---
title: "Vuoro: governed work without a cockpit-shaped monolith"
summary: >-
  A working family of sprint, queue, knowledge, audit, and cockpit tools now
  composes into one served layer, without giving up explicit state ownership or
  machine-local execution.
published: 2026-04-09
lastRevised: 2026-09-07
lastVerified: 2026-09-07
draft: false
project: vuoro
kind: engineering
status: Published and in active use
featured: true
repoUrls:
  - https://github.com/bayleafwalker/sprintctl
  - https://github.com/bayleafwalker/kctl
  - https://github.com/bayleafwalker/actionq
  - https://github.com/bayleafwalker/actionq-dispatch
  - https://github.com/bayleafwalker/auditctl
  - https://github.com/bayleafwalker/agentops
  - https://github.com/bayleafwalker/vuoro
externalUrl: https://bayleafwalker.github.io/agentops/
evidence:
  capability: >-
    Public tools own sprint, knowledge, queue, audit, and cockpit state through
    separate contracts, with local and shared operating modes. Dispatch is no
    longer a separate authority: the dispatch harness invokes product-native
    workers directly.
  latest: >-
    Served composition is at v0.1.59. The v0.1.52 image gated the work-schema
    v12 cutover — managed ActionQ schema v12 validated under the composition,
    with the sprintctl 0.3.0 reservation-model pin carried into the service
    image — and the v4 design freeze then rebuilt composition around explicit
    capabilities: uniform construction, the validator, and the migration itself.
    The releases since are adapter repins, including sprintctl 0.3.5, which
    closed a served authorization hole in reservation release.
  proofLinks:
    - label: Vuoro composition repository
      href: https://github.com/bayleafwalker/vuoro
    - label: sprintctl source repository
      href: https://github.com/bayleafwalker/sprintctl
    - label: Interactive Vuoro system map
      href: https://bayleafwalker.github.io/agentops/
  integrations:
    - SQLite
    - PostgreSQL
    - agent-cockpit
  knownLimitation: >-
    kctl and auditctl have less operational mileage than sprintctl and the
    cockpit, and cross-repository drift is an observed condition rather than a
    risk: the shipped skills taught the deleted claim model until the 0.3.5
    release corrected them. The v5 measurement is still not conclusive: oracle
    attainability is now enforced at dispatch time, and a first two-way
    scorecard exists, but its direct arm is not packet-isolated, so the
    comparison cannot yet attribute the difference.
  nextProof: >-
    Produce a two-way comparison whose direct arm is packet-isolated. Until that
    holds, the composition can show that it advances safely but not that the
    work it governs got better.
tags:
  - agents
  - workflow
  - cli-tooling
terms:
  - term: Vuoro
    definition:
      The public label for this family of small, separately owned agent-workflow
      tools.
  - term: sprintctl
    definition:
      The CLI and schema that own sprint work, dependencies, reservations, and
      handoffs.
  - term: kctl
    definition:
      The read-only pipeline that turns reviewed sprint history into durable
      knowledge.
  - term: actionq
    definition:
      The PostgreSQL-backed queue that owns actions, sessions, claims, and
      outcomes.
  - term: actionq-dispatch
    definition:
      Retired (2026-08-20 tombstone release). It formerly created a bounded
      workspace, invoked a worker, and recorded the result; the dispatch harness
      now constructs the workspace and invokes product-native workers directly.
  - term: auditctl
    definition:
      The tool that indexes audit events and emits portable daily evidence
      shards.
  - term: agent-cockpit
    definition:
      The operator interface that composes state from the owning tools without
      becoming their database.
reference:
  purpose: current-project-orientation
  discoverFor:
    - composing separately owned agent workflow tools without a monolith
    - binding component and schema compatibility to migration admissibility
  establishes:
    - that sprint, queue, dispatch, knowledge, audit, and cockpit state can stay
      in separate contracts under one composition
    - that version-bound preflight can reject an unsafe schema rollout before it
      runs
  doesNotEstablish:
    - that the v5 two-way comparison can yet attribute cost, or that governed
      work improved under the composition
    - operational mileage for kctl and auditctl comparable to sprintctl and the
      cockpit
  supplementWith:
    - the deployed component versions and migration state of the receiving
      environment
---

## Overview

sprintctl started with a mundane failure: humans and agents were editing the
same Markdown sprint files, and agents kept pattern-matching against the wrong
piece of prose. Better prompts reduced the frequency but did not change the
failure mode. The durable fix was to move live sprint state into a schema and
make a CLI the write authority.

kctl followed as the read-only knowledge path. It consumes sprint history,
extracts durable and coordination candidates, and puts them through explicit
review and publication. It does not silently turn every session note into canon,
and it never writes work back into sprintctl.

Those two tools are still useful on their own. They are no longer the whole
story. The same state-ownership rule has grown into Vuoro: each repository owns
one operational domain, and agent-cockpit composes their read surfaces instead
of becoming a new database with opinions about all of them.

The names carry separate meanings. **Vuoro** is the
[public ecosystem label](https://github.com/bayleafwalker/kctl/blob/c831aa016bdf117310fc66c12e8c2e63d2162155/docs/decisions/2026-07-19-ecosystem-public-label.md).
`agentops` remains the repository for shared contracts, cross-repository plans,
and the UI. `agent-cockpit` remains that UI. The public rename avoids confusing
the ecosystem with AgentOps.ai without churning implementation names.

## Interactive system map

[Explore the interactive Vuoro system map](https://bayleafwalker.github.io/agentops/)
to follow the wider lifecycle across sprintctl, kctl, actionq, the retired
actionq-dispatch, auditctl, deployment, and agent-cockpit. It focuses on state
ownership and the handoffs between tools rather than treating the cockpit as the
system itself.

## Architecture and communication paths

![Vuoro state ownership and communication paths](/images/projects/vuoro/system-shape.svg)

Three modes describe how a request travels, not three competing sources of
truth. In **local mode**, an agent calls the owning CLI and keeps SQLite state,
reservation and recovery material, Git worktrees, and filesystem effects on its
machine. In **remote mode**, that same domain tool uses its shared PostgreSQL
authority. In **served mode**, the transport-only Vuoro client talks to Vuoro
service, which authenticates the caller, checks compatibility, and invokes a
pinned adapter for the owning tool.

The modes compose. A served request can reach a remote authority while the
worker that receives it still performs bounded Git and filesystem work locally.
The cockpit reads projections and submits dispatch through the documented API;
it does not gain a raw write path into the domain databases. None of these
arrows promises a distributed transaction. Receipts, append-only events,
idempotency, and explicit recovery carry work across the boundaries.

## System shape

sprintctl owns sprints, work items, dependencies, events, reservations, and
handoffs. It runs against repo-local SQLite or a shared PostgreSQL backend, and
a declared backend mismatch fails rather than quietly opening a different source
of truth. Live coordination is a reservation ledger: a reservation is
session-bound and advisory, carries no bearer credential, and can be released,
reassigned, or interrupted by a maintenance sweep after an idle policy window.
The earlier claim/token model is gone as authority state — schema migrations
archived the claim rows into a history table, dropped the live claim table, and
nulled every token, so the archive records who held what and when without
retaining proof material. Its lineage `lease_epoch` survives only as a column of
that archive: historical structure, not downstream fencing. Resume and handoff
commands still turn live state into deterministic context for a new operator or
agent session.

kctl reads sprintctl events and owns the extraction, review, publication, and
rendering of knowledge artifacts. The relationship is deliberately one-way.
Rendered Markdown remains useful for review and Git history, but it is a
projection, not the live control plane.

The sibling tools fill different gaps:

- `actionq` owns PostgreSQL-backed action and session lifecycles with a strict
  queue contract and append-only events.
- `actionq-dispatch` formerly owned the bounded one-action coordinator:
  worktrees, worker invocation, path ACLs, pre- and post-gates, and result
  recording through the owning CLIs. It is retired as of 2026-08-20. The
  dispatch packet harness in `agentops` now constructs the bounded worktree,
  applies path and command policy, invokes one product-native worker, and runs
  the gates; actionq records provider references and observed status without
  spawning or supervising the process.
- `auditctl` owns a repo-local audit index plus durable daily NDJSON artifacts
  that can be rebuilt and read independently.
- `agentops` owns reusable dispatch skills and schemas, cross-repository plans,
  and the agent-cockpit application. The cockpit reads sprint state, queue
  sessions, audit artifacts, and cost signals; its writes stay mediated by the
  owning domain contracts rather than direct database mutation.

The rule across the repositories is simple: state ownership decides repository
ownership. It is also the main defense against building a cockpit-shaped
monolith.

## One work item, including failure

Here is the end-to-end property the system is designed to demonstrate:

1. An operator creates a work item through sprintctl. Sprintctl records the item
   and event history.
2. An agent takes a reservation. The reservation is session-bound and advisory —
   it makes ownership visible to every other session rather than proving it with
   a credential; the claim/token proof model it replaced survives only as
   archived history.
3. Dispatch submits an action through actionq. The dispatch harness creates a
   bounded worktree, applies path and command policy, invokes one product-native
   worker, and runs its gates; actionq records provider references and observed
   status without spawning the process. Until its 2026-08-20 retirement,
   actionq-dispatch owned this coordination as a separate package.
4. If the worker fails or returns an invalid result, the result is recorded as
   failed or rejected. It is not published and does not close the work item.
5. The same session can resume its reservation; reassignment and release are
   explicit commands, and an idle reservation is interrupted by the maintenance
   sweep after a policy window. This is a visibility discipline, not a fencing
   guarantee — the proof-rotation rule retired with the claim model.
6. Once a valid result clears independent verification, the owning CLI records
   completion and releases the reservation. Auditctl indexes portable evidence,
   and the cockpit projects the sprint, reservation, dispatch, and audit
   outcome.

This is an acceptance walkthrough, not a claim that the six steps form one
atomic transaction. The schema transition that was this section's next proof
completed in August: the v0.1.52 image gated the cutover and managed ActionQ
schema v12 was validated under the composition. The open proof has moved
accordingly: oracle attainability is now checked at dispatch time and a first
two-way scorecard exists, but its direct arm is not packet-isolated, so a
comparison able to attribute the difference is still owed.

## Current state

The tools are public and used across active repositories. sprintctl is on the
0.3.x reservation model with local and remote modes and provenance links; the
resume outcome is tested end to end, though the single-command bundle surface is
still a known gap — an operator currently assembles the continuation from a few
calls. kctl has a functioning two-stream extraction and review pipeline. actionq
supplies the queue and session read contracts, and auditctl emits portable audit
shards. actionq-dispatch, the former one-shot coordinator, is retired; the
dispatch harness invokes product-native workers directly.

The agent-cockpit is live and can show repository and sprint state, claims,
session and dispatch lifecycles, audit outcomes, and bounded cost or model
headroom signals. Its dispatch surface forwards work through actionq. sprintctl
state and workspace artifacts remain separate service contracts rather than
tables the UI is free to rewrite.

![Agent-cockpit sprint overview showing backlog, claims, and dispatch state](/images/projects/vuoro/cockpit-main.png)

The screenshot is the current sprint overview: backlog and active work on the
left, claim-aware work detail in the middle, and dispatch activity in the
operator surface. It is a composed view of owning systems rather than a new
state authority.

This is a different system from the original pair of pipx-installed SQLite
tools. Local-first operation is still the default for a small repository, but
PostgreSQL and agent-cockpit now provide a shared view when work crosses hosts
or needs an operator surface.

By 8 August, served composition had reached v0.1.35 with component and schema
compatibility made explicit. Four capability gates passed, while production
preflight correctly rejected an unsafe schema-5 rollout. The maintenance bridge
was staged to make the transition admissible without representing the production
schema as already migrated. The transition staged there completed later that
month: the v0.1.52 image carried the sprintctl 0.3.0 reservation-model pin and
gated the work-schema v12 cutover, with managed ActionQ schema v12 validated
under the composition. The composition has since advanced to v0.1.59 through
adapter repins — sprintctl to 0.3.5, auditctl to 0.1.6 — verified against the
running service on 2026-09-01.

## Open edges

The substrate has enough parts that it must continually justify them. A tool
designed to remove coordination ambiguity can recreate it through version drift,
overlapping commands, or unclear recovery rules between repositories — and that
is an observed condition, not a hypothetical: the shipped agent skills kept
teaching the deleted claim model until the 0.3.5 release corrected them.
Interface contracts and end-to-end verification matter more now than another
feature in any one CLI.

kctl and auditctl are also less exercised than sprintctl and agent-cockpit.
Their clean ownership boundaries are promising, but durable extraction and
recovery need more operational mileage before they should be treated as settled.

The agent-cockpit write surface should stay narrow. Dispatch and explicit sprint
operations are useful; turning the UI into a privileged backdoor around
reservation, queue, or audit rules would recreate the original Markdown problem
with better CSS.
