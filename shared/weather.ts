export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CityLocation extends Coordinates {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  observedAt: string;
}

export interface ForecastDay {
  date: string;
  minimumTemperature: number;
  maximumTemperature: number;
  condition: string;
  icon: string;
}

export interface WeatherResponse {
  location: CityLocation;
  current: CurrentWeather;
  forecast: ForecastDay[];
  cached: boolean;
  updatedAt: string;
}

export interface CacheEntry {
  key: string;
  payload: WeatherResponse;
  createdAt: string;
  expiresAt: string;
}

export interface ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'CONFIGURATION_ERROR';
    message: string;
    retryable: boolean;
  };
}
