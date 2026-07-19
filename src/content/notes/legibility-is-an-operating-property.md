---
title: Legibility is an operating property
status: exploration
lifecycle: current
area: organizational systems
published: 2026-07-19
lastRevised: 2026-07-19
projects:
  - sprintctl-and-kctl
relates:
  - the-deployment-boundary-was-only-a-place
  - the-devbox-is-an-access-cell
  - the-work-between-the-ticket-and-the-agent
  - compatibility-reports-should-be-a-little-rude
  - the-person-of-record
tags:
  - agents
  - organizational-design
  - audit
  - workflow
summary: Agent-readiness depends less on whether work is digital than on whether intent, action, consequence, and correction remain joinable while the work is happening.
---

An organization is not agent-ready because its manuals are searchable and its
applications have APIs. It is agent-ready when the work can show its work.

Software engineering happens to be unusually close. Requirements are imperfect
but nameable. Changes acquire revisions. Tests emit results. Reviews and
deployments leave durable records. The execution is not fully legible, but
intent, action, and consequence can often be joined without asking the engineer
to reconstruct the day from memory.

Other functions are described as less ready because their work is
"unstructured." That diagnosis is too vague. A legal matter has structure. A
sales process has stages. Support has queues and runbooks. Regulatory reporting
has more schemas and calendars than most software projects could tolerate.
What they often lack is an operational record at the moment of action. Their
systems contain claims about work, entered before or after the work, while the
work itself happens elsewhere.

A CRM says a conversation occurred. It usually does not contain the customer
commitment as a governed event tied to the policy, authority, and evidence that
made it valid. A contract repository says an agreement was executed. It rarely
operates the obligations that begin after signature. A reporting calendar says
a filing is complete. It may not bind the submitted artifact to the exact data,
rules, adjustments, approvals, and portal receipt that produced it.

The useful test is not whether a function has four recognizable planes. Almost
every function can be made to fit knowledge, work, execution, and runtime if the
labels are stretched far enough. The useful test is whether four facts can be
joined:

```text
intent:       why should anything happen?
authority:    who or what was allowed to act?
action:       what was actually attempted?
consequence:  what durable condition now holds?
```

Correction is the fifth fact. When observation and expectation disagree, can
the organization show which claim changed, who accepted the correction, and
which downstream commitments must be reconsidered?

This produces a more useful cross-functional map than a maturity score.

In regulatory reporting, the runtime is the filed report and the obligations it
creates. Legibility comes from binding rules, governed source data, adjustments,
approvals, the submitted artifact, and the regulator's receipt. In legal work,
the runtime is the active agreement: deadlines arrive, conditions become true,
and rights are exercised or lost. Legibility requires those consequences to
remain connected to the negotiated text and authorized decision. In support,
the runtime is the customer and service state being changed during diagnosis.
Closing the case is evidence of neither recovery nor a correct intervention. In
sales, the runtime includes promises the organization is now expected to keep,
not merely a stage named `closed-won`.

Agents can improve this because instrumented action can produce its record as a
side effect. An agent using a governed tool can attach the work reference,
context revision, capability, target, result, and receipt while acting. The
record no longer depends entirely on a person remembering to summarize a call
or update a tracker later.

But an agent does not make work legible merely by doing it. An agent driving an
unobserved browser, calling an opaque service, or summarizing its own actions in
free text can reproduce the same fiction faster. A transcript is not a semantic
event stream. Exhaustive tool traces can be equally useless if they cannot
answer which commitment authorized the action or which business consequence it
changed.

Legibility also has a political cost. Recording every action can become
surveillance without producing accountability. The distinction is purpose and
structure: collect the minimum evidence needed to establish authority,
causality, consequence, and repair; do not treat human attention, keystrokes, or
model monologue as organizational truth. A strong system makes decisions and
effects inspectable. It does not make people continuously observable.

This suggests a narrower route to agent adoption. Do not begin by asking which
department can receive a chatbot. Find a consequence the organization already
cares about, then make the path from intent to that consequence durable. Give
the agent authority only inside that path. If the path cannot distinguish a
proposal from an accepted commitment or an attempted action from an achieved
effect, autonomy will only accelerate ambiguity.

The agent-ready organization is not the one with the most automated work. It is
the one that can tell, without retrospective storytelling, why an action was
allowed and what changed because of it.
