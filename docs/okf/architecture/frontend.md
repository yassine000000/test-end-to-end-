---
type: Architecture Layer
title: Frontend Layer
description: Frontend responsibilities, key components, and browser boundaries for WeatherTrack.
tags: [frontend, react, tailwind-css, tailwind css, react-query, public-read-only]
timestamp: 2026-10-14T00:00:00Z
provenance: authored
arch_version: 1
renderer_version: 2
content_hash: sha256-5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
source_refs: [arch_state, low_level_state]
---

# Frontend Layer — WeatherTrack

## Responsibility

The frontend layer owns the public homepage experience, user input, weather result display, loading state, error state, and retry interaction. It presents the single-screen search-and-results flow for casual end users.

It does not own provider integrations, cache policy, or persistent storage. It only renders the browser experience and calls the backend API.

## Key Components

- Homepage shell — contains the search field, location matches, weather summary, and forecast cards.
- Search form — accepts a city name and starts location lookup.
- Location selector — lets the user choose the correct match when several cities are returned.
- Weather summary panel — shows current temperature, conditions, humidity, wind speed, icon, and last updated time.
- Forecast cards — show the five-day forecast with daily minimum and maximum temperatures plus conditions.
- Loading, error, and retry states — keep request status visible and allow the user to try again.
- React Query state — manages fetching, caching, retries, and loading state on the client.

| Route | Purpose |
|---|---|
| `/` | Single public homepage for city search, location selection, weather display, loading, error, and retry states. |

## Interfaces

- Called by the user through the browser.
- Calls the backend REST JSON API for city search and weather data.
- Receives normalized JSON responses and renders the current view state.
- Uses React Query to manage request state on the client.
- Uses Vite to serve and bundle the React application.

## Related

- `docs/okf/architecture/system.md`
- `docs/okf/architecture/backend.md`
- `docs/okf/rules/coding.md`
