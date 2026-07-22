---
title: Authority must travel with the action
role: synthesis
status: exploration
lifecycle: current
area: agent workflow
published: 2026-07-22
lastRevised: 2026-07-22
projects:
  - sprintctl-and-kctl
relates:
  - legibility-is-an-operating-property
  - the-agent-is-not-the-application
  - the-work-between-the-ticket-and-the-agent
  - the-deployment-boundary-was-only-a-place
  - the-devbox-is-an-access-cell
tags:
  - agents
  - workflow
  - authorization
  - audit
summary: Direct agent operation removes a universal deployment handoff, so authority, evidence, and reconciliation must bind to each consequential action instead of to its location.
---

## Question

What replaces the deployment boundary when an agent can inspect a live system
and alter it through the same session?

The old answer was a useful topology: code crossed from a development
representation, through a build and release process, into a production
environment. That crossing acquired review, tests, signatures, promotion, and
rollback. Direct operation has no equivalent universal bridge. A support reply,
database repair, customer-state change, or controller action can take effect
where it is executed.

The physical boundary can disappear without making an attempt and its durable
consequence the same fact. An API call can time out after committing; a
controller can accept a declaration without converging; a message can be sent
without being delivered. The record must therefore travel with the action.

## The action envelope

The useful unit is an action envelope, not a successful session:

```text
intent + pinned governing context + authenticated principal
  + scoped capability + target + preconditions
  -> attempted action
  -> target receipt
  -> reconciliation of the consequence
```

The capability is the before-boundary: it limits what may be attempted, by
whom, against which target, and for how long. The receipt is the during-boundary:
it links the work, actor, authorization, request, target, and immediate result.
Reconciliation is the after-boundary: it determines whether the consequence
actually holds and what must happen if it does not.

This is a synthesis of the earlier deployment-boundary and devbox notes. It is
not a new assurance primitive. The surrounding vocabulary belongs to established
access control, provenance, workflow assurance, and reference-monitor practice;
[_Where the assurance questions are already answered_](/notes/where-the-assurance-questions-are-already-answered/)
maps the larger field.

## Location is access, not authority

An access cell — devbox, workstation, CI runner, or ephemeral task environment
— can authenticate a session, offer approved tools, mediate network reach, and
emit session evidence. It must not silently become the owner of policy,
canonical context, or target effects.

The division is concrete:

- the work system decides why an action matters and who owns the commitment;
- the knowledge system resolves ratified context and revisions;
- a policy service issues scoped capabilities;
- the target system verifies its capability and reports its own effect; and
- the access cell carries the session between them.

A reachable tool may still refuse an operation. That is evidence that network
admission and authorization are different controls, not friction to erase.

## Current boundary

This is a working design for small, repository-backed agent workflows. It does
not say that every mutation needs a new platform, nor that every target can
produce a perfect receipt. The next useful test is narrower: choose one
consequential action, bind it to a work reference and short-lived capability,
record the target's observable result, then exercise the reconciliation path.
If that cannot distinguish an attempted action from an achieved effect, the
envelope remains incomplete.
