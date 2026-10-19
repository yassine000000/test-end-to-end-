import type { CityLocation } from '../../shared/weather.js';

export class LocationValidationError extends Error {}

function text(value: unknown, field: string, maxLength: number, optional = false): string | undefined {
  if (value === undefined && optional) return undefined;
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new LocationValidationError(`Selected location ${field} is invalid.`);
  }
  return value;
}

// Parses the optional selected-location metadata sent with GET /api/weather. The coordinates in the
// query string are authoritative: metadata describing other coordinates is refused.
export function parseSelectedLocation(raw: string | undefined, latitude: number, longitude: number): CityLocation {
  if (raw === undefined) {
    return { id: 0, name: 'Selected location', country: '', countryCode: '', latitude, longitude, timezone: 'auto' };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new LocationValidationError('Selected location must be valid JSON.');
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new LocationValidationError('Selected location must be an object.');
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.latitude !== latitude || candidate.longitude !== longitude) {
    throw new LocationValidationError('Selected location does not match the requested coordinates.');
  }
  const id = candidate.id;
  if (typeof id !== 'number' || !Number.isFinite(id)) throw new LocationValidationError('Selected location id is invalid.');

  return {
    id,
    name: text(candidate.name, 'name', 200)!,
    country: text(candidate.country, 'country', 100)!,
    countryCode: text(candidate.countryCode, 'country code', 3)!,
    admin1: text(candidate.admin1, 'region', 200, true),
    latitude,
    longitude,
    timezone: text(candidate.timezone, 'timezone', 64)!
  };
}
