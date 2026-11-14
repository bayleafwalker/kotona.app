---
title: Keep a neglect ledger
role: operating
status: guiding
lifecycle: current
area: homelab operations
published: 2026-11-13
lastRevised: 2026-11-13
projects: []
relates:
  - a-pipeline-without-a-successor-is-personal-tooling
  - the-check-has-to-fail-first
tags:
  - recovery
  - automation
  - evidence
summary: >-
  Record obligations, renewal evidence and recovery prerequisites for an absent
  operator. Unknown observations remain unknown; a deadline is not an outage
  prediction.
explorePrompt: >-
  Which obligations become uncertain when a system's operator is absent but
  existing automation continues? The worked case implements a read-only ledger
  that records certificate metadata, timer results and bounded receipts against
  an explicit inventory and evaluation cutoff. It separates observed expiry,
  successful renewal, retention limits and proof deadlines. Missing, stale,
  future and source-only observations stay unknown. Recovery follows evidenced
  dependencies only as far as the first unresolved prerequisite; even complete
  current observation coverage cannot predict every future automation outcome.
  Apply that question to a different system you operate. Name the automation
  that would continue, the obligations actually in scope, their observation
  sources and their freshness limits. Identify where the case differs: another
  operator may take over, a renewal may require human approval, or a recovery
  route may be independent of the running system. Challenge any dependency or
  forecast that the available evidence does not support. Produce a small dated
  inventory, one recovery path stopped at its first unknown, and the cheapest
  read-only observation that would resolve it. Keep policy dates distinct from
  observed artifact expiry and predicted failure.
---

If I stop operating a system, its timers keep running. A certificate's current
expiry therefore does not tell me when the service will fail. I need to know
whether renewal still works, what it depends on, and whether I can recover after
that dependency fails.

The neglect ledger records that evidence as a dated snapshot. The collector and
evaluator are implemented in
[AgentOps](https://github.com/bayleafwalker/agentops/tree/c40484751de177c2e85e30f46da9f27f98d0e624).
The operational inventory stays with the private system configuration. This page
contains the rule and its implementation boundary; it has no connection to live
estate state.

## Record the obligation

Each entry names its source revision, evidence reference, freshness limit and
one bounded observation. The collector supports public certificate metadata,
named systemd timers and sanitized JSON receipts. Local certificate and timer
probes require an explicit matching hostname. The inventory cannot supply an
arbitrary command to execute.

The evaluator keeps four kinds of information separate:

| Information                                       | What it establishes                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| Observed expiry                                   | The current artifact's boundary, subject to replacement or renewal.           |
| Successful renewal and prerequisites              | Evidence that automation recently worked, with a bounded observation age.     |
| Retention policy and latest usable recovery point | A conditional limit if no newer usable copy arrives and the policy continues. |
| Review or drill deadline                          | A proof obligation. Passing the date does not predict a service outage.       |

An old successful run does not make the current state known. Neither does an
enabled timer, a declaration in a repository, or a successful execution that
deferred the actual repair. Missing, stale, future and source-only observations
remain unknown. The report carries expected, observed and unknown counts; those
counts refer only to the declared inventory.

## Stop at the first unresolved prerequisite

Recovery paths are ordered declarations with evidence attached to each edge. The
evaluator follows them only while the required observations are available. It
stops at the first blocked or unknown prerequisite and returns that path. It
does not continue through assumed access to produce a reassuring final step.

A cycle in evidenced dependency declarations is reported as a cycle. That does
not establish that a live system is deadlocked. The collector cannot infer an
independent recovery route from the operator having managed to log in last
month.

## Run and retain the result

```sh
python scripts/neglect_ledger.py collect \
  --inventory /private/inventory.json \
  --output /private/observations.json
python scripts/neglect_ledger.py evaluate \
  --inventory /private/inventory.json \
  --observations /private/observations.json \
  --at 2026-11-13T12:00:00Z \
  --output /private/ledger.json \
  --markdown /private/ledger.md
```

The timestamp in the example is an **evaluation cutoff**. Use the observation's
actual cutoff, or omit `--at` to evaluate at the current time. The snapshot is
bound to its inventory digest; a changed inventory requires another collection.
JSON retains the dates, source references and stopped paths. Markdown is a view
over that result.

Normal exit means the calculation completed. `--require-complete` exits with
code 2 when observations are incomplete. Even full observation coverage cannot
predict every future automation result: the report gives conditional boundaries
and leaves the global first-failure forecast unknown.

## Check the refusal paths

The
[fixture tests](https://github.com/bayleafwalker/agentops/blob/c40484751de177c2e85e30f46da9f27f98d0e624/scripts/tests/test_neglect_ledger.py)
exercise expiring certificates with working and failed renewal, stale evidence,
future receipts, seven-day retention, proof deadlines, mismatched inventory
digests and recovery chains. A failed observation must not become availability
because the collection command returned successfully.

The collector does not renew credentials, restart services, prune backups or
schedule itself. Rollback removes the local invocation and generated views;
retain the dated JSON if it explains a decision. The next useful improvement is
a fresh observation of the first unknown prerequisite.
