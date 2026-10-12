---
title: Freezing service boundaries before the demo platform gets ideas
summary: >-
  Box is a contract-first platform scaffold that fixes a small service kernel
  before runtime convenience can blur its boundaries. Scenario packs stay as
  overlays, with validation tooling defined before a service runtime exists.
published: 2026-04-06
lastRevised: 2026-10-12
lastVerified: 2026-10-12
draft: false
project: box
kind: engineering
status: Phase 0 initialized
featured: false
repoUrls:
  - https://github.com/bayleafwalker/box
evidence:
  capability: >-
    The source contains three service contracts, two scenario packs, validation
    tooling, and tests. This repository review did not rerun validation or
    establish a working service runtime.
  latest: Phase 0 repository scope reviewed on 12 October 2026
  proofLinks:
    - label: Source repository
      href: https://github.com/bayleafwalker/box
  integrations: []
  knownLimitation: >-
    The reviewed source establishes the contract scaffold, not a fresh test
    result, running platform, or service-replacement proof.
  nextProof: >-
    Run one end-to-end slice through all three services with service-owned
    persistence and contract-valid events.
tags:
  - contracts
  - architecture
  - simulation
terms:
  - term: Box
    definition:
      A contract-first platform scaffold for testing a small reusable service
      kernel before implementing its runtime.
reference:
  purpose: current-project-orientation
  discoverFor:
    - fixing service boundaries before a runtime exists
    - validating service contracts and scenario overlays locally
  establishes:
    - the presence of three service contracts, two scenario packs, and their
      validation tooling in the reviewed source
    - that the repository describes a contract-first Phase 0 scaffold
  doesNotEstablish:
    - a new validation result from the October repository review
    - runtime behaviour or replacement of an existing platform or service
  supplementWith:
    - a fresh validation run and the receiving system's deployment constraints
---

## Overview

Box is a small "business in a box" platform built around contract-first service
boundaries and scenario overlays. It generalizes part of the household-platform
work into a deliberately smaller test: can a reusable business kernel support
different scenarios without turning into one application with decorative service
names?

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

Local Python tooling is provided to validate service contracts and scenario
content. A Compose file defines the local Postgres and NATS dependency stack,
while the Terraform, Talos, and Flux trees reserve the intended deployment
boundaries. They are scaffolding, not evidence of a deployed platform.

## Current state

The source review on 12 October 2026 checked the repository README and tree.
They still present the Phase 0 scaffold: architecture decisions, staged
requirements, three initial service contracts, two scenario packs, validation
tooling, and tests. Reference services, a simulator, and a working deployment
path remain listed as subsequent implementation steps.

This review did not execute the validator, pytest, or a deployment. The 13 July
2026 version of this page recorded passing local document and schema validation;
that is historical evidence, not a new October test result. The verification
date above applies to the narrower repository-scope assessment.

The useful distinction remains the same: coherent definitions do not establish
that the proposed platform works under load or survives a service replacement.
This is a contract-first architectural scaffold, not an operated reference
platform.

## Open edges

The next meaningful proof is an end-to-end slice through the three reference
services using service-owned persistence and contract-valid events. After that,
the deterministic simulator has to generate both scenario packs without writing
around the public interfaces.

The stronger test comes later: replace one service with another implementation
while callers and scenarios remain unchanged. Until that works, "contract first"
is a design constraint with validation tooling, not replacement proof.
