---
title: The log is the system
date: 2026-05-15
tags: [architecture, event-sourcing, audit, design]
summary: A speculative architectural thesis on databases that have no state, only a log — and a practical registry discipline that lifts some of the same benefits without committing to the substrate.
---

# The log is the system

Most databases are state machines that happen to keep a log. This post is about the opposite arrangement: a log that happens to materialize state machines on demand. The first three quarters are speculative — I don't think anyone should build the thing I'm describing without a much sharper application than I currently have. The last quarter is practical and worth doing regardless: operator contract registries in two modes, with the soft mode being broadly useful and the hard mode being the audit-grade primitive that nothing in the current market assembles cleanly.

The thesis is short enough to fit in a sentence, but the sentence is dense and the implications are not obvious, so I'll build up to it.

## What conventional databases don't do

Take a regulated reporting pipeline. Insurance, financial markets, anything where "show us how you produced this number on this date" is itself a deliverable rather than a compliance afterthought. The question isn't whether the data was correct. The question is whether you can reconstruct the production of the number from inputs the regulator can independently verify, through transformations whose logic the regulator can independently inspect, in an environment that produced a defensible answer at the time the answer was reported.

Conventional databases do roughly half of this. They store the inputs and the outputs, often with versioning, sometimes with snapshots. They do not store the transformations as first-class data. They do not store the environment those transformations executed in. They do not bind a particular output to a particular version of the producing logic in a way that survives the code being rewritten three releases later. The pattern is: data is in the database, code is in git, and the connection between the two is whatever your deployment system happened to record at the time, which is usually less than you wanted and almost never enough.

dbt with versioned SQL and warehouse snapshots gets you most of the way for pure SQL pipelines. EventStore and similar event-sourcing platforms get you most of the way for user-level events. Datomic goes further on immutable history than almost anyone in production. But all of these draw the same line: user data and analytical models are reproducible artifacts; everything else — code, environment, control plane, physical layout — is operational metadata, treated as roughly trustworthy but not as first-class data.

That line is the part I want to challenge. Not because most systems should challenge it, but because the systems where the challenge is worth taking seriously are exactly the systems with the strongest audit requirements, and those systems are the ones currently underserved.

## The thesis

The thesis is:

> The system has no state. It has a log, and everything else is a recomputable opinion about what the log means — including the system's own physical layout, its own operators, and its own control plane.

Three commitments fall out of that sentence.

**The log is the only authoritative memory.** Entity caches, projection layouts, normalized columnar stores, indexes, materialized views, even the running operators themselves: caches. Wipe them, rebuild from the log, the system is bit-identical to what it was before the wipe. This is the strong form of event-sourcing — not "we keep an event log for audit," but "the log is canonical and nothing downstream of it has independent authority." A snapshot is a cache, not a source of truth. A projection layout is a cache, not a source of truth. The arrival of the data, durably committed, is the system's only real claim about what happened.

**The code that runs the system is data inside the system.** Operators — splitters, normalizers, projection builders, anything that transforms inputs to outputs — are content-addressed artifacts referenced by the log. The log doesn't just say "an event arrived"; it says "an event arrived, and these operator versions are bound to process it." When you "deploy a new version," what you actually do is log a binding change. The runtime instantiates operators from cold storage on demand, looking up the binding at the relevant offset. There is no "currently deployed splitter" anywhere in the system. There is only "the splitter bound to this stream at this offset, per the binding log, instantiated from the blob it references." The distinction between code and data dissolves at the architecture boundary.

**Physical layout and control plane are part of the log too.** The decision to place this cell on this node, to promote that projection to hot tier, to evict cold segments to archive storage — these are events. They land in the same log as user data, split into placement state, project into the current physical layout. There is no separate control plane "managing" the database. The control plane is another consumer of the same log, producing physical-layout state the way a splitter produces normalized state. `EXPLAIN PLACEMENT` is a query against the placement projection. Rebalancing is an event. Rolling back a bad rebalance is logging a different event.

The recursive part is what makes this distinctive. Most ambitious event-sourced systems stop short of this; they event-source the user data and exempt the system itself. This thesis doesn't exempt anything that doesn't have to be exempt.

## What this collapses

A stack of distinctions that conventional databases hold sacred turn out to be the same thing under this design.

Code versus data, because operators are content-addressed entries in the log.

Control plane versus data plane, because control decisions are events on the same log as user data.

Schema versus instance, because schema-defining entries (operator bindings, integration contracts) are events that are processed by the same machinery as the events they describe.

Configuration versus content, because configuration changes are logged events.

Deployment versus query, because what people call "deployment" is a binding change, and what people call "the running system" is a query result: a materialization of the log's current implications, computed by the same machinery that materializes user-level projections.

Runtime state versus stored state, because there is no runtime state that isn't a function of the log. Restart the entire system from cold storage, replay, you have the same running configuration, the same operators bound, the same physical layout, the same active flows.

Everything in the system is an event. Everything else in the system is a function of events. That collapse is the thesis's payoff: one substrate, one set of primitives, one model of authority, one set of operational concerns. It's not "many systems each with their own audit story." It's one system whose audit story is the only thing the system does.

## What this commits you to

This is where the speculation has to admit its costs honestly.

There is an irreducible operational surface that the log cannot include without infinite regress. Something has to be able to read the log to start reading the log. Something has to be able to write to storage to make the log durable. Something has to be able to emit external effects — sending an email, writing to a third-party API, calling a regulatory submission endpoint — and those effects either fire on replay or they don't, both of which have problems. Something has to authenticate the entity that's authorized to insert a manual correction or supersession event, because the authorization decision cannot itself be purely log-derived without a chicken-and-egg dependency.

Call this surface the kernel. The kernel is storage drivers, bootstrap, external-effects emitter, and identity. That's the entire non-log surface of the system. Everything above the kernel is event-sourced. The kernel is small, well-defined, and security-critical in the way operating system kernels are; the architectural discipline is to treat it that way explicitly.

The kernel split is worth naming because most ambitious audit systems fail by not drawing it. They start with "everything will be event-sourced" and then accumulate side channels — operational backdoors, manual hot-fixes, configuration that lives somewhere else, secrets management that wasn't on the diagram. Each addition is defensible on its own; cumulatively they degrade the audit claim until the system's promises stop meaning what they sound like. The discipline isn't avoiding the kernel. It's naming the kernel precisely, keeping it small, and making sure nothing outside the kernel quietly becomes part of it.

The second commitment is to lineage on every artifact. The thesis works only if you can answer "what produced this" for every piece of data in the system. That requires every normalized record, every projection state, every materialized output to carry explicit references to its inputs and its producing operator version. Not stored elsewhere as metadata. Carried with the artifact, queryable, immutable.

The third commitment is to output digests at known offsets. Spin-up of historical operators isn't enough to prove reproducibility. The operator might instantiate, run, complete — and produce subtly different output than it produced originally, because of environmental drift, library patches, timezone library changes, locale defaults. The only defense is recording output digests at the time of original execution and verifying them on replay. This is another category of artifact in the log: not the outputs themselves, but content-addressed digests of outputs at known offsets, used purely for replay verification. It's modest in storage cost but it's the only way the audit claim is actually defensible against the most realistic failure mode.

The fourth commitment is to operational discipline that production engineers will find frustrating. There is no out-of-band fix. There is no manual edit. There is no whisper at 3am. Every correction is a logged event with attribution, justification, and operator identity. This sounds restrictive — and it is — but it's also the part that delivers the value. The whole point of the design is that nothing happens that isn't in the log. If anything ever happens outside the log, the system's promises stop being true. The discipline is the load-bearing thing.

## Where this fits and where it doesn't

This is a narrow design. It is not better than Postgres at OLTP. It is not better than ClickHouse at analytical scans. It is not better than CockroachDB at distributed transactions. It is not better than Kafka at high-throughput streaming. It's worse than each of them at their core jobs.

What it's better at is a specific shape of audit problem: workloads where the question "show us how you produced this output, with the actual code that produced it, in the environment it executed in, against inputs we can independently verify" is the primary deliverable rather than a compliance afterthought. Insurance reporting with model versioning requirements. Financial regulatory submissions where the rule engine's version is itself a regulated artifact. Clinical trial pipelines where reproducibility of analysis is part of the protocol. Multi-tenant platforms where forensic reconstruction is contractual.

For everything else, conventional tools with versioned transformation logic and disciplined snapshot practices cover the reproducibility floor at far lower cost. Most analytical workloads don't need this. Most operational workloads don't need this. The honest scope is: this design is justified when the transformation surface includes non-pure operations whose code is itself an auditable artifact, and where the cost of failed reconstruction is high enough to pay for the substrate's overhead.

That's a real but narrow application. I don't think anyone should build the thing this thesis describes without a specific workload pulling it. The thesis is more useful as a frame than as a blueprint — it tells you what you'd have to commit to if you wanted bit-exact reconstruction including code and environment, and lets you compare that to what you actually need.

What I think is broadly useful, regardless of the substrate, is the smallest piece of the design that delivers most of the audit value: operator contract registries.

## The practical landing: operator contract registries

Most projects don't need the recursive self-description thesis. Most projects do need something better than the current state of "code is in git, data is in the database, the connection is implicit." The piece worth lifting is the registry discipline that the thesis depends on — making transformation logic into a first-class, versioned, referenced artifact alongside the data it produces.

There are two modes worth distinguishing. Soft mode is broadly applicable and low cost; it improves change management and lineage clarity in any system with meaningful data transformations. Hard mode is the audit-grade primitive; it's expensive but it's the version that delivers genuine reconstruction guarantees.

### Soft mode

Soft mode is registry-as-data-in-the-monorepo, with declared dependencies and mechanical enforcement.

The shape is: a `registry/operators/` directory in the repository, one file per significant operator. By "significant" I mean operators whose output crosses a meaningful boundary — a pack boundary, a publication contract, a stage in a bronze-silver-gold pipeline — not every internal function. Each entry declares the operator's name, its location in the codebase, its current version (git SHA is fine for now; content hash of the actual operator module is better), its declared input schema reference, and its declared output schema reference.

Alongside, data contracts — publication contracts, schema definitions for cross-boundary artifacts — gain an `operators` field that lists the registry entries they depend on. A publication contract for `energy_hourly` declares which operator produces it, by registry reference. Reading the contract tells you the contract's reconstruction recipe: which transformation produces it, where that transformation lives, what its declared inputs and outputs are.

The architecture-contract test suite extends to enforce three rules. Every operator referenced by a data contract must exist in the registry. Every operator's declared input and output schemas must resolve to real schema files. Every operator entry's declared location must point to real code, and that code's actual signature must match the declared input/output contracts. Three rules, all mechanical, all running on every change.

That's the soft mode. It takes a day or two to draft, longer to enforce mechanically across an existing codebase, and once in place it gives you most of the practical audit value of the substrate without committing to the substrate.

What soft mode buys you, concretely:

A change to an operator's behavior forces explicit acknowledgment that it's a change. The git diff touches the registry entry, which is reviewed alongside the code change. Reviewers see "this operator's version changed from abc123 to def456, and the following data contracts depend on it" because the reverse index — which contracts depend on which operators — is a cheap computed query over registry references.

Migrations and replays become tractable. "We changed the meter parser; which historical outputs need to be regenerated?" is a query: find every data contract depending on the meter parser, find every output materialized under previous versions of the contract, mark them for replay. It's not automatic, but it's no longer detective work.

Onboarding new contributors becomes easier. "What produces this number" is answerable by reading the contract and following one reference. Currently in most codebases the answer requires reading the consuming code, tracing imports backward, and reconstructing the producer-consumer relationship from convention.

Audits, even informal ones, become tractable. "Show us how this output was produced last quarter" requires the publication metadata to have recorded which operator version was active when the output was produced — which is the one piece of runtime state that soft mode adds: at publication emit, record the operator version and input range that produced the output, in the publication's own metadata. Three additional fields on the publication metadata table or its equivalent. That's enough to answer "which code, what inputs" for any historical output.

Soft mode doesn't give you bit-exact reproducibility. It gives you defensible reconstruction. The operator version is named, the inputs are named, the code is in git at the named SHA. Re-running the operator at that SHA against the input range will produce something equivalent to the original output, modulo environmental drift. For 90% of audit questions, that's what's being asked for. The remaining 10% is what hard mode is for.

### Hard mode

Hard mode is what you do if equivalent isn't enough — if the audit story requires bit-identical reconstruction including the execution environment.

Three additions over soft mode.

The first is runtime contracts. Each operator registry entry declares the runtime it requires to execute: language version, base image SHA, declared dependency versions, environment variables that affect output. This is not "we ran this on Python 3.11"; it's "this operator requires a runtime matching this declared contract, content-addressed, instantiable from cold storage." Replay requires the runtime to be reproducible, which means base images and dependency sets are themselves content-addressed artifacts in the registry. The cost is operational discipline around image build, signing, and retention; the benefit is that historical replays actually use the historical environment.

The second is output digests. When an operator produces output that crosses a contract boundary, the system records a content-addressed digest of the output alongside the publication metadata. On replay — when validating that a re-execution produced the same answer the original did — the digest is compared. If the digest matches, replay is verified bit-exact. If it doesn't, you have a failure that needs investigation: environmental drift, operator non-determinism, corrupted historical data, or genuine code-behavior change that wasn't captured in the version. Without digests, all four failure modes are indistinguishable from "no failure" until somebody manually compares outputs, which is to say, never.

The third is binding immutability and explicit cascade. In hard mode, the binding from data contract to operator version is itself immutable. Updating an operator doesn't update the contract; it creates a new contract version, with the new binding, and the choice of which historical outputs to backfill is explicit and logged. This is what the substrate version of the thesis was getting at: a data contract whose producing logic changed _is a different contract_, even if its output shape is identical, because its reconstruction recipe changed. Hard mode commits to this explicitly. The contract registry tracks contract versions; the operator registry tracks operator versions; the binding registry — which contract version uses which operator version — is the third leg. All three are append-only.

The cost of hard mode is real. Image content-addressing and retention is non-trivial. Output digests double the storage cost of publication metadata, conservatively. Binding immutability forces an explicit decision on every operator update: do we leave existing contracts pinned to the old version, do we cut new contract versions with the new operator, do we backfill historical outputs under the new operator? Soft mode lets you upgrade silently; hard mode doesn't.

What hard mode buys you is the audit story nobody currently delivers cleanly. "Show us the exact code, the exact environment, and the exact inputs that produced this output" becomes a query whose answer is a recipe for replay, and replay is bit-exact verifiable against the recorded output digest. dbt with lineage gets you part of this. Event-sourcing platforms get you part of this. Datomic gets you part of this. None of them combine code-as-artifact, environment-as-artifact, output-digest verification, and contract-version-as-binding in a single substrate. Hard mode is that combination.

Whether hard mode is worth the cost depends entirely on whether anyone is asking the questions hard mode answers. For a regulated insurance reporting pipeline, the answer might genuinely be yes. For a homelab analytics project, the answer is almost certainly no — soft mode is enough, and hard mode is overkill for a system whose audit obligations are "Juha would like to understand what happened last week."

## What's worth lifting independent of any of this

Three things from this whole exercise transfer cleanly to systems that have no intention of becoming audit-grade substrates.

The kernel-versus-event-sourced split, as a design discipline. Asking "what is the smallest irreducible operational surface, and what could in principle be derived from data" is a useful question for any system with audit-adjacent concerns. The answer for most systems isn't "build the substrate"; the answer is "name the kernel precisely and resist the impulse to silently grow it." The discipline alone improves the system's honesty about what it's actually committing to operationally.

The composable-contracts decomposition. Ingest contract, splitter binding, integration contract, projection contract, placement policy — separate objects, separate change cadences, separate review processes. This is portable to any streaming or event-sourced system regardless of whether it adopts log-as-system. Most existing systems collapse these into one configuration object, which couples evolution cadences that shouldn't be coupled. Separating them is a small refactor with disproportionate payoff in change management.

Schema-on-split as a normative pattern. Raw data lands minimally structured; versioned, declared transformations move it to stronger schemas; pure transformations are separated from enrichment as a first-class distinction rather than a convention each pipeline reinvents. I've written about this separately in [Schema-on-split](/posts/schema-on-split), because it's portable enough to stand on its own without any of the substrate context this post depends on. The short version: bronze-silver-gold pipelines do this implicitly, and making it explicit improves the replay story significantly with no substrate changes.

The thesis itself — log-as-system, recursive self-description — I'm keeping in the back pocket rather than recommending. It's the right answer for a specific audit-native workload that I don't currently have. If that workload arrives, the thesis is what I'd want to build against. Until it does, the registry discipline and the kernel split are the parts worth doing.

The honest summary: the speculation produces one architectural thesis worth remembering, two design patterns worth adopting today, and a registry discipline worth implementing in homelab-analytics and similar projects regardless of whether the thesis ever becomes load-bearing. That's a reasonable yield from a thought exercise. Not every speculation needs to ship.
