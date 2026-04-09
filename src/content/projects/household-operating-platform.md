---
title: Turning household analytics into an operating platform
summary: >-
  Homelab Analytics is a household operating platform that keeps planning,
  simulation, and policy logic in one repo, with Home Assistant used as a
  device-facing partner rather than as the core execution model.
date: 2026-04-08
draft: false
project: homelab-analytics
status: Stage 2 complete; Stages 3-5 partial
repoUrl: https://github.com/bayleafwalker/homelab-analytics
tags:
  - architecture
  - home assistant
  - data platform
---

## Overview

Homelab Analytics is the repository for a household data and decision layer. It
started from reporting work and now centers on keeping household facts,
planning inputs, and policy logic in one place that can support analytics and
operational behavior at the same time.

The repo is not trying to turn Home Assistant into the whole platform or split
every surface into its own service. Its role is to hold the cross-domain model
behind finance, utilities, planning, and household policy.

## System shape

The current architecture is a modular monolith with explicit internal strata
for kernel logic, semantic handling, product packs, and delivery surfaces.
Bronze, silver, and gold data boundaries remain explicit, and Postgres and
DuckDB keep different responsibilities rather than being flattened into one
storage story.

Home Assistant stays as a partner layer for device-facing behavior. The current
design treats it as the edge runtime, family-facing UI, and actuation surface,
while the repo keeps the longer-lived semantics that do not fit neatly into
entity state and automations.

## Current state

Stage 2 is marked complete and released as `v0.1.0`. Later stages for
planning, simulation, and policy are partially in place, with scenario support,
a Home Assistant bridge, policy evaluation, approval flows, and synthetic
entity publication already present in the worktree.

The repo also carries a large pytest suite across architecture contracts,
domain logic, storage adapters, and API behavior. That does not make the later
roadmap stages complete, but it does mean the project is being exercised as
software rather than only described as intent.

## Open edges

The remaining work is mostly about finishing the semantic cleanup that earlier
stages depend on and tightening the adapter contracts around Home Assistant and
other boundary integrations. Publication semantics and a few household-dimension
details are still not fully closed.

The later trust and agent-oriented layers are directionally defined more
clearly than they are operationally delivered. The project already has the
shape of an operating platform, but some of the later layers are still roadmap
commitments rather than closed implementation surfaces.