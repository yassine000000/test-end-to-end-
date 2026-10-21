// Phase 7 (phase_flows, phase_access_rules): the two locked flows and the public read-only rule,
// validated end-to-end over HTTP against the real Express routes. Only the two external edges are
// replaced: the Open-Meteo provider (no network in tests) and the PostgreSQL cache (an in-memory
// store with the same ten-minute expiry).
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, describe, it } from 'node:test';
import type { Server } from 'node:http';
import { cacheDurationMs, ConfigurationError } from '../../cache/weather-cache.js';
import { ProviderError } from '../../integrations/open-meteo.js';
import type {
  ApiErrorResponse,
  CachedWeather,
  CityLocation,
  WeatherResponse
} from '../../shared/weather.js';
import { SearchCoordinator, type WeatherProvider, type WeatherStore } from './search.js';
import { createApp } from './server.js';

const paris: CityLocation = {
  id: 2988507,
  name: 'Paris',
  country: 'France',
  countryCode: 'FR',
  latitude: 48.85341,
  longitude: 2.3488,
  timezone: 'Europe/Paris'
};
const parisTexas: CityLocation = {
  id: 4717560,
  name: 'Paris',
  country: 'United States',
  countryCode: 'US',
  admin1: 'Texas',
  latitude: 33.66094,
  longitude: -95.55551,
  timezone: 'America/Chicago'
};
const providerWeather: Pick<CachedWeather, 'current' | 'forecast'> = {
  current: {
    temperature: 14,
    apparentTemperature: 12,
    humidity: 70,
    windSpeed: 11,
    condition: 'Overcast',
    icon: '☁️',
    observedAt: '2026-10-21T12:00'
  },
  forecast: [
    {
      date: '2026-10-21',
      minimumTemperature: 9,
      maximumTemperature: 15,
      condition: 'Overcast',
      icon: '☁️'
    }
  ]
};

type ProviderStep = Pick<CachedWeather, 'current' | 'forecast'> | Error;

/** One API instance with a controllable clock, provider script and cache. */
function harness(steps: ProviderStep[] = [], options: { cache?: boolean } = {}) {
  const clock = { now: Date.parse('2026-10-21T12:00:00Z') };
  const rows = new Map<string, { payload: CachedWeather; expiresAt: number }>();
  const store: WeatherStore = {
    async get(key) {
      const row = rows.get(key);
      return row && row.expiresAt > clock.now ? row.payload : null;
    },
    async set(key, payload) {
      rows.set(key, { payload, expiresAt: clock.now + cacheDurationMs });
    }
  };
  const weatherCalls: Array<[number, number]> = [];
  const provider: WeatherProvider = {
    async searchLocations(query) {
      return query.toLowerCase() === 'paris' ? [paris, parisTexas] : [];
    },
    async getWeather(latitude, longitude) {
      weatherCalls.push([latitude, longitude]);
      const next = steps.shift();
      if (!next) throw new Error('unexpected provider call');
      if (next instanceof Error) throw next;
      return next;
    }
  };
  const withCache = options.cache ?? true;
  const app = createApp({
    search: new SearchCoordinator(withCache ? store : null, provider, () => new Date(clock.now)),
    configurationError: withCache
      ? null
      : new ConfigurationError('DATABASE_URL must be set to use the PostgreSQL weather cache.')
  });
  return { app, clock, rows, weatherCalls };
}

let server: Server | null = null;
let baseUrl = '';

async function serve(app: ReturnType<typeof harness>['app']): Promise<void> {
  await new Promise<void>((resolve) => server?.close(() => resolve()) ?? resolve());
  server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

async function get(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return { response, body: (await response.json()) as unknown };
}

function weatherPath(location: CityLocation, metadata: CityLocation | null = location): string {
  const query = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude)
  });
  if (metadata) query.set('location', JSON.stringify(metadata));
  return `/api/weather?${query}`;
}

after(async () => {
  await new Promise<void>((resolve) => server?.close(() => resolve()) ?? resolve());
});

describe('flow_city_weather_lookup (HTTP)', () => {
  it('search → several matches → select one → fresh weather → cached weather → expiry refetch', async () => {
    const later = {
      ...providerWeather,
      current: { ...providerWeather.current, temperature: 17 }
    };
    const h = harness([providerWeather, later]);
    await serve(h.app);

    const search = await get('/api/locations/search?q=Paris');
    assert.equal(search.response.status, 200);
    assert.deepEqual(search.body, { locations: [paris, parisTexas] });

    const first = await get(weatherPath(parisTexas));
    assert.equal(first.response.status, 200);
    const fresh = first.body as WeatherResponse;
    assert.equal(fresh.cached, false);
    assert.deepEqual(fresh.location, parisTexas);
    assert.equal(fresh.current.temperature, 14);
    assert.equal(fresh.updatedAt, '2026-10-21T12:00:00.000Z');

    h.clock.now += cacheDurationMs - 1;
    const second = (await get(weatherPath(parisTexas))).body as WeatherResponse;
    assert.equal(second.cached, true);
    assert.deepEqual(h.weatherCalls, [[parisTexas.latitude, parisTexas.longitude]]);

    h.clock.now += 1;
    const expired = (await get(weatherPath(parisTexas))).body as WeatherResponse;
    assert.equal(expired.cached, false);
    assert.equal(expired.current.temperature, 17);
    assert.equal(h.weatherCalls.length, 2);
  });

  it('a new selection is fetched for its own coordinates, not served from another city', async () => {
    const h = harness([providerWeather, providerWeather]);
    await serve(h.app);

    await get(weatherPath(paris));
    const other = (await get(weatherPath(parisTexas))).body as WeatherResponse;

    assert.equal(other.cached, false);
    assert.deepEqual(other.location, parisTexas);
    assert.deepEqual(h.weatherCalls, [
      [paris.latitude, paris.longitude],
      [parisTexas.latitude, parisTexas.longitude]
    ]);
  });

  it('an unknown city is a 404 the user can search past; a too-short query is a 400', async () => {
    await serve(harness().app);

    const unknown = await get('/api/locations/search?q=Atlantis');
    assert.equal(unknown.response.status, 404);
    assert.deepEqual((unknown.body as ApiErrorResponse).error, {
      code: 'NOT_FOUND',
      message: 'No city matched “Atlantis”.',
      retryable: false
    });

    const short = await get('/api/locations/search?q=P');
    assert.equal(short.response.status, 400);
    assert.equal((short.body as ApiErrorResponse).error.code, 'VALIDATION_ERROR');
  });

  it('refuses location metadata that describes other coordinates, before any provider call', async () => {
    const h = harness();
    await serve(h.app);

    const mismatch = await get(weatherPath(paris, parisTexas));
    assert.equal(mismatch.response.status, 400);
    assert.deepEqual((mismatch.body as ApiErrorResponse).error, {
      code: 'VALIDATION_ERROR',
      message: 'Selected location does not match the requested coordinates.',
      retryable: false
    });

    const malformed = await get(
      `/api/weather?latitude=${paris.latitude}&longitude=${paris.longitude}&location=%7Bnot-json`
    );
    assert.equal(malformed.response.status, 400);
    assert.equal(h.weatherCalls.length, 0);
  });

  it('without a configured cache, weather is a 503 that is not offered for retry', async () => {
    const h = harness([providerWeather], { cache: false });
    await serve(h.app);

    const result = await get(weatherPath(paris));
    assert.equal(result.response.status, 503);
    assert.deepEqual((result.body as ApiErrorResponse).error.code, 'CONFIGURATION_ERROR');
    assert.equal((result.body as ApiErrorResponse).error.retryable, false);
    assert.equal(h.weatherCalls.length, 0);
  });
});

describe('flow_retry_weather_request (HTTP)', () => {
  for (const [code, status] of [
    ['TIMEOUT', 503],
    ['NETWORK_ERROR', 503],
    ['PROVIDER_ERROR', 502]
  ] as const) {
    it(`a ${code} is a retryable ${status}; retrying the same coordinates returns weather`, async () => {
      const h = harness([new ProviderError('provider failed', code), providerWeather]);
      await serve(h.app);

      const failed = await get(weatherPath(paris));
      assert.equal(failed.response.status, status);
      assert.deepEqual((failed.body as ApiErrorResponse).error, {
        code,
        message: 'provider failed',
        retryable: true
      });
      assert.equal(h.rows.size, 0, 'a failed request caches nothing');

      const retried = await get(weatherPath(paris));
      assert.equal(retried.response.status, 200);
      assert.equal((retried.body as WeatherResponse).cached, false);
      assert.deepEqual(h.weatherCalls, [
        [paris.latitude, paris.longitude],
        [paris.latitude, paris.longitude]
      ]);
    });
  }

  it('a repeated failure keeps the retryable error state', async () => {
    const h = harness([
      new ProviderError('provider failed', 'TIMEOUT'),
      new ProviderError('provider failed', 'TIMEOUT')
    ]);
    await serve(h.app);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const failed = await get(weatherPath(paris));
      assert.equal(failed.response.status, 503);
      assert.equal((failed.body as ApiErrorResponse).error.retryable, true);
    }
    assert.equal(h.rows.size, 0);
  });
});

describe('public read-only access (phase_access_rules, HTTP)', () => {
  it('every public endpoint answers without credentials and sets no session', async () => {
    const h = harness([providerWeather]);
    await serve(h.app);

    for (const path of ['/api/health', '/api/locations/search?q=Paris', weatherPath(paris)]) {
      const { response } = await get(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('www-authenticate'), null, path);
      assert.equal(response.headers.get('set-cookie'), null, path);
    }
  });

  it('exposes no write method and no login or admin surface', async () => {
    await serve(harness().app);

    for (const [method, path] of [
      ['POST', '/api/weather'],
      ['PUT', '/api/locations/search'],
      ['DELETE', '/api/weather'],
      ['GET', '/api/auth/login'],
      ['GET', '/api/admin']
    ] as const) {
      const response = await fetch(`${baseUrl}${path}`, { method });
      assert.equal(response.status, 404, `${method} ${path}`);
      await response.text();
    }
  });
});
