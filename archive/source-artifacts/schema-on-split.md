---
title: Schema-on-split
date: 2026-05-15
tags: [architecture, data-pipelines, design]
summary: Schema-on-read is what people say when they don't want to commit to schema-on-write. Schema-on-split is what most bronze-silver-gold pipelines are actually doing — and naming it explicitly, with a clean separation between pure transformation and enrichment, fixes most of the replay problems those pipelines accumulate.
---

# Schema-on-split

Schema-on-read is one of those terms that sounded clever in 2014 and has aged into a euphemism. What it tends to mean in practice is: dump raw payloads into a lake, let analysts figure out the schema later, and call the resulting suffering "flexibility." The honest version is that nobody actually reads truly unstructured data; they read data that has been structured by whoever happened to query it first, with whatever discipline that person felt like applying that day. The schema exists. It's just undocumented, undiscoverable, and inconsistent.

The opposite extreme — schema-on-write, where every record must conform to a strong schema before it's accepted — solves the discovery problem at the cost of making ingestion brittle. Producers change shapes without coordinating. Sources you don't control emit unexpected fields. Schema migrations become release-blocking events. Most teams that try strict schema-on-write end up either weakening the schema until it accepts almost anything or accumulating a queue of rejected records that nobody has the appetite to triage.

What most working bronze-silver-gold pipelines do is neither of these. They land raw payloads with minimal validation, then a transformation stage produces strongly-typed normalized records, then another stage produces the analytical or publication-shaped outputs that consumers actually query. The discipline of the strong schema is moved off the ingest path and onto the transformation path. The pattern works. What's missing is a name for it and a clean articulation of the rule that makes it work, which is the part of it that most implementations get wrong.

I want to call this pattern schema-on-split. The "split" is the transformation from raw payload to normalized record, and the discipline is in how that split is structured.

## The rule that makes it work

Schema-on-split has one load-bearing rule: the split is a pure function of its input, and anything that isn't a pure function of its input is not a split.

Pure here means strict. The transformation reads the raw payload, applies parsing and classification logic, and produces normalized output. It does not call external services. It does not look up reference data in a registry that might change. It does not depend on the current time. It does not consult a database. Given the same input bytes and the same version of the split logic, the output is identical, today and a year from now.

This sounds restrictive. It is restrictive. It's also the part that makes the rest of the pipeline tractable, and most pipelines that struggle with replay or reproducibility are struggling because they violated this rule somewhere and didn't notice.

The things that look like they belong in the split but actually don't are what most pipelines get wrong. Geocoding a customer address. Translating an IP to an ASN. Looking up a product ID in a catalog. Parsing a user-agent string against a registry. Resolving a currency code to a current exchange rate. Each of these is a transformation that takes input and produces output, and each of them feels like normalization. None of them is pure. Each depends on external state that drifts: the geocoder updates, ASN assignments change, the catalog gets new entries, the user-agent registry adds patterns, currency rates move.

If those operations live in the split, the split is non-deterministic. Replaying it tomorrow against the same input produces different output, because the external state has moved. That's fine if you accept that replay produces today's-best-effort reconstruction. It's not fine if you care about reproducing the historical answer the system actually gave.

The clean version is to separate them. Split is pure. Anything that consults external state is enrichment, and enrichment is a downstream stage.

## What this looks like in a pipeline

Bronze is the raw landing. Minimal validation, source-shaped, weakly typed, audit-grade retention. The producer's contract is "land it intact"; that's the whole job.

Silver is the schema-on-split output: normalized records with strong schemas, produced by pure splitters. A meter reading event arrives as a JSON payload with vendor-specific field names; the silver record has typed fields, normalized units, validated timestamps, and a clean reference to its bronze source. The splitter that produces it depends only on the payload and its own versioned logic. It does no lookups, calls no services, has no notion of "the current state of the world."

Silver-plus-enrichment is where the external-state-dependent operations live. A silver record gets joined with the customer dimension, the geocoded location, the current exchange rate, the resolved product hierarchy. The output is structurally similar to silver — same record shape, more populated fields — but it's no longer a pure function of its input. It's a function of its input plus the enrichment sources at the moment of enrichment.

Gold is the publication or analytical-consumer layer. By the time data reaches gold, it has been split (pure), enriched (point-in-time), and shaped for consumption. The consumer doesn't see the distinction, but the pipeline does.

This is what most working pipelines already approximate. The improvement is naming the silver split as pure-by-contract and the enrichment stage as point-in-time-by-contract, and enforcing the distinction mechanically. Pure splitters can be replayed against historical inputs and produce historical outputs. Enrichment cannot, in the general case — replaying it produces today's best guess about what the answer would have been, which is occasionally what you want and frequently isn't.

## The replay consequence

The reason this matters operationally is that most pipelines have at least one workflow that requires re-processing historical data. Backfilling a new normalization rule. Reprocessing after a bug fix in the parser. Regenerating outputs against an updated schema. The question every such workflow asks is: "if I run the transformation against historical inputs, will the output match what the system actually produced at the time?"

For a pure splitter, the answer is yes by construction, modulo execution environment drift. The splitter at version X applied to input Y produces output Z, always. The only thing that can break this is the splitter version changing (which is detectable) or the execution environment changing in ways that affect output (which is the audit-grade concern; see the parent post on [log-as-system](/posts/the-log-is-the-system) for that thread).

For an enrichment stage, the answer is no. The enrichment depends on external state, the external state has moved, the output you get from re-running is the output the enrichment would produce today against the historical input. That's a different question from "what did the enrichment produce at the time," and the answer to the latter requires either storing the enrichment output as a first-class artifact (which most pipelines don't) or storing a snapshot of the enrichment sources at the time of original execution (which almost nobody does).

The practical consequence is that pure-split outputs are cheap to regenerate and enrichment outputs are not. If you want the cheap regeneration to be widely available, you want as much of the transformation as possible to live in the pure split, and you want the enrichment surface to be narrow and explicit.

This is the inversion of what most pipelines do by default. The default is to do everything in one stage because it's simpler — "the normalizer geocodes the address while it's normalizing the rest of the record." That conflation is what makes the resulting pipeline hard to replay. Splitting the stages costs an extra hop and some plumbing; it buys you a clean replay story for the majority of your data and an honest accounting of which parts genuinely cannot be replayed.

## What enrichment should look like once you've separated it

The most common mistake after introducing the split is treating enrichment as "the silver stage but bigger." The temptation is to make the enrichment stage do whatever the silver stage was doing plus the external lookups, and call it done. This gets you most of the value of the separation without the operational discipline that makes the separation actually pay off.

The discipline is to treat enrichment outputs as point-in-time artifacts, recorded with their inputs.

When the enrichment stage runs, it consumes a silver record and produces an enriched record. The enriched record carries metadata about which enrichment sources contributed to it: the geocoder version, the FX rate snapshot identifier, the catalog version at the time of resolution. If those identifiers are content-addressed (a hash of the geocoder's lookup table at the time, not just "v2024.3"), the enrichment becomes auditable: given the silver input and the enrichment-source snapshots, you can re-run the enrichment and verify the result. If they're not — if the enrichment metadata is just "we used the geocoder, whatever version was current" — the enrichment is unauditable in the sense that mattering five years from now.

Most pipelines won't go this far. For most pipelines, recording version strings rather than content hashes is fine, and the audit story is "we used roughly this version of these tools." That's a defensible weakening for low-stakes use cases. For high-stakes use cases — regulatory reporting, anything where the enrichment is itself a regulated artifact — the content-addressed version is what you actually need, and skipping it is a problem you discover the first time someone asks "show us the exact data the system used to make this decision."

## How this maps to common pipeline patterns

The bronze-silver-gold pattern, popularized by Databricks and adopted widely under various names, is the most common landing site for this idea. The improvement is articulating what each layer is actually doing in terms of purity:

Bronze is the immutable arrival. No transformation. The audit source.

Silver is the pure split. Strong schemas produced by deterministic transformations. Replayable against bronze.

Silver-enriched (sometimes called "silver+" or merged into gold in many implementations) is the point-in-time enrichment. Strong schemas produced by transformations that depend on external state, recorded with their input snapshots.

Gold is the consumption-shaped output. Aggregations, denormalizations, analytical views. Typically produced from silver-enriched by another layer of transformations, themselves either pure (deterministic aggregations) or point-in-time (joining against changing reference data).

The dbt + warehouse pattern maps similarly. Staging models are roughly silver-shaped — they normalize source data into typed columns with cleaned values. Intermediate models are where enrichment tends to live, often without anyone naming it as such. Mart models are gold-shaped. The improvement from this framing is to make staging models actually pure — no lookups, no joins to slowly-changing dimensions, just source-to-typed-record — and push the dimension joins explicitly into intermediate models that are understood to be point-in-time.

The streaming-pipeline pattern (Kafka topics, materialization layers, downstream consumers) has the same shape with different vocabulary. The raw topic is bronze. The normalized topic produced by a splitter is silver. The enriched topic produced by a stream-table join is silver-enriched. The materialized views that downstream queries hit are gold. The improvement is the same: keep splitters pure, push state-dependent joins into explicitly-named enrichment stages, record their inputs.

In every case, the value of naming schema-on-split is that it gives you a vocabulary for the distinction that matters — pure transformation versus state-dependent transformation — and lets you reason about replay, backfill, and audit consistently across whatever physical pattern the pipeline happens to use.

## Where this is broadly useful and where it's overkill

This is broadly useful any time you have a transformation pipeline with at least one of: meaningful replay requirements (bug fixes need backfills), audit-adjacent obligations (downstream consumers ask "where did this come from"), or significant external-state dependencies in transformation (geocoding, FX rates, catalog joins, anything similar). For pipelines without any of these, the discipline is overhead without payoff — if you don't replay and nobody audits, naming the split-versus-enrichment distinction is making an unforced complexity choice.

It's overkill when the entire transformation is genuinely pure to start with — a pipeline that does nothing but type coercion and field renaming doesn't have an enrichment stage to separate. It's also overkill when the enrichment is so cheap to recompute that point-in-time matters less than current — for example, in pipelines where "the geocoder's current answer" is genuinely what consumers want, and historical answers are not interesting.

The pattern earns its keep in the middle: pipelines complex enough to have real transformation logic, exposed enough to have replay or audit pressure, and connected enough to other systems that pure and stateful transformations both naturally appear.

For homelab-analytics-shaped systems — bronze-silver-gold style, mixed data sources, occasional backfills, modest but non-trivial audit needs — schema-on-split with explicit enrichment separation is in the sweet spot. It's not a big change from current practice; it's a small reframing that pays off when the first awkward backfill happens.

## One thing to avoid

The trap is making the split-versus-enrichment distinction into a moral hierarchy, where pure splits are "the right kind of transformation" and enrichments are "the dirty stuff we have to do." They're not. Pure splits are cheap to replay and replay produces meaningful answers. Enrichments are expensive to replay properly and replay produces different answers from the original. Those are different operational characteristics, not different moral statuses. Both are necessary in real pipelines. The point of the distinction is to know which characteristic you're getting, not to push everything into one bucket and pretend the other doesn't exist.

The pipelines that handle this best are the ones that accept enrichment as a first-class concern with its own discipline — point-in-time snapshots, recorded inputs, explicit version metadata — and treat the pure-split layer as the cheap part rather than the prestigious part. The split is doing routine work. The enrichment is doing harder work. Naming them lets you allocate operational attention to where the operational complexity actually lives.

That's the whole pattern. Land raw. Split purely. Enrich with recorded inputs. Don't conflate. Most pipelines that try this find they were already half-doing it and the rest is mostly naming.
