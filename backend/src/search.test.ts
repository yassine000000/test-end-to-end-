// Phase 7 (phase_flows): flow_city_weather_lookup and flow_retry_weather_request, backend side.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Response } from 'express';
import { cacheDurationMs, ConfigurationError } from '../../cache/weather-cache.js';
import { ProviderError } from '../../integrations/open-meteo.js';
import type { ApiErrorResponse, CachedWeather, CityLocation } from '../../shared/weather.js';
import { handleError } from './errors.js';
import { SearchCoordinator, type WeatherProvider, type WeatherStore } from './search.js';

const paris: CityLocation = { id: 2988507, name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.85341, longitude: 2.3488, timezone: 'Europe/Paris' };
const providerWeather: Pick<CachedWeather, 'current' | 'forecast'> = {
  current: { temperature: 14, apparentTemperature: 12, humidity: 70, windSpeed: 11, condition: 'Overcast', icon: '☁️', observedAt: '2026-10-19T12:00' },
  forecast: [{ date: '2026-10-19', minimumTemperature: 9, maximumTemperature: 15, condition: 'Overcast', icon: '☁️' }]
};

/** In-memory stand-in for the PostgreSQL cache with the same ten-minute expiry. */
function memoryStore(clock: { now: number }) {
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
  return { store, rows };
}

function fakeProvider(results: Array<Pick<CachedWeather, 'current' | 'forecast'> | Error>) {
  const calls: Array<[number, number]> = [];
  const provider: WeatherProvider = {
    async searchLocations(query) {
      return query === 'Paris' ? [paris] : [];
    },
    async getWeather(latitude, longitude) {
      calls.push([latitude, longitude]);
      const next = results.shift();
      if (!next) throw new Error('unexpected provider call');
      if (next instanceof Error) throw next;
      return next;
    }
  };
  return { provider, calls };
}

function captureResponse() {
  const sent: { status?: number; body?: ApiErrorResponse } = {};
  const response = {
    status(code: number) {
      sent.status = code;
      return this;
    },
    json(body: ApiErrorResponse) {
      sent.body = body;
      return this;
    }
  } as unknown as Response;
  return { response, sent };
}

describe('flow_city_weather_lookup', () => {
  it('returns geocoding matches for a city and none for an unknown city', async () => {
    const { provider } = fakeProvider([]);
    const search = new SearchCoordinator(memoryStore({ now: 0 }).store, provider);
    assert.deepEqual(await search.locations('Paris'), [paris]);
    assert.deepEqual(await search.locations('Atlantis'), []);
  });

  it('fetches fresh weather on a cache miss and stores provider data only', async () => {
    const clock = { now: Date.parse('2026-10-19T12:00:00Z') };
    const { store, rows } = memoryStore(clock);
    const { provider, calls } = fakeProvider([providerWeather]);
    const search = new SearchCoordinator(store, provider, () => new Date(clock.now));

    const result = await search.weather(paris);

    assert.equal(result.cached, false);
    assert.deepEqual(result.location, paris);
    assert.equal(result.updatedAt, '2026-10-19T12:00:00.000Z');
    assert.deepEqual(calls, [[paris.latitude, paris.longitude]]);
    const stored = rows.get('48.8534:2.3488')?.payload;
    assert.deepEqual(stored, { ...providerWeather, updatedAt: '2026-10-19T12:00:00.000Z' });
    assert.equal('location' in (stored ?? {}), false);
  });

  it('serves a valid cache entry without calling the provider, labelled with the caller’s location', async () => {
    const clock = { now: 0 };
    const { store } = memoryStore(clock);
    const { provider, calls } = fakeProvider([providerWeather]);
    const search = new SearchCoordinator(store, provider, () => new Date(clock.now));

    await search.weather(paris);
    clock.now += cacheDurationMs - 1;
    const relabelled = { ...paris, name: 'Paris 1er Arrondissement' };
    const result = await search.weather(relabelled);

    assert.equal(result.cached, true);
    assert.equal(result.location.name, 'Paris 1er Arrondissement');
    assert.equal(calls.length, 1);
  });

  it('fetches a fresh response once the ten-minute entry has expired', async () => {
    const clock = { now: 0 };
    const { store } = memoryStore(clock);
    const later = { ...providerWeather, current: { ...providerWeather.current, temperature: 17 } };
    const { provider, calls } = fakeProvider([providerWeather, later]);
    const search = new SearchCoordinator(store, provider, () => new Date(clock.now));

    await search.weather(paris);
    clock.now += cacheDurationMs;
    const result = await search.weather(paris);

    assert.equal(result.cached, false);
    assert.equal(result.current.temperature, 17);
    assert.equal(calls.length, 2);
  });

  it('refuses weather without a configured cache', async () => {
    const search = new SearchCoordinator(null, fakeProvider([]).provider);
    await assert.rejects(search.weather(paris), ConfigurationError);
  });
});

describe('flow_retry_weather_request', () => {
  for (const [code, status] of [['TIMEOUT', 503], ['NETWORK_ERROR', 503], ['PROVIDER_ERROR', 502]] as const) {
    it(`maps a ${code} to a retryable ${status}, and a retry for the same coordinates succeeds`, async () => {
      const clock = { now: 0 };
      const { store, rows } = memoryStore(clock);
      const { provider, calls } = fakeProvider([new ProviderError('provider failed', code), providerWeather]);
      const search = new SearchCoordinator(store, provider, () => new Date(clock.now));

      const failure = await search.weather(paris).catch((error: unknown) => error);
      assert.ok(failure instanceof ProviderError);
      const { response, sent } = captureResponse();
      handleError(response, failure);
      assert.equal(sent.status, status);
      assert.deepEqual(sent.body?.error, { code, message: 'provider failed', retryable: true });
      assert.equal(rows.size, 0, 'a failed request caches nothing');

      const retried = await search.weather(paris);
      assert.equal(retried.cached, false);
      assert.deepEqual(calls, [[paris.latitude, paris.longitude], [paris.latitude, paris.longitude]]);
    });
  }

  it('marks a missing cache configuration as not retryable', () => {
    const { response, sent } = captureResponse();
    handleError(response, new ConfigurationError('DATABASE_URL must be set to use the PostgreSQL weather cache.'));
    assert.equal(sent.status, 503);
    assert.equal(sent.body?.error.retryable, false);
  });
});
