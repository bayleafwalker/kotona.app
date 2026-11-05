---
title: The fallback played the games
role: project-history
status: guiding
lifecycle: current
area: model evaluation
published: 2026-11-05
lastRevised: 2026-11-05
projects: []
relates:
  - intelligence-has-a-lifecycle
  - the-router-was-larger-than-the-model
  - what-107-isolated-completions-did-not-show
  - the-audit-trail-can-suggest-the-next-action
draft: false
tags:
  - agents
  - games
  - evaluation
  - fallbacks
  - observability
summary:
  Twice in one day the game AI's scoreboard credited a language model with games
  its deterministic fallback had played. The arena now labels such arms "not a
  model result"; when an outage repeated the failure the next night, the report
  said so before anyone read the win rate.
explorePrompt: >-
  Investigate whether an evaluation attributes an outcome to the component that
  actually produced it. In the worked game-arena history, a deterministic
  selector kept matches running when model requests failed. Finished games
  initially looked like model wins; explicit delivery tallies and a configurable
  failure threshold later marked affected arms as not model results and refused
  their adoption evidence. A subsequent outage tested the reporting change,
  while the partial-participation case remained open. Apply the question to a
  different system with fallback, caching, retries or substitution. Identify the
  outcome denominator, the decision-level producer record and the difference
  between successful service behavior and evidence about one component. Produce
  a provenance table, an attribution rule written before the next run and an
  outage or substitution test. Challenge the transfer where mixed participation
  is the intended product, where decision importance is uneven, or where the
  fallback changes the outcome distribution. Keep original failed cases visible,
  explain any rerun rule before seeing its results, and avoid converting absent
  telemetry into proof that the named component participated.
---

On 29 September agent sessions ran the game AI's language-model strategist
through several models in the same seeded arena at my direction. The strategist
picks a playbook and sets its parameters; a deterministic selector is the
baseline and, when a model call fails, the fallback. The game and the strategist
layer are described in [an earlier note](/notes/intelligence-has-a-lifecycle/).

Two scoreboards that day credited a model with three wins in four games.

The first was `claude-opus-5` through the API. Every one of its 139 strategy
requests was refused with `invalid_request_error`, because the key was not
scoped to a workspace. The selector played all four matches.

The second was Kimi K2.7 Code through a local forwarder. 141 of its 144 calls
timed out, with a median upstream latency of about 57 seconds, and three
proposals landed. The selector played almost every decision in those games
([pilot record](https://github.com/bayleafwalker/bindery-ra2-adapter/blob/bd3f79842bb1223f446a86ce006233e8eb6ccda2/docs/results/2026-09-29-claude-transfer-pilot/PLAN.md)).

Nothing in either scoreboard said so. The games ran, the arena scored them, and
the fallback did what it is for.

## What I expected

A model comparison: the same strategist prompt, the same seeds, wins reported
per model. I expected weaker models to lose games, not to disappear from them.

## What was observed

The fallback is correct behaviour for a live match. A strategist that stalls for
a minute must not stall the game, so the selector takes over and play continues.
That design is right, and it is exactly what made the results wrong: from the
arena's point of view, a model that never answered and a model that played well
produce the same kind of finished game.

The two failures had different mechanisms. The unscoped key failed every call
from the first; the slow model failed most calls and landed three. Both left the
same trace in the win rate, which was none.

The report already counted fallback proposals in their own column, apart from
the strategist's, so that they could not flatter the model under test. The
column sat beside the win rate and did not stop anyone reading the win rate.

The win rate is still wins divided by games. Attributing it to a model requires
another record: which decisions the model actually made and where the fallback
took over. A finished game alone cannot answer that question.

## The fix

The fix that evening added a verdict. An LLM arm whose pooled model-call failure
rate exceeds the configured limit, 20% by default in that change, is labelled
"not a model result" in the results table and in the summary line
([commit](https://github.com/bayleafwalker/bindery-ra2-adapter/commit/1498d6df9e7cff10208b6d2a42ca8e87f68d9db5)),
and delivery, answered against failed calls, sits beside the wins. Such an arm
never counts as adoption evidence.

The counts needed fixing as well. A third Opus attempt, with the workspace
header set, did play its four matches. Its first tally said 210 strategy
proposals; the log said 201. Six failed records had been read as failed calls;
one was an API failure and the other five were superseded or no-opinion
responses, which are different populations with different remedies. An
independent review corrected both miscounts in the record.

## The second time

During the overnight 30 September–1 October run comparing `gpt-6-luna` with the
selector on the contested benchmark, the local forwarder hit its two-hour
background limit at about 23:41 and was restarted within a minute. Eight Luna
matches ran through the gap with every model call failing: no proposals, 22 to
85 failed calls each. The selector played those games from start to finish.

This time the report said so before anyone read a win rate: not a model result,
352 of 999 calls failed
([outage record](https://github.com/bayleafwalker/bindery-ra2-adapter/blob/bd3f79842bb1223f446a86ce006233e8eb6ccda2/docs/results/2026-09-30-luna-contested/OUTAGE.md)).

The pre-registration had said to count every played cell, including cells with
failed or late proposals. That clause was written for occasional failures. A
cell in which the model made no decision is not a comparison between the model
and the selector, so before the rerun the outage record fixed how the result
would be read: delete the eight Luna records and rerun exactly those cells, and
also report the literal reading and the 22 unaffected cells. All three readings
landed in the same branch of the rule, parity, with Luna winning 7 of 30 cells
and the selector 10
([results](https://github.com/bayleafwalker/bindery-ra2-adapter/blob/bd3f79842bb1223f446a86ce006233e8eb6ccda2/docs/results/2026-09-30-luna-contested/RESULTS.md)).

## What changed

The rule I am keeping is that a fallback may take over silently in play and
never silently in evaluation.

The label handles the silent case. It does not settle the partial one, a game in
which the fallback made some of the calls. Whether a share-of-decisions
threshold is the right instrument there, or whether arena runs should disable
the fallback and score a failed call as a loss, is still open.
