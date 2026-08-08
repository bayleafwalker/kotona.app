---
title: Legibility is an operating property
role: synthesis
status: exploration
lifecycle: current
area: organizational systems
published: 2026-07-19
lastRevised: 2026-08-08
projects:
  - vuoro
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
summary: Agent-ready work keeps the reason, permission, attempted action, observed result, and correction connected while the work happens instead of reconstructing them later.
---

A reporting calendar says a filing is complete. That does not tell me which
data was submitted, which rule version applied, who approved an adjustment,
whether the portal accepted the file, or what happened after a later correction.
Those facts may exist, but often in separate systems and in people's memory.

I use _legibility_ for the ability to join five facts while the work is still
operational:

```text
intent:       why should anything happen?
permission:   who or what may act?
action:       what was attempted?
result:       what condition was later observed?
correction:   what changed when expectation and observation differed?
```

The records matter only if they can change a decision: whether to approve,
recover, assign responsibility, or act next. This is a working cross-functional
model, not a maturity score.

A correction record should name the claim that changed, who accepted the
correction, and which downstream commitments now need review. Recording only
that "a correction happened" leaves the important part to memory again.

## Digital work can still be hard to reconstruct

Software engineering is relatively close to this model. A requirement names an
intent, a commit records a change, CI records checks, a deployment records an
attempt, and monitoring can show an effect. These records are incomplete, but
an operator can often join them without asking the engineer to reconstruct the
day from memory.

Calling other work "unstructured" does not explain much. Legal matters have
structure. Sales processes have stages. Support teams have queues and runbooks.
Regulatory reporting has schemas and calendars. The gap is often that their
systems record descriptions before or after the work while the consequential
action happens somewhere else.

A CRM may record that a conversation occurred without recording the promise
the customer now expects the organization to keep. A contract repository stores
the signed agreement but may not operate its deadlines and conditions. A
support system can close a ticket without showing that the service recovered or
that the intervention was correct.

## Record the consequence, not just the activity

Each function has a different result worth joining to the work:

- For regulatory reporting, it is the submitted file, portal receipt, and
  obligations created by the filing.
- For legal work, it is the active agreement and the deadlines, conditions,
  rights, and duties that follow from it.
- For support, it is the customer and service state after the intervention.
- For sales, it includes promises the organization must now fulfil, not only a
  stage named `closed-won`.

This is where agents can help. A governed tool can record the work item, source
revision, permission, target, request, immediate response, and later observed
state as part of acting. The record no longer depends entirely on someone
summarizing a call or updating a tracker afterwards.

An agent can also make the problem worse. Driving an unobserved browser,
calling an opaque service, or summarizing its own actions in free text produces
activity without a reliable account of the result. Exhaustive traces are not
automatically better. Ten thousand tool events are of little use if none shows
which commitment permitted the change or whether the target actually accepted
it.

## Legibility is not continuous observation

Recording work has a political cost. Collecting every keystroke, screen view,
or model thought can become surveillance while doing little for recovery or
accountability.

The safer constraint is to collect the minimum evidence needed to connect a
decision to its permission, attempted action, observed consequence, and repair.
That may require a target receipt and a later state check. It usually does not
require continuous observation of the person operating the system.

## Start with one consequence

For agent adoption, I would begin with a result the organization already cares
about: a corrected customer state, accepted filing, restored service, or
fulfilled contractual obligation. Then work backwards.

Can the system identify the decision that authorized the action? Can it tell a
proposal from an accepted commitment? Can it distinguish a timed-out request
from a rejected request and from a committed change? Can it show which later
observation confirmed or contradicted the expected result?

Only after that path is durable would I give an agent permission to operate
inside it. If the path cannot answer those questions for a person, adding an
agent will mostly make the missing joins harder to notice.
