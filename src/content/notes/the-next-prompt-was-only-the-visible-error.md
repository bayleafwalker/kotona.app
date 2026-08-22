---
title: The next prompt was only the visible error
role: exploration
status: exploration
lifecycle: current
area: agent workflow
published: 2026-08-17
lastRevised: 2026-08-22
projects:
  - vuoro
relates:
  - judge-agents-by-the-next-prompt
  - what-107-isolated-completions-did-not-show
  - a-merged-pr-is-not-an-architectural-decision
  - the-agent-is-not-the-application
  - authority-must-travel-with-the-action
  - derived-status-is-earned
draft: false
tags:
  - agents
  - evaluation
  - observability
  - workflow
summary:
  The next-prompt heuristic measures what became visible at the human interface.
  A merged PR later filed as architecture, and a self-report that turned out to
  be reconstructable rather than introspective, both passed that test and still
  needed a different check further down.
explorePrompt: >-
  Use this note as a worked instantiation, not a rule to copy. The transferable
  question: when you supervise an autonomous worker mainly by reading its next
  message back to you, what does that catch, and what kind of failure never
  produces a correction, extension, or authorization at all? This instantiation
  names five observation layers — human-visible supervision, agent-declared
  state, execution observability, external effects, long-horizon consequences —
  and argues each answers a different question with different evidentiary
  weight, from a claim that must be externally reconstructed to a receipt that
  settles what actually happened. Its constraints are a single operator,
  sessions with real diffs and artifacts to reconstruct against, and only two
  directly evidenced failure cases: a weak human assent later filed as a
  ratified architectural decision, and a self-report that an external
  reconstructor could reproduce without having been the model. Apply the
  question to a system you actually supervise. Name which of the five layers you
  can currently observe at all, which observations could support a
  discriminating claim (declared scope diverged from touched scope, a stuck
  retry loop, a crossed authority boundary) rather than raw collection, and
  which links from observation to policy consequence you would trust enough to
  automate versus keep manual. Say where your constraints diverge from a
  single-operator setting — multiple reviewers, no artifact trail, regulated
  change control — and which conclusions stop holding there. Produce a short
  observation-to-policy inventory naming what you can check today, not a
  restatement of the five-layer model.
---

I had a rule I trusted: judge an agent by the next thing I have to tell it. A
correction means the agent transferred unfinished reasoning back to me. An
extension means the result was usable. An authorization means the work reached a
boundary where the remaining decision was mine. That distinction is still a
better evaluation than comparing prose or counting tool calls, and I am not
retiring it.

But two things I wrote afterward each describe a case where the next prompt
looked fine and the system still learned the wrong thing.

In
[a merged PR is not an architectural decision](/notes/a-merged-pr-is-not-an-architectural-decision/),
an agent asked for a design choice mid-implementation. I said "sure, B sounds
reasonable." By the next-prompt test that is a clean authorization — the agent
carried the work to a boundary and I decided. Nothing about that exchange looks
like a supervision failure. The failure showed up six weeks later, when a
planner found the answer filed as a ratified architectural decision and several
agents were faithfully implementing my "great vision" for B. The next prompt was
correct and the record was still false.

In
[what 107 isolated completions did not show](/notes/what-107-isolated-completions-did-not-show/),
the object under test was not a task result but a model's report about its own
execution — what it says influenced an answer. That report can be fluent,
specific, and pass any ordinary read as a credible account, right up until an
external reconstructor given only the prompt and the output produces the same
account without having been the model at all. Nothing in the next turn would
have caught that. The report never got corrected, extended, or authorized. It
just sat there being plausible.

## Working model

**The next prompt measures visible supervision debt, not understanding.** It
still tells me something real: whether what made it back to the human interface
needed repair, added work, or only needed a signature. What it cannot tell me is
whether the agent understood the work, because understanding can fail in ways
that never produce a correction:

- the human never notices the omission the agent made;
- the agent reaches a plausible result by an undesirable route;
- a weak human assent gets promoted into durable architectural intent;
- individually reasonable changes compose into an architectural or product
  failure with no single change to blame;
- the eventual external effect differs from what the session record says
  happened.

I have direct evidence for two of these. The merged-PR case is the assent one: a
weak "sure, B sounds reasonable" got filed as a ratified decision and several
agents later implemented it faithfully. The isolated-completions pilot is closer
to the fourth and fifth: a self-report was plausible enough to pass as an
account of what happened, and an external reconstructor produced the same
account without having been the model. The other three are named because I
expect to find them, not because I have a case for each yet.

Everything the agent did to get to that visible interaction — what it declared,
what it actually touched, what state it left behind, what that state becomes
later — is a separate observation, and each kind needs its own evidentiary
weight before it can drive a decision.

Laid out as a path rather than a single check:

```text
human-visible supervision      correction / extension / authorization
        v
agent-declared state           intent, scope, confidence, claimed influences
        v
execution observability        context used, tools invoked, branches taken,
                                retries, evidence retrieved, state touched
        v
external effects                repository state, target receipts,
                                runtime state, reconciled records
        v
long-horizon consequences      architectural drift, product behaviour,
                                accumulated policy decisions
```

The old rule still owns the top layer, and it is still cheap and still worth
running on every session. What it was never going to do is stand in for the
other four.

## Why the layers are not interchangeable

Each layer answers a different question, and treating them as substitutes is the
actual mistake, not any single layer being wrong.

**Agent-declared state** is a claim, not telemetry. The isolated-completions
pilot's whole finding was that a model's account of its own influences was
qualitatively reproducible by an external reader holding only the prompt and the
output. That does not make the declaration worthless — a declared scope is still
auditable — but it means the declaration cannot be the evidence that closes the
loop. It is the thing the next layer has to check.

**Execution observability** is stronger because it can be compared against the
declaration instead of trusted on its own. The working pattern from that same
note — declare scope, then reconstruct it independently from the diff, the
commands run, the files opened, the tests touched — treats divergence as the
signal, not the declaration itself. A declared three-file change that touched
fourteen files is worth an interrupt regardless of what the model would say if
asked about it.

**External effects** are stronger again, because they are receipts rather than
narration.
[Authority must travel with the action](/notes/authority-must-travel-with-the-action/)
is the same argument from the authorization side: a command string that looks
like the permitted operation is not proof it was the permitted operation, and
only a runner-owned receipt binding executable, identity, and scope settles
that. A reconciled target state settles a different question again — not what
the agent meant to do, but what actually happened to the system.

**Long-horizon consequences** are the layer the next-prompt rule was never built
to see, because there is no next prompt to judge. Five hundred individually
authorized pull requests can produce a system nobody would have deliberately
designed, and the merged-PR note's answer was a second review with no merge
event — triggered by a milestone or a date, not a transaction — that asks
whether the composed system still resembles the intended one. That review does
not consume any of the first four layers directly. It consumes their accumulated
effect.

The mistake in both source cases was the same shape: a real observation at one
layer was promoted to answer a question that belonged to a layer further down. A
correct authorization was promoted into an architectural decision. A fluent
self-report was nearly promoted into introspective evidence. Neither promotion
required anyone to be careless. Both required someone to stop checking once the
nearest layer looked clean.

None of this is an argument for collecting everything a session produces. A
transcript with every token, tool call, and intermediate draft is not more
useful than the next-prompt heuristic; it is just a larger pile a human still
has to read. The layers below the top one only earn their cost when they support
a specific discriminating claim: that declared scope diverged from touched
scope, that a conclusion cites no evidence gathered during the session, that a
strategy retried the same failing approach past a reasonable bound, or that an
action crossed an authority boundary the declaration never mentioned. An
observation that cannot be phrased as one of those claims is not yet worth
instrumenting.

## What this does not fix

Building four more layers of observation is its own failure mode if it is not
kept honest about what each layer can support. A self-report dressed up with a
confidence field is still a self-report. An execution trace is exhaustive about
what happened and silent about what should have happened, so it can certify a
well-executed version of the wrong plan. A receipt proves an operation occurred;
it does not prove the operation was wise. Stacking telemetry does not remove the
need for a layer where a human decides that something was worth doing, it just
moves that decision to wherever the telemetry stops being able to answer for
itself.

There is also a cost problem I have not resolved. The top layer is nearly free —
I was already reading the next prompt. Reconstructing declared scope against
artifacts costs a prompt field and a diff read. Receipts cost runner work that
has to exist before the action, not after. The long-horizon review costs the
most and runs least often, which is exactly backwards from how often it would
need to run to catch drift while it is still cheap to reverse. I do not have a
routing rule yet for which sessions earn which layers, only the observation that
running all four on every session would be its own kind of overbuilt.

## Where the model may fail

The layering assumes each lower layer is strictly more trustworthy than the one
above it, and that is not always true. A receipt can be real and still attach to
the wrong intent — the runner faithfully executed exactly what was asked, and
what was asked was itself a misreading. In that case the receipt is airtight and
the failure is still upstream, in the declaration or in the human's
authorization, and no amount of execution-layer rigor recovers it. The path is a
useful ordering of evidentiary weight, not a guarantee that a lower layer always
catches what a higher one missed.

The genuinely open question is not this decomposition. It is which link in the
chain from observation to consequence has earned enough trust to automate:

```text
observation -> derived signal -> corroboration -> policy consequence -> later outcome
```

A self-reported `confidence: low` is an observation. Whether it should route to
more review, block a merge, or just get logged is a policy consequence, and the
distance between those two is exactly the corroboration this note argues most
self-reports do not yet carry. An execution trace showing an unauthorized target
crossed is a stronger observation, closer to being able to justify an automatic
interrupt on its own. A reconciled target state is stronger again. I do not have
a settled answer for where the line sits, only the claim that it is not in the
same place for all three.

That the next-prompt rule is necessary and insufficient, I would defend. The
five-layer path I would defend only as a first cut, and where the line for
automation sits I would not defend at all. The next test is narrow: take a case
where the top layer looked clean and the outcome was still wrong — the merged-PR
case is one — and check which of the four lower layers would actually have
flagged it before the long-horizon review had to.
