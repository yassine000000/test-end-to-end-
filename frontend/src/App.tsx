import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CityLocation } from '../../shared/weather';
import { fetchWeather, findLocations } from './api';

function formatDay(date: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(
    new Date(`${date}T12:00:00`)
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function App() {
  const [city, setCity] = useState('');
  const [submittedCity, setSubmittedCity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null);

  const locationsQuery = useQuery({
    queryKey: ['locations', submittedCity],
    queryFn: () => findLocations(submittedCity),
    enabled: submittedCity.length >= 2
  });
  const weatherQuery = useQuery({
    queryKey: ['weather', selectedLocation?.latitude, selectedLocation?.longitude],
    queryFn: () => fetchWeather(selectedLocation!),
    enabled: selectedLocation !== null
  });

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCity = city.trim();
    if (nextCity.length >= 2) {
      setSelectedLocation(null);
      setSubmittedCity(nextCity);
    }
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

        <form className="mx-auto flex max-w-2xl gap-2" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="city">City name</label>
          <input
            id="city"
            className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-lg outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Search a city, e.g. Casablanca"
            autoComplete="off"
          />
          <button className="rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={city.trim().length < 2} type="submit">
            Search
          </button>
        </form>

        {locationsQuery.isFetching && <p className="mt-6 text-center text-slate-300">Finding matching cities…</p>}
        {locationsQuery.isError && (
          <StatusMessage message={errorMessage(locationsQuery.error)} onRetry={() => void locationsQuery.refetch()} />
        )}
        {locationsQuery.data && !selectedLocation && (
          <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/80 p-3 shadow-xl">
            <p className="px-3 pb-2 text-sm text-slate-400">Choose a location</p>
            <div className="grid gap-2">
              {locationsQuery.data.locations.map((location) => (
                <button key={location.id} className="rounded-xl px-3 py-3 text-left transition hover:bg-slate-800 focus:bg-slate-800" onClick={() => setSelectedLocation(location)} type="button">
                  <span className="font-semibold">{location.name}</span>
                  <span className="ml-2 text-slate-400">{[location.admin1, location.country].filter(Boolean).join(', ')}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {weatherQuery.isFetching && <p className="mt-10 text-center text-slate-300">Getting the latest weather…</p>}
        {weatherQuery.isError && <StatusMessage message={errorMessage(weatherQuery.error)} onRetry={() => void weatherQuery.refetch()} />}
        {weather && (
          <section className="mt-10">
            <div className="rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 p-6 text-slate-950 shadow-2xl sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-lg font-medium">{[weather.location.name, weather.location.country].filter(Boolean).join(', ')}</p>
                  <p className="mt-2 text-7xl font-bold tracking-tighter">{Math.round(weather.current.temperature)}°</p>
                  <p className="mt-2 text-xl font-semibold">{weather.current.icon} {weather.current.condition}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-2xl bg-white/20 p-4 text-sm backdrop-blur">
                  <div><dt className="opacity-70">Feels like</dt><dd className="text-lg font-bold">{Math.round(weather.current.apparentTemperature)}°</dd></div>
                  <div><dt className="opacity-70">Humidity</dt><dd className="text-lg font-bold">{weather.current.humidity}%</dd></div>
                  <div><dt className="opacity-70">Wind</dt><dd className="text-lg font-bold">{Math.round(weather.current.windSpeed)} km/h</dd></div>
                  <div><dt className="opacity-70">Updated</dt><dd className="text-lg font-bold">{weather.cached ? 'Cached' : 'Now'}</dd></div>
                </dl>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-bold">Five-day forecast</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {weather.forecast.map((day) => (
                  <article className="rounded-2xl border border-slate-700 bg-slate-900 p-4" key={day.date}>
                    <p className="font-semibold">{formatDay(day.date)}</p>
                    <p className="my-3 text-3xl">{day.icon}</p>
                    <p className="text-sm text-slate-300">{day.condition}</p>
                    <p className="mt-3 font-semibold"><span>{Math.round(day.maximumTemperature)}°</span><span className="ml-2 text-slate-400">{Math.round(day.minimumTemperature)}°</span></p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function StatusMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-100">
      <p>{message}</p>
      <button className="shrink-0 rounded-lg bg-rose-200 px-3 py-2 font-semibold text-rose-950" type="button" onClick={onRetry}>Retry</button>
    </div>
  );
}
