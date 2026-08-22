---
title: Subprocess, not service
role: operating
status: guiding
lifecycle: current
area: agent workflow
published: 2026-06-10
lastRevised: 2026-06-10
projects:
  - vuoro
relates:
  - the-missing-layer-is-binding-not-intelligence
  - the-coordinator-never-touches-the-repo
terms:
  - term: sprintctl
    definition:
      The CLI and schema that own sprint work, dependencies, claims, and
      handoffs.
  - term: actionq-dispatcher
    definition:
      The one-action coordinator that creates a bounded workspace, invokes a
      worker, and records the result.
  - term: actionq
    definition:
      The PostgreSQL-backed queue that owns actions, sessions, claims, and
      outcomes.
tags:
  - agents
  - workflow
summary:
  actionq-dispatcher runs agent work as subprocesses inside a per-invocation
  coordinator. The rejected alternative was a long-running agent service, and
  the rejection is most of the design.
explorePrompt: >-
  Use this note as a worked instantiation, not a design to copy. The
  transferable question: for autonomous work in your environment, what should
  the unit of execution be, and which properties does a resident process
  accumulate that a per-invocation one cannot? The worked case runs agent work
  as a subprocess inside a coordinator invoked once per action: it wakes, claims
  one action, creates a worktree, takes a claim, renders the prompt, invokes the
  worker under a per-action-type ACL, runs post-flight gates, transitions state,
  and exits, leaving no process behind. A resident agent service was rejected on
  security posture rather than capability, because it accumulates standing
  credentials, broad reach, and state that exists nowhere reviewable. The
  coordinator is deliberately deterministic, with no model in the loop;
  authority to merge or send stays with the operator. Failure handling falls out
  of the shape: a crashed subprocess is a failed queue entry with its events
  attached, and recovery is to claim it again. Apply the question to autonomous
  work you run. Name what your long-lived component holds that would disappear
  if its lifetime were one unit of work, and what genuinely needs to persist.
  Say where your constraints diverge -- work that cannot be bounded, startup
  cost that dominates, state that must survive. Produce the execution unit you
  would choose and what it costs you.
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
