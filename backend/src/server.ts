import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { WeatherCache } from '../../cache/weather-cache.js';
import type { CityLocation } from '../../shared/weather.js';
import { handleError, sendError } from './errors.js';
import { SearchCoordinator } from './search.js';

const port = Number(process.env.PORT ?? 3001);
const app = express();
let cache: WeatherCache | null = null;
let configurationError: Error | null = null;

try {
  cache = new WeatherCache();
} catch (error) {
  configurationError = error instanceof Error ? error : new Error('Weather cache is not configured.');
}

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
const search = new SearchCoordinator(cache);

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.get('/api/locations/search', async (request, response) => {
  const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
  if (query.length < 2) {
    sendError(response, 400, {
      error: { code: 'VALIDATION_ERROR', message: 'Enter at least two characters to search for a city.', retryable: false }
    });
    return;
  }

  try {
    const locations = await search.locations(query);
    if (locations.length === 0) {
      sendError(response, 404, {
        error: { code: 'NOT_FOUND', message: `No city matched “${query}”.`, retryable: false }
      });
      return;
    }
    response.json({ locations });
  } catch (error) {
    handleError(response, error);
  }
});

app.get('/api/weather', async (request, response) => {
  const latitude = Number(request.query.latitude);
  const longitude = Number(request.query.longitude);
  const encodedLocation = typeof request.query.location === 'string' ? request.query.location : undefined;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    sendError(response, 400, {
      error: { code: 'VALIDATION_ERROR', message: 'Valid latitude and longitude are required.', retryable: false }
    });
    return;
  }

  try {
    if (configurationError || !cache) throw configurationError ?? new Error('Weather cache is not configured.');
    const location: CityLocation = encodedLocation
      ? (JSON.parse(encodedLocation) as CityLocation)
      : {
          id: 0,
          name: 'Selected location',
          country: '',
          countryCode: '',
          latitude,
          longitude,
          timezone: 'auto'
        };
    const payload = await search.weather(location);
    response.json(payload);
  } catch (error) {
    handleError(response, error);
  }
});

async function start(): Promise<void> {
  if (cache) await cache.initialize();
  app.listen(port, () => console.log(`WeatherTrack API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Could not start WeatherTrack API.', error);
  process.exitCode = 1;
});
