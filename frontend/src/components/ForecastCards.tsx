import type { ForecastDay } from '../../../shared/weather';

function formatDay(date: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(
    new Date(`${date}T12:00:00`)
  );
}

export function ForecastCards({ forecast }: { forecast: ForecastDay[] }) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Five-day forecast</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {forecast.map((day) => (
          <article className="rounded-2xl border border-slate-700 bg-slate-900 p-4" key={day.date}>
            <p className="font-semibold">{formatDay(day.date)}</p>
            <p className="my-3 text-3xl">{day.icon}</p>
            <p className="text-sm text-slate-300">{day.condition}</p>
            <p className="mt-3 font-semibold"><span>{Math.round(day.maximumTemperature)}°</span><span className="ml-2 text-slate-400">{Math.round(day.minimumTemperature)}°</span></p>
          </article>
        ))}
      </div>
    </div>
  );
}
