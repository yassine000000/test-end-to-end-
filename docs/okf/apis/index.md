---
type: Index
title: APIs
description: API endpoints derived from the low-level blueprint.
tags: [apis, a, api, app, css, lightweight]
timestamp: 2026-10-14T14:26:47.266641+00:00
provenance: derived
arch_version: 1
renderer_version: 2
content_hash: sha256-3a57b1a6fc35f48df391a21706562222700baf33e353555908ac5fefd4af7e4b
source_refs: [low_level_state.api]
---

# APIs (from ③)

| Method | Path | Query parameters | Success response |
|---|---|---|---|
| `GET` | `/api/locations/search` | `q` — city name, at least two characters | `{ locations: CityLocation[] }` |
| `GET` | `/api/weather` | `latitude`, `longitude`; optional selected-location display metadata | `WeatherResponse` with current weather, five forecast days, cache status, and update time |

Both endpoints return a normalized `ApiErrorResponse` for validation, provider, network, timeout, and cache-configuration failures.
