---
title: Freezing service boundaries before the demo platform gets ideas
summary: The recurring risk was building a demo business platform that immediately cheats: shared databases, simulator shortcuts, and infra work outrunning service semantics. The chosen response was to start with versioned service contracts, scenario overlays, and local validation before substantial runtime code, accepting that Phase 0 feels slower in exchange for cleaner later pressure.
date: 2026-04-06
draft: false
project: box
status: Phase 0 complete
tags:
  - contracts
  - architecture
  - simulation
---

## Summary

This project starts from a problem that tends to show up early in demo-platform
work: the moment the runtime becomes urgent, the system starts cheating. Shared
databases appear, scenarios bypass the service interfaces, and infrastructure
gets built faster than the semantics it is supposed to host. The repo answers
that by freezing a small service kernel, versioning contracts first, and making
local validation the first real milestone. It is slower at the start, but it is
also harder to accidentally ruin.

## Context

`box` is deliberately small in scope. The initial service set is fixed to
`party-service`, `catalog-service`, and `transaction-service`. Scenario packs
such as `hotdog-stand` and `it-consultancy` are meant to vary business context
without turning the platform into a generic canonical model for every possible
industry.

The repo already mirrors conventions used elsewhere under `/projects/dev`:
Python tooling with `uv`, `Makefile`-driven verification, ADRs, repo-scoped
agent guidance, and a layout that separates infra, platform composition,
contracts, packages, and scenarios.

## Problem

The ADR names the failure modes directly: shared-database coupling, scenario
logic bypassing business interfaces, infra work outrunning service semantics,
and over-modeling "all businesses" into a swamp of abstractions.

Those are ordinary failures in this kind of project because the fastest path to
an impressive demo is usually also the path that destroys replacement testing
and service credibility later.

## Constraints

- The first service set had to stay fixed instead of expanding into a vague
  platform ambition.
- Every service had to own its own persistence.
- Contracts needed to live under `contracts/<service>/` and version
  independently.
- Scenario packs had to stay as overlays rather than becoming the platform's
  canonical enterprise model.
- The simulator was required to validate payloads against the same contracts the
  services consume.
- Terraform, Talos, and Flux scaffolding had to stay separate from application
  and scenario code.

## Options considered

The repo is clearer here than most. The ADR and product vision reject several
tempting shortcuts in plain language.

- Start by building services and let contracts emerge from implementation. That
  would feel faster, but it would also make the early service boundaries hard to
  trust because they would mostly describe whatever happened to get built first.
- Build a broad canonical business model so the platform can fit any scenario.
  The repo rejects this as a non-goal for Phase 0. It is not trying to model
  every business correctly.
- Let the simulator write directly to service databases for easier demos. The
  ADR explicitly rejects this because it would bypass the very interfaces the
  platform is supposed to demonstrate.
- The chosen direction was a contract-first kernel with local validation,
  scenario overlays, and service replacement credibility treated as the initial
  goal.

## What was built

Phase 0 established the repository scaffold, the architecture ADR, sprintctl and
kctl workflow artifacts, three initial service contracts, two scenario packs,
and shared validation tooling in `packages/contract_kit/` and
`packages/scenario_sdk/`.

The interesting part is what was deliberately left out. The repo does not claim
to have a finished runtime. Instead, it aims to prove that mocked or seeded
payloads validate against the declared contracts before the services or simulator
become large enough to pressure those contracts into irrelevance.

## How it held up

So far the evidence is intentionally modest. Phase 0 is described as complete,
there is a local validation CLI, pytest coverage, and contract plus scenario
content that can be checked before any major service implementation exists.

That is useful, but it is also partial. The repo does not yet support strong
claims about runtime behavior because the three-service kernel and simulator are
still future phases. The honest reading is that the design discipline exists and
the runtime proof is still to come.

[TODO: clarify whether NATS JetStream is a permanent eventing choice or only a
Phase 0 local dependency for the compose-based stack. The current material shows
it in local setup but does not present it as a settled architectural decision.]

## Trade-offs and limits

This approach is slower at the point where many teams would want to show a live
demo. Writing contracts and validation before service behavior feels deliberate
in the least glamorous way.

The repo is also still early. There are only two visible commits so far: the
initial scaffold and a publish-state record. That matches the written phase
status. It does not leave much room to pretend there is more operational proof
than there really is.

## What I'd change

The next meaningful step is to build the reference FastAPI services and keep the
contract discipline intact while the runtime gets real. If the boundary survives
that pressure, the case for the approach gets much stronger.

I would also add contract-compatibility checks sooner rather than later. The ADR
already names that follow-up, and it is the kind of thing that is easy to
support in principle and slightly less fun once several versions already exist.