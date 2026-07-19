---
title: Subprocess, not service
status: guiding
lifecycle: current
area: agent workflow
published: 2026-06-10
lastRevised: 2026-06-10
projects:
  - sprintctl-and-kctl
relates:
  - the-missing-layer-is-binding-not-intelligence
  - the-coordinator-never-touches-the-repo
tags:
  - agents
  - workflow
summary: actionq-dispatcher runs agent work as subprocesses inside a per-invocation coordinator. The rejected alternative was a long-running agent service, and the rejection is most of the design.
---

An earlier post argued that the missing layer in solo agent work is binding, not intelligence. This is the shape the layer ended up taking.

Two pieces. actionq is a Postgres-backed action queue with claim semantics and ordinary lifecycle commands — add, claim, complete, fail, reject, sweep. actionq-dispatcher is the coordinator, and the load-bearing word in its CLI is `dispatcher-once`. An invocation wakes, claims one action, creates a git worktree, takes a sprintctl claim, renders the prompt, invokes the agent as a subprocess under a per-action-type ACL, runs the post-flight gates, transitions state on both sides, and exits. Then there is no process.

The alternative everyone reaches for is a resident agent service — a daemon that holds context, watches for work, and acts. The general-purpose frameworks ship this shape by default, and it was rejected here on security posture, not capability. A resident agent accumulates exactly the properties you don't want: standing credentials, broad reach, and state that exists nowhere reviewable. The subprocess inverts each one. Its lifetime is one action. Its permissions are one ACL, enforced both where the dispatcher constructs the invocation and where the worker runs. Its working surface is one worktree that either becomes a reviewable artifact or gets discarded. When the queue is empty, the only thing running is a systemd timer that occasionally sweeps stale claims.

The coordinator itself is deliberately not an agent. It is a deterministic dispatcher: no model in the loop, no judgment, nothing to align. Anything that requires intelligence happens inside the subprocess, inside the ACL, against the worktree. Anything that requires authority — merging, sending, deciding the work is done — happens later, by the operator, who remains the only actor with commit rights.

Failure handling falls out of the shape rather than being designed. A crashed subprocess is a failed action sitting in a queue with its events attached, not a degraded service to nurse back to health. Recovery is `claim` again. There is no agent state to reconstruct because no agent state survives an invocation.

The service model asks how to keep an agent trustworthy over time. The subprocess model deletes the time.
