---
title: A mapping document becomes engineering when it can fail
role: synthesis
draft: true
status: exploration
lifecycle: current
area: data architecture
published: 2026-08-03
lastRevised: 2026-08-08
projects: []
relates:
  - schema-on-split
  - log-as-system
  - compatibility-reports-should-be-a-little-rude
  - derived-status-is-earned
  - layering-you-cant-violate-by-accident
tags:
  - data-platforms
  - documentation
  - verification
  - agents
summary: AI can make legacy source-to-target documentation cheap to produce, but only versioned lineage and executable checks turn it into an engineering capability.
explorePrompt: >-
  Use this note as a worked instantiation, not a template to copy. The
  transferable question: when AI assistance makes documentation cheap, which
  documentation work becomes an engineering capability and which just
  produces more fluent description? The note argues that the value comes from
  structured versioned lineage plus executable checks that can falsify the
  next release, with human authority retained over semantic equivalence and
  domain interpretation, not from generated specification prose. Apply the
  question to an estate you are responsible for. Name where your constraints
  diverge: little release history, streaming rather than batch sources, weak
  source identity, or documentation that already has a blocking owner. Decide
  which conclusions survive that divergence and which invert. Produce a
  bounded implementation slice — the specific checks you would write first,
  who would own their disposition, and what they would have to fail on to be
  worth writing.
---

The useful output of reconstructing a legacy mapping estate is not another
mapping document. It is a set of checks capable of falsifying the next mapping
release. Prose makes an estate easier to describe; traceability, regression
baselines, and executable assertions make it possible to change without relying
entirely on institutional memory.

That distinction is the whole question here. AI assistance can lower the cost of
producing documentation enough that structured reconstruction becomes practical.
It does not, by itself, change what documentation is worth. Where mappings encode
long-lived domain decisions, descriptive documentation is rarely the binding
constraint.

## The substrate

Consider an accumulated source-to-target estate: repeated releases, inconsistent
naming across source systems, and mapping specifications whose rationale is only
partly recorded. The concrete records are source attributes, mapping expressions,
target attributes, release versions, and accepted exceptions.

Three properties matter more than the scale:

- The same business attribute appears repeatedly under different names, in
  different releases, with different nullability and different accepted values.
- Mappings encode decisions — accepted exceptions, regulatory interpretations,
  deliberate coarsening — that are not recoverable from the mapping expression
  itself.
- Release history is load-bearing. What a field meant in release 100 is a fact
  about a reporting period, not obsolete trivia.

## Why summarization was insufficient

A model can read this estate and produce a clean, readable, internally coherent
specification. That artifact is dangerous in a specific way: it is most
confident exactly where the original was ambiguous.

Two failure modes appeared immediately.

**Erasure of release history.** Harmonizing "the same" attribute across releases
produces one clean row and destroys the record that the definition changed. The
document reads better and is now wrong for every historical period.

**Collapse of materially different definitions.** Two attributes with the same
label and compatible types can be semantically distinct — different populations,
different cut-off conventions, different domain basis. Similarity is
evidence for a candidate match. It is not the match.

Both failures can survive prose review, because the resulting prose is fluent and
may leave the reviewer no competing artifact against which to test it.

## Harmonization as a traceability problem

The reframing that made the work tractable: this is not a writing problem, it is
a lineage problem. The unit is not a paragraph but a traceable chain:

```text
stable attribute identity
  -> source system + release version
  -> source attribute (name, type, nullability, domain)
  -> mapping expression + transformation
  -> target attribute
  -> acceptance owner + accepted exceptions
```

Every link carries a version. Harmonization then means asserting that two
identities are the same identity, as a recorded, attributable claim with a date
— not as a silent merge inside a document.

This is not a novel model. It is what data lineage and metadata management have
always asked for. The change is that producing it across a large legacy estate
used to cost more analyst time than anyone would fund.

## Where AI helped, and where authority stayed

AI assistance was genuinely load-bearing on the mechanical majority:

- comparing releases and surfacing structural differences;
- proposing candidate matches across inconsistent naming;
- flagging anomalies — attributes that appear once, types that change between
  releases, mappings with no reachable source;
- drafting specification prose from the structured lineage.

Authority stayed human on everything that constitutes a claim about the
business:

- whether two attributes are semantically equivalent;
- domain interpretation;
- which historical exceptions remain accepted and why;
- ownership of the target definition.

The split is not "AI drafts, human reviews." Review of fluent prose is weak. The
split is by **authority rather than authorship**. Models propose matches,
descriptions, anomalies and candidate checks. Humans ratify semantic
equivalence, domain interpretation, accepted exceptions and target
definitions — and those ratifications are the claims recorded as authoritative,
with an owner and a date.

Drawing the line at authority rather than authorship also travels to systems
where a model-generated assertion is accepted through automated verification
instead of being retyped by a person.

## The executable boundary

The part that makes this engineering rather than documentation:

- **SQL checks** derived from the lineage — expected cardinalities, referential
  reachability, domain membership, transformation invariants such as
  sum-preservation or monotone date ordering.
- **Regression baselines** per release, so the next datamap release is compared
  against a recorded prior state rather than against a reader's memory.
- **Explicit accepted exceptions**, so a check that legitimately fails does not
  train everyone to ignore failing checks.

A mapping specification that cannot fail against data is a description. A
mapping specification with checks attached can at least be falsified: the next
release, the next refactor, and the next well-intentioned harmonization all
produce a result someone can point at. That is the same move as a compatibility
report that is willing to be rude, applied to documentation instead of
interfaces.

## The control boundary

Three states are easy to run together:

1. a check can execute and fail;
2. someone reviews the result and acts on it;
3. the release system mechanically blocks on failure.

State 1 is evidence that a mapping can be falsified, but not that failure changes
an outcome. Until checks are part of an owned release decision, the control still
depends on someone choosing to run them and act on the results. A team should
therefore state which of these three conditions it has achieved rather than use
the existence of checks as shorthand for release enforcement.

## The reusable pattern

For any legacy estate where documentation is the stated problem:

1. Narrative documentation for humans — cheap now, and genuinely useful.
2. **Structured lineage** underneath it, versioned, with stable identities.
3. **Executable checks** derived from that lineage, with recorded exceptions.
4. A named **acceptance owner** per target definition.

Steps 1 and 4 were always possible. Step 2 is what AI assistance can make
affordable. Step 3 is what turns the affordability into an engineering
capability, and it is the step most likely to be skipped, because the document
already looks finished without it.

## Open edge

The unresolved question is whether check coverage can itself be assessed. A
lineage-derived check suite can be large and still miss the class of error that
actually occurs — semantic drift that satisfies every structural invariant.
Mutation-style testing against deliberately corrupted mapping releases is the
obvious probe, and I have not run it.
