---
title: The cluster did not need another lock
role: exploration
status: prospective
lifecycle: current
area: software assurance
published: 2026-08-27
lastRevised: 2026-08-27
projects: []
relates:
  - where-the-assurance-questions-are-already-answered
  - why-production-access-changes-the-shape-of-agent-tooling
  - authority-must-travel-with-the-action
draft: false
tags:
  - agents
  - harness-engineering
  - devops
  - cluster-operations
  - study-notes
summary:
  A wrapper-derived effect-intent projection should let an application session
  correlate instability during the next Talos control-plane upgrade; if it still
  escalates without correlation, the hypothesis fails.
explorePrompt: >-
  Use this note as a worked correction, not an architecture to repeat. Map your
  harness's coordination vocabulary onto the DevOps mechanism that already
  implements it; list what is left over. Test leases, fencing, split-brain
  handling, writer exclusion, maintenance windows, and approval against the
  actual merge, admission, concurrency, HA, identity, and recovery controls at
  each effect target. Keep ordinary parallel work visible and identify only
  specific effect pairs that cannot commute. Then examine imperative paths that
  bypass the desired-state or CI/CD gate. For one concrete cross-session
  incident, draw the smallest resource and propagation graph, separate fields a
  wrapper can derive from annotations only the actor can supply, and design an
  advisory intent projection. State a falsifiable trial, including the expected
  correlation, false-notification cases, escalation boundary, and evidence that
  would justify adding a new fence rather than reusing an existing one.
reference:
  purpose: design-rationale
  discoverFor:
    - deciding whether parallel operational agents need a new coordination lock
    - correlating imperative maintenance with symptoms seen by another session
  establishes:
    - a prospective, falsifiable case for wrapper-derived effect-intent
      projection
    - that fencing should remain at the specific non-commutative target
  doesNotEstablish:
    - that the proposed projection has been implemented or tested
    - that every imperative operational surface already has sufficient fencing
  supplementWith:
    - the target system's own HA, authorization, admission, and recovery
      controls
---

One session upgrades a Talos control-plane node while another changes an
application deployed through the same cluster. If the second session sees the
API flap or Flux stop reconciling, it has no intuitive way to know whether the
cluster is failing or somebody else is maintaining it.

My first answer borrowed the language of distributed systems: leases, fencing
epochs, single writers, split brain. It also put the resource boundary around
the cluster. Taken seriously, that would serialize unrelated application work
behind a control-plane upgrade.

## Working model

The single-writer invariant was a granularity error. DevOps already fences the
objects whose effects really cannot commute. Git protects integration through
review, required checks, and merge ordering. Kubernetes has authorization,
admission, revision preconditions, field ownership, and controllers. etcd uses
quorum; HA stacks use techniques such as STONITH when two active owners would be
dangerous. These controls are imperfect, but a new agent lease does not improve
them unless the effect target validates it.

The residual gap appears where an imperative action bypasses the Git gate. A
`talosctl` upgrade, node drain, database failover, or direct cloud operation can
be safe in its own control path while remaining invisible to a different agent
observing the consequences. Whatever happened in the unverified agent story that
prompted this discussion, its useful residue is one familiar failure shape: the
coordination plane is epistemically partitioned while the effect plane remains
connected.

The proportionate addition is a resource graph and an effect-intent projection,
not another lock. Tool wrappers can record the actual session, operation,
target, time, and result, then resolve propagation through a versioned graph:
Talos node to etcd and API availability, API availability to Flux, Flux to an
application's delivery path. The agent adds only what the wrapper cannot
observe: purpose, phase, expected symptoms, duration, and abort conditions.

A session whose own work intersects that path receives a bounded maintenance
notice with evidence links. A session editing local code does not. The notice
explains an observation; it grants no authority and cannot clear its author's
failure. Existing CI, GitOps, admission, identity, and recovery controls keep
doing the harsh work.

The next Talos control-plane upgrade is the test. Run an application session at
the same time. If it correlates a short API interruption with the active upgrade
and escalates only when the declared envelope is exceeded, the projection has
earned another iteration. If it still escalates the expected instability as
unexplained while the graph path and notice are available, the hypothesis fails.
The same is true if broad propagation floods unrelated sessions.

That is the proportionality test promised by
[Where the assurance questions are already answered](/notes/where-the-assurance-questions-are-already-answered/):
map the new vocabulary to established controls, then build only the remainder.
Here the remainder is correlation. Fence nothing new.
