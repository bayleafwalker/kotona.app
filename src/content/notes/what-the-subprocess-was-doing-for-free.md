---
title: What the subprocess was doing for free
role: project-history
status: prospective
lifecycle: current
area: agent infrastructure
published: 2026-11-05
lastRevised: 2026-11-05
projects:
  - vuoro
relates:
  - subprocess-not-service
  - reachability-is-architecture
  - the-queue-was-never-the-hard-part
  - authority-must-travel-with-the-action
  - the-human-is-in-the-slow-loop
draft: false
terms:
  - term: actionq
    definition:
      The historical PostgreSQL-backed action queue whose daemon, harnesses and
      standalone server were removed in August 2026.
  - term: actionq-dispatcher
    definition:
      Retired (2026-08-20 tombstone release). It formerly created a bounded
      workspace, invoked a worker, and recorded the result; the dispatch harness
      now constructs the workspace and invokes product-native workers directly.
  - term: Sovite
    definition:
      The execution owner in the October design. It admits bindings and owns
      execution attempts, leases, fences, cancellation and execution receipts.
tags:
  - agents
  - execution
  - security
  - retirement
summary: >-
  The June dispatch rule bounded worker state and credential exposure through
  per-action execution. October's proposed resident coordinator needed explicit
  owners and tests for the properties that a short lifetime had supplied.
explorePrompt: >-
  Use this history to examine which guarantees a component obtains from having a
  short lifetime, and what replaces them when coordination becomes resident. The
  June dispatch design limited local credential exposure and surviving worker
  state through per-action execution. Its daemon was later retired; an October
  service design retained disposable workers but assigned leases, fences,
  budgets, revocation and recovery to explicit owners. Routine work could use
  commissioned standing authorization while administration remained separate.
  This is a dated design transition, not evidence that the later service was
  installed or qualified. Apply the question to another component whose lifetime
  is changing. Inventory the state, credentials, outstanding requests and
  permissions that survive each end condition. Challenge the case where startup
  costs dominate, a resident coordinator is unnecessary, or a short-lived
  process never actually contained the relevant remote effect. Produce a
  property-to-owner-and-test table, the smallest migration slice and a recovery
  or rollback path. Keep worker lifetime separate from coordinator lifetime, and
  distinguish automatic routine policy from authority to change that policy.
  Identify which previous rule must be retired publicly.
---

In June I published [a rule](/notes/subprocess-not-service/) for my agent
dispatch: run each piece of agent work as a subprocess inside a coordinator
invoked once per action, and reject the resident agent service. The rejection
was about security posture: standing credentials, broad reach and surviving
state that existed nowhere reviewable. The subprocess was intended to contain
those concerns by living for one action. The original argument ended: "The
subprocess model deletes the time."

On 29 October I accepted an architecture for an operated agentic service. This
note records what happened in between and which parts of the June argument
survived. The cited October record distinguishes source and local proofs from
installation and service qualification.

## What happened

The rule did not stop a service from appearing next to it. By August, actionq
ran a daemon execution plane on the devbox with seven harness adapters, routing
and usage limits, plus an HTTP server deployed in the cluster. Its daemon-only
code measured 4,480 lines. The June sentence about an empty queue leaving only a
systemd timer running had stopped being true. On 20 August, with both retirement
gates approved, one change deleted the execution plane and the server
([change](https://github.com/bayleafwalker/actionq/commit/9dccf4e084da88f3f0c52bb9d845b64bed89d202)),
and actionq-dispatcher became a tombstone whose every invocation exits nonzero
([tombstone](https://github.com/bayleafwalker/actionq-dispatch/blob/42649f136fdc97430bc2bfb562bdea22927148a0/README.md)).

By September the agents had moved into hosted runtimes that could not reach the
coordination services on my network, and the record went partial without an
error ([reachability](/notes/reachability-is-architecture/)). A coordinator that
wakes on a workstation timer cannot be called by a runtime in someone else's
cloud.

The October record puts a resident control plane back on purpose: a hosted
substrate, managed execution in isolated VMs, and a gateway controlled by the
owner of each private resource. Its first demonstration starts from a fresh
browser with no dependency on my workstation
([plan](https://github.com/bayleafwalker/agentops/blob/b3e9241e4775a1ad5297af9b446252ca5e0c9681/docs/plans/agentops/2026-10-29-operated-agentic-service.md)).

## What the September account expected

The September update to the June note said that retirement had not reversed its
argument: the unit of execution stayed a bounded, per-invocation subprocess, and
only the component that constructed it had changed. That account left the
coordinator's per-invocation lifetime as the continuing assumption.

## What was observed

The October design preserves the bounded worker and changes the control plane.
Going through it row by row, the June lifetime properties acquire named
mechanisms, while one rule changes position:

| June: the lifetime did it                        | October: a named mechanism does it                                                                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The invocation bounded local credential exposure | The guest VM receives no provider, Sovite, forge or operator credential; the supervisor outside it holds model credentials, the lease and the budget                    |
| No agent state survived an invocation            | One single-use descriptor per started attempt, leases and fences, and execution receipts owned by Sovite                                                                |
| One ACL and one worktree                         | Workbench, task, acceptance and preview are distinct purposes with their own state, network, credential and retention rules; a gateway exposes typed catalog operations |
| Recovery was `claim` again                       | Unknown effects are reconciled before a retry; a fresh successor continues; a stale predecessor is refused settlement                                                   |
| Merging and sending waited for me                | Standing authorization for routine operation, administration in a separate identity, session, credential and network lane, and no universal human confirmation gate     |

The last row changes the June rule that every merge, send or completion waited
for me as the only actor with commit rights. The October record permits routine
operation within commissioned standing authorization. Release signing and
resource-owner admission still apply at their actual boundaries, and a separate
administrative lane contains changes to trust, policy and infrastructure. This
is a change in the routine approval rule; a worker still cannot widen its own
mandate.

Two things survived intact. The agent is still disposable: the native VM runtime
source runs the harness in a separate VM for one attempt, and a missing
environment never falls back to local execution
([source](https://github.com/bayleafwalker/sovite/blob/253005957d6123700af812b56f2daa75c81b04d9/docs/native-vm-runtime.md)).
Judgment still lives in the harness: Sovite owns attempts, leases, fences and
receipts, while the native harness owns the agent loop, its tools and its
provider process.

## The lesson

The June note avoided a question by deleting the time: how to keep something
trustworthy for months. The October control plane has to answer it, and its
answers are a watchdog that closes on revocation or deadline, lease expiry, a
durable budget and fencing. Each has to be tested. A bounded invocation had a
simple local end condition, although even process exit could not revoke a copied
credential or cancel a request already at a remote target.

When a per-invocation design becomes resident, list what the lifetime was
enforcing and give each property an owner and a test before the service ships.
The June note's prompt asked readers to name what their long-lived component
holds that would disappear if its lifetime were one unit of work. The table
above is my answer to my own question, four months late.

## What is not settled

The cited VM runtime is source and "not an installed or qualified execution
profile", and the service plan says no infrastructure change follows from the
planning record alone. Until each row has a test that has been seen to fail, the
table is a design.

The first service in this history took two approval gates and 4,480 deleted
daemon-only lines to remove. The replacement has its intended guarantees written
down before service commissioning.
