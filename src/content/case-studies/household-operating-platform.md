---
title: Turning household analytics into an operating platform
summary: A household analytics project had outgrown dashboards, but turning it into Home Assistant logic or many services would have hurt the semantics. The repo instead moves toward a modular monolith with Home Assistant as a partner layer and a staged path toward planning and policy.
date: 2026-04-08
draft: false
project: homelab-analytics
status: Stage 2 complete; Stages 3-5 partial
tags:
  - architecture
  - home assistant
  - data platform
---

## Summary

The project started as a household analytics platform and then ran into a more
annoying problem: visibility was useful, but it did not answer planning,
simulation, or policy questions. The repo chose to stay as one modular
monolith, keep Home Assistant as a first-class partner instead of an execution
substrate, and make the semantic model explicit enough that later stages could
build on it. That trades some immediate simplicity for a clearer long-term
boundary: fewer runtime pieces, more discipline inside the codebase.

## Context

The repo already had a working pipeline across landing, transformation, and
reporting, plus finance, utilities, and overview capability packs. It also had
three different runtime surfaces in play at once: a FastAPI API, a worker, and
a Next.js web shell.

Home Assistant was already important, but not in the usual "just turn it into a
custom integration" way. The docs are explicit that it should remain the edge
runtime, device hub, family-facing UI, and primary actuation surface, while the
platform keeps the cross-domain semantics that Home Assistant does not model
well.

[TODO: clarify when the identity shift from analytics platform to operating
platform first became visible in runtime behavior rather than only in the
documentation. The reviewed material is stronger on direction than on the exact
turning point.]

## Problem

The recurring friction was that descriptive reporting had stopped being enough.
The project could already explain what had happened across money, utilities,
and household state, but the next questions were managerial rather than purely
analytical: what should the budget target be, what changes if a tariff shifts,
what policies should trigger, and which actions belong in Home Assistant versus
the platform itself.

Without a clearer architecture, the likely failure modes were obvious enough:
either keep accumulating special-case logic in an analytics codebase, or push
too much cross-domain reasoning into Home Assistant because it already had the
devices and dashboards.

## Constraints

- Home Assistant had to be treated as a first-class integration partner, not as
  the platform itself.
- The project needed one repo and one deployment story rather than a small
  parade of services.
- Bronze, silver, and gold data boundaries had to remain explicit because the
  same underlying facts support both analytics and control semantics.
- Postgres and DuckDB already had different roles, so the database story needed
  separation rather than false unification.
- Later goals such as policy and agentic assistance could not be allowed to
  flatten the semantic model into a chat-shaped shortcut.

## Options considered

The docs do not present a single neat alternatives table, but they make the
practical options clear enough.

- Keep the repo as a household analytics platform and stop there. This was the
  least disruptive option, but it left planning, simulation, and policy work as
  awkward add-ons instead of first-class capabilities.
- Collapse the project into Home Assistant as an add-on or custom integration.
  This would have reused an existing runtime and UI, but it would also have
  forced cross-domain household semantics into a model that is strong on device
  state and weak on finances, contracts, loans, lineage, and long-horizon
  planning.
- Split the codebase into separate service products around API, worker, and web
  concerns. The repo rejects this directly: the useful boundary is change rate
  and conceptual ownership, not turning every runtime surface into a separate
  product.
- The chosen direction was a modular monolith with hard internal contracts,
  explicit capability packs, and Home Assistant positioned as a partner layer
  for ingest, publication, and actuation.

## What was built

The project formalized an 11-stage roadmap from documentation reset through
canonical household semantics, operating views, planning, simulation, policy,
adapters, multi-renderer delivery, trust, and eventually agentic assistance.

Architecturally, the core decision was to harden the repo around internal
stability strata rather than service count: kernel, semantic engine, product
packs, and surfaces. The platform ADR keeps the modular monolith shape, while
the direction ADR explains what new stages add on top of it.

Home Assistant integration is treated as a six-layer bridge rather than as a
host container for the whole project. That includes entity normalization,
bidirectional event and command flow, synthetic entity publication back into
Home Assistant, and an approval-aware action model. It is a fairly deliberate
refusal to make one tool pretend to be all tools.

## How it held up

The evidence is partial but respectable.

Stage 2 is marked complete and delivered as `v0.1.0` on `2026-03-20`. The
roadmap says Stage 3 is partially complete, Stage 4 is partially complete with
five shipped scenario types, and Stage 5 is substantially complete in the
current worktree through the Home Assistant bridge, policy evaluation, approval
flows, and synthetic entity publication.

The repo also has a large pytest suite covering architecture contracts, domain
logic, storage adapters, and API behavior. That does not prove the later stages
are finished, but it does suggest the project is being forced through more than
README-level validation.

## Trade-offs and limits

The design is intentionally more structured than a normal homelab side project,
which means documentation and semantic governance can get ahead of runtime
closure. The roadmap still lists real unfinished work in Stage 1, especially
around publication semantics and `dim_household_member`.

Later stages are also clear on direction without being fully committed on
implementation. The simulation, policy, trust, adapter, and agent layers are
stronger as architectural commitments than as fully closed technical stories.
That is fine, but it is still a limit.

## What I'd change

The next sensible step is not another burst of Home Assistant features. It is
to finish the remaining semantic-governance cleanup from Stage 1 and extract the
integration contracts proven by the Home Assistant bridge into a cleaner adapter
model.

I would also tighten the chronology around the analytics-to-operations shift.
The design direction is clear now, but the repo would be easier to understand if
the transition from useful analytics system to operating platform was easier to
trace without reading half the docs tree.
