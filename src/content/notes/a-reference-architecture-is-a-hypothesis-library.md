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
summary:
  A reference architecture is a set of ideas to test, not a target to copy. It
  can suggest capabilities, controls, and common failure modes; local strategy
  and evidence decide which parts survive.
explorePrompt: >-
  Use this note as a worked instantiation, not an answer to repeat. The
  transferable question is how to use a reference architecture without mistaking
  its broad coverage or familiar notation for local authority. This note
  concludes that references are most useful as libraries of candidate
  capabilities, boundaries, information structures, controls, dependencies, and
  failure warnings. Strategy selects the effects that matter; local constraints
  and evidence then support an adopt, specialise, map, or reject decision. Apply
  that method to one bounded decision in your own system or organisation. Name
  the desired effect, strategic role, inherited constraints, recovery
  requirements, and the narrow reference slice being considered. Convert its
  material propositions into explicit hypotheses, distinguish accumulated
  evidence from convention, and identify where your local history agrees or
  conflicts. Challenge this note where capability language obscures
  responsibility, where a standard imposes a mandatory requirement rather than a
  candidate pattern, or where the four-decision vocabulary loses an important
  distinction. Produce a compact mapping of propositions, evidence, decisions,
  consequences, tests, and review triggers—not an alignment percentage or a
  renamed copy of the reference model.
---

A reference architecture makes it easy to produce a tidy diagram. Match the
local boxes to the reference boxes, borrow its names, calculate an alignment
percentage, and the work looks finished.

The diagram may also be wrong for the system being designed.

A reference architecture is better used as a set of ideas to test. It can
suggest functions the system may need, common separations of responsibility,
information that has to move, useful controls, and failures other designers have
already met. Local goals and constraints decide which suggestions belong in the
design.

## What the reference can and cannot know

[ISO/IEC/IEEE 42010](https://www.iso.org/standard/74393.html) distinguishes a
system's architecture from the description used to represent it. The
[OASIS SOA Reference Model](https://docs.oasis-open.org/soa-rm/v1.0/soa-rm.html)
is deliberately abstract and independent of a concrete implementation. The
[TOGAF Standard](https://www.opengroup.org/togaf) and industry models such as
the [BIAN Service Landscape](https://bian.org/deliverables/service-landscape/)
offer reusable material at different scales.

None of them knows:

- what this organization is trying to improve;
- which functions distinguish it from competitors;
- which old systems, contracts, and skills constrain the change;
- how much interruption or recovery time is acceptable;
- which untidy local arrangement is preventing a real failure; or
- what has deliberately been left out of scope.

Broad coverage is useful for finding omissions. It is not evidence that every
box deserves local investment.

## Start with the result, not the reference

The useful chain runs in this direction:

```text
problem to solve
    ↓
result wanted, including deliberate exclusions
    ↓
things the system must be able to do
    ↓
small reference slice worth consulting
    ↓
local decision and migration
    ↓
test that the result occurred
```

This order matters. Michael Porter's
[distinction between operational effectiveness and strategy](https://hbr.org/1996/11/what-is-strategy)
is relevant here: a common good practice may improve operations without being a
strategic priority. Henry Mintzberg's
[critique of strategic planning](https://hbr.org/1994/01/the-fall-and-rise-of-strategic-planning)
makes a related point. Analysis can expose options and implications; it does not
choose what is worth doing.

The starting position matters too. Work on
[dynamic capabilities](https://sms.onlinelibrary.wiley.com/toc/10970266/1997/18/7)
shows why two organizations can accept the same general idea and still need
different paths.
[Discovery-driven planning](https://hbr.org/1995/07/discovery-driven-planning)
provides the practical response: test the assumptions that carry the most risk
before committing the whole roadmap.

## Use capabilities carefully

A capability asks what must be possible without assuming which current system,
team, or process will provide it. This makes capabilities useful for comparing a
local estate with a reference model. The Open Group's
[Business Capabilities guidance](https://www.opengroup.org/togaf/series-guides)
uses them to connect strategy to architecture without starting from an
application inventory.

Before adopting a reference capability, classify its local role:

| Local role      | Practical response                                                                       |
| --------------- | ---------------------------------------------------------------------------------------- |
| Differentiating | Preserve the local advantage; use the reference to check omissions and interoperability. |
| Necessary       | Standardize where useful and fund enough reliability to operate it.                      |
| Commodity       | Prefer adoption and reuse over local invention.                                          |
| Transitional    | Keep it working long enough to remove it; do not polish it into permanence.              |

The classification is local. A capability may be ordinary in the reference model
and differentiating here. The reverse is equally common.

Capability language also has a limit: it can hide the person or system that
actually does the work. Once a capability matters to the design, name who owns
it, where its data lives, how it is reached, and what happens when it fails.

## Record a decision, not an alignment score

For each relevant proposition, record one of four decisions:

- **Adopt:** use it without a material local change.
- **Specialise:** keep the idea but alter it for a named constraint.
- **Map:** retain a different local design and document the relationship.
- **Reject:** do not use it, and record why.

“Aligned” is not a fifth decision. It does not say whether the names match, the
function exists, an interface conforms, or the design has merely been redrawn.

A compact record is enough:

```yaml
source: conventional segmented-network design
proposal: isolate infrastructure management from ordinary client traffic
wanted_result: client-network failure does not remove administrative access

local_fact: >-
  The network controller runs inside the Kubernetes cluster whose switching
  fabric it manages.

decision: specialise
reason: >-
  Segmentation is useful, but the controller needs a bootstrap and recovery path
  that does not depend on the network it is repairing.

tests:
  - remove ordinary client reachability
  - reach the controller from the recovery workstation
  - verify switches and access points retain or regain controller contact

review_when:
  - the controller moves outside the cluster
  - out-of-band management is added
```

The record names the source, desired result, conflicting local fact, decision,
tests, and reason to reconsider it. That is more useful than “82% aligned.”

## A worked case: network segmentation

A common network design separates client, server, management, and untrusted
device traffic. The proposal is sensible: one compromised or broken client
network should not remove the ability to administer infrastructure.

In this homelab, the network controller runs inside Kubernetes, and Kubernetes
depends on the switches managed by that controller. Copying the reference
boundary directly can make the controller unreachable during the change meant to
protect it.

The reference still improves the design. It prompts five checks:

- keep management traffic separate from ordinary clients;
- preserve an administrative route;
- keep the controller reachable;
- recover without depending on the failed path; and
- migrate devices without dropping both old and new control paths together.

The local answer is to specialise the segmentation pattern with a separate
bootstrap and recovery route. The result is less visually pure and safer to
operate.

## What to challenge in a reference

The mismatches are usually the useful output:

- a function has no local owner;
- one component performs several functions that should fail independently;
- the local design needs a distinction the reference does not make;
- a proposed boundary would break recovery;
- a supposedly standard function is locally differentiating;
- a low-priority box is receiving investment because it appears in the model; or
- a workaround is being normalized even though it should be removed.

Also resist one-to-one mappings. A reference capability is not automatically one
service, team, repository, or data product. Its maturity sequence may not be a
safe migration order. Its terminology does not change who decides, which
database owns a record, or what fails together.

## Minimum workflow

For one architecture decision:

1. State the result that should become possible or safer.
2. Name the inherited systems, skills, costs, risks, and recovery requirements.
3. Select only the relevant part of the reference.
4. Turn each useful proposal into a small decision record.
5. Classify the local role of the affected capability.
6. Adopt, specialise, map, or reject the proposal.
7. Test the weakest assumption first with a reversible experiment.
8. Put only the surviving choices into the target and migration plan.

The reference has done its job when it helps produce a better local decision.
Conformity is neither required nor, by itself, informative.

## Sources and further study

- [ISO/IEC/IEEE 42010:2022, Architecture description](https://www.iso.org/standard/74393.html)
- [OASIS Reference Model for Service Oriented Architecture](https://docs.oasis-open.org/soa-rm/v1.0/soa-rm.html)
- [OASIS Reference Architecture Foundation for Service Oriented Architecture](https://docs.oasis-open.org/soa-rm/soa-ra/v1.0/cs01/soa-ra-v1.0-cs01.html)
- [The TOGAF Standard](https://www.opengroup.org/togaf)
- [TOGAF Series Guides](https://www.opengroup.org/togaf/series-guides)
- [BIAN Service Landscape](https://bian.org/deliverables/service-landscape/)
- [Michael Porter, What Is Strategy?](https://hbr.org/1996/11/what-is-strategy)
- [Henry Mintzberg, The Fall and Rise of Strategic Planning](https://hbr.org/1994/01/the-fall-and-rise-of-strategic-planning)
- [Rita McGrath and Ian MacMillan, Discovery-Driven Planning](https://hbr.org/1995/07/discovery-driven-planning)
- [David Teece, Gary Pisano, and Amy Shuen, Dynamic Capabilities and Strategic Management](https://sms.onlinelibrary.wiley.com/toc/10970266/1997/18/7)
