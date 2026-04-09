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
repoUrls:
  - https://github.com/bayleafwalker/homelab-analytics
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

The project carries habits from professional data platform work in financial
services and regulatory reporting. The bronze, silver, and gold data boundaries
are not a homelab affectation, they are the same separation pattern that keeps
transformation layers auditable under constraints, applied here because the 
household domain has enough cross-cutting facts across finance, utilities, 
contracts, and device state that a looser model would quietly rot.

The shift from analytics to operating platform followed the same path it
follows in enterprise work: descriptive reporting becomes useful, then someone
asks a planning question the reporting layer cannot answer without pretending to
be something else. Rather than bolting simulation and policy onto a reporting
codebase or pushing cross-domain reasoning into Home Assistant because it
already has the dashboards, the repo formalized the boundary and kept the
semantic model explicit enough that later stages can build on it without
rewriting the foundation.

The repo is not trying to turn Home Assistant into the whole platform or split
every surface into its own service. Its role is to hold the cross-domain model
behind finance, utilities, planning, and household policy.

## System shape

The current architecture is a modular monolith with explicit internal strata
for kernel logic, semantic handling, product packs, and delivery surfaces.
Bronze, silver, and gold data boundaries remain explicit.

Home Assistant stays as a partner layer for device-facing behavior. The current
design treats it as the edge runtime, family-facing UI, and actuation surface,
while the repo keeps the longer-lived semantics that do not fit neatly into
entity state and automations.

The database separation between Postgres and DuckDB reflects a principle that
shows up in any data platform with both operational and analytical workloads:
the storage that serves transactional reads and the storage that supports
analytical queries should not be forced into the same engine just because the
data is related. Here, Postgres holds the operational state and DuckDB handles
the analytical surfaces, and the boundary between them is explicit rather than
papered over by an abstraction layer.

## Current state

Is rapidly evolving, so this section is promised to be out of date at any 
given time. Regardless, brief notes follow in this section to capture some
idea of the state of the work.

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
