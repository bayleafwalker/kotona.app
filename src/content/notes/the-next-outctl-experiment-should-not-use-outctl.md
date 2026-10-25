---
title: The next Outctl experiment should not use Outctl
seoTitle: Reusing evidence after the Outctl retirement
role: exploration
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-10-25
lastRevised: 2026-10-25
projects:
  - vuoro
relates:
  - measure-the-diagnosis-not-only-the-transcript
  - a-platform-capability-does-not-exist-all-at-once
  - the-platform-can-retrieve-the-application-still-has-to-decide
  - the-audit-trail-can-suggest-the-next-action
  - simplicity-is-an-ambitious-property
draft: false
tags:
  - agents
  - evaluation
  - evidence
  - context-management
summary: >-
  Outctl remains retired. The new question is whether an evidence-linked
  interpretation can be reused by independent consumers without displacing the
  source record.
explorePrompt: >-
  Treat this as a re-review of a retired implementation, not a proposal to
  restore it. The worked case is Outctl, a command wrapper that retained full
  output and exposed selected slices to coding agents. Its output-reduction
  measurements did not establish better diagnosis or session economics; native
  programmatic tool calling also moved its original product boundary. The new
  hypothesis is about repeated use, not transcript compression: capture source
  evidence once, derive a provenance-linked semantic observation, and reuse it
  across reconciliation, analysis and narrative without promoting the derived
  claim into authority. Apply this distinction to one expensive, repeated
  interpretation in your own system. Specify the source, the independent
  consumers, invalidation rules, and an untreated baseline. Measure actual
  repeated reads, total cost and latency, critical facts lost, and maintenance
  overhead. Challenge the proposal if the observations are rarely reused or if
  native tools already supply an equivalent structured record. Give a
  falsifiable adoption or retirement decision, not a byte-saving percentage.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - reusing provenance-linked semantic observations across several consumers
    - measuring repeated source reads in an interpretation pipeline
  establishes:
    - the distinction between single-use filtering and reusable evidence
      projections
    - the proposed replay test for shared observations and invalidation
  doesNotEstablish:
    - that a semantic observation pipeline has saved money or operator attention
    - that the retired Outctl wrapper should be restarted or required
  supplementWith:
    - measured downstream reads, cache behavior and acceptance outcomes
---

Outctl is retired. That is the starting condition, not a problem to fix.

Its repository remains a frozen discovery artifact, not a required runtime.

I built it to keep large command results out of a coding agent's ordinary
context. It retained the complete output and returned a small view that the
agent could expand later. In the original Kubernetes diagnosis comparison,
model-visible output fell by about 84%. The experiment did not prove equal
diagnostic quality: two agents could both report a degraded cluster while
identifying substantially different failures.

A later A/B snapshot reduced exposed `kubectl` bytes by about 94.9%, but
recorded 16.7% more input tokens, 5.4% more cost and 36.9% more elapsed time.
These are different experiments, not a pooled benchmark. They make the same
point: a mechanism can meet its narrow metric and still fail to improve the
work.

Then native programmatic tool calling moved filtering, aggregation and
intermediate tool processing closer to the harness. The original argument for a
separate output wrapper lost its product boundary. I recorded that change in
[A platform capability does not exist all at once](/notes/a-platform-capability-does-not-exist-all-at-once/),
and kept the earlier
[diagnostic evaluation](/notes/measure-the-diagnosis-not-only-the-transcript/)
as a disproven recommendation with useful measurements.

Why look at the subject again in October? Small decision models and typed
extraction models have made cheap interpretation more plausible. They have not
made the old wrapper useful.

**Working model:** the possible residual value is not making one tool result
smaller. It is creating one evidence-linked interpretation that several
independent consumers can reuse.

## One source, several questions

Imagine a failed CI run. Its logs and test reports are already available. Three
later consumers may ask different questions:

- The work reconciler asks which acceptance requirement lacks evidence.
- The periodic analyst asks whether this failure repeats across projects.
- A personal work narrator asks what changed since the last useful update.

Sending each consumer the complete log is often wasteful. Summarizing it once is
tempting, but a summary can also erase the line that matters to the next
question. The unit worth testing is a **typed observation linked to its
source**: failure kind, affected test, occurrence time, source digest,
extraction method and the evidence required to check the claim.

The original log remains retrievable. A derived classification is not a verified
test result, and an audit record does not make a release acceptable. An upstream
revision, changed extraction method or corrected log invalidates the derived
result for current decisions; its historical record can remain.

This could be produced by ordinary parsing, a cheap generative model, or a typed
extractor such as Cloudflare Clairic. A one-pass decision model has a different
job: choosing among the currently valid follow-up categories. These are
experimental suppliers, not reasons to make model inference mandatory.

## The evaluation has to change

The original treatment had one principal consumer: the agent reading a tool
result. The proposed treatment needs **at least two genuine later consumers**
before there is much reason to persist a shared interpretation.

I would take a fixed collection of operational and coding-session events and
replay three paths: direct use of the original evidence, deterministic
extraction, and cheap model-assisted extraction. Give each path the same
downstream questions and independent expected findings.

Measure:

| Dimension | What could make the idea fail                                   |
| --------- | --------------------------------------------------------------- |
| Fidelity  | A critical fact is absent or a finding has no valid source      |
| Reuse     | Later consumers rarely consult the shared observation           |
| Economics | Extraction, storage and retries cost more than saved reads      |
| Latency   | Waiting for enrichment makes useful work slower                 |
| Recovery  | A stale or corrupt observation cannot be rebuilt or challenged  |
| Authority | A model-derived field is treated as proof of a protected effect |

Count the time spent maintaining the pipeline, too. An elaborate reuse cache
that saves a few cents while requiring a weekly repair session is not a win.

This does **not** justify restoring Outctl, putting another daemon on every tool
call, or intercepting all shell output. The smallest trial is an out-of-process
consumer of existing evidence. If most observations are read once, stop. Native
filtering and ordinary source retrieval already cover that case.

The question is whether later agents can avoid reconstructing the same facts
without inheriting someone else's unsupported conclusions. That has not been
measured yet.
