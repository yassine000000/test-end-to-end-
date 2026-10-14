import type { CityLocation, CurrentWeather, ForecastDay } from '../shared/weather.js';

const timeoutMs = 10_000;

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' = 'PROVIDER_ERROR'
  ) {
    super(message);
  }
}

async function providerFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new ProviderError('Weather provider could not complete the request.');
    return response;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ProviderError('Weather provider request timed out.', 'TIMEOUT');
    }
    throw new ProviderError('Could not connect to the weather provider.', 'NETWORK_ERROR');
  } finally {
    clearTimeout(timer);
  }
}

export async function searchLocations(query: string): Promise<CityLocation[]> {
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' });
  const response = await providerFetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  const data = (await response.json()) as { results?: Array<Record<string, unknown>> };

  return (data.results ?? []).map((location) => ({
    id: Number(location.id),
    name: String(location.name),
    country: String(location.country),
    countryCode: String(location.country_code),
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    admin1: typeof location.admin1 === 'string' ? location.admin1 : undefined,
    timezone: String(location.timezone)
  }));
}

function conditionFromCode(code: number): { condition: string; icon: string } {
  const conditions: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear sky', icon: '☀️' },
    1: { condition: 'Mainly clear', icon: '🌤️' },
    2: { condition: 'Partly cloudy', icon: '⛅' },
    3: { condition: 'Overcast', icon: '☁️' },
    45: { condition: 'Foggy', icon: '🌫️' },
    48: { condition: 'Rime fog', icon: '🌫️' },
    51: { condition: 'Light drizzle', icon: '🌦️' },
    53: { condition: 'Drizzle', icon: '🌦️' },
    55: { condition: 'Heavy drizzle', icon: '🌧️' },
    61: { condition: 'Light rain', icon: '🌦️' },
    63: { condition: 'Rain', icon: '🌧️' },
    65: { condition: 'Heavy rain', icon: '🌧️' },
    71: { condition: 'Light snow', icon: '🌨️' },
    73: { condition: 'Snow', icon: '🌨️' },
    75: { condition: 'Heavy snow', icon: '❄️' },
    80: { condition: 'Rain showers', icon: '🌦️' },
    81: { condition: 'Rain showers', icon: '🌧️' },
    82: { condition: 'Heavy showers', icon: '🌧️' },
    95: { condition: 'Thunderstorm', icon: '⛈️' }
  };
  return conditions[code] ?? { condition: 'Unknown conditions', icon: '🌡️' };
}

export async function getWeather(latitude: number, longitude: number): Promise<{
  current: CurrentWeather;
  forecast: ForecastDay[];
}> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '5'
  });
  const response = await providerFetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  const data = (await response.json()) as {
    current: Record<string, number | string>;
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
  };
  const currentCondition = conditionFromCode(Number(data.current.weather_code));
  return {
    current: {
      temperature: Number(data.current.temperature_2m),
      apparentTemperature: Number(data.current.apparent_temperature),
      humidity: Number(data.current.relative_humidity_2m),
      windSpeed: Number(data.current.wind_speed_10m),
      ...currentCondition,
      observedAt: String(data.current.time)
    },
    forecast: data.daily.time.map((date, index) => ({
      date,
      minimumTemperature: Number(data.daily.temperature_2m_min[index]),
      maximumTemperature: Number(data.daily.temperature_2m_max[index]),
      ...conditionFromCode(Number(data.daily.weather_code[index]))
    }))
  };
}
