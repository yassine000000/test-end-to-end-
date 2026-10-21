import type { Response } from 'express';
import { ConfigurationError } from '../../cache/weather-cache.js';
import { ProviderError } from '../../integrations/open-meteo.js';
import type { ApiErrorResponse } from '../../shared/weather.js';
import { LocationValidationError } from './selected-location.js';

export function sendError(response: Response, status: number, body: ApiErrorResponse): void {
  response.status(status).json(body);
}

export function handleError(response: Response, error: unknown): void {
  if (error instanceof LocationValidationError) {
    sendError(response, 400, {
      error: { code: 'VALIDATION_ERROR', message: error.message, retryable: false }
    });
    return;
  }
  if (error instanceof ConfigurationError) {
    sendError(response, 503, {
      error: { code: 'CONFIGURATION_ERROR', message: error.message, retryable: false }
    });
    return;
  }
  if (error instanceof ProviderError) {
    const status = error.code === 'PROVIDER_ERROR' ? 502 : 503;
    sendError(response, status, {
      error: { code: error.code, message: error.message, retryable: true }
    });
    return;
  }
  console.error(error);
  sendError(response, 500, {
    error: { code: 'PROVIDER_ERROR', message: 'An unexpected server error occurred.', retryable: true }
  });
}
