import { ConfigurationError, type WeatherCache } from '../../cache/weather-cache.js';
import { getWeather, searchLocations } from '../../integrations/open-meteo.js';
import type { CityLocation, WeatherResponse } from '../../shared/weather.js';

export class SearchCoordinator {
  constructor(private readonly cache: WeatherCache | null) {}

  async locations(query: string): Promise<CityLocation[]> {
    return searchLocations(query);
  }

  async weather(location: CityLocation): Promise<WeatherResponse> {
    if (!this.cache) throw new ConfigurationError('DATABASE_URL must be set to use the PostgreSQL weather cache.');
    const cacheKey = `${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };

    const weather = await getWeather(location.latitude, location.longitude);
    const payload: WeatherResponse = {
      location,
      ...weather,
      cached: false,
      updatedAt: new Date().toISOString()
    };
    await this.cache.set(cacheKey, payload);
    return payload;
  }
}
