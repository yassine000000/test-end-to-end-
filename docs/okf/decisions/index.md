---
type: Index
title: Decisions Index
description: Index of every locked architecture decision (ADR).
tags: [decisions, a, api, app, css, lightweight]
timestamp: 2026-10-14T14:26:47.266641+00:00
provenance: derived
arch_version: 1
renderer_version: 2
content_hash: sha256-22da3eb74183a0ad1c8f5225a1dfb4d0e63b0ecafd4cffe569b5d532b25dd22b
source_refs: [arch_state.decisions]
---

# Decisions (ADR Index)

| ADR | Key | Value | Status |
|---|---|---|---|
| [ADR-001](adr-001.md) | `arch.access_control` | Public read-only access | locked |
| [ADR-002](adr-002.md) | `arch.api_style` | REST JSON API | locked |
| [ADR-003](adr-003.md) | `arch.folder_structure` | frontend app, backend api, shared types, integration services, cache layer, UI components | locked |
| [ADR-004](adr-004.md) | `arch.routing_convention` | Single homepage with search results below, plus API endpoints for geocoding and weather | locked |
| [ADR-005](adr-005.md) | `data.schema_outline` | search_requests, location_candidates, selected_location, weather_snapshot, forecast_day, cache_entry, api_error | locked |
| [ADR-006](adr-006.md) | `infra.file_storage` | none | locked |
| [ADR-007](adr-007.md) | `infra.hosting` | Managed web hosting and managed API hosting | locked |
| [ADR-008](adr-008.md) | `stack.auth_provider` | none | locked |
| [ADR-009](adr-009.md) | `stack.client_state` | React Query | locked |
| [ADR-010](adr-010.md) | `stack.database` | PostgreSQL | locked |
| [ADR-011](adr-011.md) | `stack.database_provider` | Managed PostgreSQL | locked |
| [ADR-012](adr-012.md) | `stack.forbidden` | none | locked |
| [ADR-013](adr-013.md) | `stack.framework` | React web app with a lightweight Node.js API | locked |
| [ADR-014](adr-014.md) | `stack.language` | TypeScript | locked |
| [ADR-015](adr-015.md) | `stack.ui_library` | Tailwind CSS | locked |
| [ADR-016](adr-016.md) | `stack.build_tool` | Vite | locked |
| [ADR-017](adr-017.md) | `stack.api_framework` | Express | locked |
| [ADR-018](adr-018.md) | `stack.postgres_client` | pg | locked |
| [ADR-019](adr-019.md) | `integration.weather_provider` | Open-Meteo geocoding and forecast APIs | locked |
