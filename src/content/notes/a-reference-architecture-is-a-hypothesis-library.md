---
title: A reference architecture is a hypothesis library
role: synthesis
status: guiding
lifecycle: current
area: architecture practice
published: 2026-08-08
lastRevised: 2026-08-08
projects: []
relates:
  - where-the-assurance-questions-are-already-answered
  - the-recommendation-does-not-need-authority
  - moving-a-live-cluster-to-a-new-subnet
draft: false
tags:
  - architecture
  - capabilities
  - strategy
  - planning
  - reference-models
summary: Reference architectures supply candidate propositions about capabilities, boundaries, information and controls. Local architecture begins when strategy and evidence turn them into adopt, specialise, map or reject decisions.
explorePrompt: >-
  Use this note as a worked instantiation, not an answer to repeat. The
  transferable question is how to use a reference architecture without
  mistaking its broad coverage or familiar notation for local authority. This
  note concludes that references are most useful as libraries of candidate
  capabilities, boundaries, information structures, controls, dependencies,
  and failure warnings. Strategy selects the effects that matter; local
  constraints and evidence then support an adopt, specialise, map, or reject
  decision. Apply that method to one bounded decision in your own system or
  organisation. Name the desired effect, strategic role, inherited constraints,
  recovery requirements, and the narrow reference slice being considered.
  Convert its material propositions into explicit hypotheses, distinguish
  accumulated evidence from convention, and identify where your local history
  agrees or conflicts. Challenge this note where capability language obscures
  responsibility, where a standard imposes a mandatory requirement rather than
  a candidate pattern, or where the four-decision vocabulary loses an important
  distinction. Produce a compact mapping of propositions, evidence, decisions,
  consequences, tests, and review triggers—not an alignment percentage or a
  renamed copy of the reference model.
---

A reference architecture usually arrives with the authority of a map and the usability of a stencil. The tempting move is to align local boxes to reference boxes, rename the local nouns, and call the result architecture.

That is backwards.

A reference architecture is most useful before it is treated as correct. It is a library of reusable propositions about what a system or organisation may need to be able to do, where responsibilities often separate, which information must cross those boundaries, which controls tend to matter, and which failure modes recur. Some propositions are standardised, some are supported by accumulated practice, and some are merely conventional. None enters the local design as a fact.

Local architecture begins when those propositions are tested against local purpose, constraints, evidence, and history.

The map does not know why this particular journey is being made. It can still stop the traveller from confidently walking into a lake.

## A reference is not a target

[ISO/IEC/IEEE 42010](https://www.iso.org/standard/74393.html) draws a useful boundary between an entity's architecture and the architecture description used to express it. A reference model or diagram is therefore not the architecture of the local system merely because it is drawn in architecture-shaped notation.

The [OASIS SOA Reference Model](https://docs.oasis-open.org/soa-rm/v1.0/soa-rm.html) makes the same distinction from another direction. Its model is abstract and independent of concrete implementation details; concrete architectures arise by combining references and patterns with actual requirements and technology constraints. The [TOGAF Standard and Series Guides](https://www.opengroup.org/togaf) and industry models such as the [BIAN Service Landscape](https://bian.org/deliverables/service-landscape/) provide reusable material at different scopes, but none can know the local system merely by being comprehensive.

Neither kind of reference can know:

- the outcome being pursued;
- which capabilities are differentiating and which are merely necessary;
- the local risk appetite and recovery tolerance;
- inherited systems, skills, contracts, and path dependencies;
- which apparently untidy boundary is carrying a real operational constraint;
- what the organisation is deliberately choosing not to do.

Treating a reference architecture as a target architecture silently imports answers to all of those questions. The result may be tidy, conformant, and wrong in a large number of mutually reinforcing ways.

A better interpretation is:

```text
reference architecture
    = candidate capabilities
    + candidate boundaries
    + candidate information structures
    + candidate control points
    + candidate dependencies
    + accumulated warnings
```

Each candidate is a hypothesis to test, not a command to obey.

## Capabilities are the useful comparison frame

Systems, teams, and processes are poor first-level comparison units because they contain years of local implementation history. A capability asks a more stable question. In the OASIS reference-architecture vocabulary, it is an ability to deliver a real-world effect:

> What must this system or organisation be able to do, regardless of which current component, team, or process performs it?

The Open Group publishes separate TOGAF guidance on [Business Capabilities and Business Capability Planning](https://www.opengroup.org/togaf/series-guides) for this reason. Capability models can connect strategic intent to architecture without beginning from the current application estate.

That stability is useful, but not magical. A capability map still contains choices about granularity, scope, and separation. A reference model may distinguish capabilities because the distinction is common in its source industry, because it supports a standard interface, or simply because its authors needed a navigable model. Local evidence may support a different grouping.

The reference capability is therefore not the answer. It is a better question than “which current system owns this?”

For each candidate capability, classify its strategic role before deciding how closely to follow the reference:

| Strategic role  | Architecture posture                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Differentiating | Preserve local advantage; use the reference mainly as a completeness and interoperability check. |
| Necessary       | Standardise where possible; invest enough to make it reliable and governable.                    |
| Commodity       | Prefer adoption and reuse over local invention.                                                  |
| Transitional    | Contain, bridge, and remove; do not polish it into accidental permanence.                        |

This prevents a common failure in capability planning: every box becomes equally important because the diagram has no way to express choice.

## Strategy decides which hypotheses matter

Strategic planning does not become strategy merely by becoming detailed. Henry Mintzberg's critique in [The Fall and Rise of Strategic Planning](https://hbr.org/1994/01/the-fall-and-rise-of-strategic-planning) separates analytical planning from the synthesis and choice involved in forming strategy. A reference architecture is firmly on the analytical side: it can decompose, compare, expose omissions, and make implications visible. It cannot decide what is worth doing.

Michael Porter's [distinction between operational effectiveness and strategy](https://hbr.org/1996/11/what-is-strategy) sharpens the problem. A reference can carry broadly useful practices, but strategy depends on choices, trade-offs, and fit among activities. A comprehensive reference model therefore cannot imply that every capability should be improved equally. Its coverage is input to prioritisation, not a substitute for it.

Research on [dynamic capabilities](https://sms.onlinelibrary.wiley.com/toc/10970266/1997/18/7) adds another correction. The ability to reconfigure systems and competencies depends on existing processes, assets, knowledge, and path history. Two organisations can accept the same reference proposition and still need different transition paths because they are not starting from the same place.

Under uncertainty, the useful planning move is not to hide assumptions inside a more elaborate target diagram. [Discovery-driven planning](https://hbr.org/1995/07/discovery-driven-planning) makes important assumptions explicit and connects further investment to checkpoints that test them.

Applied to reference architectures, that produces a simple rule:

> The less local evidence supports a reference proposition, the more the roadmap should look like a learning plan rather than an implementation commitment.

A reference model can tell us that a capability or boundary commonly exists. It cannot tell us that importing it will create value here, that the local system can sustain it, or that the migration cost is justified.

## The chain runs from challenge to effect

The clean planning chain is not reference box to local box. It runs through the effect the strategy is trying to produce:

```text
strategic challenge
        ↓
chosen outcome and exclusions
        ↓
required real-world effects
        ↓
capabilities that can produce them
        ↓
reference propositions worth testing
        ↓
local decision and transition
        ↓
evidence that the effect occurred
```

This gives each discipline a bounded job. Strategy concentrates effort and excludes attractive but irrelevant work. Capability planning states what must become possible without prematurely assigning it to the current estate. Reference architectures supply candidate structures and remembered constraints. Local architecture decides which candidates survive contact with reality. Migration planning explains how the capability can change without temporarily destroying the system that still provides it.

The chain also runs upward. A target component that cannot be traced to a required capability is architectural inventory, not yet a justified investment. A capability that cannot be traced to a chosen effect may be legitimate in general and irrelevant here. A strategic ambition with no required capability or evidence condition is decorative intent.

## Turn the reference into hypothesis cards

The useful adoption artifact is not an alignment percentage. It is a record of propositions, evidence, decisions, and consequences.

```yaml
source:
  reference: conventional segmented-network design
  proposition_type: pattern
  evidence_strength: accumulated-practice

reference_proposition: >-
  Infrastructure management should be isolated from ordinary client traffic.

desired_effect: >-
  Loss or compromise of an ordinary client network does not remove the ability
  to administer or recover the infrastructure.

local_concern: >-
  The network controller runs inside the Kubernetes cluster whose switching
  fabric it manages, so a pure segmentation change can remove its own control path.

capability:
  name: Manage network infrastructure
  strategic_role: necessary

assumptions:
  - the management controller remains reachable after segmentation
  - administrators retain an independent recovery path
  - switches and access points can route to the controller

local_evidence:
  supports:
    - separate management traffic reduces accidental coupling
  contradicts:
    - the controller currently runs inside the cluster whose network it manages

uncertainty:
  - behaviour during loss of inter-VLAN routing
  - recovery when both controller and fabric configuration are impaired

decision: specialise

consequence: >-
  Adopt segmentation, but design an explicit bootstrap and recovery path rather
  than placing every management component behind the dependency it controls.

test:
  - remove ordinary client reachability
  - verify controller access from the recovery workstation
  - verify switches and access points retain or regain controller contact

review_trigger:
  - controller moved outside the cluster
  - out-of-band management added
```

The card forces six distinctions that diagrams commonly blur:

1. where the proposition came from and how strong its backing is;
2. what the reference actually proposes;
3. which desired effect and local concern make it relevant;
4. which assumptions connect the proposition to that effect;
5. what evidence supports or contradicts those assumptions;
6. what local decision follows.

The decision vocabulary can stay small:

- **Adopt** — the reference proposition fits the local need with no material change.
- **Specialise** — the proposition is useful, but local constraints require a narrower or extended form.
- **Map** — the local design remains different, but an explicit semantic or structural relationship is maintained.
- **Reject** — the proposition does not fit, and the reason is recorded.

“Aligned” is not a fifth decision. It is usually what people write when they have not yet decided which of the four they mean. **Deferred** can be a valid roadmap status, but it should preserve the underlying architectural disposition rather than becoming a polite drawer for unresolved thought.

## The disagreement is the valuable part

A local mapping that only records matches has removed most of the architectural information. The useful findings are usually:

- a reference capability that has no local owner;
- one local component performing several capabilities that should fail independently;
- a local distinction the reference model does not make;
- a reference boundary that conflicts with the required recovery path;
- a supposedly standard capability that is actually differentiating;
- a strategically irrelevant capability receiving investment because the model contains a box for it;
- a local workaround that should be transitional rather than normalized.

These are not failures of alignment. They are the output of the exercise.

A percentage such as “82% aligned to the reference architecture” compresses unlike decisions into a number with no stable meaning. Eighty-two percent could mean that most names were matched, most capabilities exist, most interfaces conform, or most reviewers became tired. The measure conceals exactly the disagreements architecture was meant to surface.

## A small worked example

A conventional homelab network reference design suggests separate client, server, management, and untrusted-device networks. The capability-level proposition is sensible: faults and trust boundaries should not all collapse into one broadcast domain.

The local system complicates it. The network controller runs inside the Kubernetes cluster, while the cluster depends on the switching fabric managed by that controller. A pure reading of “put management on its own network” can create a bootstrap loop in which the controller becomes unreachable during the very network change needed to reach it.

The reference architecture still helps. It exposes capabilities and concerns that the flat network obscured:

- isolate management traffic;
- preserve administrative access;
- keep the controller reachable;
- recover without relying on the failed path;
- migrate devices without losing both old and new control at once.

The local decision is not to reject segmentation. It is to specialise the reference proposition with an explicit transition and recovery design. The resulting architecture is less pure than the stencil and more correct for the system.

That is the pattern worth retaining: the reference supplied the hypothesis; the local dependency supplied the correction.

## What not to cargo-cult

### The nouns

Renaming a local service after a reference capability does not change its authority, state boundary, interface, or failure mode. Vocabulary can improve comparison, but the label is the cheapest part of the architecture.

### The granularity

A reference capability, service domain, or component is not automatically one deployable service, one team, one repository, or one data product. One-to-one implementation mapping is an additional hypothesis and often a poor one.

### The maturity sequence

A reference model may show an attractive end state without describing the order in which a particular system can safely reach it. Local migration constraints remain local.

### The implied importance

Reference models usually aim for broad coverage. Strategy requires exclusion. A capability can be legitimate, common, and not worth improving now.

### The authority

A standard can define interoperable semantics or a useful pattern. It cannot assign local decision rights merely by naming an owner-shaped box.

## The minimum useful workflow

For a bounded architecture decision:

1. **State the local outcome.** Name what should become possible or safer.
2. **Name the material constraints.** Include inherited systems, skills, risk, cost, and recovery requirements.
3. **Select a narrow reference slice.** Do not import an entire framework to answer one boundary question.
4. **Convert propositions into hypothesis cards.** Capabilities, boundaries, information, controls, and dependencies all qualify.
5. **Classify strategic role.** Mark the capability as differentiating, necessary, commodity, or transitional.
6. **Record adopt, specialise, map, or reject.** Include the evidence and consequence.
7. **Test the least-supported assumptions first.** Prefer a reversible proof over a polished target diagram.
8. **Promote only surviving propositions into the target and migration plan.** Keep rejected and deferred items in the record.

The output is small enough to review and specific enough to change a design. That is a better result than producing a large model whose main verified property is that all of its boxes fit on the page.

## Current conclusion

A reference architecture does not save us from doing architecture. It makes architecture cheaper by supplying candidate answers, accumulated vocabulary, and remembered failure modes before we begin.

Its best use is not conformity. It is disciplined disagreement.

The reference says, “systems like this often need these capabilities and boundaries.” Local architecture replies, “under these constraints, with this evidence, we will adopt these parts, specialise those, map the semantic difference, reject the rest, and test what remains uncertain.”

That reply is the architecture.

## Sources and further study

- [ISO/IEC/IEEE 42010:2022, Architecture description](https://www.iso.org/standard/74393.html)
- [OASIS Reference Model for Service Oriented Architecture](https://docs.oasis-open.org/soa-rm/v1.0/soa-rm.html)
- [OASIS Reference Architecture Foundation for Service Oriented Architecture](https://docs.oasis-open.org/soa-rm/soa-ra/v1.0/cs01/soa-ra-v1.0-cs01.html)
- [The TOGAF Standard](https://www.opengroup.org/togaf)
- [TOGAF Series Guides, including Business Capabilities and Business Capability Planning](https://www.opengroup.org/togaf/series-guides)
- [BIAN Service Landscape](https://bian.org/deliverables/service-landscape/)
- [Michael Porter, What Is Strategy?](https://hbr.org/1996/11/what-is-strategy)
- [Henry Mintzberg, The Fall and Rise of Strategic Planning](https://hbr.org/1994/01/the-fall-and-rise-of-strategic-planning)
- [Rita McGrath and Ian MacMillan, Discovery-Driven Planning](https://hbr.org/1995/07/discovery-driven-planning)
- [David Teece, Gary Pisano, and Amy Shuen, Dynamic Capabilities and Strategic Management](https://sms.onlinelibrary.wiley.com/toc/10970266/1997/18/7)
