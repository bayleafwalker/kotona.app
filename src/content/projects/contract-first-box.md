---
title: Freezing service boundaries before the demo platform gets ideas
summary: >-
  Box is a contract-first platform scaffold that fixes a small service kernel
  before runtime convenience can blur its boundaries. Scenario packs stay as
  overlays, and local validation checks their coherence before a runtime exists.
published: 2026-04-06
lastRevised: 2026-07-13
lastVerified: 2026-07-13
draft: false
project: box
kind: engineering
status: Phase 0 initialized
featured: false
repoUrls:
  - https://github.com/bayleafwalker/box
evidence:
  capability: >-
    Three service contracts and two scenario packs pass local document and
    schema validation; service implementations and a simulator do not exist.
  latest: Phase 0 contract baseline
  proofLinks:
    - label: Source repository
      href: https://github.com/bayleafwalker/box
  integrations: []
  knownLimitation: >-
    The repository proves coherent boundaries, not a running platform or
    service replacement.
  nextProof: >-
    Run one end-to-end slice through all three services with service-owned
    persistence and contract-valid events.
tags:
  - contracts
  - architecture
  - simulation
---

## Overview

Box is a small "business in a box" platform built around contract-first service
boundaries and scenario overlays. It generalizes part of the household-platform
work into a deliberately smaller test: can a reusable business kernel support
different scenarios without turning into one application with decorative
service names?

The repository fixes the initial boundaries early because demo pressure is
excellent at inventing shared databases, private imports, and simulator
shortcuts. Those choices make a demo move quickly and make the architecture
meaningless. Box starts with the interfaces instead.

## System shape

The initial kernel contains `party-service`, `catalog-service`, and
`transaction-service`. Each has a service manifest, an OpenAPI contract, an
event schema, and example payloads under its own contract directory. The
`hotdog-stand` and `it-consultancy` scenario packs provide seeds and policies
without changing that kernel.

Local Python tooling validates both service contracts and scenario content. A
Compose file defines the future Postgres and NATS dependencies, while the
Terraform, Talos, and Flux trees reserve the intended deployment boundaries.
They are scaffolding, not a deployed platform.

## Current state

As verified on 13 July 2026, Box remains at its Phase 0 baseline. The repository
contains the architecture decision, staged requirements, three initial service
contracts, two scenario packs, validation tooling, and tests for the document
and schema contracts.

There are still no service implementations or simulator runtime. The three
service directories are boundary stubs, not running reference services. That is
an honest limit: the repository currently shows that its definitions are
coherent, not that the proposed platform works under load or replacement.

The project has also moved slowly since the initial scaffold. It is useful as a
frozen architectural experiment, but it is not one of the actively operated
systems yet.

## Open edges

The next meaningful proof is an end-to-end slice through the three reference
services using service-owned persistence and contract-valid events. After that,
the deterministic simulator has to generate both scenario packs without
writing around the public interfaces.

The stronger test comes later: replace one service with another implementation
while callers and scenarios remain unchanged. Until that works, "contract
first" is a design constraint with good tests, not replacement proof.
