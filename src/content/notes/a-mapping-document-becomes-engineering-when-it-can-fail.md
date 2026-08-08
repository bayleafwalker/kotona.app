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
summary: AI can make legacy source-to-target documentation cheap to produce, but only versioned lineage, falsifiable checks, and owned failure disposition turn it into an engineering capability.
explorePrompt: >-
  Use this note as a worked instantiation, not a template to copy. The
  transferable question is: when AI assistance makes documentation cheap, which
  documentation work becomes an engineering capability and which merely
  produces more fluent description? The note argues that structured, versioned
  lineage makes mapping claims traceable; executable checks make them
  falsifiable; and an owned process for disposing of failures turns those checks
  into an operating capability. Mechanical release enforcement is a further,
  separate condition and should be applied only where failure semantics are
  sufficiently unambiguous. Human authority remains explicit over semantic
  equivalence, domain interpretation, accepted exceptions, and target
  definitions. Apply the question to an estate you are responsible for. Name
  where your constraints diverge: little release history, streaming rather than
  batch sources, weak source identity, or documentation that already has a
  blocking owner. Decide which conclusions survive that divergence and which
  invert. Produce a bounded implementation slice: the lineage records and
  checks you would create first, who would own failure disposition, which checks
  could safely block a release, and what representative mapping mutations they
  would need to detect to be worth maintaining.
---

The useful output of reconstructing a legacy mapping estate is not another
mapping document. It is a set of checks capable of falsifying the next mapping
release. Prose makes an estate easier to describe; traceability, regression
baselines, and executable assertions make it possible to change without relying
entirely on institutional memory.

AI assistance changes the economics of producing documentation, not what makes
that documentation reliable. It can make structured reconstruction practical at
a scale that previously cost more analyst time than anyone would fund. Where
mappings encode long-lived domain decisions, however, description is rarely the
binding constraint. The harder problem is preserving identity, change history,
authority, and testable consequences.

## The substrate

Consider an accumulated source-to-target estate: repeated releases, inconsistent
naming across source systems, and mapping specifications whose rationale is only
partly recorded. The concrete records are source attributes, mapping
expressions, target attributes, release versions, and accepted exceptions.

Three properties matter more than the scale:

- The same business attribute appears repeatedly under different names, in
  different releases, with different nullability and different accepted values.
- Mappings encode decisions — accepted exceptions, domain interpretations, and
  deliberate coarsening — that are not recoverable from the mapping expression
  itself.
- Release history is load-bearing. What a field meant in an earlier release is a
  fact about the period it described, not obsolete trivia.

## Why summarisation is insufficient

A model can read this estate and produce a clean, readable, internally coherent
specification. That artifact is dangerous in a specific way: it can sound most
confident exactly where the source material was ambiguous.

Two failure modes are especially easy to create.

**Erasure of release history.** Harmonising "the same" attribute across releases
produces one clean row and destroys the record that the definition changed. The
document reads better and is now wrong for every historical period.

**Collapse of materially different definitions.** Two attributes with the same
label and compatible types can still be semantically distinct: different
populations, different cut-off conventions, or different domain bases.
Similarity is evidence for a candidate match. It is not the match.

Both failures can survive prose review because the resulting prose is fluent and
may leave the reviewer no competing artifact against which to test it.

## Harmonisation as a traceability problem

A useful reframing is that this is not primarily a writing problem. It is a
lineage problem. The unit is not a paragraph but a traceable chain:

```text
stable attribute identity
  -> source system + release version
  -> source attribute (name, type, nullability, domain)
  -> mapping expression + transformation
  -> target attribute
  -> acceptance owner + accepted exceptions
```

Every link carries a version. Harmonisation then means asserting that two
identities represent the same thing as a recorded, attributable claim with a
date — not silently merging them inside a document.

This is not a novel model. It is what data lineage and metadata management have
always asked for. The practical change is that AI assistance can make the
mechanical reconstruction affordable across estates where the work previously
remained perpetually incomplete.

## Where AI helps, and where authority stays

AI assistance is strongest on the mechanical majority:

- comparing releases and surfacing structural differences;
- proposing candidate matches across inconsistent naming;
- flagging anomalies, such as attributes that appear once, types that change
  between releases, or mappings with no reachable source;
- drafting specification prose from structured lineage.

Authority should remain explicit for everything that constitutes a claim about
the business:

- whether two attributes are semantically equivalent;
- domain interpretation;
- which historical exceptions remain accepted and why;
- ownership of the target definition.

The split is not "AI drafts, human reviews." Review of fluent prose is weak. The
split is by **authority rather than authorship**. Models propose matches,
descriptions, anomalies, and candidate checks. Authoritative actors ratify
semantic equivalence, domain interpretation, accepted exceptions, and target
definitions, and those ratifications are recorded with an owner and a date.

An authoritative actor does not always have to be a person retyping a result.
A model-generated assertion may instead be accepted through an independently
defined verification process. The important boundary is that the producer does
not grant authority to its own claim.

## The executable boundary

The parts that make the mapping specification falsifiable are:

- **Executable checks** derived from the lineage: expected cardinalities,
  referential reachability, domain membership, and transformation invariants
  such as sum preservation or monotone date ordering.
- **Regression baselines** per release, so the next mapping release is compared
  with a recorded prior state rather than a reader's memory.
- **Explicit accepted exceptions**, so a check that legitimately fails does not
  train everyone to ignore failing checks.

A mapping specification that cannot fail against data is a description. A
mapping specification with checks attached can be falsified: the next release,
the next refactor, and the next well-intentioned harmonisation all produce a
result someone can point at. That is the same move as a compatibility report
that is willing to be rude, applied to documentation instead of interfaces.

## The control boundary

Three conditions are easy to run together:

1. a check can execute and fail;
2. a named owner reviews the failure, records its disposition, and acts on it;
3. the release system mechanically blocks on failure.

The first condition makes the specification falsifiable. It does not yet make
the check an operating control.

The second condition creates an operating capability when execution is reliable,
failure disposition is owned, accepted exceptions are explicit, and the result
is retained as evidence. It still depends on a process being followed.

The third condition is automated enforcement. It is stronger, but it is not
automatically better. Some checks express unambiguous invariants and can safely
block a release. Others require domain interpretation, materiality judgement, or
an accepted exception. Turning every failure into a mechanical stop merely moves
the ambiguity into an emergency override.

A team should therefore state which condition it has achieved rather than use
the existence of checks as shorthand for release enforcement.

## The reusable pattern

For any legacy estate where documentation is the stated problem:

1. **Narrative documentation** for humans — cheap now, and genuinely useful.
2. **Structured lineage** underneath it, versioned, with stable identities.
3. **Executable checks** derived from that lineage, with recorded exceptions.
4. **Owned failure disposition** and a named acceptance owner for each target
   definition.
5. **Mechanical release gates** only for checks whose failure semantics are
   sufficiently unambiguous.

AI assistance can make step 2 affordable at a scale that was previously
uneconomic. Step 3 makes the mapping specification falsifiable. Step 4 turns
failure into an operating decision rather than an interesting result. Step 5
automates that decision where automation is safe and proportionate.

The tempting stopping point is step 1 because the document already looks
finished. The more dangerous stopping point is step 3 because the checks already
look like a control.

## Open edge

The unresolved question is whether check coverage can itself be assessed. A
large lineage-derived suite can still miss the class of error that matters:
semantic drift that satisfies every structural invariant.

A useful next probe is mutation-style testing. Deliberately inject
representative mapping errors and measure which ones survive:

- replace a valid join with a plausible but incorrect one;
- remove or broaden a population filter;
- shift a cut-off date or temporal boundary;
- reverse a sign or aggregation direction;
- substitute an incorrect code mapping;
- change null handling or default-value behaviour.

This would test sensitivity to the chosen failure classes. It would not prove
that the suite covers unknown semantic errors, nor that the mutation corpus
represents the failures most likely to occur. The remaining research problem is
therefore not only whether the checks fail, but whether the deliberately broken
mappings are a credible model of how the estate can actually become wrong.
