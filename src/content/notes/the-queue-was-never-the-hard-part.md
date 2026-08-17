---
title: The queue was never the hard part
role: synthesis
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-08-17
lastRevised: 2026-08-17
projects:
  - vuoro
relates:
  - subprocess-not-service
  - the-missing-layer-is-binding-not-intelligence
  - a-platform-capability-does-not-exist-all-at-once
  - the-second-operator-is-the-test
  - why-production-access-changes-the-shape-of-agent-tooling
draft: false
tags:
  - agents
  - infrastructure
  - workflow
  - evaluation
  - postgres
summary: The queue chassis behind ActionQ is now commodity, split across a Postgres-native library, a durable-workflow runtime, an execution control plane, and an automation platform. How much of ActionQ survives once that chassis is removed is the open spike.
explorePrompt: >-
  Use this note as a worked instantiation, not a rule to copy. The
  transferable question: when deciding whether to replace a piece of
  bespoke infrastructure with an off-the-shelf product, how do you separate
  the commodity mechanics worth handing off from the domain-specific
  authority that has to stay local, without collapsing both into one
  feature-count percentage? This instantiation compares a personal
  Postgres-backed action queue against six durable-execution candidates
  across four different product shapes — a thin Postgres-native library, a
  durable-workflow library, an execution control plane, and an automation
  platform — using two separate matrices (existing-responsibility overlap
  versus newly available capability) and a four-role authority model
  (delivery ownership, execution grant, evidence, acceptance) instead of
  treating a candidate's lease as competing with the system's own claim
  proof. It also found that a previously ratified internal decision
  conflicts with part of its own recommendation once read closely, rather
  than confirming it, and left that conflict open instead of resolving it in
  the note's favor. Apply the question to a system you actually maintain.
  Build your own two-pile inventory — commodity mechanics versus
  domain-specific semantics — and check it against any existing decision
  record before concluding anything, the way this note had to correct itself
  after doing that check. Name where your constraints diverge: regulated
  data residency, a team rather than one operator, consequences that can't
  be reverted. Produce a capability split, an authority-boundary rule stating
  which system may decide what, and a minimum-change spike design with a
  named failure-injection list, not a vendor comparison table.
---

`actionq/schema.py` is 1,222 lines. Roughly half of that is schema-compatibility checking machinery that inspects a Postgres schema down to the exact column default expression, the exact status-check constraint, the exact index predicate and null-ordering, and refuses to serve traffic if any of it drifted. There is a separate migration role and a separate runtime role, and the runtime role is denied `CREATE` even if it also happens to own a table, because ownership alone would still grant `ALTER`. I wrote that. It is careful, and it is real work, and none of it is about scheduling agent tasks. It is about making sure the thing that schedules agent tasks cannot silently serve from a schema it doesn't actually understand.

That is the question this note is trying to answer honestly: how much of that is worth building myself in 2026, when a handful of well-maintained projects now sell exactly "durable, Postgres-backed, retryable execution" as their whole pitch. ActionQ is a personal Postgres-backed action queue that dispatches coding-agent work for the Vuoro/Sprintctl ecosystem — `actionctl add/claim/complete/fail/reject/cancel/sweep`, a persistent `actionq-daemon`, and a Vuoro execution adapter that serves the same lifecycle over an authenticated RPC catalog. I read the current source and docs rather than my memory of writing them, then spent a day checking six candidates in depth against primary sources — their own docs sites and GitHub repos, not aggregator posts — plus a wider scan that added four more thinner comparators. Five of the ten are open source; Restate and Inngest are source-available under licenses that say outright they are not open source, and I kept both in the survey anyway because their architecture is too relevant to skip. The finding is not a verdict. It's a boundary: which parts of ActionQ are now commodity, and which parts no candidate I found even has a concept for.

## What's actually in ActionQ today

Splitting the current implementation (not the docs, the code) into two piles:

**Commodity execution mechanics** — the stuff any general-purpose durable-execution product plausibly supplies:

- Enqueue with ascending priority, `FOR UPDATE SKIP LOCKED` claim selection, claim leases with a deadline, `sweep` to requeue expired claims, cancel with a `cancelling`/acknowledge protocol, per-source hourly rate limiting, chain-depth-limited parent/child actions, an append-only event log, a thin CLI and a stdlib-only HTTP facade.
- What's explicitly _not_ there: there is no generic retry policy. The daemon docstring says so directly — "no generic automatic retry, no masking of real failure" — the only retry/backoff in the codebase is a bounded internal retry for publishing audit events, not a task-level policy. There's no priority beyond one integer column. `execution_groups` gives you a batch of actions with a `max_parallel` cap, but the doc is explicit that groups "do not define dependencies, ordering, retries, rollback, group-wide cancellation, or a group terminal result." There is no OpenTelemetry or Prometheus anywhere in the tree — I grepped for it and got nothing. There's no human-approval gate. Pause/resume for a stalled harness is "checkpoint-and-fail plus re-dispatch," not a real suspend.

**Vuoro-specific semantics** — the part that isn't a queue feature at all:

- Ed25519 `runner-auth/v1` proofs binding operation, resource, request id, and a validity window to a specific registered runner identity, with the explicit documented caveat that this still doesn't fence terminal `complete`/`fail`/`reject` — `claimed_by` is metadata, not claimant proof, for those three.
- A durable, three-part invocation record (`invocation.requested` → the lifecycle event → `invocation.decided`) where the _envelope_ succeeding and the _nested domain decision_ succeeding are different things, and callers must check `result.decision.status`, not just the RPC status.
- Session binding (`session.*` events), evidence and settlement (`git_evidence.py`, a content-addressed `artifact:sha256:<digest>` store, a `publication-receipt/v1` that binds a Git source/candidate commit and tree OID to that artifact reference and _is_ the terminal `result_ref`), and the migration/authority separation described above.

Every item in the second pile is implemented and covered by an integration gate, not aspirational — the portable-runner and schema-migration docs describe verification evidence and a gate that actually starts an isolated Postgres cluster to prove the role separation holds. That is test exercise, not production exercise, and the same caveat applies to the first pile with more weight: an internal review a few weeks before this survey found that the fenced-renew and sweep-requeue design specifically — the lease/heartbeat/expiry machinery in the commodity pile — had not yet fired against live traffic at all. It lowers the switching cost for exactly the part this survey argues is replaceable: the less a piece of bespoke machinery has actually been proven under real failure, the less there is to lose by handing it to a candidate that has.

## The market is easier to compare once I stop calling all of it a queue

My first pass compared six products feature by feature. That was useful for finding factual gaps and not very useful for making the decision, because the candidates are solving different-sized problems. PgQueuer wants Postgres to remain a job queue. DBOS turns ordinary application code into durable workflows. Hatchet supplies a separate execution control plane. Windmill supplies most of an automation platform. Temporal is the mature durable-workflow benchmark. Restate changes the persistence and execution model more fundamentally again. Putting all six in one checklist rewards the biggest product for having the most checkmarks, which is not the question ActionQ needs answered.

The useful comparison has three parts: what ActionQ does today, what adopting the candidate would add, and which system becomes authoritative for what. The last one matters most.

### The thin replacement: PgQueuer

PgQueuer is the candidate I would test first. It is Python, MIT, and Postgres-native. Workers claim jobs with `FOR UPDATE SKIP LOCKED`. It has priority, database-wide concurrency limits, delayed execution, database-backed retries, stale-worker recovery, completion tracking, Prometheus metrics, and tracing. Its 1.x contract is explicitly trying to be a production task queue rather than a workflow platform.

That makes it useful for an almost embarrassingly simple reason: it can test whether ActionQ's queue chassis can disappear without changing the architecture around it. It does not need to understand Vuoro claims, acceptance decisions, or publication receipts. A job payload can carry an attempt identifier. PgQueuer decides which worker receives that job. The runner still verifies the authority attached to the attempt, produces evidence, and returns a result to a different system that decides whether the work counts. That is a cleaner test than asking a full workflow engine to impersonate ActionQ.

Procrastinate remains a credible second example of the same category — priority, task retry strategies, and Postgres-backed dispatch — but recovery of jobs abandoned by a dead worker is something the application has to arrange using its stalled-job APIs, not something it does for you. Its maintainer has kept a [public discussion open since February 2023](https://github.com/procrastinate-org/procrastinate/discussions/748) asking for co-maintainers, still active in early 2026, which is bus-factor information worth recording. It would be unfair to read that as development having stopped; the current release line keeps adding features. It just means PgQueuer, not Procrastinate, is the closer like-for-like swap for what `actionctl`'s claim/sweep/complete surface already does.

River is the Go analogue worth naming alongside it: MPL-2.0, Postgres-native, transactional enqueue against the app's own database, and — as far as I found — no open bus-factor discussion of the kind Procrastinate has. It doesn't change which category wins the thin-replacement slot, since ActionQ and its adapter surface are Python; it just confirms the category itself is crowded and healthy across language ecosystems, not one library's accident.

### The durable-library replacement: DBOS

DBOS tests a larger change. Instead of replacing only `add`, `claim`, `sweep`, and settlement plumbing, it asks whether an agent attempt should simply be a durable workflow stored in Postgres. Its queue already supplies concurrency and rate limits, priority, partitioning, and deduplication. Workflow execution is persisted in the system database, and current DBOS has two explicit, documented answers to code evolution — rather than the fork-to-patched-code workaround I originally read it as. [`DBOS.patch()`](https://docs.dbos.dev/python/tutorials/upgrading-workflows) returns `True` for workflows started after a breaking change and `False` for workflows started before it, so a conditional can branch safely. Separately, every workflow is tagged with the application version it started under — by default a hash of the source, optionally set explicitly — and recovery only resumes a workflow whose tagged version matches the currently running version, which is the actual mechanism that prevents an old workflow from being recovered against code that no longer agrees with it. OpenTelemetry spans are emitted directly by the runtime.

Operationally that is attractive because the minimal shape is still an application process plus Postgres. The qualification is distributed recovery: a self-hosted deployment can recover workflows without Conductor, but coordinating recovery across several executors becomes an operator responsibility, and Conductor's self-hosted distribution is proprietary with a one-executor free tier. That does not make DBOS unsuitable here — it makes the spike useful: how much durable-execution machinery do I actually need before paying that operational or licensing cost?

### The execution control plane: Hatchet

Hatchet is the strongest candidate if the boundary wanted is not a library but a maintained execution service. It is MIT, Postgres-backed, and self-hostable, with tasks, priorities, retries, concurrency policies, rate limiting, DAGs, and durable tasks, plus a web UI in the open-source product itself rather than left to a separate commercial layer. Observability is native but split across several explicit flags rather than one switch: `SERVER_PROMETHEUS_ENABLED` for the metrics endpoint, `SERVER_OTEL_METRICS_ENABLED` and `SERVER_OBSERVABILITY_ENABLED` for the worker-to-engine OTel collector service and REST trace endpoints, and engine trace export specifically has no boolean at all — it activates the moment `SERVER_OTEL_COLLECTOR_URL` is set.

Two more in this category are worth naming rather than spiking. Trigger.dev is Apache 2.0 and markets itself directly at agent and workflow deployment rather than generic background jobs, though its self-hosting footprint is heavier than PgQueuer's or DBOS's — Postgres plus Redis plus ClickHouse plus object storage, not just an app process and a schema. Inngest is also source-available with a delayed conversion to Apache 2.0, though via SSPL rather than BSL — a different license with a different mechanism from Restate's, arriving at the same practical place — and its self-hosted default store is SQLite, with Postgres only an optional addition since January 2025 rather than the native model. Neither adds a fifth shape of product to this survey; they're evidence that the execution-control-plane category is now specifically courting AI agent workloads, which Hatchet already represents here.

The cost is architectural rather than a missing feature: Hatchet becomes another service with its own execution history, worker model, and control surface. That may be exactly right if Vuoro wants a pluggable execution plane. It is unnecessary if replacing the ActionQ queue only needs a maintained implementation of the Postgres mechanics already there — which is why Hatchet moves behind PgQueuer in the spike order, not because it is less capable but because it answers a bigger question than the one currently open.

### The platform-shaped alternative: Windmill

Windmill belongs in this survey because an earlier ActionQ plan already anticipated it as a possible execution backend, and the first version of this note skipped comparing it directly. Its self-hosted architecture is recognizably compatible with this environment — Postgres holds the job queue and state, server processes expose the API, worker processes execute jobs — and its flows add branching, retries, suspension, and human approval on top.

It also demonstrates why "has the feature" is not enough. Current Self-Hosted Enterprise packaging puts several of the most relevant controls behind the commercial tier, including priority, concurrency limits, richer approval restrictions, and the listed Prometheus/OpenTelemetry observability features. More fundamentally, Windmill already wants to own scripts, flows, workers, permissions, execution history, and operator interaction — substantially more product than ActionQ is. That could be an advantage if the goal were an internal automation platform. It is probably the wrong-sized tool if the goal is only to stop maintaining queue mechanics while Vuoro remains the control plane — and this isn't a new conclusion: an earlier internal backlog decision already records Windmill as not adopted and the single-queue boundary parked until an external runtime is selected, for essentially this reason.

### The maturity benchmark: Temporal

Temporal stays in the survey without needing to win it. It establishes what the mature end of durable execution looks like — execution history survives process and infrastructure failure, and workflows resume from durable state rather than an ad-hoc retry protocol — and it's a useful guard against treating a feature as novel merely because a smaller candidate just added it. For ActionQ, adopting Temporal means choosing a dedicated durable-workflow platform, with its own server cluster and persistence store, when the current implementation is a small Postgres-backed queue. I would want a workflow requirement PgQueuer or DBOS demonstrably cannot satisfy before making that jump.

### The different-state-model comparator: Restate

Restate is the most interesting candidate here that I would not call open source. Its server ships under BSL 1.1, and the license says outright that BSL "is not an Open Source license." The additional-use grant is permissive enough for this case — internal deployments and ordinary production use are covered — it just forbids reselling Restate as a managed platform to third parties, and each release converts to Apache 2.0 four years after it ships.

Technically it is still worth following. Durable execution, stateful functions, and reliable RPC are core primitives rather than queue add-ons, Restate 1.7 introduced a new virtual-queue scheduler, and Prometheus metrics and OTLP tracing are native self-hosted capabilities — that part of my first pass had it backwards. The new flow-control work should not be overstated, though: concurrency limiting has landed, while rate limiting and priority are still described as staged follow-ons in Restate's own OSS roadmap. The bigger difference is persistence — a single Restate node is one binary with its own durable local storage, and a distributed deployment brings Restate's own replicated store rather than another way to use the Postgres schema everything else already lives in. That is enough of an architectural change that I would use Restate as a comparator for where agent-oriented durable execution is heading, not as the first ActionQ migration target.

## Two matrices, not one

Both matrices below cover only the four candidates that are realistic adoption targets for ActionQ's own shape — PgQueuer, DBOS, Hatchet, and Windmill. Temporal, Restate, and the four thinner comparators are deliberately not columns here; they were compared in prose above, not scored, because none of them is a serious near-term fit for the reasons already given.

The first matrix covers only capabilities ActionQ actually owns today:

| Existing ActionQ responsibility     | PgQueuer               | DBOS                                                   | Hatchet            | Windmill                                          |
| ----------------------------------- | ---------------------- | ------------------------------------------------------ | ------------------ | ------------------------------------------------- |
| Postgres-backed queued dispatch     | native                 | native                                                 | native             | native                                            |
| Priority                            | native                 | native                                                 | native             | commercially tiered for the relevant flow control |
| Worker-loss recovery                | native                 | native, cross-executor coordination varies by topology | native             | native                                            |
| Cancellation                        | adapter check required | workflow-native                                        | native             | native                                            |
| Execution/history read surface      | basic                  | basic locally, richer with Conductor                   | native UI/API      | native UI/API                                     |
| Existing Postgres operational shape | almost unchanged       | almost unchanged                                       | additional service | additional server/worker platform                 |

The second matrix is explicitly **capability gained**, not replacement evidence — none of these rows exist in ActionQ today, so nothing here is being ported, only made available:

| Capability ActionQ does not substantially own | PgQueuer       | DBOS                           | Hatchet                              | Windmill                                     |
| --------------------------------------------- | -------------- | ------------------------------ | ------------------------------------ | -------------------------------------------- |
| Generic task retry policy                     | native         | native                         | native                               | native                                       |
| Durable intra-workflow checkpointing          | absent         | native                         | native                               | native workflows-as-code                     |
| DAG / workflow composition                    | absent         | native                         | native                               | native                                       |
| Rich rate/concurrency controls                | partial        | native                         | native                               | tier-dependent                               |
| Workflow code evolution                       | n/a            | patching + versioning          | evaluate in spike                    | versioned flow deployments                   |
| Human approval / suspension                   | absent         | build from workflow primitives | build from workflow/event primitives | native                                       |
| OTel execution tracing                        | native adapter | native                         | native                               | tier-dependent in packaged self-host product |

The split matters because adopting DBOS does not "replace" ActionQ's workflow versioning — ActionQ never had workflow versioning. DBOS makes an architectural capability available that may remove the reason to invent it later. Collapsing both matrices into one, as my first pass did, produces a number like "commodity two-thirds of ActionQ" that has no honest denominator: several of the most attractive capabilities in these products are things ActionQ does not currently do, not code they can replace.

## The authority model gets simpler if the runtime is allowed to be a runtime

I originally treated a candidate's lease and ActionQ's runner proof as competing answers to the same question — two authorities that would need reconciling before any of this could be adopted cleanly. I think that model was wrong. They are not necessarily the same question:

```text
execution runtime:      which worker currently owns delivery?
Vuoro:                  which principal may execute this attempt?
runner / evidence layer: what actually ran, and what evidence resulted?
acceptance authority:   does that result satisfy the work?
```

A PgQueuer lock, a Hatchet assignment, or a DBOS executor identity can be perfectly authoritative for delivery without carrying any authority to mutate the target. A valid Vuoro execution grant does not entitle a worker to tell the queue that somebody else no longer owns the delivery lease. The integration requirement is not to merge the two authorities into one. It is to make sure crossing one boundary cannot silently satisfy the other:

```text
dangerous:  runtime says complete -> work becomes accepted

useful:     runtime delivers attempt
            -> runner verifies scoped authority
            -> effect produces evidence / receipt
            -> runtime records execution finished
            -> independent domain settlement accepts or rejects the result
```

That keeps the execution engine replaceable.

## What probably should not survive ActionQ

That correction changes how I read some of ActionQ's most careful code. The exact Postgres compatibility checker, migration ledger, and role separation are a good implementation of one real rule: runtime code must not quietly operate against persistence it does not understand or have migration authority over. They are not necessarily things to migrate. If PgQueuer owns its tables, DBOS owns its workflow schema, or Hatchet owns its engine schema, the detailed checks for column defaults, index predicates, and status constraints disappear with the schema they were protecting. I should keep the invariant wherever I still own data, and delete the machinery whose only purpose was safely owning the queue database.

The same pressure applies to the more interesting residue. Signed execution authority belongs naturally with Vuoro or its policy boundary. Session and publication evidence belongs with the runner/evidence system. `invocation.requested` and `invocation.decided` describe the governed attempt and its decision, not the algorithm that selected the next database row. Finding that no candidate implements those exact contracts is not evidence that ActionQ should retain them. It is evidence that ActionQ has been their accidental home.

## A ratified decision already disagrees with part of this

A ratified dispatch program already parks a deferred wave for exactly this question, and reading it closely surfaces a real conflict rather than a confirmation. It gates an external runtime on two conditions — an operator selecting one, and a named evidence corpus containing "content-addressed normal, denial, cancellation, and abrupt-failure scenarios" — and then states: "any implementation remains coordinator-owned and must preserve ActionQ as the only claim/retry/cancellation-settlement/verification/publication authority."

That clause agrees with this survey on settlement, verification, and publication: those stay with ActionQ or its successor under every candidate examined above, for the reasons the authority section gives. It disagrees on claim and retry. The PgQueuer spike proposed here hands exactly those two — "PgQueuer decides which worker receives that job" — to the candidate, on the theory that delivery ownership and execution authority are different questions. The ratified clause treats claim and retry as part of the authority ActionQ must keep. One of these positions is wrong, or the distinction this survey draws between delivery and authority needs to be argued to whoever owns that clause, not asserted past it. That's a conflict for an operator decision, not something this note can resolve by publishing a stronger paragraph. The evidence-corpus condition is also close to free: the failure scenarios this survey's spikes already propose testing — a worker dying mid-delivery, a lost response after an external effect, re-delivery, a stale runner identity, replayed settlement — are close to what that corpus asks for, so a spike run in that shape produces evidence for both purposes at once.

A separate, more informal thread from recent working sessions suggests DBOS specifically has been discussed as something to evaluate only if a named ActionQ failure occurs, rather than proactively. I could not find that as a ratified, citable decision the way the Wave 6 clause is — it may exist somewhere I can't currently reach, or it may be closer to a proposal than a policy. I'm noting it because if it does hold as stated, it's a reactive trigger this survey's proactive framing sits in tension with: a market survey can find a strong candidate before anything breaks, but a failure-gated policy exists because migrating working infrastructure on spec has its own cost, independent of the candidate's quality. Either way, the spikes below are worth running as evidence-gathering. Whether they're also grounds to authorize a cutover is a narrower question this survey doesn't get to answer on its own, especially given the claim/retry conflict above.

## What to spike

Two experiments, in this order. **PgQueuer first:** replace the queue chassis while preserving the existing attempt, authority, runner, and settlement contracts outside it. This is the minimum-change test — if it works, a large part of ActionQ can disappear without first adopting durable workflows as a new architecture. **DBOS second:** model the same attempt as a durable workflow and test whether its stronger recovery and versioning primitives remove enough surrounding machinery to justify the larger semantic change.

Both experiments should deliberately separate delivery ownership from execution authority: kill a worker after it acquires delivery, lose a response after an external effect, re-deliver the attempt, present a stale or wrong runner identity, replay terminal settlement, upgrade the worker code while an attempt remains live. Success is not that the task eventually finishes. It is that the runtime can fail, retry, and reassign work while only the currently authorized attempt can produce a settlement Vuoro accepts.

Hatchet becomes the third experiment only if a separate execution control plane proves desirable on its own terms. Windmill is the comparison to revisit if the need grows from agent execution into a wider internal automation platform. Temporal remains the mature reference. Restate remains the architecture worth watching.

## The boundary the survey actually established

The queue was indeed not the hard part, but I cannot defend a percentage of ActionQ that has become commodity. What is clear is narrower: the queue chassis no longer justifies bespoke ownership. Postgres-backed scheduling, priority, crash recovery, retry, concurrency control, and usable observability are maintained elsewhere now, competently, by more than one project.

The open question is how much of ActionQ survives after the queue chassis is removed. The current evidence points toward a smaller answer than "ActionQ with a different backend," though the ratified claim/retry boundary above means that answer isn't mine to finalize from a survey alone. Attempt identity, scoped execution authority, domain accept/reject decisions, and independently inspectable evidence belong above and beside the execution runtime, not inside a queue product. The next experiment should test whether ActionQ can be deleted rather than assume it should be ported — which is also a reason to ask why the hard part has been living in a repository named `actionq`.
