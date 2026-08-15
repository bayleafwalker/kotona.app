---
title: A merged PR is not an architectural decision
role: exploration
status: exploration
lifecycle: current
area: agent workflow
published: 2026-08-15
lastRevised: 2026-08-15
projects:
  - vuoro
relates:
  - authority-must-travel-with-the-action
  - derived-status-is-earned
  - the-recommendation-does-not-need-authority
  - the-work-between-the-ticket-and-the-agent
  - judge-agents-by-the-next-prompt
draft: true
tags:
  - agents
  - code-review
  - decision-making
  - provenance
  - workflow
summary: An agent asks for a design decision mid-implementation, the operator answers at pull-request depth, and the answer gets filed as architecture. The fix is not a better escalation prompt but keeping the three review surfaces from borrowing each other's authority.
---

An agent has been inside an implementation for an hour. It has read the schema,
followed the call graph, tried two approaches and found a genuine fork. So it
asks:

> We need to choose between A and B because of X, Y and Z. I recommend B.
> Approve?

And I say something like:

> Uh, B sounds reasonable.

What happens next is the interesting part. The agent records an operator
decision. A planner later discovers that B was explicitly operator-approved. A
subsequent implementation treats it as an architectural constraint. A reviewer
confirms the code correctly implements the ratified decision. Six weeks later
several agents are faithfully implementing my great vision for B.

My actual contribution was approximately "sure, I suppose." Provenance turned
it into intent.

**Working model.** The failure here is not that I was underinformed, and the
fix is not a better escalation prompt. The question was asked inside a pull
request, answered at the depth a pull request implies, and then filed at a depth
a pull request does not reach. Nobody was negligent. The record is still false.

## What a pull request gate is actually for

A pull request is a convenient unit of change. Merging one is a policy decision
about a repository, not a design decision about a system. On my projects the
policy is roughly: casual review passes, tests are aligned and pass, no
outstanding notices block it. Sometimes a pull request passes that does not meet
even these.

That gate can be cheap because of one property: any action taken in a single
pull request can be reversed in a single pull request. Nothing about the gate
requires proof of ultimate provenance, and demanding one would not make the
merge safer. It would make it slower and produce a paper record that looks like
authority.

This is why "agents produce more code, so review harder" is the wrong response.
It strengthens the surface that was never carrying the weight.

## The exception is consequence, not code

Reversibility is a property of the code in a diff and not always of what the
diff caused. A pull request that adds a column, ships, and acquires three
consumers is a clean `git revert` and a dirty system state. [Derive status only
from reproducible evidence](/notes/derived-status-is-earned/) makes the same
split between a throwaway query and a migration that changes customer records:
generation cost says almost nothing about which case you are in, and neither
does diff size.

So a small number of changes carry semantics that outlive their own revert:
persisted data contracts, published API shape, security and authority
boundaries, anything a client can start depending on, anything with money or
regulatory meaning attached.

Those need routing out of the casual gate, not reviewing harder inside it. A
stricter review at the same surface still produces a decision stamped with
pull-request authority. The useful mechanism is a classifier on the change
stream that says _this one is not a merge question_, and then handles it
somewhere else.

## The third surface has no trigger

The review nobody schedules asks whether the system we now have still resembles
the system we intend to have. Product intent, architecture, public interfaces,
domain and data models, code structure, runtime behaviour — do those still
describe approximately the same thing?

Five hundred individually acceptable changes can produce a system nobody would
deliberately design. There is no offending pull request to reject. The failure
is in the composition: overlapping abstractions for one concept, a schema
representing distinctions the product no longer cares about, supposedly
independent modules coupled through a growing shared core, retries interacting
badly across layers, a configuration surface expressive enough to permit
nonsensical states.

This review does not end in `PASS` or `FAIL`. Its output looks more like a
classification:

```text
accepted evolution
documentation drift
implementation drift
duplicated capability
architecture conflict
simplification opportunity
decision required
```

Humans have always done versions of this through architecture reviews,
migrations and refactoring initiatives. Those are irregular precisely because
reconstructing the system was expensive. That constraint is weakening. An agent
can inspect the whole repository, compare dependency graphs over time, find
concepts multiplying across schemas, and reconstruct why an odd boundary exists
before asking whether it still makes sense. Breadth is cheap for it and
expensive for me.

What the agent should not get is the verdict. Sometimes the code is right and
the architecture document is stale. Sometimes a duplicate exists because two
domains genuinely need independent implementations. Sometimes the architecture
was followed exactly and the architecture is now the problem.

## The provenance rule

If the three surfaces are separated, one rule follows directly: a decision made
inside the pull-request surface cannot be recorded as a constraint binding the
system surface.

Concretely, when an agent asks me something mid-implementation and I answer,
that answer is a delegated implementation choice with an audit trail. It is not
an architectural decision record, later agents are not entitled to treat it as
settled, and a planner discovering it should see what it actually is: an
operator unblocking work, not an operator setting direction.

This is the same shape as [authority must travel with the
action](/notes/authority-must-travel-with-the-action/). The authority attached
to a decision has to match the surface where it was actually exercised, not the
surface where it later turns out to be useful.

## What this does not fix

Assent laundering is not fully solvable, and working too hard at it makes things
worse.

The obvious mitigations are real but partial. Keep escalations rare enough that
I still have attention when one arrives. Make the agent prepare a decision
rather than transfer its uncertainty — what needs deciding, why it matters, the
realistic alternatives, what becomes difficult to reverse, what happens if
nobody decides yet. Record weak assent as weak assent.

None of that removes the underlying asymmetry: the agent has most of the
situational context and I have the authority. Push the fix further and you get
semi-artificial decision gates, and the request becomes closer to asking someone
to stake their judgment on "A or B?" about a system they have not been inside.
That is not better governance. That is a worse version of the same problem with
more ceremony attached.

So I would treat this as mitigation rather than elimination, and be suspicious
of any process that claims to have closed it.

## Where the model may fail

The confident half of this note is the separation of surfaces. The uncertain
half is whether the routing classifier works. Detecting which changes carry
non-revertible semantics is itself a judgment, and an agent applying it will
have both false negatives — a schema change that looked internal — and false
positives that push routine work into the expensive path until the path stops
being trusted.

I am also not claiming that agent review is generally better. It does not get
bored on file 37 and it can search every caller instead of the three that looked
important, which is real. Its failure mode is calibration: confident findings on
code whose intent it reconstructed wrongly, and enough volume that the false
positives become their own tax on the attention I was trying to protect.
Exhaustive review and human attention do not have to be the same operation, but
separating them does not automatically make either one good.

The next test is narrow: take the operator decisions currently recorded in my
own pipeline, and check how many of them were actually exercised at the surface
their record claims. If most of them were mid-implementation unblocking filed as
architecture, the rule earns its cost. If they were already fine, the problem is
smaller than this note assumes.
