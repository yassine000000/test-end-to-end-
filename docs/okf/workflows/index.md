---
type: Index
title: Build Order
description: Build phases derived from the low-level blueprint.
tags: [workflows, a, api, app, css, lightweight]
timestamp: 2026-10-14T14:26:47.266641+00:00
provenance: derived
arch_version: 1
renderer_version: 2
content_hash: sha256-fc47ddc9dc340cff1b01ad08d1cdb0029871d2db3b455c129be5170eafd4025e
source_refs: [low_level_state.build_order]
---

# Build Order (from ③)

1. `phase_data_model` — Define weather domain entities and temporary cache storage.
2. `phase_backend_modules` — Create geocoding, weather, cache, search, and error handling modules.
3. `phase_api_contracts` — Expose public REST JSON endpoints for location search and weather summary.
4. `phase_frontend_home` — Build the single homepage search-and-results experience.
5. `phase_shared_structure` — Organize shared types, backend API, integration services, and cache layer directories.
6. `phase_access_rules` — Apply public read-only access across homepage and APIs.
7. `phase_flows` — Validate lookup, cache, error, and retry flows end-to-end.
