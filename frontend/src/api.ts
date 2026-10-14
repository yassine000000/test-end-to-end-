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
