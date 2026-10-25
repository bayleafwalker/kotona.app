---
title: The audit trail can suggest the next action
seoTitle: Evidence-first reconciliation for agent sessions and completion
role: exploration
status: exploration
lifecycle: current
area: agent workflow
published: 2026-10-25
lastRevised: 2026-10-25
projects:
  - vuoro
relates:
  - the-router-was-larger-than-the-model
  - the-human-is-in-the-slow-loop
  - the-next-prompt-was-only-the-visible-error
  - the-next-outctl-experiment-should-not-use-outctl
  - authority-must-travel-with-the-action
draft: false
tags:
  - agents
  - evidence
  - audit
  - decisions
  - reconciliation
summary: >-
  Session hooks can capture what happened, cheap models can propose what it
  means, and an owner-aware reconciler can decide what follows. The audit record
  informs completion without becoming another acceptance authority.
explorePrompt: >-
  Treat this note as a proposed placement of small decision models, not a claim
  about a completed deployment. The case is a multi-harness agent workflow in
  which sessions finish, tests and Git state change, and a separate work
  authority must decide whether the original requirement is satisfied.
  Mechanical hooks capture attributable facts; inexpensive models derive
  defeasible claims; reconciliation reads the current requirement, revisions and
  evidence before suggesting or performing an owner-authorized action. Audit
  observations and recorded judgments are different from the action owner's
  terminal decision. Apply the pattern to one real workflow. Inventory what is
  mechanically visible, where source facts live, which claims would require
  interpretation, and who can actually complete work. Test clean completion,
  missing evidence, stale source revisions, conflicting interpretations, absent
  hooks and duplicate events. Explain whether the proposed model adds
  information unavailable through ordinary deterministic queries, and identify
  the smallest result that would justify keeping it.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - positioning small decision models alongside agent audit and evidence
      capture
    - reconciling session outputs against current work acceptance requirements
  establishes:
    - a proposed separation of mechanical facts, model judgments and owned
      transitions
    - a falsifiable replay plan for evidence-driven follow-up and completion
  doesNotEstablish:
    - a deployed universal hook or complete capture across hosted harnesses
    - an additional authority for settlement, release or knowledge publication
  supplementWith:
    - current owner contracts, session coverage and accepted-outcome records
---

A coding session ends. The tests are green, a commit exists, and the work item
still says active. Another session may be about to notice a missing test, while
an audit record may never have arrived because the local recorder was offline.
Which event should start the next agent?

My first instinct was to place a cheap decision model at a branch in the
workflow graph: tests pass, ask what happens next. That works for one flow. It
becomes repetitive when many harnesses and other kinds of work need the same
question, and brittle when the significant evidence arrives later.

**Working model:** collect observations beside the work, then reconcile them
against the current requirements. Most follow-up decisions should be made from
evidence and owner rules. A small model supplies a bounded judgment only when
those rules cannot decide.

## A record is not a transition

The existing
[Auditctl contract](https://github.com/bayleafwalker/auditctl/blob/main/docs/contracts/central-observation-ingest.md)
deliberately distinguishes an `observation` from a recorded `decision`. Its
append and receipt path does not settle work, issue grants or apply the
judgment. The
[Vuoro target state](https://github.com/bayleafwalker/agentops/blob/main/docs/plans/2026-09-17-target-state.md)
also keeps release acceptance and protected effects with their owners. Those are
design constraints, not a claim that the planned evidence-home migration is
complete.

Kctl historically extracted lessons and handoffs from execution events. It is
retiring in favor of the current Workspace and evidence direction. I would not
put a new classifier or knowledge lifecycle inside Kctl; the consumer should use
the surviving evidence interfaces.

A short chain describes the proposal:

```text
native harness / CI / git
    -> mechanical event or immutable source reference
    -> audit / evidence record
    -> optional cheap semantic claim, linked to the source
    -> reconciliation against current work state
    -> no change | obtain evidence | follow-up | owner-owned completion
```

That last arrow matters. No classifier receives the right to mark a release
accepted by virtue of its confidence score.

## What the hooks know

Session-start and stop capture can bind a run to a work item, profile and source
revision. Tool, Git and CI observations can supply changed paths, commit
digests, verification reports, tool errors and elapsed time. They need not store
a raw conversation. They also cannot claim to have observed what a hosted
harness never exposed.

The recorder should preserve the source fact first. A cheap scribe may then
write an inference such as "this patch appears to address the schema
compatibility requirement" or "the test report suggests a missing rollback
check." That inference needs the source digest, the model and instruction
version, a work-state revision and an indication that no independent
verification occurred.

A decision model such as Jev, d1 or Clef can select among defined follow-ups:
`no-change`, `reverify`, `inspect-conflict`, or `escalate`. A generative model
is a better choice when the task is to read several documents and extract a
candidate lesson. The same small model need not do both.

My earlier [routing experiment](/notes/the-router-was-larger-than-the-model/)
found that changing the classifier alone did not settle the routing question.
The important inputs were the assembled state, legal choices, error costs and
actual outcomes. Those requirements transfer here.

## Completion and further work are different answers

A reconciler reads the current work revision, acceptance criteria, already
recorded decisions and source-linked evidence. Three outcomes are particularly
important.

**Complete:** required evidence is valid and the current contract permits
automatic completion. The owning work or release operation applies the
transition. An optional semantic scribe is not an extra approval gate.

**Incomplete:** a required check is absent, contradictory, or tied to an old
revision. Ask for the particular missing evidence, not an open-ended review of
the entire task.

**Complete with a new finding:** the original task can complete, but a model or
verifier notices an improvement or unrelated risk. Record a separate,
deduplicated follow-up rather than retroactively reopening the accepted work.

An actual contract may require an independent judgment for a particular effect.
In that case, the reconciler must obtain it. The rule is not "never review"; it
is "do not manufacture reviews for work whose acceptance conditions are already
met."

## Keep the observers cheap to lose

The older
[session mechanization work](https://github.com/bayleafwalker/agentops/blob/main/docs/plans/agentops/session-mechanization-plan.md)
already explored mechanical capsules, an immediate reconciler and a periodic
scribe. Its implementation path was retired under the later estate direction.
The useful inheritance is its failure model: a recorder can miss a session, a
fast reconciliation can fail, and a periodic pass must still recover the
available evidence without replaying external effects.

I would test this in shadow mode on previously completed and interrupted
sessions. Seed cases with missing audit delivery, an outdated work revision,
duplicate records, a misleading self-report and an actual new regression.

Measure false completion, missed findings, repeat investigation loops, cost per
resolved follow-up and accepted work unnecessarily held. Keep the model out of
the execution path until it beats ordinary rules on a recorded decision problem.

If the evidence already settles the requirement, no model needs to wake. If it
does not, the audit trail should tell the next agent what remains unknown, not
pretend that an attractive summary has made it true.
