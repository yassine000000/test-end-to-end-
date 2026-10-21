import type { WeatherResponse } from '../../../shared/weather';

export function CurrentWeatherPanel({ weather }: { weather: WeatherResponse }) {
  return (
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
  );
}
