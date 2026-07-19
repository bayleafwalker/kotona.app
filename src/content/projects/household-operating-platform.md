---
title: Turning household analytics into an operating platform
summary: >-
  Homelab Analytics keeps household reporting, planning, simulation, policy,
  trust, and agent-facing retrieval in one semantic model. Home Assistant is
  the device-facing partner, not the system of record for household reasoning.
published: 2026-04-08
lastRevised: 2026-07-17
lastVerified: 2026-07-17
draft: false
project: homelab-analytics
kind: engineering
status: Active household operating platform
featured: true
repoUrls:
  - https://github.com/bayleafwalker/homelab-analytics
externalUrl: https://bayleafwalker.github.io/homelab-analytics/
evidence:
  capability: >-
    Published operating views, five scenario types, persisted policies,
    approval-aware Home Assistant actions, and a narrow agent retrieval and
    proposal surface share one semantic model.
  latest: v0.1.0 operating-view release with later policy, trust, and agent slices
  proofLinks:
    - label: Source repository
      href: https://github.com/bayleafwalker/homelab-analytics
    - label: Interactive system map
      href: https://bayleafwalker.github.io/homelab-analytics/
  integrations:
    - Home Assistant
    - PostgreSQL
    - DuckDB
    - MCP
  knownLimitation: >-
    Home Assistant is the only full reference adapter, so the generic adapter
    boundary has not yet survived a second serious integration.
  nextProof: >-
    Ship a second production-like adapter through the existing contracts without
    changing the semantic core or approval boundary.
tags:
  - architecture
  - home assistant
  - data platform
---

## Overview

A household has enough cross-cutting facts — income, debt, utilities, contracts,
assets, device state, and infrastructure cost — that modelling them properly
matters. A spreadsheet handles one slice at a time. Home Assistant handles
devices well, but entity state is a poor semantic core for long-horizon planning
and cross-domain decisions.

Homelab Analytics keeps that reasoning in an explicit household model. The
bronze, silver, and gold data boundaries are borrowed from larger data systems
because provenance, repeatability, and semantic ownership still matter at
household scale. The project stopped being merely an analytics stack when the
useful questions changed from "what happened?" to "what should happen, what if
the assumptions change, and may the system act on the answer?"

## Interactive system map

[Explore the interactive household operating platform map](https://bayleafwalker.github.io/homelab-analytics/)
to trace domain data through bronze, silver, and gold boundaries, then continue
through publications, scenarios, policy evaluation, approval, Home Assistant
actuation, and measured feedback.

## System shape

The codebase remains a modular monolith with one deployment story and four
internal stability strata: kernel, semantic engine, capability packs, and
delivery surfaces. Finance, utilities, homelab, and cross-domain overview packs
publish reusable operating views instead of binding every answer to one UI.

Postgres is the canonical operational and published-reporting store for shared
deployments. DuckDB remains the worker and local analytical engine, while
SQLite is a bootstrap fallback. Keeping those roles explicit is less elegant
than calling every database interchangeable, but it is also true.

Home Assistant is the edge runtime, device hub, family-facing interface, and
actuation layer. The platform owns the longer-lived semantics, scenarios,
policies, approvals, and cross-domain joins. Outputs return to Home Assistant as
synthetic entities and approved actions; device control does not migrate into a
private automation framework for the sake of architectural purity.

## Current state

Stage 2 operating views shipped as `v0.1.0`. Planning surfaces now cover budgets,
loans, affordability, recurring commitments, and household cost. Five scenario
types cover loan, income, expense, utility-tariff, and homelab cost-benefit
questions with saved assumptions and staleness tracking.

The reporting layer now includes finance, assets, energy, infrastructure, and
home-automation marts. Source pages expose freshness and remediation paths, and
lineage and confidence are visible parts of the product rather than metadata
kept for a future governance phase.

Later roadmap stages have landed out of numerical order. The Home Assistant
bridge can ingest state, publish synthetic entities, evaluate policy, and route
approval-aware actions. Policies have a persisted Postgres registry. The first
agent-facing slice provides a semantic publication index, narrow MCP tools, and
a shared proposal queue: an agent can retrieve published meaning and draft an
action, but approval remains the only route to execution.

The repository has therefore moved beyond the older description of Stages 3–5
as mostly provisional. It is still incomplete, but it is incomplete software
with operating surfaces, not an eleven-stage architecture document waiting for
an implementation.

## Open edges

The roadmap is now less linear than the stage numbers imply. A small amount of
canonical-model and publication cleanup remains while policy, trust, and agent
surfaces already exist. The documentation needs to keep distinguishing a
shipped slice from a completed stage or it will overstate both.

Home Assistant is still the only full reference integration. The generic
adapter contracts are present, but a second serious adapter is needed to prove
that the abstraction was extracted rather than merely renamed around the first
implementation.

The agent surface is intentionally narrow. It retrieves publication-backed
facts and creates auditable proposals; it is not a general household oracle or
an autonomous operator. Better explanations, broader semantic coverage, and a
useful assistant experience can grow from that base without weakening the
approval boundary.
