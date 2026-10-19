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
- Cache module — maintains 10-minute temporary weather response cache with expiration logic
- Search module — coordinates location search, weather retrieval, cache validation, and request shaping
- Errors module — normalizes unknown city, external API failure, network failure, and timeout responses

## Interfaces

- Calls frontend app via HTTP for location search (/api/locations/search) and weather (/api/weather)
- Calls integration services for geocoding provider and weather provider requests
- Writes to database layer for temporary cached API responses (expiresAt)
- Depends on error states from Errors module for retryable UI patterns

## Related

- docs/okf/architecture/system.md
- docs/okf/architecture/frontend.md
- docs/okf/architecture/database.md
- docs/okf/rules/architecture.md