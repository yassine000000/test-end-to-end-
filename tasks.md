# Build Execution Contract — WeatherTrack

## Phase 0 — Workspace Verification (phase_data_model)

- [x] Ensure the locked architecture files are present in `docs/okf/` and the bootstrap adapters are present at the repository root.
- [x] Verify the data entities for city names, countries, geographic coordinates, current weather observations, five-day forecasts, and temporary cached API responses are defined.
- [x] Confirm the application remains a single public homepage with no authentication or admin surface.

## Phase 1 — Foundation Setup (phase_backend_modules)

- [x] Prepare the application shell for the public homepage experience.
- [x] Wire the frontend entry point to the browser UI.
- [x] Wire the backend entry point to the REST API routes.
- [x] Establish shared TypeScript types for city, coordinates, weather, forecast, cache, and API response shapes.

## Phase 2 — City Search and Weather Flow (phase_backend_modules)

- [x] Implement the geocoding lookup module for matching city locations.
- [x] Implement the weather retrieval module for current conditions and 5-day forecast data.
- [x] Implement the cache module for 10-minute temporary weather response storage.
- [x] Implement the search coordinator that resolves city lookup, weather retrieval, cache lookup, error handling, and response shaping.

## Phase 3 — Public API Endpoints (phase_api_contracts)

- [x] Expose `GET /api/locations/search` for city matching.
- [x] Expose `GET /api/weather` for weather summary retrieval by latitude and longitude.
- [x] Normalize error responses for unknown cities, external provider failures, network failures, and timeouts.

## Phase 4 — Frontend Homepage Experience (phase_frontend_home)

- [x] Build the single homepage for city search and weather display.
- [x] Show loading, retry, and error states clearly.
- [x] Render location matches when the geocoding provider returns more than one result.
- [x] Render current weather and forecast cards for the selected city.

## Phase 5 — Access Rules (phase_access_rules)

- [x] Confirm the homepage and API endpoints remain public with no login or admin access.
- [x] Verify the public role has read-only access to location search and weather endpoints.

## Phase 6 — Shared Structure (phase_shared_structure)

- [x] Organize the shared types, backend API, integration services, and cache layer directories as specified in the architecture.

## Phase 7 — Validation and Delivery (phase_flows)

- [x] Validate the city weather lookup flow end-to-end.
- [x] Validate the retry weather request flow end-to-end.
- [x] Confirm the homepage remains public and requires no login.
- [ ] Confirm the build matches the locked architecture before final bundle export.

## Finalize Build

- [ ] Run final bundle verification across all OKF governance and bootstrap files: CLAUDE.md, AGENTS.md, GEMINI.md, CLAUDE.local.md, docs/okf/manifest.json, and the complete OKF knowledge tree.
- [ ] Switch the project mode from BUILD to DEV.
