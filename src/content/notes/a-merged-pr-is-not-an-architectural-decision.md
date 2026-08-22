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
explorePrompt: >-
  Use this note as one worked instantiation, not a rule to copy. The
  transferable question: when an automated worker asks a human to decide
  something mid-implementation, what authority should that answer carry
  afterwards, and which later work is it entitled to bind? The note concludes
  that merging a change is a policy decision about a repository rather than a
  design decision about a system; that change acceptability, system coherence,
  and composed behaviour are three distinct reviews that answer different
  questions and cannot substitute for one another; and that a decision exercised
  inside the cheapest of them must not be recorded as a constraint binding the
  others. Its constraints are a single operator, agents holding far more
  situational context than the approver, and a merge gate kept deliberately
  casual because a repository delta is cheap to revert. Apply the question to
  your own setting. Name where your constraints diverge -- regulated change
  control, many reviewers, changes whose consequences cannot be reverted -- and
  say which conclusions stop holding there. Produce a routing rule for your
  change stream, a provenance rule stating what each review's decisions may
  bind, and the observation that would show either rule is wrong.
draft: false
tags:
  - agents
  - code-review
  - decision-making
  - provenance
  - workflow
summary:
  An agent asks for a design decision mid-implementation, the operator answers
  at pull-request depth, and the answer gets filed as architecture. The fix is
  not a better escalation prompt but keeping three separate reviews from
  borrowing each other's authority.
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

My actual contribution was approximately "sure, I suppose." Provenance turned it
into intent.

**Working model.** The failure here is not that I was underinformed, and the fix
is not a better escalation prompt. The question was asked inside a pull request,
answered at the depth a pull request implies, and then filed at a depth a pull
request does not reach. Nobody was negligent. The record is still false.

## What a pull request gate is actually for

A pull request is a convenient unit of change. Merging one is a policy decision
about a repository, not a design decision about a system. On my projects the
policy is roughly: casual review passes, tests are aligned and pass, no
outstanding notices block it. Sometimes a pull request passes that does not meet
even these.

That gate can be cheap because of one property: the repository delta of a pull
request is cheap to reverse. Whatever a single pull request did to the tree, a
single pull request can undo. Nothing about the gate requires proof of ultimate
provenance, and demanding one would not make the merge safer. It would make it
slower and produce a paper record that looks like authority.

This is why "agents produce more code, so review harder" is the wrong response.
It strengthens the surface that was never carrying the weight.

## The exception is consequence, not code

The delta is cheap to reverse. Its consequences may not be. A pull request that
adds a column, ships, and acquires three consumers is a clean `git revert` and a
dirty system state.
[Derive status only from reproducible evidence](/notes/derived-status-is-earned/)
makes the same split between a throwaway query and a migration that changes
customer records: generation cost says almost nothing about which case you are
in, and neither does diff size.

So a small number of changes carry semantics that outlive their own revert:
persisted data contracts, published API shape, security and authority
boundaries, anything a client can start depending on, anything with money or
regulatory meaning attached.

Those need routing out of the casual gate, not reviewing harder inside it. A
stricter review at the same surface still produces a decision stamped with
pull-request authority. The useful mechanism is a filter on the change stream
that says _this one is not a merge question_, and then hands it somewhere else.
The filter is not itself a review. It only decides which review a change belongs
to.

## The second review has no merge event

The review nobody schedules asks whether the system we now have still resembles
the system we intend to have. It has no natural transaction boundary: nothing
arrives, nothing is pending, nothing blocks. That is not the same as being
unschedulable. A release milestone, a large schema addition, measured growth in
the dependency graph or simply a date can all trigger it. What it cannot have is
a merge event, which is why it does not happen by itself. Product intent,
architecture, public interfaces, domain and data models, code structure, runtime
behaviour — do those still describe approximately the same thing?

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

## A pull request is not the product either

Architectural coherence is not the last surface. A system can be internally tidy
and still behave badly as the thing someone uses.

Retries are the clearest case I have. The frontend retries. The API retries. The
queue redelivers. The worker times out. Reconciliation runs. The user presses
submit again. Every one of those implementations can be correct against its own
specification, tested, reviewed and architecturally where it belongs. The
interesting behaviour exists only in the interaction, and no single pull request
contains it.

The same is true of most of what makes a system pleasant or unpleasant to
operate: latency, recovery after a partial failure, resource consumption,
observability, upgrade behaviour, how many operations a common workflow actually
takes, and plain feel. Those are properties of the composed thing. Asking a diff
about them is a category error.

This is where heavy change-level assurance becomes quietly misleading. The
measurable layer — coverage, lint, security findings, review comments resolved —
responds well to effort, and agents can make it spectacular. Every pull request
can carry exhaustive tests, three independent reviews and a clean scan. None of
that is evidence about the composed behaviour, because none of it was ever
measuring that. A project can have excellent change review, defensible
architecture and a product that is slow and awkward to use, and nothing in the
pipeline will say so.

So the third review exercises the actual thing: realistic workflows, combined
failures rather than isolated ones, performance under something resembling real
load, and the product surface as a user meets it. It is the one review that
cannot be done by reading the repository.

## The provenance rule

Three reviews, then: whether the change is acceptable, whether the system still
coheres, and whether the composed thing works well. They answer different
questions and they are not substitutable — a project can score well on the first
and badly on the other two, which is the ordinary case rather than a pathology.

One rule follows from keeping them separate: a decision made inside the
pull-request review cannot be recorded as a constraint binding the other two.

Concretely, when an agent asks me something mid-implementation and I answer,
that answer is a delegated implementation choice with an audit trail. It is not
an architectural decision record, later agents are not entitled to treat it as
settled, and a planner discovering it should see what it actually is: an
operator unblocking work, not an operator setting direction.

This is the same shape as
[authority must travel with the action](/notes/authority-must-travel-with-the-action/).
The authority attached to a decision has to match the review where it was
actually exercised, not the review where it later turns out to be useful.
Authority should not silently increase as a decision travels from implementation
into history.

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

The confident half of this note is the separation of the three reviews. The
uncertain half is whether the routing filter works. Detecting which changes
carry non-revertible semantics is itself a judgment, and an agent applying it
will have both false negatives — a schema change that looked internal — and
false positives that push routine work into the expensive path until the path
stops being trusted.

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
