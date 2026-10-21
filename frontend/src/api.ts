import type { ApiErrorResponse, CityLocation, WeatherResponse } from '../../shared/weather';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean
  ) {
    super(message);
  }
}

/** Network failures (no API response) are retryable; API errors say so themselves. */
export function canRetry(error: unknown): boolean {
  return !(error instanceof ApiError) || error.retryable;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/** React Query retry policy: never repeat a request the API marked as not retryable (e.g. unknown city). */
export function retryPolicy(failureCount: number, error: unknown): boolean {
  return canRetry(error) && failureCount < 2;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(body?.error.message ?? 'Something went wrong. Please try again.', body?.error.retryable ?? true);
  }
  return (await response.json()) as T;
}

export function findLocations(query: string): Promise<{ locations: CityLocation[] }> {
  return request(`/api/locations/search?q=${encodeURIComponent(query)}`);
}

export function fetchWeather(location: CityLocation): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    location: JSON.stringify(location)
  });
  return request(`/api/weather?${params}`);
}
