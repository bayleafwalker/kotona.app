---
title: Acceptance Lab
published: 2026-08-17
lastRevised: 2026-11-20
revisionSummary: >-
  Added one captured public-source review, separated fixture rebuilds from dated
  evidence, and exposed the source-byte verification the adapter leaves outside
  its scoring input.
lastVerified: 2026-11-20
draft: false
project: acceptance-lab
kind: engineering
status: Runnable prototype; one captured public-source review
featured: false
repoUrls:
  - https://github.com/bayleafwalker/acceptance-lab
evidence:
  capability: >-
    Scores bounded candidate records against versioned acceptance scenarios,
    persists hash-chained events, rebuilds projections, and compares promotion
    states across mechanism, quality, authority, and economics.
  latest: >-
    v0.1.0 at fddbab2; a site-owned recorder captured three public Git reads and
    evaluated one agent-authored review, with three explicit constructed
    controls
  proofLinks:
    - label: Recorded review, outcome and reproduction
      href: /notes/the-scorer-never-saw-the-changed-bytes/
    - label: Retained observation manifest
      href: /evidence/acceptance-lab/2026-11-20-campaign-provenance/manifest.json
    - label: Root synthesis note
      href: /notes/the-platform-can-retrieve-the-application-still-has-to-decide/
  integrations: []
  knownLimitation: >-
    The captured interval covers three public reads, not a complete provider
    trace. Native billing is unknown. Raw output and source verification remain
    outside the adapter; no production effect or external promotion policy was
    qualified.
  nextProof: >-
    Capture a second task with an actual failed tool call and an observation
    contract that preserves the result and independently observed billing.
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
    - complete provider traces, attested runner identity or production effects
    - improved model quality, operator productivity or known model cost
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

The read-only adapter maps an already-observed trace record into the candidate
contract; it does not call tools, fetch trace data, or check a receipt against
an external system. Each run now pins the revisions of the scorers it used, so a
recorded verdict stays interpretable after a scorer changes.

The committed examples under `campaigns/2026-08-20/` are regenerable fixtures
over two sanitized reductions of earlier observations. The date names when the
case was written. The generator recomputes the scores with the current build and
omits wall-clock timestamps from its stable reports, so those files cannot
establish what was scored on that date. The
[source README](https://github.com/bayleafwalker/acceptance-lab/blob/fddbab2e26398f0ecddfc89cd291462effdc8e75/README.md)
states that limitation explicitly.

Two fixture pairs demonstrate the current claim:

1. naïve retrieval promotes a highly relevant but superseded ADR and fails;
   authority-aware retrieval filters by lifecycle and valid time and passes;
2. an unsafe tool trajectory reaches the claimed final state but fails because
   it uses an unscoped shell, omits the required control path, and produces no
   effect receipt or verification; the bounded verified trajectory passes.

The event chain detects edits to recorded history. It is not an external
signature or protection against a host owner rewriting both the database and the
verification code.

## One captured review, checked 2026-11-20

A site-owned recorder captured three actual public Git reads while a delegated
agent reviewed the campaign's provenance. The task and scenario were declared
before those reads; the agent's separate answer corrected the description above.
The retained bundle includes arguments, outputs, exit codes, times and digests,
plus the original evaluation events. The
[case note](/notes/the-scorer-never-saw-the-changed-bytes/) gives the observed
outcome and a pinned reproduction procedure.

At `fddbab2`, the Lab passed the review's six hard gates and returned
`CONDITIONAL` because native model billing was unknown. Deliberately removing a
required read or the entire trace failed the mechanism gates. Deliberately
altering recorded stdout did not change the inner verdict: the adapter omits raw
result bytes. An independent check against the digest and pinned Git object
rejected that altered record before its score could be used.

The trace captures a designated three-read interval, with prior setup context;
it does not establish full-session completeness or attest the recorder's
identity. The direct checker reached the same bounded conclusions. This case
establishes a usable evidence path and its remaining source-verification gap,
not a model-quality or productivity improvement. No production action was
performed.

## Earlier repository check, 2026-11-17

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

The first captured review identified concrete fields the compact schema does not
carry: stdout, stderr, exit code, timestamps and output digests. The full
observation must remain retrievable, and a consumer must validate it before
using an otherwise acceptable score. A second task with an actual failed tool
call should test that responsibility beyond constructed controls. Independently
observed model identity, latency and billing remain open.

A model judge can be added later for genuinely semantic criteria, but it should
not override deterministic authority, evidence, or execution failures. Shared
Vuoro extraction remains deferred until a second real consumer needs the same
run lifecycle and promotion state.
