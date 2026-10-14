---
type: Coding Rules
title: Code Standards
description: Coding conventions, error handling, and banned alternatives for WeatherTrack.
tags: [typescript, nodejs, react, rest, json, tailwind-css, react-query]
timestamp: 2026-10-14T00:00:00Z
provenance: authored
arch_version: 1
renderer_version: 2
content_hash: sha256-3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d
source_refs: [arch_state, low_level_state]
---

# Code Standards — WeatherTrack

## Language & Runtime

- **Language:** TypeScript.
- **Runtime:** Node.js.

## Framework Conventions

- Build the browser UI as a React application with one public homepage and a single search-and-results flow.
- Keep the API as a lightweight Node.js REST JSON service with separate location search and weather endpoints.
- Use Tailwind CSS for utility-first styling and keep visual rules consistent across the single-screen experience.
- Use React Query on the client for request state, retries, loading, and result caching behavior.
- Keep external geocoding and weather provider logic behind the backend API.

## Naming

- **Files:** kebab-case for shared documents and conventional framework file naming for source files.
- **Variables & functions:** camelCase.
- **Components/Classes:** PascalCase.

## Error Handling

Never swallow errors; use typed errors or structured error responses, and never hide provider failures from the retry flow.

## DO NOT USE

- ✗ Authentication frameworks — the app is public read-only.
- ✗ User-account systems — no login or profile flow is required.
- ✗ Payment libraries — payments and subscriptions are out of scope.
- ✗ Admin dashboard frameworks — no internal admin screen is needed.
- ✗ Heavy infrastructure orchestration — keep the deployment simple and inexpensive.

## Lint & Format

- TypeScript and JavaScript: ESLint + Prettier.

See `docs/okf/rules/architecture.md` for the forbidden stack.

## Related

- `docs/okf/rules/architecture.md`
- `docs/okf/architecture/system.md`
- `docs/okf/architecture/backend.md`
- `docs/okf/architecture/frontend.md`
- `docs/okf/architecture/database.md`