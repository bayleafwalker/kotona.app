---
title: The agent is not the application
role: synthesis
status: exploration
lifecycle: current
area: agent architecture
published: 2026-07-19
lastRevised: 2026-08-08
projects:
  - vuoro
relates:
  - the-missing-layer-is-binding-not-intelligence
  - derived-status-is-earned
  - the-person-of-record
  - where-the-assurance-questions-are-already-answered
  - a-field-guide-to-assurance-managed-ai-development
tags:
  - agents
  - software-architecture
  - authorization
  - verification
summary:
  A durable agent application keeps permissions, records, checks, and recovery
  outside the model, so changing models does not also replace the system's
  memory or rules.
explorePrompt: >-
  Use this note as a worked architecture, not a template. The transferable
  question: which parts of an agent system must survive a new prompt, session,
  or model, and where do they currently live? The worked answer puts identities
  and permissions, work state and approved transitions, current source
  revisions, checks and their results, target receipts, and reconciliation
  outside the model, leaving plans, queries, explanations, situational code, and
  execution choices inside the granted scope as replaceable. Two moves carry
  most of the weight: selecting which sources actually govern this work and
  binding that packet to the attempt, rather than retrieving merely similar
  text; and giving each attempt a short-lived permission bound to identity, work
  item, action, target, constraints, and expiry, so policy is not left in the
  prompt. The stated test is direct -- start a later session with a different
  model and see whether it can reconstruct what was authorized, attempted,
  observed, and left unresolved without imitating the previous model's
  recollection. Apply the question to an agent system you operate. Run that test
  on paper and name what only exists in conversation history. Say where your
  constraints diverge: no policy service to issue capabilities, targets that
  cannot return receipts, a workflow with no durable work item. Produce the list
  of facts you would move out of the model and the mechanism for each, not an
  architecture diagram.
---

Consider an agent asked to repair a failed customer import. It reads the ticket,
finds a runbook, queries the import state, proposes a correction, runs a tool,
and says the repair succeeded.

The model may have planned the work well, but the application still has to
answer the questions that make the repair usable. Which runbook revision
applied? Was this account in scope? Who allowed the data change? Did the target
commit it before the tool timed out? Which check established that the import is
now correct? What can an operator undo?

If those answers live only in the conversation, changing the model also changes
the system's memory, interpretation, and evidence. A durable application keeps
them elsewhere.

## What the application must retain

The model can propose plans, queries, reports, explanations, adapters, and
execution strategies. The application should own the parts that must survive a
new prompt, session, or model:

```text
application records and controls
  identities and permissions
  work state and approved transitions
  current source revisions
  checks and their results
  target receipts
  reconciliation and recovery
            |
            v
replaceable model work
  plans, queries, explanations
  situational code and interfaces
  execution choices inside the granted scope
```

This application is not itself a security kernel. A
[security kernel](https://csrc.nist.gov/glossary/term/security_kernel) is the
small, protected, verifiable part of a trusted computing base that mediates
access. The application owns a wider workflow; the mechanism that enforces
access should remain much smaller.
[Where the assurance questions are already answered](/notes/where-the-assurance-questions-are-already-answered/)
and
[A field guide to assurance-managed AI development](/notes/a-field-guide-to-assurance-managed-ai-development/)
cover the established disciplines behind this design.

## Give the model applicable context, not merely related text

Search can find several runbooks. The application has to decide which one
currently governs this import, whether a later decision superseded it, and which
unresolved exception applies to this customer. It should then record the exact
material the agent received.

```text
sources and revisions
  -> select what applies to this work
  -> add identity, policy, and scope
  -> produce a task-specific context packet
  -> bind that packet to the attempt
```

I call this context compilation because selection and applicability matter as
much as similarity. A longer context window can carry more text, but it cannot
decide which text has standing or whether it is stale.

## Give tools narrow permission

A tool schema explains how to call `repair_import`. It does not explain why this
agent may repair this account now.

Broad credentials plus an instruction to behave sensibly leave policy inside the
prompt. A stronger design gives the attempt a short-lived permission bound to
the operator or service identity, work item, action, target, constraints, and
expiry. The target checks that permission and returns its own receipt.

This still leaves the model freedom to choose a method inside the granted scope.
Better reasoning can improve that choice without quietly widening what the
session is allowed to change.

## Keep organizational memory out of the conversation

Tickets, approved decisions, document revisions, attempts, target effects, and
later corrections belong in systems with explicit retention rules. A session can
read a projection of those records and propose additions. It should not be the
only place they exist.

This is easy to test: start a later session with a different model. Can it
reconstruct what was authorized, attempted, observed, and left unresolved
without imitating the previous model's recollection? If not, the application
does not yet own its continuity.

## Evaluate the work outside the answer

A fluent completion is useful, but it does not establish that the repair worked.
The application needs checks that can answer:

- Did the agent receive the current runbook and relevant exception?
- Was the attempted change permitted for this account?
- What did the target report, and what state was later observed?
- Did an independent check establish the required result?
- Can an operator reconstruct or reverse the decision and effect?

The model can help collect this evidence. It should not be the only witness for
its own action.

Chat remains a good interface for ambiguity. Routine operation may instead
appear as a proposed change, exception queue, simulation, or familiar domain
screen. The useful product boundary is not whether the interface looks like a
chatbot. It is whether permissions, records, verification, and recovery remain
intact when the model is replaced.

Exact generated artifacts still matter when tests or analysis depend on their
precise behaviour.
[Derive status only from reproducible evidence](/notes/derived-status-is-earned/)
describes when the process can carry the continuing claim and when the generated
object must remain part of the record.
