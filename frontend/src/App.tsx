import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CityLocation } from '../../shared/weather';
import { canRetry, errorMessage, fetchWeather, findLocations, retryPolicy } from './api';
import { CurrentWeatherPanel } from './components/CurrentWeatherPanel';
import { ForecastCards } from './components/ForecastCards';
import { LocationSelector } from './components/LocationSelector';
import { minimumQueryLength, SearchForm } from './components/SearchForm';
import { LoadingMessage, StatusMessage } from './components/StatusMessage';

export function App() {
  const [city, setCity] = useState('');
  const [submittedCity, setSubmittedCity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null);

  const locationsQuery = useQuery({
    queryKey: ['locations', submittedCity],
    queryFn: () => findLocations(submittedCity),
    enabled: submittedCity.length >= minimumQueryLength,
    retry: retryPolicy
  });
  const weatherQuery = useQuery({
    queryKey: ['weather', selectedLocation?.latitude, selectedLocation?.longitude],
    queryFn: () => fetchWeather(selectedLocation!),
    enabled: selectedLocation !== null,
    retry: retryPolicy
  });

  // A new search replaces the previous weather result (flow_city_weather_lookup).
  function search(nextCity: string) {
    setSelectedLocation(null);
    setSubmittedCity(nextCity);
  }

  const weather = weatherQuery.data;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <section className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">WeatherTrack</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Weather, right where you are headed.</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">Search a city for current conditions and a five-day forecast.</p>
        </header>

        <SearchForm value={city} onChange={setCity} onSearch={search} />

        {locationsQuery.isFetching && <LoadingMessage message="Finding matching cities…" />}
        {locationsQuery.isError && (
          <StatusMessage
            message={errorMessage(locationsQuery.error)}
            onRetry={canRetry(locationsQuery.error) ? () => void locationsQuery.refetch() : undefined}
          />
        )}
        {locationsQuery.data && !selectedLocation && (
          <LocationSelector locations={locationsQuery.data.locations} onSelect={setSelectedLocation} />
        )}

        {weatherQuery.isFetching && <LoadingMessage className="mt-10" message="Getting the latest weather…" />}
        {weatherQuery.isError && (
          <StatusMessage
            message={errorMessage(weatherQuery.error)}
            onRetry={canRetry(weatherQuery.error) ? () => void weatherQuery.refetch() : undefined}
          />
        )}
        {weather && (
          <section className="mt-10">
            <CurrentWeatherPanel weather={weather} />
            <ForecastCards forecast={weather.forecast} />
          </section>
        )}
      </section>
    </main>
  );
}
