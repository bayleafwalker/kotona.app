---
title: Turning household analytics into an operating platform
summary: >-
  Homelab Analytics keeps household reporting, planning, simulation, policy,
  trust, and agent-facing retrieval in one semantic model. Public source now
  includes Kotiakku evidence checks; current household inputs and realized
  outcomes remain unverified.
published: 2026-04-08
lastRevised: 2026-10-17
lastVerified: 2026-10-17
draft: false
project: homelab-analytics
kind: engineering
status: Source-reviewed platform; household outcomes unverified
featured: true
repoUrls:
  - https://github.com/bayleafwalker/homelab-analytics
externalUrl: https://bayleafwalker.github.io/homelab-analytics/
evidence:
  capability: >-
    Source implements operating views, five scenario types, persisted policies,
    approval-aware Home Assistant actions, and a narrow agent retrieval and
    proposal surface around one semantic model.
  latest: >-
    Public main includes a read-only Kotiakku evidence evaluator and synthetic
    refusal tests. This source review does not establish an installed release,
    current household data, a published recommendation, or a realized decision.
  proofLinks:
    - label: Source repository
      href: https://github.com/bayleafwalker/homelab-analytics
    - label: Interactive system map
      href: https://bayleafwalker.github.io/homelab-analytics/
    - label: HLA source snapshot reviewed 2026-10-17
      href: https://github.com/bayleafwalker/homelab-analytics/commit/1b1606c6eb076da97e5078c2acdddaa7cea8feea
    - label: Kotiakku evidence evaluator and synthetic tests
      href: https://github.com/bayleafwalker/homelab-analytics/blob/1b1606c6eb076da97e5078c2acdddaa7cea8feea/tests/test_kotiakku_evidence.py
    - label: Household outcome acceptance and remaining evidence
      href: https://github.com/bayleafwalker/homelab-analytics/blob/1b1606c6eb076da97e5078c2acdddaa7cea8feea/docs/plans/household-outcome-evidence-decision-plan.md
    - label: Kotiakku monthly evidence source
      href: https://github.com/bayleafwalker/ha-elisa-kotiakku/commit/83b91adf3ba7d2a7d8b4af87ff094a183c0624f7
  integrations:
    - Home Assistant
    - PostgreSQL
    - DuckDB
    - MCP
  knownLimitation: >-
    Home Assistant is the only full reference adapter, so the generic adapter
    boundary has not yet been qualified through a second production-like
    integration. The Kotiakku source slice does not close that gate.
  nextProof: >-
    Qualify an authorized closed-month source window, publish its traced
    assessment, and record a decision or explicit non-decision with follow-up. A
    second production-like adapter remains a separate architecture proof.
tags:
  - architecture
  - home-assistant
  - data-platforms
terms:
  - term: Homelab Analytics
    definition:
      The household data and decision platform that owns long-lived semantics,
      scenarios, policies, and approvals.
reference:
  purpose: current-project-orientation
  discoverFor:
    - keeping household reporting, planning, and policy in one semantic model
    - giving agents a narrow retrieval and proposal surface over household data
  establishes:
    - that public source defines operating views, scenarios, policies,
      approval-aware actions, and agent retrieval around one semantic model
    - that a device platform can be a device-facing partner rather than the
      system of record
  doesNotEstablish:
    - current household data coverage, installed versions, or measured savings
    - a published recommendation, actual decision, or realized household result
    - that the generic adapter boundary survives a second serious integration
  supplementWith:
    - the receiving system's own data ownership and approval boundaries
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
deployments. DuckDB remains the worker and local analytical engine, while SQLite
is a bootstrap fallback. Keeping those roles explicit is less elegant than
calling every database interchangeable, but it is also true.

Home Assistant is the edge runtime, device hub, family-facing interface, and
actuation layer. The platform owns the longer-lived semantics, scenarios,
policies, approvals, and cross-domain joins. Outputs return to Home Assistant as
synthetic entities and approved actions; device control does not migrate into a
private automation framework for the sake of architectural purity.

## Source review (2026-10-17)

This review checked public HLA `main` at `1b1606c6` and the public
`ha-elisa-kotiakku` source at `83b91adf`. The verification date records those
source checks. It does not renew a claim about household operations, installed
versions, input freshness, or measured savings. The system map illustrates the
architecture; it is not a deployment receipt.

HLA now contains a transformation helper for reviewing battery-plan evidence
from explicitly mapped Home Assistant history. It checks a selected closed
month's five-minute coverage, source freshness, units, conflicting duplicates,
and the versioned Kotiakku evidence contract. The companion integration carries
monthly evidence counters and month-specific tariff inputs. Synthetic tests
exercise review recommendations and refusals such as `insufficient_evidence`;
they do not establish actual household economics.

The outcome plan still requires authorized source history, verified entity
mapping and tariff assumptions, publication through the existing reporting
contracts, and a recorded decision or explicit non-decision with a later
observation. Its source text still describes branch review, but the public main
commits linked above now contain the evaluator and companion attributes. That
merge changes source availability, not completion of the outcome plan. This page
uses no private deployment records or household observations.

## Implemented source slices

The repository records Stage 2 operating views as the `v0.1.0` release. The
following describes source capabilities, without asserting that a household is
currently running them. Planning surfaces cover budgets, loans, affordability,
recurring commitments, and household cost. Five scenario types cover loan,
income, expense, utility-tariff, and homelab cost-benefit questions with saved
assumptions and staleness tracking.

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

The repository has therefore moved beyond the older description of Stages 3–5 as
mostly provisional. It is still incomplete, but it is incomplete software with
operating surfaces, not an eleven-stage architecture document waiting for an
implementation.

## Open edges

The roadmap is now less linear than the stage numbers imply. A small amount of
canonical-model and publication cleanup remains while policy, trust, and agent
surfaces already exist. The documentation needs to keep distinguishing a shipped
slice from a completed stage or it will overstate both.

Home Assistant remains the full reference integration described by the public
architecture. The Kotiakku helper consumes history through that boundary; it
does not itself qualify a second production-like adapter. That separate
integration proof remains open.

The agent surface is intentionally narrow. It retrieves publication-backed facts
and creates auditable proposals; it is not a general household oracle or an
autonomous operator. Better explanations, broader semantic coverage, and a
useful assistant experience can grow from that base without weakening the
approval boundary.
