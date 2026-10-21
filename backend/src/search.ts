import { ConfigurationError } from '../../cache/weather-cache.js';
import { getWeather, searchLocations } from '../../integrations/open-meteo.js';
import type { CachedWeather, CityLocation, WeatherResponse } from '../../shared/weather.js';

export interface WeatherStore {
  get(key: string): Promise<CachedWeather | null>;
  set(key: string, payload: CachedWeather): Promise<void>;
}

export interface WeatherProvider {
  searchLocations(query: string): Promise<CityLocation[]>;
  getWeather(latitude: number, longitude: number): Promise<Pick<CachedWeather, 'current' | 'forecast'>>;
}

const openMeteo: WeatherProvider = { searchLocations, getWeather };

export function cacheKeyFor(location: CityLocation): string {
  return `${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;
}

export class SearchCoordinator {
  constructor(
    private readonly cache: WeatherStore | null,
    private readonly provider: WeatherProvider = openMeteo,
    private readonly now: () => Date = () => new Date()
  ) {}

  async locations(query: string): Promise<CityLocation[]> {
    return this.provider.searchLocations(query);
  }

  // The cache is keyed by coordinates and shared by every caller, so it holds provider data only;
  // the caller's selected-location label is attached per request and never cached.
  async weather(location: CityLocation): Promise<WeatherResponse> {
    if (!this.cache) throw new ConfigurationError('DATABASE_URL must be set to use the PostgreSQL weather cache.');
    const cacheKey = cacheKeyFor(location);
    const cached = await this.cache.get(cacheKey);
    if (cached) return { location, current: cached.current, forecast: cached.forecast, updatedAt: cached.updatedAt, cached: true };

    const weather = await this.provider.getWeather(location.latitude, location.longitude);
    const fresh: CachedWeather = { ...weather, updatedAt: this.now().toISOString() };
    await this.cache.set(cacheKey, fresh);
    return { location, ...fresh, cached: false };
  }
}
