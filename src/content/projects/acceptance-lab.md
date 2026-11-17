---
title: Acceptance Lab
published: 2026-08-17
lastRevised: 2026-11-17
lastVerified: 2026-11-17
draft: false
project: acceptance-lab
kind: engineering
status: Runnable local prototype; fixtures and two reduced observations
featured: false
repoUrls:
  - https://github.com/bayleafwalker/acceptance-lab
evidence:
  capability: >-
    Scores bounded candidate records against versioned acceptance scenarios,
    persists hash-chained events, rebuilds projections, and compares promotion
    states across mechanism, quality, authority, and economics.
  latest: >-
    v0.1.0 package with a read-only trace adapter, pinned scorer revisions, and
    one committed campaign over two reduced observations
  proofLinks:
    - label: Root synthesis note
      href: /notes/the-platform-can-retrieve-the-application-still-has-to-decide/
  integrations: []
  knownLimitation: >-
    The proof uses deterministic fixtures and two sanitized reductions of
    already-observed runs. The harness does not capture a live model trace
    itself, execute an effect, or enforce an external promotion policy.
  nextProof: >-
    Bind one real read-only agent run to runner-owned tool observations and show
    which trajectory details the initial candidate schema fails to preserve.
tags:
  - agents
  - evaluation
  - evidence
  - trajectory
  - governance
summary: >-
  A local-first prototype for turning agent requirements, observed evidence,
  authority rules, and operating budgets into executable promotion decisions.
reference:
  purpose: current-project-orientation
  discoverFor:
    - deciding whether an agent run should be promoted
    - turning acceptance criteria into executable scoring
  establishes:
    - that promotion can be scored from bounded candidate records against
      versioned acceptance scenarios
    - that mechanism, quality, authority, and economics are separable promotion
      dimensions
  doesNotEstablish:
    - behaviour against live model traces or executed effects
    - a promotion policy that any other system is obliged to follow
  supplementWith:
    - the run evidence and acceptance criteria of the receiving task
---

## Overview

Acceptance Lab is a small implementation vehicle for a larger question: when an
AI system changes, what evidence is sufficient to promote the candidate rather
than merely admire its output?

The current package accepts a versioned scenario and a bounded candidate record.
It applies deterministic checks, stores the exact records and scores in an
append-only SQLite event stream, and emits `PASS`, `CONDITIONAL`, or `FAIL`.
Retrieval is one example workload. It is not the product boundary.

## System shape

```text
trace or observed run
-> bounded candidate evidence
-> deterministic scenario checks
-> hash-chained run events
-> rebuildable reports and comparisons
-> external promotion policy
```

The prototype owns the middle of this chain. It does not run the agent, mint
credentials, perform production effects, or replace MLflow, OpenTelemetry,
Prometheus, Loki, or Vuoro.

Four score dimensions remain separate:

- **mechanism:** whether the expected control path occurred;
- **quality:** whether required facts or effects survived;
- **authority:** whether sources, tools, and effect receipts were admissible;
- **economics:** whether latency and cost stayed inside the declared envelope.

A run can be complete as evidence and still fail as an outcome.

## Current state

The v0.1.0 package includes JSON contracts, deterministic scorers, a Python CLI,
a hash-chained SQLite event store, rebuildable projections, Markdown and JSON
reports, and comparison gates.

Since the first version of this page the repository has added three things. A
read-only adapter maps an already-observed trace record into the candidate
contract; it does not call tools, fetch trace data, or check a receipt against
an external system. Each run now pins the revisions of the scorers it used, so a
recorded verdict stays interpretable after a scorer changes. And one committed
campaign, dated 20 August 2026, scores two sanitized reductions of runner-owned
observations without executing either candidate.

Two fixture pairs demonstrate the current claim:

1. naïve retrieval promotes a highly relevant but superseded ADR and fails;
   authority-aware retrieval filters by lifecycle and valid time and passes;
2. an unsafe tool trajectory reaches the claimed final state but fails because
   it uses an unscoped shell, omits the required control path, and produces no
   effect receipt or verification; the bounded verified trajectory passes.

The event chain detects edits to recorded history. It is not an external
signature or protection against a host owner rewriting both the database and the
verification code.

## Current verification scope

The review on 17 November 2026 ran the repository's own validation target in a
clean checkout of commit
[`fddbab2`](https://github.com/bayleafwalker/acceptance-lab/commit/fddbab2e26398f0ecddfc89cd291462effdc8e75),
on Python 3.13 with the optional JSON Schema dependency installed. All 56 unit
tests passed. The scenario and candidate records validated against their
schemas. The deterministic demo reproduced both fixture pairs: each baseline
failed, each candidate passed, and the event chain verified. The committed
August campaign outputs matched a rebuild.

That is a check of the repository as published. No live model trace was
captured, no tool was executed, and no promotion decision was enforced anywhere.
The campaign's source evidence is not public, so its reductions were checked for
reproducibility, not for fidelity to the runs they summarize.

## Open edges

The next proof is one real, bounded agent run. The adapter must obtain tool
calls, effects, and receipts from the trace or runner rather than from model
self-report. The resulting failure analysis should identify fields that the
fixture-designed schema flattened or missed.

A model judge can be added later for genuinely semantic criteria, but it should
not override deterministic authority, evidence, or execution failures. Shared
Vuoro extraction remains deferred until a second real consumer needs the same
run lifecycle and promotion state.
