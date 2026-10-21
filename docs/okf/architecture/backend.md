---
type: Architecture Layer
title: Backend Layer
description: Defines the backend responsibilities, modules, and how the Node.js API handles geocoding, weather retrieval, caching, and error handling for public read-only endpoints.
tags: ["backend", "api", "nodejs", "postgresql"]
timestamp: 2025-11-24T00:00:00Z
provenance: authored
arch_version: 1
renderer_version: 2
content_hash: sha256-4115c38528b531f8e2c7824f0dfd4838685a190071de6b31aacac6cbe5bc246e
source_refs: [arch_state, low_level_state]
---

# Backend Layer — WeatherTrack

## Responsibility

This layer owns the lightweight Node.js REST JSON API that exposes two public endpoints (location search and weather summary), orchestrates geocoding, weather, caching, and error handling modules, and persists short-lived cache entries in PostgreSQL.

## Key Components

- Geocoding module — queries the external geocoding provider to resolve city names to coordinates
- Weather module — fetches current observations and five-day forecasts from the weather provider
- Cache module — maintains 10-minute temporary weather response cache with expiration logic. Entries are keyed by coordinates and shared by all callers, so they hold provider weather only, never a caller's location label
- Search module — coordinates location search, weather retrieval, cache validation, and request shaping. The optional selected-location metadata on `/api/weather` is validated against the requested coordinates (mismatch or malformed → `400 VALIDATION_ERROR`, not retryable)
- Errors module — normalizes unknown city, external API failure, network failure, and timeout responses

## Interfaces

- Calls frontend app via HTTP for location search (/api/locations/search) and weather (/api/weather)
- Calls integration services for geocoding provider and weather provider requests
- Writes to database layer for temporary cached API responses (expiresAt)
- Depends on error states from Errors module for retryable UI patterns

## Validation

The API is built by `createApp` in `backend/src/server.ts`; `start()` adds the PostgreSQL cache and listens only when the file is run directly. `backend/src/flows.e2e.test.ts` runs both locked flows (`flow_city_weather_lookup`, `flow_retry_weather_request`) and the public read-only rule over real HTTP against these routes, replacing only the two external edges: the weather provider and the cache (an in-memory store with the same ten-minute expiry).

## Related

- docs/okf/architecture/system.md
- docs/okf/architecture/frontend.md
- docs/okf/architecture/database.md
- docs/okf/rules/architecture.md