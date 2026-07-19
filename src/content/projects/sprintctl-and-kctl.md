---
title: Building an AgentOps substrate because agents kept editing the wrong line
summary: >-
  sprintctl and kctl began as schema-enforced sprint and knowledge tools. They
  now sit beside actionq, auditctl, and a live AgentOps cockpit, with each tool
  owning one kind of operational state.
published: 2026-04-09
lastRevised: 2026-07-17
lastVerified: 2026-07-17
draft: false
project: sprintctl-and-kctl
kind: engineering
status: Published and in active use
featured: true
repoUrls:
  - https://github.com/bayleafwalker/sprintctl
  - https://github.com/bayleafwalker/kctl
  - https://github.com/bayleafwalker/actionq
  - https://github.com/bayleafwalker/auditctl
  - https://github.com/bayleafwalker/agentops
externalUrl: https://bayleafwalker.github.io/agentops/
tags:
  - agents
  - workflow
  - cli-tooling
---

## Overview

sprintctl started with a mundane failure: humans and agents were editing the
same Markdown sprint files, and agents kept pattern-matching against the wrong
piece of prose. Better prompts reduced the frequency but did not change the
failure mode. The durable fix was to move live sprint state into a schema and
make a CLI the write authority.

kctl followed as the read-only knowledge path. It consumes sprint history,
extracts durable and coordination candidates, and puts them through explicit
review and publication. It does not silently turn every session note into
canon, and it never writes work back into sprintctl.

Those two tools are still useful on their own. They are no longer the whole
story. The same state-ownership rule has grown into a small AgentOps substrate:
each repository owns one operational domain, and the cockpit composes their
read surfaces instead of becoming a new database with opinions about all of
them.

Here, “AgentOps” means the local operational substrate for agent-assisted work on my own repositories, not AgentOps.ai, the commercial agent-observability product.

## Interactive ecosystem map

[Explore the interactive AgentOps ecosystem map](https://bayleafwalker.github.io/agentops/)
to follow the wider lifecycle across sprintctl, kctl, actionq, the dispatcher,
auditctl, deployment, and the cockpit. It focuses on state ownership and the
handoffs between tools rather than treating the cockpit as the system itself.

## System shape

sprintctl owns sprints, work items, dependencies, events, claims, and handoffs.
It runs against repo-local SQLite or a shared PostgreSQL backend, and a declared
backend mismatch fails rather than quietly opening a different source of truth.
Claim tokens prove ownership; resume and handoff commands turn live state into
deterministic context for a new operator or agent session.

kctl reads sprintctl events and owns the extraction, review, publication, and
rendering of knowledge artifacts. The relationship is deliberately one-way.
Rendered Markdown remains useful for review and Git history, but it is a
projection, not the live control plane.

The sibling tools fill different gaps:

- `actionq` owns PostgreSQL-backed action and session lifecycles with a strict
  queue contract and append-only events.
- `auditctl` owns a repo-local audit index plus durable daily NDJSON artifacts
  that can be rebuilt and read independently.
- `agentops` owns cross-repository plans and the cockpit. It reads sprint state,
  queue sessions, audit artifacts, and cost signals; dispatch writes go through
  the actionq contract, while authenticated sprint mutations go through
  sprintctl's MCP contract rather than direct database mutation.

The rule across all five is simple: state ownership decides repository
ownership. It is also the main defense against building a cockpit-shaped
monolith.

## Current state

The tools are public and used across active repositories. sprintctl supports
both local and remote modes, recoverable claims, provenance links, and a
single-command resume bundle. kctl has a functioning two-stream extraction and
review pipeline. actionq supplies the queue and session read contracts, while
auditctl emits portable audit shards.

The AgentOps cockpit is live and can show repository and sprint state, claims,
session and dispatch lifecycles, audit outcomes, and bounded cost or model
headroom signals. Its dispatch surface forwards work through actionq. sprintctl
state and workspace artifacts remain separate service contracts rather than
tables the UI is free to rewrite.

This is a different system from the original pair of pipx-installed SQLite
tools. Local-first operation is still the default for a small repository, but
PostgreSQL and the cockpit now provide a shared view when work crosses hosts or
needs an operator surface.

## Open edges

The substrate has enough parts that it must continually justify them. A tool
designed to remove coordination ambiguity can recreate it through version
drift, overlapping commands, or unclear recovery rules between repositories.
Interface contracts and end-to-end verification matter more now than another
feature in any one CLI.

kctl and auditctl are also less exercised than sprintctl and the cockpit. Their
clean ownership boundaries are promising, but durable extraction and recovery
need more operational mileage before they should be treated as settled.

The cockpit write surface should stay narrow. Dispatch and explicit sprint
operations are useful; turning the UI into a privileged backdoor around claim,
queue, or audit rules would recreate the original Markdown problem with better
CSS.
