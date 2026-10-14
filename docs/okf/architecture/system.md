---
type: Architecture System
title: System Architecture
description: Overview of WeatherTrack's public read-only homepage, REST JSON API, external provider integrations, and temporary cache flow.
tags: [weathertrack, react, nodejs, rest, json, postgresql, cache, public-read-only]
timestamp: 2026-10-14T00:00:00Z
provenance: authored
arch_version: 1
renderer_version: 2
content_hash: sha256-a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef
source_refs: [arch_state, low_level_state]
---

# System Architecture — WeatherTrack

## System Overview

WeatherTrack is a public read-only web application with a lightweight Node.js REST JSON API and a React browser UI. The architecture is intentionally small: one public homepage, two public API endpoints, and a temporary cache layer that keeps repeated weather lookups inexpensive.

The main constraint is simplicity. The system must support one-city-at-a-time lookup, show loading and retry states, and keep external weather provider details behind the API rather than exposing them directly in the browser.

## Data Flow

The build starts with `phase_data_model`, which defines the city, country, coordinates, weather, forecast, and cache entities. The browser then drives the `phase_backend_modules` and `phase_api_contracts` work by calling the REST JSON API search endpoint, which uses the geocoding integration to find matching locations and returns selectable candidates when more than one city matches.

After the user selects a location, the browser calls the weather endpoint with the selected coordinates. The backend search flow checks the cache layer first, then either returns a fresh cached response or fetches current weather observations and a five-day forecast from the external weather provider, stores the response in the cache, and returns the response to the browser for display. The `phase_frontend_home`, `phase_shared_structure`, `phase_access_rules`, and `phase_flows` work together to keep the single homepage, shared types, public access, and retry behavior consistent.

## Integration Points

- React web app ⇆ REST JSON API: city search and weather requests.
- REST JSON API ⇆ Geocoding integration: matching location lookup.
- REST JSON API ⇆ Weather integration: current conditions and forecast retrieval.
- REST JSON API ⇆ PostgreSQL: temporary weather cache and configuration storage.
- Public read-only access ⇆ single homepage: search, selection, results, loading, error, and retry states.

## Deferred Features

- No multiple-city comparisons.
- No saved favorites.
- No authentication or user management.
- No payments or subscriptions.
- No admin dashboards.
- No complex infrastructure.
- No additional screens beyond the single search-and-results homepage.

## Related

- `docs/okf/architecture/index.md`
- `docs/okf/rules/architecture.md`
- `docs/okf/rules/coding.md`
- `docs/okf/context/project.md`
- `docs/okf/manifest.json`