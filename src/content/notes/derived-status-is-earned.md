---
title: Derive status only from reproducible evidence
role: synthesis
status: exploration
lifecycle: current
area: software assurance
published: 2026-07-19
lastRevised: 2026-08-08
projects:
  - vuoro
relates:
  - the-agent-is-not-the-application
  - log-as-system
  - schema-on-split
  - compatibility-reports-should-be-a-little-rude
  - where-the-assurance-questions-are-already-answered
  - a-field-guide-to-assurance-managed-ai-development
tags:
  - agents
  - software-architecture
  - verification
  - provenance
summary: Continuing assurance can move away from an exact generated output only when retained inputs and independent checks can produce another acceptable result; retention remains a separate decision.
---

Suppose an agent writes two things: a query for a one-off internal analysis and
a migration that changes customer records. Both took seconds to generate. That
does not give them the same assurance or retention requirements.

I can treat the query as derived if I retain its inputs and can check that a
replacement answers the same question. I may still keep the exact query for
audit or debugging. The migration is different: its exact text, toolchain,
approvals, logs, and resulting data state may be needed to explain what changed
or reverse it. Generation cost says almost nothing about which case I am in.

> **Update, 2026-07-20.** Review confirmed the distinction but corrected its
> framing: the local terms below sit inside ordinary assurance-case practice,
> not a new assurance method. A claim is credible only for an identified
> configuration, under stated assumptions, with evidence that actually supports
> it. [Where the assurance questions are already
> answered](/notes/where-the-assurance-questions-are-already-answered/) and [A
> field guide to assurance-managed AI
> development](/notes/a-field-guide-to-assurance-managed-ai-development/) map
> the established material.

## When the exact output remains part of the record

Some checks need the object that will run. Static analysis, type checking,
model checking, interface compatibility, and adversarial review all inspect
properties that a successful execution log cannot establish. A log can show
what happened once; it cannot show what an unexercised code path would have
done.

In that case, retaining source alone may still be insufficient. The reviewed
object is closer to this:

```text
source and generated files
  + compiler and toolchain
  + pinned dependencies
  + configuration and policy
  + environment assumptions
  + build provenance
  + executable digest
```

If dependencies float or deployment transforms the build, the code that was
reviewed may differ from the code that ran. I use _artifact of record_ for an
output whose exact identity has to remain bound to its evidence in this way.

Generated code often strengthens the need for that binding. With human-written
code, teams sometimes assume the author can later explain it. That was never a
particularly strong control, and an agent gives us even less reason to rely on
it.

## When the process can carry the claim

Other outputs are acceptable members of a set. A dashboard view, temporary
adapter, internal report, or exploratory query may differ each time without
changing what the user relies on. I use _derived realization_ for that case.

Calling an output derived requires two practical demonstrations.

First, the system must retain enough to make another acceptable output: the
contract, semantic inputs, interfaces, constraints, dependencies, and relevant
environment assumptions. Exact replay may be neither possible nor useful with
a stochastic generator. The useful test is whether an approved generator can
still produce an output inside the allowed range.

Second, something other than the generator must decide whether the result is
acceptable. Depending on the consequence, that may be a schema check, test,
invariant, simulation, static analysis, canary, independent review, or human
judgment. If the only acceptance signal is that the agent says the result looks
right, the old output remains the only inspectable statement of behaviour.

The formal labels for these two conditions are _generative closure_ and
_verification closure_. The conditions matter more than the labels.

## Use determines the classification

The same code can move between the two categories. A parser may be treated as a
derived convenience inside an exploratory notebook and as part of the record
inside a payment protocol. A report may be replaceable while it is a draft and
fixed once it is filed. A generated client becomes harder to regenerate freely
when another system compiles against its exact interface.

Before treating an output as derived, ask:

- Could its exact behaviour become the subject of a dispute?
- Do important properties require inspection of this exact object?
- What is the blast radius, and can a bad result be reversed?
- Does another system depend on its exact interface or behaviour?
- Would an investigation need the original object to reconstruct events?

The consumer's answer matters. A producer may consider an output reproducible
while a downstream team has built controls around that exact version. In that
case the producer's convenience does not remove the consumer's retention and
change-control needs.

Retention is separate from derived status. A derived output may still need to
be kept for audit, debugging, cost analysis, or historical reconstruction. The
narrower claim is that the contract and acceptance process carry the continuing
assurance claim; the old text does not automatically do so.

AI makes replacement cheap enough to tempt us into calling every output
reproducible. The safe default is more demanding: move continuing assurance
away from the exact output only after the generation inputs and independent
checks have shown they can carry the same claim. Decide retention separately.
