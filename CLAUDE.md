> PROJECT MODE: BUILD
# WeatherTrack — Claude Code Guide

## Knowledge Source (read before ANY change)
`docs/okf/` is the single source of truth. Before modifying anything, read `docs/okf/protocol.md` and route via `docs/okf/index.md` to the files your task needs. Never invent architecture, endpoints, entities, or file paths — if the OKF does not cover it, STOP and ask.

## Locked Stack
- **Language:** TypeScript
- **Framework:** React web app with a lightweight Node.js API
- **API style:** REST JSON API
- **UI library:** Tailwind CSS
- **Database:** PostgreSQL
- **Database provider:** Managed PostgreSQL
- **Client state:** React Query
- **Hosting:** Managed web hosting and managed API hosting
- **Access control:** Public read-only access
- **Auth provider:** none
- **File storage:** none

## DO-NOT-USE
- No authentication framework
- No payments or subscriptions
- No admin CMS
- No complex infrastructure
- No user accounts

## Build Mode
The project starts in Build Mode. Loop: read Governance → acquire knowledge from `docs/okf/` → read `tasks.md` (the ONLY work queue) → implement → verify → continue. No architecture redesign, no invented solutions. Build Mode ends at the `tasks.md` Finalize Build task, which switches this banner BUILD → DEV.

## Development Mode
After Finalize Build: every change runs the fixed loop — Problem → Knowledge Acquisition (OKF) → Deep Analysis → Architecture Impact → Plan → User Approval → Tasks → Implementation → OKF Update → Verification → Close. Architecture changes are legal ONLY through this loop.

## Standing Invariants
- **code ⇄ docs/okf:** the docs always describe what the code does. Finishing ANY modification obliges the matching OKF update in the same work package.
- **Deviation rule:** if a task cannot be implemented as designed, or the code contradicts the OKF, STOP and report — never redesign silently, never invent a workaround.
- **Cross-references:** `tasks.md` (the contract) and `docs/okf/protocol.md` (how to read knowledge).
