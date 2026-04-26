---
title: Turning household analytics into an operating platform
summary: >-
  Homelab Analytics is a household operating platform that keeps planning,
  simulation, and policy logic in one repo, with Home Assistant used as a
  device-facing partner rather than as the core execution model.
date: 2026-04-08
draft: false
project: homelab-analytics
kind: engineering
status: Stage 2 complete; Stages 3-5 partial
repoUrls:
  - https://github.com/bayleafwalker/homelab-analytics
tags:
  - architecture
  - home assistant
  - data platform
---

## Overview

A household has enough cross-cutting facts — finance, utilities, contracts,
device state, planning constraints — that modelling them properly matters. A
spreadsheet handles one dimension at a time. Home Assistant handles device
behavior well but is not built to be the semantic core for long-lived household
reasoning. The right structure was a proper domain model with explicit data
tiers, not a sprawl of automations or a reporting layer that pretends to support
decisions it was never designed for.

The project exists partly because the alternative — a spreadsheet, a stack of
Home Assistant automations, some informal rules held in memory — was already
failing at the kind of question I actually wanted to answer. Modelling a
household loan repayment against heating costs against an investment plan
requires a proper domain model and proper data boundaries, not a formula in
column G. The day job involves building exactly this kind of thing at larger
scale. It seemed worth applying the same discipline at home, if only to find
out where the analogies break.

Homelab Analytics is that model. The bronze, silver, and gold data boundaries
are the same separation pattern that keeps transformation layers auditable under
regulatory constraints in financial services work — applied here because the
problem structure is the same, not as a homelab affectation. The shift from
analytics to operating platform followed the same path it follows in enterprise
work: descriptive reporting becomes useful, then someone asks a planning
question the reporting layer cannot answer without pretending to be something
else. Rather than bolting simulation and policy onto a reporting codebase or
pushing cross-domain reasoning into Home Assistant, the repo formalized the
boundary and kept the semantic model explicit enough that later stages can build
on it without rewriting the foundation.

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
