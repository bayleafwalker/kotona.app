---
title: The router was larger than the model
role: exploration
status: exploration
lifecycle: current
area: model evaluation
published: 2026-09-28
lastRevised: 2026-09-28
projects:
  - vuoro
relates:
  - what-107-isolated-completions-did-not-show
  - the-agent-is-not-the-application
  - the-coordinator-never-touches-the-repo
  - the-work-between-the-ticket-and-the-agent
  - measure-the-diagnosis-not-only-the-transcript
draft: true
tags:
  - jev
  - agents
  - routing
  - evaluation
summary: >-
  A disappointing Jev routing comparison exposed that the model was only one
  part of the router; state construction, choices, policy, consequences and
  feedback determined more of the result.
---

I expected my Jev experiment to end quickly.

Jev is a small model for fast, typed decisions: give it some state and a fixed
question, and it returns a choice or score rather than a conversation. I was
doubtful that this would help with software work. A sprint item can hide its
important fact in a plan, an earlier decision, the repository or the history of
why the item exists. A model deliberately denied that context seemed like the
wrong tool.

The first comparison did little to change my mind. I gave Jev and Haiku the
title and description of 100 completed work items and asked them to assign a
work tier. Against one hindsight judge, Haiku matched 50 items and Jev
matched 48. Against another judge's 50 items, Haiku matched 44% and Jev 30%. On
the 35 items where both judges agreed, Haiku matched 57% and Jev 34%.

That was not a Jev win. The useful result appeared when I stopped treating it as
a model leaderboard.

## The model was only the replaceable part

I had described the experiment as “Jev versus Haiku routing.” That made the
model sound like the router. It was not.

The router also decided:

- which repository state to collect;
- how to compress that state into an input;
- which choices the model was allowed to make;
- how scores became a decision;
- what happened after each decision;
- and which outcomes returned as evidence.

Jev and Haiku happened to occupy one box inside that system. Replacing the box
did not repair the rest of it.

This was especially visible in the error directions. Under the first hindsight
judge, Haiku marked 58 items not ready. Thirty of those were labelled buildable,
while it missed six items labelled as needing planning. Jev made the opposite
kind of mistake: it dispatched work that hindsight said needed planning and
almost never selected the middle tier. One system produced visible friction; the
other risked silent waste.

The judges complicated the result further. They agreed on only 70% of the items.
Some planning needs were visible only in the later history: an item was retired,
superseded or resolved by another decision. No router reading the original
ticket could have known that future.

The
[full evaluation](https://github.com/bayleafwalker/agentops/blob/main/jev/eval/agentops-2026-09-28/README.md)
therefore kept Jev in shadow mode. It did not establish a better router. It did
show that “use a smarter model” was an incomplete description of the problem.

## “Zero knowledge” was the wrong phrase, but a useful instinct

I kept reaching for “zero knowledge” to describe Jev. That is inaccurate — and
collides with a specific cryptographic term. Jev is a trained model. What I
meant was a deliberately closed-context decision maker: no repository search, no
project memory and no opportunity to repair a poorly framed question with a long
explanation.

That limitation looked like a weakness in ticket routing. It started to look
useful elsewhere.

**Working model:** a closed-context model becomes valuable when the surrounding
system can compile the relevant state, constrain the legal choices, check the
choice and produce rapid feedback.

This model predicts that Jev will be weak at questions such as “what should we
do with this work?” and more useful at questions such as “given this state,
which of these valid playbooks fits best?” The first asks the model to recover a
world. The second asks it to discriminate inside a world the application has
already built.

It also gives the application nowhere to hide. If a result is poor, I have to
inspect the state compiler, the question, the choice set and the policy — not
only blame the model.

## Gameplay has the shape the router lacked

The more promising Jev case appeared in the game-agent work. This is still an
architectural hypothesis, not a measured Jev gameplay result. Jev has not yet
improved the bot's win rate.

But the loop has several properties the routing test lacked:

| Sprint-item routing               | Gameplay loop                                       |
| --------------------------------- | --------------------------------------------------- |
| Partial prose ticket              | Compiled state snapshot                             |
| Relevant history may be hidden    | Observations are refreshed every cycle              |
| Tiers have disputed meanings      | Choices can be validated against legal playbooks    |
| Outcome arrives much later        | Simulator feedback arrives quickly                  |
| One decision per item             | Repeated, comparable decisions                      |
| A bad route starts the wrong work | Code can reject or fall back from an invalid choice |

The target architecture makes those boundaries explicit. A larger model writes
or revises typed playbooks. A fast decision tier selects among them from the
current strategic state. Deterministic code validates and executes the choice.
The simulator supplies the next state and, eventually, an outcome.

That is a better-shaped experiment for Jev than handing it a ticket and asking
for a global judgment. It narrows the model's responsibility without making the
whole system less capable.

## Plan acceptance is the middle case

Larger planned work offers a similar opportunity, but only if Jev is an
acceptance sub-gate rather than the accepting authority.

Instead of asking one vague question — “is this plan ready?” — a planner can
submit each node and parent–child edge to narrow probes:

- Is a product decision still open?
- Is the proposed acceptance observable?
- Could the oracle reject an incorrect implementation?
- Does this child preserve a named part of its parent's intent?
- Are sibling units too coupled to run independently?
- Is the unit small enough for one reasoning context?

Jev can return probabilities for those properties. Code owns the thresholds and
composition. The planner receives the failed or uncertain dimensions, revises
the frontier and may explicitly overrule a score. The accepted plan is then
frozen before oracle-writing and implementation begin.

The first probe set also supplied a warning. Its narrow questions detected
planning need about as well as Haiku, not better. Combining every score below
0.7 with a naive OR flagged 77 of 100 items, at 38% precision. A lattice of
noisy judgments does not become reliable merely because it has more cells.

Each dimension needs its own calibration against outcomes. Structural checks,
dependency cycles and authority boundaries remain deterministic. The model
supplies semantic evidence; the workflow decides what that evidence is allowed
to do. The proposed
[acceptance lattice](https://github.com/bayleafwalker/agentops/blob/main/docs/dispatch/plan-acceptance-lattice.md)
keeps that division visible.

## Where I would try Jev next

I would keep the broad work router in shadow mode and test Jev where the loop
can be made smaller:

1. **Gameplay selection.** Choose among validated playbooks from a typed state
   snapshot. Compare it with the current deterministic selector on frozen maps,
   recording win rate, invalid choices, fallbacks, latency and cost.
2. **Plan-node acceptance.** Score atomic readiness and intent-preservation
   questions, then calibrate each threshold against repairs, parks and later
   scope corrections. Never use an unweighted conjunction as the gate.
3. **Oracle readiness.** Estimate whether a proposed check could distinguish
   correct work from plausible wrong work. Let code verify the check where it
   can and send uncertain cases to the oracle author.
4. **Repair diagnosis.** Given a bounded verifier report, select the most likely
   failure class and the next permitted diagnostic action. Do not let the model
   execute irreversible repair itself.

The important comparison is not only Jev against another model. It is one
complete decision system against another: the same state boundary, the same
choice set, the same consequences and the same outcome measurements.

I would change this working model if Jev remains unstable after the state and
choices are made explicit, if calibrated probabilities do not improve a real
policy, or if a deterministic selector performs as well for less complexity.
Until then, the routing result is a reason to narrow the experiments, not to
discard the tool.

The surprise was not that Jev knew more than I expected. It was that several
useful loops could be arranged so it needed to know much less.
