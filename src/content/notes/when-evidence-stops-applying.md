---
title: When evidence stops applying
role: exploration
status: exploration
lifecycle: current
area: software assurance
published: 2026-09-22
lastRevised: 2026-09-22
projects: []
relates:
  - derived-status-is-earned
  - a-reference-architecture-is-a-hypothesis-library
tags:
  - experiments
  - retries
  - evidence
  - decision-making
summary: >-
  A passing retry experiment supports a decision under its tested conditions.
  When the implementation or replay window changes, the old result remains true
  but its use in the new decision needs reassessment.
explorePrompt: >-
  Use this note as a worked example of deciding whether old test evidence can
  support a current operational choice. The transferable question is which parts
  of a passing observation remain useful after the implementation, dependency,
  workload, or operating window changes. In the worked case, a serial SQLite
  retry worker produced one durable effect with an atomic transaction and a
  nine-tick replay window; replay at the ten-tick deduplication expiry produced
  two effects. The first observation stays true for its recorded schedule, but
  it does not authorize the extended window. The prototype also does not
  establish behavior under concurrency, external APIs, or clock skew, nor an
  advantage over a competent runbook. Apply this question to a materially
  different system you know. Name the decision, acceptance measurement, tested
  configuration and schedule, and untested actors or time boundaries. Separate
  the observed result from its present applicability. Identify changes that may
  preserve support after an explicit argument and changes that demand a new
  test; challenge exact condition matching where it would cause needless work.
  Produce a compact decision record with usable evidence, missing challenges,
  and the next test.
draft: false
---

In a disposable SQLite worker, an atomic transaction survived a process exit
between a business effect and the job's completion record. A worker that wrote
those records separately did not: its retry committed a second effect. I counted
rows in the effects table after both attempts, rather than trusting either
worker's exit status.

The atomic worker passed that challenge. It still duplicated an effect when I
replayed the job at the exact tick its deduplication record expired. A test that
had supported replay inside the retention period could not support the extended
window.

**Working model.** An experiment has a result and a set of conditions under
which that result can inform a decision. The result belongs to the history of
the tested system. Applicability belongs to the decision being made now. A
changed condition can withdraw the second without falsifying the first.

## The result has an address

The
[Counterfactual Ops prototype](https://github.com/bayleafwalker/counterfactual-ops)
records the worker version, transaction mechanism, SQLite dependency, workload,
job identity, retention period, replay window, fault schedule, and observation
limit beside a retry decision. For the passing case, the retention period was
ten logical ticks and the replay window ended at tick nine. The observer checked
for exactly one durable business effect for one logical job.

That supports a narrow choice: replay this kind of job under those conditions.
It says nothing about concurrent workers, an external API, wall-clock cleanup,
or power loss. The prototype does not simulate them.

At tick ten, the identity record has expired. The atomic transaction still
protects each attempt, but it no longer lets the second attempt recognize the
first. The extra effect is a counterexample to the extended replay decision. It
does not retroactively make the tick-nine observation wrong.

The same distinction applies when the worker version or dependency changes. The
old run remains a useful record of what that version did. Whether its result can
support the new version is unestablished until the affected conditions are
checked. Exact matching is conservative; a harmless change may require
reassessment too. A person can then explain why it is irrelevant, or run the
missing challenge.

## What this has not proved

The prototype demonstrates that it can preserve a result, reuse it for a related
decision with matching conditions, and withdraw support when those conditions
change. A competent runbook with the same tests and searchable notes can make
the same decisions. I have not established that the prototype prevents more
errors or saves enough investigation and maintenance work to justify a separate
tool.

The next test is comparative: give both workflows the same unfamiliar failure,
related decision, and changed implementation; count missed defects, unnecessary
blocks, active work, and withdrawal errors. Until then, the useful claim is
about the decision record: keep what the experiment observed, and reopen the
decision when the conditions carrying that observation change.
