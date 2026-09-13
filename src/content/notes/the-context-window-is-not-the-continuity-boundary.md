---
title: The context window is not the continuity boundary
role: synthesis
status: exploration
lifecycle: current
area: agent workflow
published: 2026-09-13
lastRevised: 2026-09-13
projects: []
relates:
  - the-agent-is-not-the-application
  - the-work-between-the-ticket-and-the-agent
  - the-human-is-in-the-slow-loop
  - a-project-folder-is-a-view-not-an-authority
  - utilization-is-a-signal-not-a-limit
  - a-repository-should-not-contain-everything-its-agents-know
draft: false
tags:
  - agents
  - context-management
  - handoffs
  - workflow
  - state
summary: >-
  Long-running agent work should continue through a validated handoff and an
  addressable predecessor, rather than depending on a compacted conversation as
  its only memory.
explorePrompt: >-
  Use this note to test a continuity boundary, not to argue that every long
  conversation should restart. The transferable question is what a successor
  execution attempt actually needs to continue work correctly, and which of
  those facts currently exist only in conversation history. This note separates
  compaction, which keeps a lossy summary in the active working context, from a
  handoff, which records objective, current state, decisions, evidence,
  revisions, changed artifacts, unresolved questions, completion criteria, and
  the next executable step while referencing the stored predecessor. Apply the
  question to one consequential agent workflow. Choose a coherent boundary,
  draft the smallest handoff that would let a fresh session resume, and identify
  the authoritative home of every claim it carries. Challenge the model where
  work is genuinely conversational, no durable workflow exists, or retrieval of
  the predecessor is impossible. Produce a handoff schema, its validation test,
  and the condition under which ordinary compaction remains the better choice.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - how to hand work from one agent session to another
    - continuing long-running agent work after context compaction
    - designing a validated handoff between agent sessions
  establishes:
    - why stored transcripts, active context, and durable handoff state serve
      different continuity needs
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
plan. It needs a precise state from which to act:

```text
session A
   │
   ├─ objective and current state
   ├─ decisions and evidence references
   ├─ source revision and changed artifacts
   ├─ unresolved questions
   ├─ completion criteria
   └─ next executable step
           │
           ▼
     validated handoff
           │
           ▼
       session B
```

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

If a conclusion looks suspicious, the successor can retrieve the relevant piece
of the predecessor. The old transcript does not need to enter the new context
wholesale. It remains available as evidence.

Large command output benefits from the same treatment: preserve the complete
source, project the useful portion into the working set, and retrieve omitted
detail when a question requires it. The active context then carries what matters
now while the complete record remains elsewhere.

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

That test should be concrete. Start a fresh session with only the handoff and
access to its declared sources. It should be able to identify the current
revision, explain what remains open, reproduce the relevant verification state,
and perform the next step without guessing at authority. Any fact it can obtain
only by asking the predecessor to remember better belongs somewhere else.

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
