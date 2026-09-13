---
title: Utilization is a signal, not a limit
role: synthesis
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-09-13
lastRevised: 2026-09-13
projects: []
relates:
  - a-platform-capability-does-not-exist-all-at-once
  - measure-the-diagnosis-not-only-the-transcript
  - the-agent-is-not-the-application
  - the-coordinator-never-touches-the-repo
  - the-context-window-is-not-the-continuity-boundary
  - simplicity-is-an-ambitious-property
draft: false
tags:
  - agents
  - workflow
  - infrastructure
  - planning
summary: >-
  Model allowance, reset time, latency, cost, and concurrency should influence
  where agent work runs without becoming durable rules that redefine the work.
explorePrompt: >-
  Use this note as a scheduling distinction to test, not as a routing policy to
  copy. The transferable question is whether live execution-resource state is
  informing where already-defined work runs or silently changing the work's
  decomposition, evidence requirements, and completion conditions. This note
  separates durable work facts -- required capabilities, authority, state,
  evidence, environment, and completion -- from observations such as remaining
  allowance, reset time, throttling, latency, context pressure, locality,
  marginal cost, and concurrency. Its worked conclusion is that the latter
  should rank feasible execution choices, while cheap substitution and durable
  handoff make exhaustion survivable. Apply the distinction to a dispatcher or
  human routing practice you operate. Identify one rule that has fossilized a
  temporary provider condition, replace it with an observation and preference,
  and retain any genuine capability or authority exclusion. Include the failure
  case: what happens when the estimate is missing, stale, or wrong? Challenge
  the note where live availability really must alter the plan. Produce a small
  state model and one boundary-crossing test, not a universal model table.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - deciding whether model utilization may change agent workflow design
    - routing agent work across subscriptions, APIs, and local inference
  establishes:
    - a distinction between durable work constraints and live resource
      observations used for routing
  doesNotEstablish:
    - universal utilization thresholds or permanent model-role assignments
    - measured accuracy for any utilization estimate or production scheduler
  supplementWith:
    - the receiving environment's capability, authority, and budget rules
---

I can currently send the same piece of agent work to several paid subscriptions,
metered APIs, or local inference. Their practical availability changes by the
hour: one allowance approaches its reset, another has just renewed, a local
model sits idle, and a long-running session carries more context than the next
step needs.

The tempting response is to turn that snapshot into workflow policy:

- do not start large work above 60 per cent usage;
- route simple work to a local model;
- reserve the expensive model for planning;
- stop parallel work near a reset boundary;
- use no more than three workers for one task.

Each rule is easy to implement. Each also promotes a temporary observation about
today's resources into a durable claim about tomorrow's work.

The useful question is narrower: what should a dispatcher know about execution
capacity, and what is that knowledge allowed to change?

## Work and capacity describe different state

Suppose a coordinator concludes that a change needs an investigation, two
independent implementations, a review, and an integration pass. That
decomposition should follow from the change, its risks, and its completion
conditions.

Now suppose one backend is nearly exhausted, another has just reset, and a local
model is idle. Those facts can change where the five pieces run. They do not
make the review unnecessary or turn two independent implementations into one.

The order matters:

```text
work and its constraints
        ↓
eligible execution resources
        ↓
current resource observations
        ↓
currently feasible choices and routing preference
        ↓
execution
```

Starting with resource state reverses the dependency. The scheduler begins
redesigning the task to fit a provider's meter, and temporary scarcity leaks
into completion policy.

This does not require the work plan to ignore cost. A task may carry an actual
budget or deadline. Those are constraints of the work. The distinction is
between a declared constraint and a scheduler guessing that today's utilization
should become one.

## Useful observations are wider than a percentage

For each backend, a dispatcher may benefit from observing:

```text
availability
estimated remaining allowance
time until reset
recent throttling
expected latency
context pressure
local or remote execution
marginal monetary cost
known capability
current concurrency
```

Several values will be estimates. A subscription may not expose exact allowance,
capability judgments will be task-dependent, and recent latency is not a promise
about the next request. These observations do not need to become authoritative
to improve a choice.

Availability can still be a limit for one attempt: an offline backend is not a
feasible destination. The claim is that a utilization reading should not become
a lasting constraint on how the work itself is defined.

A planning session can decide that local inference is adequate for repository
orientation but not for resolving an architectural ambiguity. A dispatcher can
prefer a recently reset subscription for a long implementation. A session near
its useful context limit can finish a coherent unit and prepare a handoff before
opening another investigation.

That is more adaptable than permanently labelling one model as planning and
another as implementation. The scheduler exposes current conditions; the work
decides which conditions matter.

## Marginal utilization changes the economics

Subscription inference has unusual marginal economics. Paid allowance that
expires unused can have close to zero marginal monetary cost. Local inference
has a similar shape once the hardware is already running.

Neither is free. It still consumes elapsed time, electricity, context, operator
attention, and opportunity. But a scheduler that compares only API-equivalent
token prices misses resources that are already paid for and otherwise idle.

Available capacity can make speculative review, independent challenge,
classification, test generation, or repository orientation sensible. It does not
justify inventing work to improve a utilization graph. The candidate work must
still be useful before cheap execution makes it attractive.

## Exhaustion needs a transition, not an early prohibition

Resource awareness matters most near a boundary. One response is to stop
starting work early enough that the boundary can never be crossed. That avoids
one failure by leaving capacity unused and encoding a conservative guess into
every workflow.

A substitution path is more useful:

```text
detect an approaching constraint
        ↓
finish the smallest coherent unit
        ↓
write a durable handoff
        ↓
select another feasible resource
        ↓
continue
```

A rate-limited backend can return queued work to the feasible pool. Local
inference can be preferred while idle and abandoned without ceremony when the
task exceeds its useful capability. A long session can end without taking the
work with it.

This approach will still make bad choices when utilization estimates are stale
or capability judgments are wrong. That is the important failure case. Routing
must remain replaceable, and a failed preference must not corrupt the work
record or weaken its checks.

## Keep durable policy small

Some exclusions should remain firm. Unused quota does not expand an agent's
authority. Work requiring a particular environment cannot run where that
environment is unreachable. A backend known to be unsuitable for a consequential
decision may be excluded from that decision.

Those constraints survive provider and quota changes. A utilization reading does
not.

The practical implementation rule is therefore to persist work state, required
capabilities, authority, evidence, completion conditions, and handoff state.
Observe availability, allowance, latency, cost, and concurrency around them. The
next test is whether a dispatcher can lose every utilization observation,
rebuild them later, and still recover the same definition of done.
