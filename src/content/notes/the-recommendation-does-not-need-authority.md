---
title: "The recommendation does not need authority"
role: exploration
status: exploration
lifecycle: current
area: organizational-systems
published: 2026-08-08
lastRevised: 2026-08-08
projects: []
relates: []
tags:
  - ai
  - requirements
  - architecture
  - decision-making
  - organizational-design
summary: Senior analysts rarely start with complete information or a blank strategic canvas. Their job is to produce a recommendation that holds together when other people challenge it; AI can help maintain that reasoning without making the decision.
explorePrompt: >-
  Examine the argument that high-level enterprise work has a larger automation
  surface than its current use of AI suggests. The central claim is not that AI
  can autonomously set strategy or command an organization, but that much of the
  work between strategic intent and committed execution is structured coherence:
  requirements synthesis, alternative analysis, dependency discovery, roadmap
  construction, precedent retrieval, impact assessment, and continuous
  reconciliation between decisions and reality. Test whether "decision-sufficient
  understanding" is a strong enough substitute for complete organizational
  knowledge, and whether proof-carrying recommendations can be useful without
  possessing authority. Pay particular attention to the counterargument that
  formalized artifacts do not imply formalizable decisions: objectives can
  conflict, tacit knowledge matters, and polished coherence can conceal weak
  assumptions. Distinguish discovery, coherence, and commitment, and challenge
  the argument where those boundaries are less clean than presented. Prefer
  concrete counterexamples over generic claims that human judgment is required.
---

Enterprise AI is usually introduced with small tasks: draft the email, summarize
the meeting, write the test, implement the ticket. Those are sensible places to
start because a person can inspect the result and undo it cheaply.

I suspect the larger opportunity sits one level above them. Senior analysts and
architects spend a great deal of time finding affected systems, comparing
options, tracing dependencies, updating roadmaps, and explaining why a proposal
still makes sense after the facts change. An AI system could do much of that
work without being allowed to approve the proposal.

**Working model.** A recommendation can be partly automated when it carries
enough facts, assumptions, alternatives, and reversal conditions for a reviewer
to challenge it precisely. The person or forum with the right to decide remains
responsible for the commitment.

I do not yet know how far this extends. Tacit knowledge, conflict, and polished
but incomplete analysis may set the limit much earlier than the model suggests.

## What an analyst actually produces

Consider a proposal to retire a legacy platform. The analyst does not begin with
a blank organization or complete information. They have a strategic direction,
an application inventory of uneven quality, several known consumers, old
contracts, a budget, and people who remember exceptions that were never written
down.

The work is practical:

- find the active consumers;
- identify replacement gaps;
- separate mandatory constraints from preferences;
- compare possible sequences;
- show which dependency blocks each sequence;
- retrieve earlier decisions and explain whether they still apply;
- state what is unknown; and
- update the recommendation when implementation reveals something new.

A useful recommendation lets a reviewer point to the exact disagreement. They
can reject a fact, add a missing consumer, change the objective, challenge an
assumption, or accept a different trade-off. A bare conclusion does not provide
that opportunity.

The minimum record looks something like this:

```yaml
decision: retire the legacy platform by the end of the programme
known_consumers: []
constraints: []
options_considered: []
preferred_option: ""
reason: ""
open_assumptions: []
would_change_the_answer: []
decided_by: ""
review_date: ""
```

This is not a mathematical proof. It is enough structure to make disagreement
specific and to revisit the answer later.

## Complete knowledge is not the requirement

No architect knows every team, contract, database, workaround, and personal
relationship in a large organization. Decisions are made anyway.

Experienced analysts cope by following the parts that could change the answer.
They ask who uses the platform, which contracts constrain timing, where data is
copied, who can refuse the change, and what breaks if the preferred sequence is
wrong. They stop when the remaining unknowns are unlikely to alter the choice.

An AI system would need the same stopping rule. It does not need a perfect
digital twin. It needs access to records it can trace, a way to find related
systems and decisions, and permission to return:

> No recommendation is justified yet. Every viable option depends on whether
> this consumer can migrate. Resolve that question first.

That answer is more useful than a complete-looking roadmap built on a hidden
guess.

## Strategy narrows the work

Most architecture and transformation work begins after a broad direction has
already been chosen: consolidate platforms, reduce operating cost, improve
resilience, standardize controls, or retire an estate. The direction may be
vague or internally inconsistent, but it still removes many possible answers.

Within that space, an AI system could check ordinary but expensive questions:

- Does the proposed investment support the stated direction?
- Does the roadmap eventually remove the platform it claims to retire?
- Has a temporary bridge gained new consumers?
- Did an implementation change invalidate an assumption in the business case?
- Does a new proposal repeat an option rejected earlier under the same facts?

These checks do not choose the strategy. They keep its downstream documents
from drifting apart unnoticed.

## Three kinds of work

I currently find it useful to separate discovery, maintenance, and commitment.
The borders are not clean, but the distinction exposes where automation has a
credible role.

### Discovery

Discovery asks whether the problem has been framed correctly. A new technology,
business condition, or stakeholder may make all existing options irrelevant.
There may be no stored precedent or method that produces the answer. Agents can
search and compare, but this is where their inherited framing is most dangerous.

### Maintenance

Once a proposal exists, someone has to keep its facts, dependencies, plan, and
results synchronized. Today this often means updating an architecture, business
case, roadmap, backlog, governance paper, delivery report, and executive summary
at different times.

This is the part I expect to automate most readily. The work is repeated,
traceable, and testable: find a changed fact, identify the documents and
decisions that depend on it, and ask whether the conclusion still holds.

### Commitment

Commitment allocates money, accepts risk, assigns work, and makes groups act
despite disagreement. A model does not acquire that standing by writing the best
paper. The accountable person or forum must still decide, and other people must
be able to identify who did so.

Preparation can be automated. Institutional legitimacy cannot be inferred from
analytical quality.

## Where the model may fail

Structured output can make a weak argument look stronger. A missing stakeholder
can disappear beneath a precise dependency graph. A doubtful estimate can turn
into a confident milestone after being copied through several documents. An
agent may retrieve precedent without noticing that the earlier decision depended
on a relationship or political constraint that was never recorded.

Conflicting objectives are harder still. No amount of evidence calculates whose
risk should matter most when the choice is genuinely about values, incentives,
or power.

The proposed system therefore needs to preserve the awkward parts:

- the source for each important fact;
- assumptions that have not been checked;
- dissent and rejected alternatives;
- the person who made the decision;
- observations that would reopen it; and
- the difference between “unknown” and “unlikely to matter.”

If automation makes those details harder to see, it has made the decision
process worse even when the document reads better.

## Precedent is useful and dangerous

Accepted decisions give later work a starting point. A new proposal can reuse an
earlier pattern, distinguish itself from a rejected case, or explain why an old
rule no longer fits.

Agents are good candidates for finding and comparing those records. But a
precedent without its original scope and assumptions becomes dogma. A reusable
decision record needs the conclusion, the reasons, the exceptions, the date,
and what happened afterward.

The goal is not to make every decision consistent with history. It is to make a
departure deliberate.

## What I would test next

The next useful experiment is not an autonomous architecture board. It is a
shadow process for one continuing decision, such as a platform retirement.

The system would maintain the consumer list, assumptions, alternatives,
dependencies, decision record, and review triggers. It would propose updates
when source records change but could not approve or execute them. A human analyst
would compare its recommendation with the ordinary process.

The test should record:

- missed dependencies and false alarms;
- how often a changed fact alters the recommendation;
- which important corrections came only from tacit knowledge;
- whether reviewers can locate the source of each claim; and
- whether maintaining the record costs less than reconstructing it for each
  governance cycle.

Evidence that the system repeatedly misses decisive tacit constraints, or makes
review slower by producing plausible noise, would weaken this model. Evidence
that it keeps the decision current while making disagreement more specific
would strengthen it.

For now, the claim remains narrower than autonomous strategy: AI may be able to
maintain much of the reasoning around a consequential recommendation without
being the actor that commits the organization to it.
