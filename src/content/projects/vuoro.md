---
title: "Vuoro: governed work without a cockpit-shaped monolith"
summary: >-
  Vuoro is a family of separately owned workflow tools and a planned product
  direction for portable work, evidence, authority, and learning. The former
  AgentOps cockpit is retired; current runtime composition is unverified.
published: 2026-04-09
lastRevised: 2026-10-17
lastVerified: 2026-10-17
draft: false
project: vuoro
kind: engineering
status: Published reference; current runtime unverified
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
    Public repositories define separate workflow contracts and a Vuoro
    composition. The previous AgentOps cockpit application has been removed from
    source. No current service or deployed composition was verified for this
    revision.
  latest: >-
    The owner accepted a revised product direction on 2026-10-15 and a delivery
    plan on 2026-10-17. Both describe planned scope and gates, not
    implementation, provisioning, release, or deployment.
  proofLinks:
    - label: Vuoro composition repository
      href: https://github.com/bayleafwalker/vuoro
    - label: sprintctl source repository
      href: https://github.com/bayleafwalker/sprintctl
    - label: Interactive Vuoro system map
      href: https://bayleafwalker.github.io/agentops/
    - label: Accepted Vuoro product direction (2026-10-15)
      href: https://github.com/bayleafwalker/vuoro/blob/main/docs/direction/2026-10-15-product-direction.md
    - label: Vuoro product delivery plan (2026-10-17)
      href: https://github.com/bayleafwalker/vuoro/blob/main/docs/plans/2026-10-17-product-delivery-plan.md
    - label: AgentOps source snapshot checked 2026-10-17
      href: https://github.com/bayleafwalker/agentops/commit/b55198b25717ed542ca3e7c0d6ae7376d823ad55
  integrations:
    - SQLite
    - PostgreSQL
    - Former AgentOps cockpit (retired; historical reference)
  knownLimitation: >-
    Current release, deployment, and live qualification are unverified. The
    previous public cockpit was removed from AgentOps source; old screenshots
    and present-tense cockpit descriptions below are historical. The current
    product direction and delivery plan remain source/planning evidence only.
  nextProof: >-
    Reconcile current source, release and runtime state, then qualify one
    reference workflow under the accepted delivery plan. Do not infer deployment
    or operating status from repository plans or former service versions.
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
      The former AgentOps operator interface, removed from source; references on
      this page describe historical design and screenshots only.
reference:
  purpose: current-project-orientation
  discoverFor:
    - composing separately owned agent workflow tools without a monolith
    - binding component and schema compatibility to migration admissibility
  establishes:
    - that separate workflow contracts and historical composition designs have
      existed across these repositories
    - that version-bound preflight can reject an unsafe schema rollout before it
      runs
  doesNotEstablish:
    - that the v5 two-way comparison can yet attribute cost, or that governed
      work improved under the composition
    - operational mileage for kctl and auditctl comparable to sprintctl and the
      cockpit
  supplementWith:
    - current owner release and runtime evidence before relying on any served
      composition or operational capability
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

## Current source status (2026-10-17)

The previous AgentOps cockpit application is absent from the current AgentOps
source tree. The site and screenshots later on this page describe the former
interface and are retained as historical context; they do not establish a
currently available operator UI. The 2026-10-15 product direction and 2026-10-17
delivery plan define accepted scope and qualification gates, but explicitly do
not establish implementation, provisioning, release, or deployment. No current
Vuoro runtime was reachable for this source review, so its live composition and
status remain unknown. Source evidence checked 2026-10-17 08:27 UTC: AgentOps
`main` at `b55198b25717ed542ca3e7c0d6ae7376d823ad55` no longer contains
`apps/web/`; Vuoro `main` at `b433c8ffebdde81aa0d0fdf97b14182562a864f0` contains
the accepted direction and delivery plan. A live-site request from the review
environment could not connect, so no current runtime version or deployment
status was observed. The verification date records this evidence review, not a
runtime qualification.

Those two tools are still useful on their own. They are no longer the whole
story. The same state-ownership rule has grown into Vuoro: each repository owns
one operational domain. The former agent-cockpit composed their read surfaces
instead of becoming a new database with opinions about all of them.

The names carry separate meanings. **Vuoro** is the
[public ecosystem label](https://github.com/bayleafwalker/kctl/blob/c831aa016bdf117310fc66c12e8c2e63d2162155/docs/decisions/2026-07-19-ecosystem-public-label.md).
`agentops` remains the repository for shared contracts and cross-repository
plans. Its former `agent-cockpit` application was removed from source. The
public rename avoids confusing the ecosystem with AgentOps.ai without churning
implementation names.

## Interactive system map (historical composition)

[Explore the interactive Vuoro system map](https://bayleafwalker.github.io/agentops/)
for the previous lifecycle model across sprintctl, kctl, actionq, the retired
actionq-dispatch, auditctl, deployment, and the former agent-cockpit. The map is
a historical composition illustration; it does not establish current runtime
availability.

## Historical architecture and communication paths

The following design and operating snapshot reflects the page's last runtime
verification on 2026-09-07. It is retained for provenance and must not be read
as current deployment, product, or operator-interface status.

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

## Historical operating snapshot (last verified 2026-09-07)

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
