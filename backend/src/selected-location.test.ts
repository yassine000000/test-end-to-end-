import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Response } from 'express';
import type { ApiErrorResponse, CityLocation } from '../../shared/weather.js';
import { handleError } from './errors.js';
import { LocationValidationError, parseSelectedLocation } from './selected-location.js';

const casablanca: CityLocation = { id: 2553604, name: 'Casablanca', country: 'Morocco', countryCode: 'MA', admin1: 'Casablanca-Settat', latitude: 33.58831, longitude: -7.61138, timezone: 'Africa/Casablanca' };

describe('parseSelectedLocation', () => {
  it('uses a neutral label when no metadata is sent', () => {
    assert.deepEqual(parseSelectedLocation(undefined, 1.5, 2.5), {
      id: 0, name: 'Selected location', country: '', countryCode: '', latitude: 1.5, longitude: 2.5, timezone: 'auto'
    });
  });

  it('accepts metadata for the requested coordinates, exactly as the frontend sends it', () => {
    const raw = JSON.stringify(casablanca);
    assert.deepEqual(parseSelectedLocation(raw, Number(String(casablanca.latitude)), Number(String(casablanca.longitude))), casablanca);
  });

  it('keeps only known fields', () => {
    const raw = JSON.stringify({ ...casablanca, cached: true, extra: '<script>' });
    assert.deepEqual(parseSelectedLocation(raw, casablanca.latitude, casablanca.longitude), casablanca);
  });

  const refused: Array<[string, string]> = [
    ['malformed JSON', '{"name":'],
    ['a non-object', '["Casablanca"]'],
    ['other coordinates', JSON.stringify({ ...casablanca, latitude: 48.85 })],
    ['a missing name', JSON.stringify({ ...casablanca, name: undefined })],
    ['an oversized name', JSON.stringify({ ...casablanca, name: 'x'.repeat(201) })],
    ['a non-numeric id', JSON.stringify({ ...casablanca, id: '1' })]
  ];
  for (const [label, raw] of refused) {
    it(`refuses ${label}`, () => {
      assert.throws(() => parseSelectedLocation(raw, casablanca.latitude, casablanca.longitude), LocationValidationError);
    });
  }

  it('maps a refusal to a 400 that is not retryable', () => {
    const sent: { status?: number; body?: ApiErrorResponse } = {};
    const response = {
      status(code: number) { sent.status = code; return this; },
      json(body: ApiErrorResponse) { sent.body = body; return this; }
    } as unknown as Response;
    handleError(response, new LocationValidationError('Selected location must be valid JSON.'));
    assert.equal(sent.status, 400);
    assert.deepEqual(sent.body?.error, { code: 'VALIDATION_ERROR', message: 'Selected location must be valid JSON.', retryable: false });
  });
});
