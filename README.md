# WeatherTrack

**Summary:** WeatherTrack is a simple public web application that lets anyone search for a city and view current weather conditions plus a 5-day forecast. It serves casual end users who need quick weather lookup without accounts, admin workflows, payments, saved favorites, or extra screens. The project exists to keep the MVP focused, reliable, inexpensive, and maintainable.

## Documentation Map
- `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` — per-assistant bootstrap adapters with the operating contract and entry chain into `docs/okf/`.
- `README.md` — project map, repository structure, and integration reference.
- `tasks.md` — implementation backlog with priorities.
- `docs/okf/` — the OKF knowledge tree and single source of truth: `manifest.json`, `protocol.md`, `index.md`, `architecture/`, `rules/`, `decisions/`, `context/`.
- `docs/okf/architecture/system.md` — system overview and dataflow.
- `docs/okf/rules/coding.md` — code standards, naming conventions, and banned libraries.
- `.claude/agents/` — specialist agent prompts for complex domain tasks.
- `.claude/mcp.json` — MCP server configuration.

## Architecture Overview
This project follows a React web app with a lightweight Node.js REST JSON API pattern — see `docs/okf/architecture/system.md` for the overview and `docs/okf/decisions/` for locked ADRs.

## Repository Structure

_Rendered from the final bundle at finalize (R-7) — it always matches the files shipped._

```
project/
├── .claude/                             # assistant workspace config
│   ├── agents/                          # specialist sub-agents
│   │   ├── code-quality-reviewer.md
│   │   ├── database-specialist.md
│   │   └── framework-specialist.md
│   └── mcp.json
├── docs/
│   └── okf/                             # OKF knowledge tree (single source of truth)
│       ├── apis/
│       │   └── index.md
│       ├── architecture/
│       │   ├── backend.md
│       │   ├── database.md
│       │   ├── frontend.md
│       │   ├── index.md
│       │   └── system.md
│       ├── context/
│       │   └── project.md
│       ├── decisions/
│       │   ├── adr-001.md
│       │   ├── adr-002.md
│       │   ├── adr-003.md
│       │   ├── adr-004.md
│       │   ├── adr-005.md
│       │   ├── adr-006.md
│       │   ├── adr-007.md
│       │   ├── adr-008.md
│       │   ├── adr-009.md
│       │   ├── adr-010.md
│       │   ├── adr-011.md
│       │   ├── adr-012.md
│       │   ├── adr-013.md
│       │   ├── adr-014.md
│       │   ├── adr-015.md
│       │   └── index.md
│       ├── rules/
│       │   ├── architecture.md
│       │   ├── coding.md
│       │   └── index.md
│       ├── schemas/
│       │   └── index.md
│       ├── workflows/
│       │   └── index.md
│       ├── index.md
│       ├── manifest.json
│       └── protocol.md
├── AGENTS.md                            # Agent bootstrap adapter (Codex / generic)
├── CLAUDE.local.md                      # Local, git-ignored agent notes
├── CLAUDE.md                            # Agent bootstrap adapter (Claude Code)
├── GEMINI.md                            # Agent bootstrap adapter (Gemini)
├── README.md                            # This file — project map
└── tasks.md                             # Implementation backlog
```

## Module Expansion Rules
1. Before adding a module, read `docs/okf/architecture/system.md` and `docs/okf/rules/architecture.md` to verify the change fits the locked architecture.
2. Add frontend work under `frontend/src/` only when it supports the single public homepage flow.
3. Add backend API route work under `backend/src/` and keep the public REST JSON contract aligned with `GET /api/locations/search` and `GET /api/weather`.
4. Add shared request and response models under `shared/` when frontend and backend both need the same TypeScript shapes.
5. Add geocoding and weather provider clients under `integrations/` so external provider details stay out of the browser.
6. Add cache behavior under `cache/` and preserve the ten-minute weather response expiration rule.
7. Register new backend modules in the backend API entry point when implementation files are created, then update `tasks.md` with any follow-up work.
8. Do not add comparisons, favorites, authentication, user accounts, admin screens, payments, subscriptions, or additional screens.

## API / Communication Contract
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/locations/search` | City name query string | Matching city names, countries, and geographic coordinates for user selection |
| GET | `/api/weather` | Selected latitude and longitude | Current weather observations, five-day weather forecast, cache status, and last updated time |

## Getting Started
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development
npm run dev
```
