---
title: Intelligence has a lifecycle
seoTitle: Using a game AI to test where LLMs, learned models, and code belong
role: exploration
status: exploration
lifecycle: current
area: agent architecture
published: 2026-09-27
lastRevised: 2026-09-27
projects: []
relates:
  - the-agent-is-not-the-application
  - the-human-is-in-the-slow-loop
  - a-reference-architecture-is-a-hypothesis-library
  - authority-must-travel-with-the-action
tags:
  - agents
  - games
  - hierarchical control
  - experimentation
  - jev
summary:
  A hobby game AI is a cheap laboratory for deciding which decisions should stay
  with an LLM, which should become learned, and which should become ordinary
  code -- settled by replayable contests, not diagrams.
explorePrompt: >-
  Use this note as a worked instantiation, not a design to copy. The
  transferable question: in a system that mixes generative models, learned
  models, and deterministic code, which decisions should stay generative, which
  should become learned, and which should become ordinary software -- and what
  evidence moves a decision from one to the next? The worked case is a hobby
  game AI in which an LLM invents strategic plans slowly, a bounded selector
  chooses among the currently valid plans quickly, a validator checks actions
  and abort conditions, and deterministic controllers execute. Its conclusion is
  that intelligence should be able to leave a layer once traces show the
  decision is stable, and that each architectural claim must become a replayable
  contest rather than a diagram. For generated plans, the baseline to beat is a
  candidate-conditioned scorer, not a fixed-class classifier, and a contest must
  include held-out plans and matched games before it says anything about
  winning. Those conclusions depend on full state capture, bounded actions,
  measurable outcomes, and cheap replay. Apply the question to a system you run.
  Identify which of those conditions you lack, which conclusions survive without
  them, and where the note's lifecycle would fail. Produce a map of your
  decision points by current layer, the evidence that would move each one, and
  the first contest you could actually run.
---

I have been building a game AI partly because games are a good place to ask
architectural questions that are much harder to answer in production systems.

The immediate question was mundane enough. An RTS agent has a set of strategic
playbooks. What should choose between them?

A large language model can do it. A trained classifier can do it. Rules can
often do it. A newer model such as Jev might also fit the slot: take structured
state, make a bounded probabilistic decision, return a typed result.

I did not start from "I need Jev." I arrived at a more general slot -- semantic
decision-making over a bounded action space that changes during play -- and Jev
is one candidate for it. The slot is useful whether that candidate survives the
experiment or not.

**Working model:** the interesting question is not which model wins the slot. It
is when each kind of intelligence should leave it.

## From reasoning to machinery

Suppose the agent has four strategies available:

- rush early;
- expand economically;
- defend and tech;
- pressure one flank while preparing an attack elsewhere.

If those strategies are fixed and the game state is well represented, asking an
LLM every second to choose between them is probably wasteful. Run enough games
and the choice becomes ordinary supervised learning. Run enough more and parts
of it may collapse into a handful of rules.

That suggests a progression:

```text
reason about it
    ↓
repeat the reasoning
    ↓
learn the decision
    ↓
encode the stable parts
```

An LLM might first notice that a particular mix of economy, map position, and
opponent behaviour warrants a particular response. The repeated examples, kept
as traces, can train a classifier. Where the classifier's behaviour is stable
and explainable, it can become deterministic policy.

The system does not have to keep the most powerful model everywhere just because
it can. It can become more ordinary in the places where it has learned enough to
do so, while the LLM moves upward to problems that are still open.

## Generated playbooks break the easy version

Static playbooks make the architecture easy: train a classifier over twelve
known strategies and let it choose.

I am more interested in a strategic layer that is allowed to invent plans.
During a match, an LLM might decide the situation warrants something that did
not exist when the system was built:

```text
feign pressure west
hold production temporarily
force defensive investment
switch into air
attack exposed economy
abort if scouting shows anti-air transition
```

Now the decision space is not fixed. A classifier trained yesterday cannot
choose a class that was created five seconds ago.

A fixed-class classifier is the weak baseline, though. A candidate-conditioned
scorer -- a ranker or utility model that takes the game state and one plan's
features and returns a score -- can evaluate a plan it has never seen, provided
the plan can be described in features it was trained on: target, timing, unit
mix, how much production it commits, and when it aborts. That baseline already
handles much of the generated-plan case without a language model in the fast
path.

That opens a middle layer between generative reasoning and deterministic
execution:

```text
LLM
  creates and revises plans (slowly)
        ↓
bounded decision layer
  selects among the currently valid plans (quickly)
        ↓
validator
  checks allowed actions and abort conditions
        ↓
game-specific controllers
  execute the selected plan
```

This middle layer is where something like Jev may be interesting. It
[accepts the set of choices with each request](https://docs.typesafe.ai/api), so
it can sit in the same slot as the scorer. The useful question is not whether it
can choose among generated plans at all -- the scorer can too -- but whether
reading a plan's description, including the parts a feature schema flattens
("feign pressure", "abort if scouting shows anti-air"), improves decisions
enough to justify its cost and latency. If it does, it fills the gap between
"the LLM reasons every time" and "train a specialised model once." The system
can operate while the decision space is still moving, then distil the stable
parts later.

If it does not work, the fallback is known: the LLM selects directly at a slower
cadence, the candidate scorer carries the fast path, and plans whose
descriptions matter more than their features wait for enough games to train on
them.

## Why a game and not a real system

The same boundaries appear in agent systems, infrastructure automation, and data
platforms. Games are a cleaner laboratory for them:

- the state can usually be captured;
- actions are bounded;
- outcomes can be measured;
- the same situation can be replayed;
- thousands of counterfactual games can run unattended;
- latency, model capability, planning depth, and controller structure can be
  varied deliberately;
- a bad architectural decision destroys an imaginary tank rather than a
  production database.

My infrastructure and agent work approaches the same problem from the opposite
direction. There the world is open and the job is to constrain agent behaviour
enough to operate safely. Here the world is closed and the job is to add enough
adaptive intelligence to behave usefully. Both tracks keep arriving at the same
pieces: contracts, typed intents, validators, authority boundaries, plans,
evidence, and feedback.

I do not intend to merge the projects. That would probably ruin the fun and
produce GeneralAgentFrameworkFactory. Letting each inform the other is enough.

## Every idea has to become a contest

The weak version of this hobby is designing ever more general agent
architectures without accumulating evidence. Another twelve-layer diagram does
not buy much.

So the discipline I am imposing is that every architectural idea must eventually
become an observable contest, with the traces kept. For example:

```text
LLM chooses directly
  vs semantic decision model
  vs candidate-conditioned scorer
  vs rules
```

```text
static playbooks
  vs LLM-generated playbooks
  vs LLM-generated playbooks filtered through simulation
```

```text
game-specific architecture
  vs shared genre controller + game adapter
```

A diagram showing that a control architecture generalises across RTS and 4X
games proves very little. Trying to make the same architecture run Red Alert 2
and Civilization is more useful, because the genres stress different
assumptions. An RTS cares about latency and continuous reaction. A turn-based 4X
game can afford far more deliberation. An FPS would push language models almost
entirely out of the mechanical control loop.

An abstraction that looks elegant in an ADR but fails when moved from Red Alert
2 to Civilization is doing me a favour.

## Where the model may fail

- **The middle layer may not be needed.** If an LLM at a slower cadence plus a
  fast deterministic controller wins the contests, the bounded decision layer is
  architecture for its own sake.
- **The language model may add nothing over features.** If a candidate scorer
  matches Jev on generated plans, the plan description carried no decision
  signal the features missed, and the cheaper model should hold the slot.
- **Distillation may not stabilise.** A classifier trained on LLM traces may
  inherit the LLM's inconsistency rather than its judgement, leaving nothing
  stable enough to encode as rules.
- **Generality may be an illusion of two games.** An abstraction that survives
  an RTS and a 4X game may still be shaped by what those two happen to share. An
  RPG or management sim would be a harder test.
- **Games may be too clean.** The properties that make games a good laboratory
  -- full state, bounded actions, cheap replay -- are exactly what production
  systems lack. A lifecycle that works here may not transfer to an open world
  where outcomes are ambiguous and nothing replays.

## Current position

I do not know whether a multi-game AI framework is itself useful, and that is
not why I am building one. It gives me a compact world in which to experiment
with generated plans, learned decisions, validation, deterministic execution,
and the boundaries between them.

The question it keeps returning to is: what should remain generative, what
should become learned, and what should eventually become ordinary software?
Those boundaries do not have to be fixed. The architecture could become more
deterministic over time without becoming less adaptive, which is almost the
opposite of wrapping an LLM around every existing subsystem.

That is still a hypothesis. The first contest that would move it has to include
plans the selectors have not seen: generated playbooks held out from the
scorer's training and from the rule author, offered alongside the known ones.
Jev, a candidate-conditioned scorer, rules, and an LLM choose among them from
the same observations. A fixed playbook set would only test fixed selection,
which is the easy version.

Replayed decision points can show agreement between selectors or with a
reference choice, latency, and cost. They cannot show win rate. That needs
controlled continuations from the replayed state, or complete games with matched
seeds and opponents, so that a selector's wins are not a better map draw.

And if the architecture is wrong, the tanks respawn.
