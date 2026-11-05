---
title: Subprocess, not service
role: operating
status: guiding
lifecycle: superseded
lifecycleChanged: 2026-10-29
lifecycleReason: >-
  The operated-service architecture accepted on 29 October 2026 brings back a
  resident control plane. The per-attempt worker survives, but a short process
  lifetime no longer supplies the security properties this note relied on.
supersededBy:
  - what-the-subprocess-was-doing-for-free
area: agent workflow
published: 2026-06-10
lastRevised: 2026-11-05
projects:
  - vuoro
relates:
  - the-missing-layer-is-binding-not-intelligence
  - the-coordinator-never-touches-the-repo
  - what-the-subprocess-was-doing-for-free
terms:
  - term: sprintctl
    definition:
      The CLI and schema that own sprint work, dependencies, reservations, and
      handoffs.
  - term: actionq-dispatcher
    definition:
      Retired (2026-08-20 tombstone release). It formerly created a bounded
      workspace, invoked a worker, and recorded the result; the dispatch harness
      now constructs the workspace and invokes product-native workers directly.
  - term: actionq
    definition:
      The PostgreSQL-backed queue that owns actions, sessions, claims, and
      outcomes.
tags:
  - agents
  - workflow
summary:
  The June dispatch design used a per-invocation coordinator and rejected a
  resident agent service. Retained as historical guidance; the October service
  decision and its replacement controls are recorded in the successor.
explorePrompt: >-
  This note is superseded by "What the subprocess was doing for free", which
  records the October service decision; read that successor first. Use the June
  note as a historical case of choosing one-action worker lifetimes. Its
  per-invocation coordinator limited surviving local state and credential
  exposure, kept judgment in the worker and reserved merging or sending for the
  operator. The later design retained disposable workers while replacing the
  coordinator's lifetime guarantees with explicit service controls and allowing
  routine standing authorization. Apply the historical question to a component
  you operate: what would disappear if its lifetime were one unit of work, and
  what must persist? Challenge the assumption that process exit alone revokes
  copied credentials or stops remote effects. Produce a short inventory of
  properties supplied by lifetime, properties needing another owner, and the
  evidence required before choosing a resident coordinator. Keep the obsolete
  operator-only rule and retired component names out of current implementation
  advice; use the successor to assess the changed boundary.
---

An earlier post argued that the missing layer in solo agent work is binding, not
intelligence. This is the shape the layer ended up taking.

Two pieces. actionq is a Postgres-backed action queue with claim semantics and
ordinary lifecycle commands — add, claim, complete, fail, reject, sweep.
actionq-dispatcher is the coordinator, and the load-bearing word in its CLI is
`dispatcher-once`. An invocation wakes, claims one action, creates a git
worktree, takes a sprintctl claim, renders the prompt, invokes the agent as a
subprocess under a per-action-type ACL, runs the post-flight gates, transitions
state on both sides, and exits. Then there is no process.

The alternative everyone reaches for is a resident agent service — a daemon that
holds context, watches for work, and acts. The general-purpose frameworks ship
this shape by default, and it was rejected here on security posture, not
capability. A resident agent accumulates exactly the properties you don't want:
standing credentials, broad reach, and state that exists nowhere reviewable. The
subprocess inverts each one. Its lifetime is one action. Its permissions are one
ACL, enforced both where the dispatcher constructs the invocation and where the
worker runs. Its working surface is one worktree that either becomes a
reviewable artifact or gets discarded. When the queue is empty, the only thing
running is a systemd timer that occasionally sweeps stale claims.

The coordinator itself is deliberately not an agent. It is a deterministic
dispatcher: no model in the loop, no judgment, nothing to align. Anything that
requires intelligence happens inside the subprocess, inside the ACL, against the
worktree. Anything that requires authority — merging, sending, deciding the work
is done — happens later, by the operator, who remains the only actor with commit
rights.

Failure handling falls out of the shape rather than being designed. A crashed
subprocess is a failed action sitting in a queue with its events attached, not a
degraded service to nurse back to health. Recovery is `claim` again. There is no
agent state to reconstruct because no agent state survives an invocation.

The service model asks how to keep an agent trustworthy over time. The
subprocess model deletes the time.

## Outcome, added 2026-09-07

actionq-dispatcher was retired on 2026-08-20; the dispatch harness now
constructs the bounded workspace and invokes product-native workers directly.
The retirement did not reverse this note's argument — the unit of execution
stayed a bounded, per-invocation subprocess; what changed is which component
constructs it. The [Vuoro project page](/projects/vuoro/) carries the current
architecture.
