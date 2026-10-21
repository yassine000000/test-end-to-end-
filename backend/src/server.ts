import 'dotenv/config';
import cors from 'cors';
import express, { type Express } from 'express';
import { pathToFileURL } from 'node:url';
import { WeatherCache } from '../../cache/weather-cache.js';
import { handleError, sendError } from './errors.js';
import { SearchCoordinator } from './search.js';
import { parseSelectedLocation } from './selected-location.js';

export interface AppOptions {
  search: SearchCoordinator;
  /** Set when the weather cache could not be configured; weather requests then fail with 503. */
  configurationError?: Error | null;
  frontendOrigin?: string;
}

// Builds the public REST JSON API. Kept separate from start() so the flows can be validated
// end-to-end over HTTP with a test provider and cache (backend/src/flows.e2e.test.ts).
export function createApp({
  search,
  configurationError = null,
  frontendOrigin
}: AppOptions): Express {
  const app = express();
  app.use(cors({ origin: frontendOrigin ?? 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

  app.get('/api/locations/search', async (request, response) => {
    const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
    if (query.length < 2) {
      sendError(response, 400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Enter at least two characters to search for a city.',
          retryable: false
        }
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
    const encodedLocation =
      typeof request.query.location === 'string' ? request.query.location : undefined;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      sendError(response, 400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid latitude and longitude are required.',
          retryable: false
        }
      });
      return;
    }

    try {
      const location = parseSelectedLocation(encodedLocation, latitude, longitude);
      if (configurationError) throw configurationError;
      const payload = await search.weather(location);
      response.json(payload);
    } catch (error) {
      handleError(response, error);
    }
  });

  return app;
}

async function start(): Promise<void> {
  const port = Number(process.env.PORT ?? 3001);
  let cache: WeatherCache | null = null;
  let configurationError: Error | null = null;
  try {
    cache = new WeatherCache();
  } catch (error) {
    configurationError =
      error instanceof Error ? error : new Error('Weather cache is not configured.');
  }

  const app = createApp({
    search: new SearchCoordinator(cache),
    configurationError,
    frontendOrigin: process.env.FRONTEND_ORIGIN
  });
  if (cache) await cache.initialize();
  app.listen(port, () => console.log(`WeatherTrack API listening on http://localhost:${port}`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((error) => {
    console.error('Could not start WeatherTrack API.', error);
    process.exitCode = 1;
  });
}
