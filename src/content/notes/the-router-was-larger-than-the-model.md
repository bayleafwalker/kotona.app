---
title: The router was larger than the model
seoTitle: Evaluating Jev and Claude Haiku for triaging coding-agent work
role: exploration
status: exploration
lifecycle: current
area: model evaluation
published: 2026-09-28
lastRevised: 2026-09-28
projects:
  - vuoro
relates:
  - intelligence-has-a-lifecycle
  - the-agent-is-not-the-application
  - the-platform-can-retrieve-the-application-still-has-to-decide
  - the-coordinator-never-touches-the-repo
  - the-human-is-in-the-slow-loop
  - what-107-isolated-completions-did-not-show
draft: true
tags:
  - agents
  - evaluation
  - routing
  - jev
summary:
  Jev, Claude Haiku 4.5 and keyword rules triaged 100 agent work items from
  ticket text, and none was reliably better. The ranking flipped with the judge,
  the question's wording and the price of each error, so the next tests vary the
  router around the model.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - evaluating a model that triages work items for coding agents
    - comparing a closed-context decision model with an LLM for routing
    - using narrow yes/no probes to gate plan acceptance
  establishes:
    - that a text-only routing comparison on 100 work items did not separate
      Jev, Claude Haiku 4.5 and keyword rules
    - that the judge, the question's wording and the price of each routing error
      could each reverse which router looked better
  doesNotEstablish:
    - that Jev routes better or worse than Claude Haiku 4.5 on compiled state or
      recorded outcomes
    - any measured Jev gameplay or plan-acceptance result
  supplementWith:
    - the receiving workflow's recorded routing outcomes and error costs
---

I expected my Jev experiment to end quickly.

Jev is TypeSafe AI's [model for typed decisions](https://docs.typesafe.ai/api):
the caller sends some state and a fixed set of questions, each with its allowed
answers, and gets typed answers back rather than text -- a choice with a
confidence, or the probability that a yes/no statement is true. As I use it, it
works in closed context: no repository search, no project memory and no chance
to talk its way around a badly framed question. I doubted that this would help
with software work. A work item can hide its important fact in a plan, an
earlier decision, the repository or the history of why the item exists. A model
deliberately denied that context seemed like the wrong tool.

The first comparison did little to change my mind. I took the first 100
completed items from the backlog of my agent-operations repository, where a
dispatch workflow picks up an item, prepares a workspace and starts a coding
agent on it. Three routers decided, for each item, whether an agent should start
now -- at a `bounded`, `standard` or `hard` tier, which sets how much
implementation effort the build gets -- or whether the item needed planning
first. Each router saw only the title and description: Jev, Claude Haiku 4.5
running the workflow's triage rubric, and a set of keyword rules. Two Claude
models then labelled the same items in hindsight, after reading each item's
history: its events, decisions, refinements and whether it was later retired.
Opus labelled all 100 and Sonnet labelled 50. Neither saw a router's answer.

Exact agreement with those labels looked like this. The held-out half is the 50
items that were not used to tune a reworded Jev question, described below; the
other half was.

| Hindsight labels    | Items | Haiku | Keyword rules | Jev |
| ------------------- | ----: | ----: | ------------: | --: |
| Opus, all items     |   100 |   50% |           41% | 48% |
| Opus, held-out half |    50 |   56% |           54% | 64% |
| Opus, other half    |    50 |   44% |           28% | 32% |
| Sonnet              |    50 |   44% |           32% | 30% |
| Both judges agree   |    35 |   57% |           34% | 34% |

Rankings moved with the sample as well as the judge. Under the same Opus labels
every router did better on the held-out half, and Jev went from 32% on one half
to 64% on the other. Against Sonnet it fell below the keyword rules, and where
both judges agreed it tied them. The judges themselves agreed on 70% of the 50
items they both labelled (κ 0.59), which is roughly the ceiling for any router
measured this way, and at 50 items or fewer none of these gaps is outside the
noise. That is not a Jev win, and it is barely a ranking.

**Working model:** a router is the whole decision system -- the state it
collects, the choices it permits, the rule that turns an answer into an action,
what a wrong call costs, and the record that comes back. A model comparison
tests one part of it. A closed-context model such as Jev can earn a place only
where the rest is built: where code assembles the state the decision needs,
supplies the legal choices, owns the policy and returns the outcome. Where the
model would have to recover those things from a ticket, changing the model will
not fix the routing.

The routing evidence supports the first half of that. The second half is still a
design.

## What else moved the result

I had described the experiment as "Jev versus Haiku routing." That made the
model sound like the router. The router also decides which repository state to
collect, how to compress it into an input, which choices the model may make, how
an answer becomes a decision, what a wrong decision costs, and which outcomes
come back as evidence. The evaluation was built to compare models, so it tried
to hold most of that still. The other parts moved the result anyway.

**The state.** When the evaluation ran, the Haiku triage also read the
repository's agent instructions, its dispatch configuration and the live item.
The evaluation gave it the title and description only, to match Jev. That kept
the comparison fair between the two models, but it measured both inside a router
smaller than the one in use.

**The question.** The two models were not even asked the same thing. Haiku
answered its own rubric -- a tier plus a separate ready-or-not flag -- and the
evaluation read "not ready" as needing planning, setting aside the tier Haiku
had given those items. Jev chose planning directly, as one of five answers.
Rewording only Jev's tier criteria then fixed its habit of under-tiering,
calling `standard` work `bounded`, and left its planning misses in place. It had
been tuned on the other half of the items, so only the held-out result is clean:
there, the rewording moved Jev by 8 points, the same as the gap between Jev and
Haiku. Both are inside the noise, and the rewording was not adopted. The wording
of the question is at least as open a variable as the model.

**The consequences.** Exact agreement blends two decisions: whether to start the
work now, and how hard it is. Split out the first, and the ranking reverses
under the larger judge:

| Opus labels, 100 items             | Haiku | Keyword rules | Jev |
| ---------------------------------- | ----: | ------------: | --: |
| Start-or-plan agreement            |   64% |           70% | 76% |
| Ready work sent to planning        |    30 |            15 |   8 |
| Work that needed planning, started |     6 |            15 |  16 |

Haiku marked 58 items not ready where the Opus judge saw 34. Jev did the
opposite: it started work that needed planning, and chose the middle tier,
`standard`, once in 100 items. Jev's three "insufficient evidence" answers count
as starts here; counted as holds, it agrees on 73% and sends 11 ready items to
planning, and the order stands. One router produced visible friction; the other
risked silent waste.

An agreement score treats those two errors as equal. The workflow cannot. On
these counts, Haiku's caution is the better choice under every judge once a bad
start costs more than about two unnecessary planning passes, and Jev's is better
below about 0.8; in between, it depends on the judge. That prices only the
start-or-plan decision. A wrong tier on work that does start has its own cost: a
failed check, a repair round and eventually a higher tier.

The workflow has since changed that price rather than the model. Its router now
sends each unit to a build, to an oracle author or to a refiner, and every lane
moves the unit forward in the same run. In the
[workflow's own words](https://github.com/bayleafwalker/agentops/blob/18ca1d9c8202c9970014ff2c8bc76f3e55d12ad6/docs/dispatch/workflow-topology.md),
"a routing mistake is cheap by design": a ready unit sent to refinement costs
one refinement pass, and an under-specified unit that is built meets its oracle
and a verifier. Haiku still routes. What changed is what a wrong route costs.

**The judge.** Many of the planning needs the judges found were visible only in
the later history: the item was retired, or superseded by a strategic decision.
No router reading the item text could have seen that coming. Some descriptions
had also been edited after completion, which leaked outcome text to every router
equally. The judges are language models reading history, not measurements of
what the work cost.

**The confidence.** Jev's confidence was informative about Jev. Against Opus, it
was right on 63% of its 38 answers at confidence 0.8 or above, and on 25% of its
36 answers below 0.6. With judges who agree with each other only 70% of the
time, that cannot say whether the confidence is calibrated, and it did not make
Jev a better gate. Rescoring the published data, a router that trusted Jev at
0.8 or above and asked Haiku otherwise edged Haiku by two points against Opus,
then fell six below it against Sonnet and on the items both judges agreed on.

**The record.** The change the
[evaluation](https://github.com/bayleafwalker/agentops/blob/18ca1d9c8202c9970014ff2c8bc76f3e55d12ad6/jev/eval/agentops-2026-09-28/README.md)
kept was to the router. The dispatch workflow now records each routing decision
as an event. Before that, triage decisions were not stored at all, which is why
language-model judges had to stand in for outcomes. Jev stays out of the
dispatch path, and its routing scores are computed offline until recorded
decisions support a clear result.

## Recovering a world or choosing inside one

I kept calling Jev "zero knowledge," which is wrong twice: it arrives with
general knowledge from training, and the phrase already names something specific
in cryptography. Closed context is the accurate term, and the working model
turns it from a weakness into a design constraint.

It predicts that Jev will be weak at questions such as "what should we do with
this work?" and more useful at questions such as "given this state, which of
these valid playbooks fits best?" The first asks the model to recover a world.
The second asks it to discriminate inside a world the application has already
built.

That also gives the application nowhere to hide. If a result is poor, I have to
inspect the code that assembles the input -- the
[context compilation](/notes/the-agent-is-not-the-application/) that stays
outside the model -- along with the question, the choice set and the policy,
before blaming the model.

## Gameplay has the shape, not yet the result

The more promising Jev case is the game agent described in
[Intelligence has a lifecycle](/notes/intelligence-has-a-lifecycle/). A larger
model writes playbooks -- strategies such as "feign pressure west, then attack
the exposed economy" -- including new ones during play. A fast selector chooses
among the currently valid playbooks from the game state, and deterministic code
validates and executes the choice. It is an architectural hypothesis. I have no
measured Jev gameplay result.

That shape suits a trained scorer as well as it suits Jev: a ranker that rates
each playbook from features such as target, timing and unit mix. Jev's specific
bet is that reading a playbook's description, including the parts a feature
schema flattens ("abort if scouting shows anti-air"), carries signal the
scorer's features miss.

The loop has several properties the routing test lacked, and two that make it
harder:

|                | Work-item routing                             | Gameplay loop                                      |
| -------------- | --------------------------------------------- | -------------------------------------------------- |
| Input          | Title and description, some edited afterwards | Compiled state snapshot                            |
| Choices        | Tiers whose meaning two judges dispute        | Playbooks that code can check for legality         |
| Invalid answer | Starts the wrong work                         | Rejected by code, with a fallback                  |
| Feedback       | After the work, through a judge               | The next state, within seconds                     |
| Replay         | An item cannot be rerun with another route    | The same state can be replayed with another choice |
| Credit         | One outcome per decision                      | One result at game end, shared by every decision   |
| Latency budget | Seconds are cheap beside an agent run         | A slow answer arrives after the state has changed  |

Latency is the open risk. The per-call records behind the evaluation show the
same Jev version, `jev-1.13.0`, answering in a median of 4.7 seconds on the
first routing run -- the README's "5 s" -- but that run split in two: 37 of its
100 calls returned in under a second and the rest took 2 to 13 seconds. The
client's timer also covers retries after rate-limit or overload responses, and
the run did not record whether any happened. Backoff alone adds at most a second
and a half, though, and the same model answered the reworded routing questions
and the seven-question probes described below in a median of about 0.27 seconds.
So the slow tail more likely came from conditions during that run -- the
service, the network path or rate limiting -- than from the model, and the log
cannot say which. The fast figure would allow a strategic choice every few
seconds; the slow tail would not. A game would have to measure the tail under
its own load, with a deterministic default holding until an answer arrives and a
validator that rejects a choice whose state has already changed.

## Plan acceptance has the questions, not yet the inputs

Larger planned work sits between the two. It can have gameplay's narrow
questions and code-owned policy, but today its inputs are routing's prose items,
and its outcomes -- repairs, parked units and confirmations -- arrive late.

The design only works if Jev is an acceptance sub-gate: it supplies some of the
checks a plan must pass before implementation, and code decides whether the plan
passes. Instead of one vague question -- "is this plan ready?" -- the workflow
sends each plan node, and each parent-child edge, to narrow yes/no probes, which
together form an acceptance lattice. Is a decision still open? Could the
proposed oracle -- the checks written before implementation -- reject wrong
work? Does the unit fit one reasoning context? Is acceptance observable? Does a
child preserve a named part of its parent's intent? Are siblings too coupled to
run independently?

The first probe run, on the same 100 items, sorted those questions into three
groups:

- **Some signal.** Open decisions, oracle viability and fitting one context
  detected planning need at an AUC of about 0.66 to 0.73, where 0.5 is chance:
  about as well as the Haiku triage, not better. The strongest single probe,
  whether the item was framed as an experiment, ranged from 0.64 to 0.82
  depending on the judge.
- **No signal on ticket text.** Acceptance observability and missing information
  scored at chance.
- **Untested.** Parent intent, completeness and sibling coupling need a plan
  graph in which each child links to a parent whose intent was recorded. Backlog
  items carry dependencies but have no parent to preserve. These are the probes
  the plan case depends on most.

Combining the probes naively made things worse. Flagging an item whenever open
decisions, experiment framing or oracle viability put its failure probability at
0.7 or above flagged 77 of the 100 items at 38% precision -- barely above the
34% that flagging every item would score -- where the Haiku triage -- already
the over-cautious router -- flagged 58 at 48%. A lattice of noisy judgments does
not become reliable merely because it has more cells. The probes' value is
diagnostic: they name the dimension that failed, which a planner can act on and
a bare "not ready" cannot.

So ownership matters more than the probes. Code owns a threshold for each
dimension, calibrated separately against what happened to the work, and owns the
rule that combines them. Structural checks, dependency cycles and authority
enforcement stay deterministic: Jev may flag a unit that appears to cross an
authority boundary, but code decides whether it may. The planner receives only
the failed or uncertain dimensions, may overrule a score if it records why, and
gets a capped number of revision rounds rather than revising until Jev is
satisfied.

The obvious failure is a planner that narrows its plan until the probes pass.
The design answers that outside the model. The original intent is recorded
before refinement, scope may move into follow-ups but is never dropped, and
whether a plan got better or merely narrower is never judged by the model the
planner is optimising against. The accepted plan is then frozen before the
oracle is written and implementation begins. The proposed
[acceptance lattice](https://github.com/bayleafwalker/agentops/blob/18ca1d9c8202c9970014ff2c8bc76f3e55d12ad6/docs/dispatch/plan-acceptance-lattice.md)
keeps that division visible.

## Where the model may fail

- **Compiled state may help every model equally.** If Haiku gains as much as Jev
  from a compiled input, closed context adds nothing to routing; the better
  input simply helps whoever reads it.
- **Cheaper baselines may keep pace.** Keyword rules already tied Jev on the
  consensus items. If rules, or a trained scorer that ranks each option from its
  features, keep matching Jev once the state is compiled, Jev is complexity
  without a job.
- **The model may be most of the router after all.** If swapping the model moves
  outcome-scored results far more than changing the input, the question or the
  policy, the title of this note is wrong.
- **Latency may not fit the loop.** If the quarter-second runs do not hold under
  a game's load, Jev is confined to occasional strategic choices.
- **Plans may pass by shrinking.** If plans accepted through the probes deliver
  less of their recorded intent than plans accepted today, the gate is
  optimising the wrong thing.
- **Outcomes may be too late or too sparse to calibrate against.** Per-dimension
  thresholds need repairs, parked units and confirmations in useful numbers. If
  they accumulate slowly, the calibration never finishes.

## What I would test first

Each test below compares complete decision systems, so each has to declare what
it holds fixed and what it varies. The routing evaluation meant to compare
models. It asked each its own question, reworded Jev's, and held Haiku's input
artificially small. Versions need the same care: the saved question sets ask for
`jev-latest`, an alias that moves with each release, so a rerun has to pin
`jev-1.13.0` or count a new version as one more thing it varied. The judges'
versions were not recorded at all.

1. **Routing, with the router varied instead of the model.** Rerun the same
   items with two inputs for every router: the title and description, and a
   fixed-size packet compiled from the repository's agent instructions, the
   dispatch configuration and the live item. Ask every router the same question.
   Score the start-or-plan decision separately from the tier, against the judges
   now and against recorded outcomes once enough decisions exist, and price the
   two error directions explicitly. If changing the input moves results more
   than changing the model, the router was the larger part. If compiled state
   helps Haiku and not Jev, or the keyword rules keep pace, Jev leaves routing.
2. **Gameplay selection.** Run the contest from the game note: held-out
   generated playbooks offered alongside the known ones, with Jev, the current
   rules, a candidate-conditioned scorer and a slower LLM selector choosing from
   the same observations. Replayed decision points can show agreement, invalid
   choices, fallbacks, latency and cost; win rate needs matched seeds and
   opponents, or controlled continuations. If the scorer matches Jev, the
   playbook descriptions carried no signal the features missed.
3. **Plan-node acceptance.** Tune a threshold for each probe that showed signal
   on half of the recorded outcomes, and score the other half. Adopt a combined
   rule only if it flags no more items than the Haiku triage at better than its
   48% precision. Separately, compare revision given the failed dimensions with
   revision given generic open questions. If neither helps, keep the probes as
   logged diagnostics. The relational probes wait for a plan graph.
4. **Oracle readiness.** Dispatch already checks that an oracle is attainable;
   this asks whether it would reject wrong work. Take the label from mechanics
   rather than a judge: seed plausible wrong implementations and record whether
   the proposed check rejects them. Compare Jev's estimate of oracle viability
   with that rejection rate, with a Haiku call and with the existing
   attainability check, and drop it if it does not beat them.

I trust the negative half of this. Routing from ticket text did not separate the
models, and at this size it could not have. The positive half -- that Jev earns
a narrow slot where the application has already done the knowing -- is still a
design. The routing rerun with compiled state is the cheapest test that could
move it, and the decision records it needs are now being kept.
