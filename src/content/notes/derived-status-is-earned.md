---
title: Derived status is earned
status: exploration
lifecycle: current
area: software assurance
published: 2026-07-19
lastRevised: 2026-07-19
projects:
  - sprintctl-and-kctl
relates:
  - the-application-is-the-assurance-kernel
  - log-as-system
  - schema-on-split
  - compatibility-reports-should-be-a-little-rude
tags:
  - agents
  - software-architecture
  - verification
  - provenance
summary: AI generation creates more disposable realizations, but an artifact becomes derived only when assurance can move from its exact implementation to a durable generation and verification contract.
---

Generation does not make an artifact disposable. Assurance does.

AI can make it cheap to produce another implementation, query, migration,
report, adapter, interface, or plan. That changes the economics of construction.
It does not answer whether the exact thing produced must remain the
authoritative object for analysis, dispute, or reconstruction.

There are two assurance postures.

## Artifacts of record

For an artifact of record, assurance attaches to one immutable realization.
The organization needs to know exactly what ran, which analyses applied to it,
what it could have done under other inputs, and whether the reviewed object is
the object that took effect.

This is the posture for artifacts whose required properties must hold before or
independently of operation. Static analysis, type systems, model checking,
concurrency analysis, interface compatibility, and adversarial review need an
actual artifact. An event log can show what happened once. It cannot establish
the counterfactual behavior of code paths that were not exercised.

The object of record is rarely source code alone. It is a bound execution
capsule:

```text
source and generated outputs
  + compiler and toolchain
  + dependencies
  + configuration and policy
  + environment assumptions
  + build provenance
  + executable digest
```

If dependencies float or deployment transforms the output, analysis of the
source may not be analysis of what ran. The contractual layer does not replace
the artifact. It binds the artifact tightly enough that its proofs, failures,
and approvals refer to the same object.

Agent generation makes this posture stronger. Human authorship used to provide
a weak accountability story: somebody wrote the code and was presumed to
understand it. Generated code removes even that presumption. The artifact and
its evidence chain become the available common ground.

## Derived realizations

For a derived realization, assurance attaches mainly to a durable generation
and acceptance process. The specific output is one adequate member of an
allowed set:

```text
contract
  + authoritative substrate state
  + generation procedure
  + independent acceptance procedure
  -> acceptable realization
```

The realization is not worthless. It is evidence that the contract could be
satisfied at a particular time. But it does not have to remain the source of
authority after use. A current generator may produce a different adequate
query, temporary adapter, internal analysis, situational workflow, or user
interface when the need returns.

This posture requires two kinds of closure.

**Generative closure** means retaining enough governing information to produce
another acceptable realization: the contract, semantic inputs, interfaces,
constraints, dependencies, and environment assumptions. Exact replay is not
always possible or useful when the generator is stochastic. The relevant claim
may be semantic reproducibility: a currently approved generator can still
produce an output inside the declared acceptance envelope.

**Verification closure** means deciding acceptability independently of the
generator's confidence. Tests, invariants, schema checks, property-based
evaluation, simulation, static analysis, canaries, independent review, or
human judgment must reject unacceptable realizations with strength
proportionate to their consequences.

Without verification closure, regeneration is just repeated suggestion. The
artifact remains the only inspectable statement of behavior and has not earned
derived status.

## Classification follows reliance

These postures are not intrinsic properties of code. They depend on use.

A parser can be a derived convenience inside an exploratory analysis and an
artifact of record inside a payment protocol. A migration script becomes part
of the record after it changes regulated data. A generated client becomes
load-bearing when another system compiles against its exact interface. A report
that was disposable during drafting becomes a record when filed or used to
make an adjudicable decision.

The main classification pressures are:

- whether exact behavior could become the subject of a dispute
- whether important properties are visible only through artifact analysis
- the blast radius and reversibility of a bad realization
- whether consumers rely on exact behavior or interface stability
- whether historical reconstruction requires the original object

This makes classification relational. A producer may regard an output as
regenerable while a consumer has built an assurance boundary around it. The
reliance edge outranks the producer's convenience. Consumers need a way to
promote an upstream realization into their record boundary and impose the
corresponding pinning, evidence, and retention obligations.

Promotion can also run the other way. Better specifications, verified
generators, stronger type systems, semantic comparison, and independent
acceptance can move assurance from individual outputs to the process that
produces them. Generation capability makes derived realizations cheaper.
Verification capability determines whether they are permitted.

Retention is a separate decision. A realization can be non-authoritative and
still require retention for audit, debugging, cost analysis, or evidence. The
claim is not that derived outputs should be deleted. It is that change control
and assurance attach to their contract rather than automatically to their exact
text.

This is the central risk of AI-generated software: not merely producing bad
code, but silently applying derived-artifact discipline where exact behavior
was part of the record. Cheap generation creates pressure to call everything
reproducible. The contract layer's first duty is to know when that claim is
false.

Generation improvements reduce the cost of producing artifacts. Verification
improvements determine which artifacts no longer need to remain authoritative.
