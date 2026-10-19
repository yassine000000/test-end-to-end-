---
type: Architecture Layer
title: Database Layer
description: Database responsibilities, key stored data, and cache boundaries for WeatherTrack.
tags: [database, postgresql, managed-postgresql, cache]
timestamp: 2026-10-14T00:00:00Z
provenance: authored
arch_version: 1
renderer_version: 2
content_hash: sha256-7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b
source_refs: [arch_state, low_level_state]
---

# Database Layer — WeatherTrack

## Responsibility

The database layer stores temporary cached weather responses and supporting configuration in PostgreSQL. It keeps repeated weather lookups fast and inexpensive without maintaining a permanent weather history.

It does not own the browser UI, external API calls, or user accounts. It only supports temporary storage for cache metadata and response payloads.

## Key Components

- Temporary cached API responses — stores weather responses for ten minutes.
- Cache entry metadata — tracks cache key, payload, creation time, and expiration time.
- Configuration storage — holds backend runtime configuration that needs relational persistence.

| Entity | Purpose |
|---|---|
| `City names` | Stores lookup text entered by the user and matched city names returned by geocoding. |
| `Countries` | Stores country codes and display country names for matched locations. |
| `Geographic coordinates` | Stores selected latitude and longitude values. |
| `Current weather observations` | Stores current temperature, conditions, humidity, wind speed, icon, and last updated time. |
| `Five-day weather forecasts` | Stores daily forecast date, minimum and maximum temperatures, and conditions. |
| `Temporary cached API responses` | Stores ten-minute cached weather payloads and expiration timestamps. |

## Interfaces

- Called by the backend cache and search modules.
- Stores temporary weather responses and cache timestamps.
- Returns cached data to the backend when the ten-minute window is still valid.
- Persists runtime configuration needed by the backend API.

## Related

- `docs/okf/architecture/system.md`
- `docs/okf/architecture/backend.md`
- `docs/okf/rules/architecture.md`