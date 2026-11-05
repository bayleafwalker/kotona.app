---
title: The context window is not the continuity boundary
role: synthesis
status: exploration
lifecycle: current
area: agent workflow
published: 2026-09-13
lastRevised: 2026-11-05
projects: []
relates:
  - the-agent-is-not-the-application
  - the-work-between-the-ticket-and-the-agent
  - the-human-is-in-the-slow-loop
  - a-project-folder-is-a-view-not-an-authority
  - utilization-is-a-signal-not-a-limit
  - a-repository-should-not-contain-everything-its-agents-know
  - an-idempotency-key-is-not-a-business-invariant
  - a-supported-workflow-includes-its-operating-environment
draft: false
tags:
  - agents
  - context-management
  - handoffs
  - workflow
  - state
summary: >-
  Long-running agent work can move to a fresh attempt through a validated
  handoff with retrievable candidates, owner records, current access and
  explicit unknowns. Continuity across hosts and harnesses need not expose
  private logs.
explorePrompt: >-
  Test what a fresh execution attempt needs to continue consequential work
  across a host or harness boundary. The worked design preserves a semantic
  handoff with retrievable candidate bytes, owner records, verification,
  completion criteria and next actions, while mechanical capture carries its own
  source intervals and gaps. A hash without available bytes is not a portable
  checkpoint, an empty gap list does not prove complete capture, and historical
  release permission does not supply current access. Native resume and successor
  continuation are separate capabilities. Apply this to a different workflow,
  identifying where its conversational, data-retention or resource constraints
  diverge. Produce the smallest authorized handoff packet and a qualification
  scenario using another harness on a clean host with the predecessor and
  private raw logs unavailable. Require exact candidate retrieval, current
  authority, explicit unknown effects and either a safe next step or a precise
  missing prerequisite. Challenge the design where those facts have no durable
  owner or ordinary compaction is sufficient. Keep delivery, admission,
  execution and acceptance distinct; replacing a worker does not prove its
  remote requests stopped. State what a failed continuation would teach you to
  preserve next.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - replacing an overgrown conversation with a fresh attempt that can continue
      safely
    - how to hand work from one agent session to another
    - continuing long-running agent work after context compaction
    - designing a validated handoff between agent sessions
  establishes:
    - why stored transcripts, active context, and durable handoff state serve
      different continuity needs
    - requirements for portable evidence, declared capture gaps and current
      access
  doesNotEstablish:
    - that every long conversation should become a durable workflow
    - a universal handoff schema or automatic transition threshold
  supplementWith:
    - the receiving workflow's authoritative work, evidence, and decision stores
---

In a long agent session, the repository can stay almost unchanged while each new
turn becomes more expensive. Tool output, rejected hypotheses, corrections,
plans, and incidental discussion remain in the working context. Eventually the
harness offers to compact it.

Compaction tries to preserve the conversation. Consequential work may need a
different promise: preserve enough state for a fresh execution attempt to
continue correctly.

That is a handoff problem, and treating it as one changes both what must be
recorded and when a session is allowed to end.

## Compaction preserves a derivative

Before compaction, an old observation is directly present in the active context
as an original message or tool result. Afterwards, only what the summarization
process selected remains in that working context. The harness may still retain
the full transcript by session ID, but the model no longer reasons over it
unless it is retrieved. Detail disappears from the working set, uncertainty
becomes prose, and several observations may collapse into one conclusion.

The summary can be excellent and still be a lossy derivative of the session it
replaces. For an ordinary conversation that may be exactly the right trade. For
work, the stronger question is what the next attempt needs, not how faithfully
it can imitate the preceding conversation.

This distinction matters when the history contains exact source revisions,
operator instructions, accepted decisions, verification failures, or evidence
that contradicts the current conclusion. A fluent summary is not an
authoritative home for any of them.

## A handoff preserves a resumption point

A successor does not need every joke, dead end, duplicated log, or abandoned
plan. It needs a precise state from which to act: the objective, current state,
decisions, evidence references, source revision, candidate artifacts, unresolved
questions, completion criteria and next executable step. A validated handoff
binds those facts to their owners.

The preceding session becomes history rather than working memory. Work
continuity survives because the successor receives the state needed to resume,
not because one conversation is made to look immortal.

The handoff is not another place to copy every fact. It should identify the
systems and artifacts that own those facts. A source revision belongs in Git,
work ownership in the work system, a verification result in its evidence record,
and an operator decision wherever that workflow records decisions. The handoff
binds the relevant references into one transition.

## Keep the predecessor addressable

Transcript storage can make a predecessor addressable after either compaction or
a handoff. The handoff's advantage is not preservation of the transcript; it is
an explicit, validated resumption record that points back to the stored source.

```yaml
handoff:
  objective: ...
  current-state: ...
  decisions: ...
  evidence-references: ...
  source-revision: ...
  changed-artifacts: ...
  unresolved-questions: ...
  completion-criteria: ...
  next-executable-step: ...

predecessor:
  session-id: ...
```

If a conclusion looks suspicious, a successor with current permission can
retrieve the relevant retained predecessor evidence. Retention and access are
conditions of that retrieval. A private native session handle is useful on its
own provider; it is not a portable promise that another host can open it.

Large command output benefits from keeping permitted source evidence separately
from its bounded working projection. Where source bytes were never captured or
have expired, the reference must retain that limitation. The successor cannot
recover omitted detail by trusting a more confident summary.

## Make the packet usable outside the original host

The
[30 October integration plan](https://github.com/bayleafwalker/vuoro/blob/95ee8b38d2b0d4ba8ff9c636e34228e0e4b7257e/docs/plans/2026-10-30-agent-substrate-integration.md)
turns the September proposal into sharper implementation requirements. It is a
plan and contract refinement, with no runtime qualification claim.

A local path and a hash do not make a checkpoint portable. The successor needs
the exact committed candidate or immutable artifact bytes, or an owner reference
it can actually resolve and verify. Successful publication and successful
retrieval are separate observations. A dirty worktree flag cannot substitute for
the missing diff.

Mechanical capture and the semantic handoff also answer different questions. The
handoff explains the work; captured source segments support particular claims.
Capture needs an identified source and version, observed intervals and
frontiers, and explicit gaps. A clean process exit can leave an unknown tail. An
empty gap list means no gaps were detected within the observation boundary. It
does not establish that every expected source was observed.

The
[capture-integrity profile](https://github.com/bayleafwalker/agentops/blob/1739beb696d92304efb2f7e8b550aa5ef7914a63/docs/plans/agentops/2026-10-30-capture-integrity-and-export.md)
likewise separates raw captures from sanitized exports. They have different
digests and a recorded derivation. An internally consistent hash chain cannot
establish that its producer observed an omitted tail without independent
frontier or closure evidence.

Release applies to the exact export, including attachments and metadata, for a
reader, destination and purpose under current policy. A scan with zero findings
does not grant that permission. An old allow decision remains historical
evidence; the receiver still needs current access. These checks can run under
commissioned automatic policy.

## A delivered handoff has not necessarily started execution

Delivery, message handling, admission of an attempt, process outcome, target
effects and acceptance are distinct facts. A packet that reached an inbox may
still lack an eligible executor. A process that exited successfully may still
have an unresolved target operation.

The successor must obtain current work and execution authority from the owning
systems. Copied permissions in a packet do not issue a new grant. Native resume
continues a provider-specific session when that capability is supported;
successor continuation reconstructs the permitted work state. The latter need
not restore private conversation or process state.

Worker disconnection or lease loss does not prove that remote requests stopped.
Reconcile outstanding effects or use a destination retry contract that is safe
across their possible outcomes. The
[effect-recovery models](/notes/an-idempotency-key-is-not-a-business-invariant/)
show why a fresh attempt ID alone supplies neither destination deduplication nor
protection against an obsolete write.

## Session boundaries become operational choices

Once ending a session no longer threatens the work, a boundary can be chosen
when:

- a coherent stage has finished;
- historical material dominates the current context;
- execution needs a different model or environment;
- a provider approaches a practical limit;
- responsibility moves from planning to implementation or review;
- an independent reading would reduce anchoring.

The trigger does not need perfect automation. The more important capability is a
cheap, testable transition to a successor.

That test should be concrete. Use a different native harness on a clean host,
with only the authorized handoff and permitted owner records. Hide the original
host, predecessor chat and private raw logs. Ask the successor to retrieve the
exact candidate, identify the current revision and authority, reproduce the
relevant verification state and name the capture limits and outstanding effects.

It should then perform the next permitted step or identify a precise missing
prerequisite and stop safely. A retained predecessor must not regain settlement
or resource authority merely by sending a late result. Native resume and
cross-harness continuation receive separate results. No successful replay is
claimed here; these are the proposed qualification conditions.

## Compaction still has a role

Not every accumulation of context deserves a new execution attempt. A session
can become noisy before reaching a coherent handoff point. Exploratory work may
not yet have durable state worth binding. Some tasks are conversations rather
than workflows.

Compaction is useful in those cases. The mistake is making it the sole recovery
mechanism for context pressure.

The open implementation question is how to validate a handoff without turning it
into another exhaustive transcript. A useful first check is deliberately small:
can a successor recover the work's authority, evidence, current state, and next
action while the predecessor remains offline? If so, the task has a continuity
boundary independent of either session's context window.
