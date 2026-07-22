---
title: The deployment boundary was only a place
role: exploration
status: exploration
lifecycle: superseded
lifecycleChanged: 2026-07-22
lifecycleReason: >-
  Its action-envelope argument is now merged with the access-cell boundary in
  one synthesis about authority, evidence, and reconciliation.
supersededBy:
  - authority-must-travel-with-the-action
area: agent workflow
published: 2026-07-19
lastRevised: 2026-07-22
projects:
  - sprintctl-and-kctl
relates:
  - the-work-between-the-ticket-and-the-agent
  - log-as-system
  - the-devbox-is-an-access-cell
  - legibility-is-an-operating-property
  - the-agent-is-not-the-application
tags:
  - agents
  - workflow
  - runtime
  - audit
summary: Agents can bypass the physical handoff between execution and runtime, so authorization, evidence, and reconciliation have to attach to each consequential action instead.
---

CI/CD did not solve the boundary between execution and runtime. It made one
particularly convenient version of that boundary governable.

The software moved in stages. A person edited a representation of the system,
an artifact was built, and a pipeline carried that artifact into an environment
where it could take effect. The crossing was visible enough to acquire gates:
tests, review, signatures, promotion rules, deployment records, and rollback.
The industry became good at guarding the bridge because there was a bridge.

An agent acting through an operational API has no corresponding journey. It can
diagnose a failing workload and change it through the same session. It can read
a customer case and answer the customer. It can find a malformed row and repair
the table. It can inspect a campaign and alter its audience. In each case the
medium of execution is already the place where the consequence occurs. There is
no artifact waiting politely at the edge of production.

This is not peculiar to AI. Operators, support staff, database administrators,
and traders have always worked this way. Agents generalize their condition:
more organizational work becomes direct manipulation of live state, performed
at machine speed through reusable interfaces.

The physical planes collapse. The semantic distinction must not.

An attempted action and a durable consequence are still different facts. An API
call may time out after committing. A message may be sent but never delivered.
A controller may accept a new declaration without converging on it. A contract
may be signed while its obligations remain unperformed. Calling all of this one
"operational plane" would describe the topology while throwing away the exact
distinction an audit needs.

The replacement for the old crossing is an action envelope:

```text
intent
  + work reference
  + pinned governing context
  + authenticated actor
  + scoped capability
  + target and preconditions
  -> attempted action
  -> observed consequence
  -> reconciliation
```

The capability is the before-boundary. It says which action may be attempted,
against which target, for how long, and under which preconditions. It should be
short-lived enough that possessing yesterday's context does not grant today's
authority.

The receipt is the during-boundary. It binds the action to the work, session,
actor, capability, request, target, and immediate result. A generic session
trace is useful evidence but too weak as the contract: it can explain a run
without proving that the run was entitled to change anything.

Reconciliation is the after-boundary. It asks whether the intended consequence
actually holds and whether it continues to hold. This is not merely review
after the damage. High-risk actions can still require a proposal, simulation,
transaction, second principal, or reversible staging step before execution.
What disappears is the assumption that every useful control can sit at one
universal handoff called deployment.

The smallest durable unit therefore changes. In an artifact pipeline it was
reasonable to make the deployment the main audit object. In direct operation it
has to be the consequential action. Session logs remain valuable, but a session
is only a container. One session may read freely, acquire two different
capabilities, attempt five mutations, observe three consequences, and leave one
ambiguous result for repair. Compressing that into `session: succeeded` would be
the new version of closing a ticket when its pull request merged.

This also changes what "runtime" means. It is not a synonym for a Kubernetes
cluster or a deployed executable. Runtime is the durable field of consequences:
the live service, the altered ledger, the sent reply, the published price, the
active contract, the customer promise. Execution is the attempt to intervene in
that field. They can occupy the same system and still require different records.

For Vuoro, the implication is narrower than building an organizational control
plane. Claims and sessions already point in the right direction, but a wider
substrate would need to bind capabilities and consequence receipts to stable
work and knowledge references without becoming the owner of every target
system. The target still decides what happened. The work system still decides
why it mattered. The substrate preserves the causal join.

CI/CD gated the crossing. Agents often do not cross. What remains gateable is
the action, and what remains provable is the path from authority to consequence.
