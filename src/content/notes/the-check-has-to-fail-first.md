---
title: The check has to fail first
role: operating
status: guiding
lifecycle: current
area: software assurance
published: 2026-11-05
lastRevised: 2026-11-05
projects:
  - vuoro
relates:
  - layering-you-cant-violate-by-accident
  - when-evidence-stops-applying
  - derived-status-is-earned
  - intelligence-has-a-lifecycle
  - a-model-portfolio-is-not-a-workflow
draft: false
tags:
  - verification
  - evaluation
  - testing
  - agents
summary: >-
  A passing oracle, validator or benchmark counts as evidence only after the
  same record shows it rejecting the baseline or a broken input. Oracles that
  failed on untouched code made one comparison readable; an unchecked benchmark
  nearly promoted a playbook.
explorePrompt: >-
  Examine what a passing check actually establishes before using it to accept,
  compare or promote work. The worked cases bind a frozen instrument to a
  rejecting control: task oracles failed on the untouched source before six
  candidate passes, a removed response validator exposed a forbidden value, and
  a playbook promotion was reversed when the decision rule consumed results from
  a benchmark outside its declared useful range. The code tasks establish narrow
  correctness, not a general model ranking. Apply this to a different validator,
  experiment or release decision. Choose the control that tests the intended
  claim; an existing valid baseline need not fail, but a deliberately broken
  input must expose the relevant defect. Name which instrument and expected
  outcomes are frozen before candidate results, and put comparison calibration
  inside the decision rule. Produce a compact evidence record, one useful
  negative control and the action taken if it fails to discriminate. Challenge
  this method where a control covers an unrepresentative mutation or validates
  only copied results rather than their sources. State what remains untested and
  how a mistaken earlier decision would be corrected visibly.
---

On 3 November I commissioned an agent-run comparison of three coding runners on
the same two tasks against `agentops` at a pinned commit: OpenCode with Kimi
K2.7 Code, Codex requesting `gpt-6.1-terra`, and Claude Code with Sonnet 5.5.
Each task came with an oracle script, hashed and frozen before any model saw the
task. Before the first model run, both oracles ran against the untouched
checkout and failed on their task-specific assertions. Then all six candidate
runs passed, and on the second task the three runners produced byte-identical
diffs
([evidence](https://github.com/bayleafwalker/agentops/blob/b3e9241e4775a1ad5297af9b446252ca5e0c9681/docs/evidence/2026-11-03-routing-comparison/repo-tasks/README.md)).

The baseline failures show that these oracles distinguished the requested
changes from their absence. An oracle that already passes on untouched code
cannot establish that the candidate supplied the missing behavior. The identical
diffs mark the other limit: the oracle discriminated the change, not the models.
Six passes on these two small tasks do not establish a general model ranking,
and the evidence record says so.

## The rule

Before citing a pass, a ranking or a promotion, make the same record show the
instrument rejecting an input it should reject: the untouched baseline, a
deliberately broken input, or, for a benchmark, a measured ability to separate
the arms. The record also says which failure the control demonstrated.

None of this is new. It is the red step of test-driven development, mutation
testing, the negative control in a lab protocol and the ceiling effect in
benchmark design. What changed is the price of skipping it. A coding agent
writes a plausible passing check faster than I can read one, and when the same
session writes the change and its test, an inert test is an ordinary outcome
rather than a rare accident.

## Why it exists

On 30 September the game AI's arena tested an induced playbook against the
deterministic selector under a rule written before the run. The candidate was
better than the selector on five paired held-out cells and worse on one, and the
rule said promote. The arena's own report had flagged the benchmark as
saturated: the selector scored 0.750, outside the run's declared 30–70% useful
band. The pre-registration had not named a benchmark, the default ran, and the
flag was missed when the rule was applied
([results](https://github.com/bayleafwalker/bindery-ra2-adapter/blob/bd3f79842bb1223f446a86ce006233e8eb6ccda2/docs/results/2026-09-30-induced-playbook-test/RESULTS.md)).

The correction landed after merge: not promoted. A free diagnostic afterwards,
on training maps and against opponents partly used to tune the selector, decides
nothing but shows why the call mattered. Against live bot styles on the
contested benchmark the fixed playbook won 15 of 60 cells and the selector 55.

The rule had been written in advance and applied as written. It never asked
whether the instrument under it could say no.

## Scope

Any check whose pass I would cite: task oracles, response and schema validators,
architecture tests, network policy tests, results validators and benchmarks. A
check that only gates a local edit loop and is never quoted as evidence does not
need the ceremony.

## Implementation

The record that carries the pass also carries:

- the instrument's identity, as a hash or commit, and when it was frozen
  relative to the first candidate run;
- the control input and the observed rejection: the failing assertion, the exit
  code, the refused field;
- what the control demonstrates and what it does not;
- for a comparison, the discrimination check written into the decision rule, not
  left beside it as a report line.

The last item is the one the playbook test lacked. A warning in the report sat
next to the number the rule consumed, and the rule consumed the number.

Other cases in the estate have the same shape:

- In the Vuoro contract qualification of 23 October, removing the generated
  response validator let an unknown lifecycle value through as an HTTP 200, and
  the qualification guard rejected the run
  ([record](https://github.com/bayleafwalker/vuoro/blob/7b2181ea285dd17ec8fd60c7533ca0ff0cb96fce/docs/experiments/ec00-qualification/README.md)).
  That is the evidence that the validator, rather than the transport, does the
  rejecting.
- The guest egress module in the 29 October service plan has two local proofs.
  In the namespace proof, four deliberately weakened policies failed their
  intended checks; the VM proof added positive reachability controls. The
  namespace proof covers IPv6 packets and the VM proof does not, and the record
  says which
  ([plan](https://github.com/bayleafwalker/agentops/blob/b3e9241e4775a1ad5297af9b446252ca5e0c9681/docs/plans/agentops/2026-10-29-operated-agentic-service.md)).
- The results validator for the 3 November synthetic comparison fails when one
  recorded correctness flag is flipped. That control shows it catches a recorded
  verdict that disagrees with the recorded answer. The error that mattered came
  from elsewhere: a source audit against the raw thread and HTTP response found
  the two T1 arm results transposed in the hand-assembled file, a comparison the
  validator never makes
  ([source correction](https://github.com/bayleafwalker/agentops/blob/b3e9241e4775a1ad5297af9b446252ca5e0c9681/docs/evidence/2026-11-03-routing-comparison/synthetic/README.md)).

## Validation

A cited result satisfies the rule when the control's failure predates the first
candidate result in the same record, a comparison's decision rule names its
discrimination check, and the record states what the control did not cover.

## Failure

If the required control fails to reject — the change oracle accepts the
untouched baseline, or the benchmark cannot separate arms as its declared
calibration requires — the candidate run cannot support the intended claim. Fix
the instrument, freeze it again, rerun the control and only then the candidates.
Do not reinterpret candidate passes afterwards.

If a decision was made on an unchecked instrument, correct it in the same record
with a dated correction and keep the original call visible, as the playbook
result does.

A control covers the mutation someone thought to make. Whether a set of controls
resembles the ways the work actually goes wrong is the question mutation testing
has never fully answered, and this rule does not answer it either.
