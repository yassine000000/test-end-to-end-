import type { CityLocation } from '../../../shared/weather';

export function LocationSelector({ locations, onSelect }: { locations: CityLocation[]; onSelect: (location: CityLocation) => void }) {
  return (
    <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/80 p-3 shadow-xl">
      <p className="px-3 pb-2 text-sm text-slate-400">Choose a location</p>
      <div className="grid gap-2">
        {locations.map((location) => (
          <button key={location.id} className="rounded-xl px-3 py-3 text-left transition hover:bg-slate-800 focus:bg-slate-800" onClick={() => onSelect(location)} type="button">
            <span className="font-semibold">{location.name}</span>
            <span className="ml-2 text-slate-400">{[location.admin1, location.country].filter(Boolean).join(', ')}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
