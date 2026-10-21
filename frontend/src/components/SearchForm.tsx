import type { FormEvent } from 'react';

export const minimumQueryLength = 2;

export function SearchForm({ value, onChange, onSearch }: { value: string; onChange: (value: string) => void; onSearch: (city: string) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = value.trim();
    if (city.length >= minimumQueryLength) onSearch(city);
  }

  return (
    <form className="mx-auto flex max-w-2xl gap-2" onSubmit={submit}>
      <label className="sr-only" htmlFor="city">City name</label>
      <input
        id="city"
        className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-lg outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search a city, e.g. Casablanca"
        autoComplete="off"
      />
      <button className="rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={value.trim().length < minimumQueryLength} type="submit">
        Search
      </button>
    </form>
  );
}
