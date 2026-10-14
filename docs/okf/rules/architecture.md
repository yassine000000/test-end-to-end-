---
type: Architecture Rules
title: Architecture Rules
description: Non-negotiable invariants and the forbidden stack.
tags: [rules, a, api, app, css, lightweight]
timestamp: 2026-10-14T14:26:47.266641+00:00
provenance: derived
arch_version: 1
renderer_version: 2
content_hash: sha256-7409532bd09820d908655f5300a8c35718a7d3e9adb2b5ff35ddfd234b15b233
source_refs: [arch_state.decisions]
---

# Architecture Rules — Invariants

## Invariants (non-negotiable)
1. NEVER invent architecture, libraries, or structure absent from this OKF.
2. The locked stack below is law. Do not substitute equivalents.
3. A request that contradicts these rules → STOP and surface the conflict.
4. Missing information → ASK. Never assume.

## Forbidden Stack
No forbidden technologies recorded.

The locked stack itself is recorded as ADRs in `decisions/` — see `decisions/index.md`.
