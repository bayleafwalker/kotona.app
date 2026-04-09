---
title: Freezing service boundaries before the demo platform gets ideas
summary: >-
  Box is a contract-first platform repo that fixes a small service kernel
  before runtime convenience can blur the boundaries. Scenarios stay as
  overlays and local validation proves the interfaces before broader
  implementation work.
date: 2026-04-06
draft: false
project: box
status: Phase 0 complete
repoUrl: https://github.com/bayleafwalker/box
tags:
  - contracts
  - architecture
  - simulation
---

## Overview

Box is a small platform repo built around contract-first service boundaries and
scenario overlays. The repository fixes the initial kernel early so the project
does not slide into a demo platform where shared databases and simulator
shortcuts erase the boundaries it is supposed to test.

The scope is intentionally narrow. The point is not to model every possible
business correctly, but to prove that a small service set can keep clean
interfaces while different scenarios reuse the same platform shape.

## System shape

The initial service kernel is fixed to `party-service`, `catalog-service`, and
`transaction-service`. Contracts live under `contracts/<service>/`, scenario
packs stay as overlays, and validation tooling is expected to check the same
payloads that the services and simulator will later consume.

The repo layout keeps infrastructure, platform composition, contracts,
packages, and scenarios separate. Shared tooling in `packages/contract_kit/`
and `packages/scenario_sdk/` is there to support the boundary model rather than
to hide it.

## Current state

Phase 0 is complete. The repository already has the scaffold, the architecture
ADR, workflow artifacts, three initial service contracts, two scenario packs,
and local validation tooling for contracts and scenario content.

What it does not claim yet is a finished runtime. The current state is stronger
on boundary discipline than on service behavior, which is appropriate for the
phase the repo is in.

## Open edges

The next meaningful test is whether the same contract discipline survives once
the reference FastAPI services and simulator become more concrete. That is the
stage where demo pressure usually starts asking for shortcuts.

Contract-compatibility checks and the long-term eventing choice also still need
tighter closure. The repo already states the direction clearly, but some of the
runtime proof is deliberately left for later phases.