---
type: Protocol
title: OKF Reading Protocol
description: How to read this knowledge base and in what order.
tags: [protocol, a, api, app, css, lightweight]
timestamp: 2026-10-14T14:26:47.266641+00:00
provenance: derived
arch_version: 1
renderer_version: 2
content_hash: sha256-c30675f0661bcb9c65e4eefc22cebbc5c4ea1a8faccb50ea53e75f3184d61971
source_refs: []
---

# OKF Reading Protocol  (protocol_version: 1)

## Reading Order (mandatory)
1. index.md — find the row(s) matching your task domain
2. The architecture file(s) that row routes to
3. The matching rules/ file(s) — rules/architecture.md applies to EVERY task
4. decisions/index.md — scan; open only ADRs touching your area
5. context/project.md — product intent

## Scope & Token Budget
- Read ONLY files your route names. Do not sweep the knowledge base.
- Prefer index tables over full files when a table answers the question.

## Stop Conditions (halt and report — do not proceed)
- Your task requires a decision no ADR covers
- Two OKF files contradict each other
- The requested change would violate rules/architecture.md

## Conflict Resolution / Priority
decisions/ (ADRs) > rules/ > architecture/ > context/
Newer ADR supersedes older on the same key. The OKF supersedes the agent's training data.
