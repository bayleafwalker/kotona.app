---
title: Authority must travel with the action
role: synthesis
status: exploration
lifecycle: current
area: agent workflow
published: 2026-07-22
lastRevised: 2026-09-07
projects:
  - vuoro
relates:
  - legibility-is-an-operating-property
  - the-agent-is-not-the-application
  - the-person-of-record
  - a-project-folder-is-a-view-not-an-authority
  - why-production-access-changes-the-shape-of-agent-tooling
  - the-work-between-the-ticket-and-the-agent
  - the-deployment-boundary-was-only-a-place
  - the-devbox-is-an-access-cell
tags:
  - agents
  - workflow
  - authorization
  - audit
summary:
  Direct agent operation removes a universal deployment handoff, so authority,
  evidence, and reconciliation must bind to each consequential action instead of
  to its location.
explorePrompt: >-
  Use this note as a worked model, not a new primitive. The transferable
  question: when a worker can inspect a live system and change it in the same
  session, what replaces the deployment boundary that used to collect review,
  tests, signatures, promotion, and rollback? The worked answer moves the record
  from the crossing to the action. Each consequential act carries intent, pinned
  governing context, an authenticated principal, a scoped capability, a target,
  and preconditions into an attempt, then a target receipt, then reconciliation
  of the consequence -- capability as the before- boundary, receipt as the
  during-boundary, reconciliation as the after- boundary. The motivating fact is
  that an attempt and its durable effect are not the same: an API call can time
  out after committing, a controller can accept a declaration without
  converging, a message can be sent without being delivered. Location is access,
  not authority: an access cell authenticates a session and mediates reach but
  must not become the owner of policy, canonical context, or target effects.
  Apply the question to a system where work now happens directly. Take one
  consequential action, name what issues its capability, what receipt the target
  can actually produce, and how you would detect an attempt that did not achieve
  its effect. Say where your constraints diverge -- targets with no receipt, no
  policy service, irreversible actions. Produce the envelope for that one action
  and the gap that defeats it.
reference:
  purpose: design-rationale
  discoverFor:
    - what replaces the deployment boundary when an agent operates a live system
    - separating an attempt from its durable consequence
  establishes:
    - that the controls once carried by a promotion boundary must attach to the
      action itself
    - that an attempt and its effect can diverge, so a record of intent alone is
      insufficient
  doesNotEstablish:
    - an implementation, protocol, or permission model for any specific system
  supplementWith:
    - the receiving system's own authorization boundaries and audit records
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

The capability is the before-boundary: it limits what may be attempted, by whom,
against which target, and for how long. The receipt is the during-boundary: it
links the work, actor, authorization, request, target, and immediate result.
Reconciliation is the after-boundary: it determines whether the consequence
actually holds and what must happen if it does not.

This is a synthesis of the earlier deployment-boundary and devbox notes, and the
canonical statement of the envelope on this site: other notes link here rather
than restating it. It is not a new assurance primitive. The surrounding
vocabulary belongs to established access control, provenance, workflow
assurance, and reference-monitor practice;
[_Where the assurance questions are already answered_](/notes/where-the-assurance-questions-are-already-answered/)
maps the larger field.

## One action, walked through a timeout

The envelope stops being abstract at the exact moment an attempt and its effect
diverge, so here is the dispatch system's own worst case. A runner finishes
governed work and publishes the result as a content-addressed artifact; the
terminal completion call to the queue then times out. Did the action complete?

The design's first move is to refuse to treat that as one question. Publication
and terminal queue mutation are separate retry boundaries. The publication
produced a receipt — sanitized to its load-bearing fields:

```text
publication-receipt/v1
  action_id, attempt_id
  source_commit,    source_tree
  candidate_commit, candidate_tree
  records: { report: artifact:sha256:<digest> }
```

One structural detail carries most of the weight: the receipt cannot contain its
own address. The journal reference is attached only after the receipt is hashed,
and settlement later verifies that the recovered receipt equals the original
with that single field removed — so the evidence cannot be quietly rewritten to
point somewhere else.

Reconciliation then resolves the timeout instead of retrying the work. After
reclaim, the daemon recovers the completed receipt and settles it under the new
live claim rather than rerunning the harness. If the completion response was
lost, it reads the queue's own history and acknowledges settlement only when the
authoritative terminal status and result reference match the receipt. The
guarantee this buys is stated in the contract's own words: content-idempotent
publication plus at-most-once terminal mutation under a live claim — not
exactly-once processing. A timeout whose process state cannot be established is
recorded as unknown, and its output is quarantined rather than treated as
canonical publication.

The unresolved case is just as instructive. The same contract admits that the
queue's terminal complete, fail, and reject calls are not fenced — the
claimed-by field is metadata, not claimant proof — so one edge of this envelope
rests on an authority the target does not yet verify. And some targets can never
produce a strong receipt at all: a sent message proves submission, not delivery.
There the after-boundary carries everything, and where reconciliation is
impossible the honest record is an attempt with an unknown consequence, not a
success.

## Location is access, not authority

An access cell — devbox, workstation, CI runner, or ephemeral task environment —
can authenticate a session, offer approved tools, mediate network reach, and
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
record the target's observable result, then exercise the reconciliation path. If
that cannot distinguish an attempted action from an achieved effect, the
envelope remains incomplete.
