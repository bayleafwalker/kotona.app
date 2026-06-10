---
title: Schema on split
status: guiding
area: data architecture
lastRevised: 2026-05-15
relates:
  - log-as-system
tags:
  - data-platforms
  - replay
  - audit
summary: "A pipeline rule: land raw, split deterministically, enrich point-in-time, then shape for consumers."
---

## Rule

Schema-on-split names a common compromise:

```text
raw input
  |
  v
bronze: source artifact
  |
  | pure splitter(input, splitter_version)
  v
silver: normalized record
  |
  | point-in-time enrichment(input, source_snapshot)
  v
silver-enriched: contextual record
  |
  | consumer shaping
  v
gold: mart / view / product output
```

The split is pure.

Anything that reads external state is not a split.

## Boundary

```text
splitter may read:
  - raw payload
  - parser code
  - declared mapping tables bundled with that code

splitter may not read:
  - current time
  - catalog service
  - geocoder
  - FX service
  - user-agent registry
  - mutable reference data
```

If the same input bytes and same splitter version do not produce the same
output later, the operation was enrichment.

## Contract

```text
bronze -> silver
  deterministic
  cheap to replay
  safe to backfill broadly

silver -> enriched
  stateful
  replay requires historical source state
  backfill changes meaning unless snapshots are preserved
```

Do not hide enrichment in silver because the diagram is cleaner. That is where
replay stories usually rot.

## Mapping

| Layer    | Contract               | Failure mode            |
| -------- | ---------------------- | ----------------------- |
| Bronze   | Preserve source        | Source loss             |
| Silver   | Pure normalized output | Non-deterministic split |
| Enriched | Point-in-time context  | Missing source snapshot |
| Gold     | Consumer shape         | Accidental authority    |

Gold is not truth. It is a useful opinion.

Silver is not prestigious. It is the cheap reproducible layer.

Enrichment is not dirty. It is the expensive layer that needs stronger
lineage.

## Replay

```text
good replay:
  bronze_event
  + splitter_digest
  = same silver_record

audit replay:
  silver_record
  + enrichment_source_snapshot
  + enrichment_operator_digest
  = same enriched_record

bad replay:
  silver_record
  + today's geocoder
  = plausible but not historical
```

Pure split outputs can be regenerated. Enriched outputs can only be reproduced
if the enrichment sources were recorded as artifacts or snapshots.

## Discipline

Record enrichment metadata with the output:

```text
record.lineage = {
  raw: content_hash,
  splitter: content_hash,
  enrichment_operator: content_hash,
  enrichment_sources: [
    { name: "fx_rates", snapshot: "sha256:..." },
    { name: "catalog", snapshot: "catalog-2026-05-15T09:00Z" }
  ]
}
```

Content-addressed snapshots are the audit-grade form. Version strings are a
weaker but often acceptable form.

## Apply When

Use the rule when a pipeline has at least one of:

- replay pressure
- audit pressure
- backfills after bug fixes
- external reference data in transformations
- mixed pure and stateful transformation logic

Avoid it when the pipeline is small, current-state recomputation is the desired
behavior, or the split is already only type coercion and field renaming.

## Project Use

For homelab analytics and adjacent data-platform work:

```text
first pass:
  find every silver transform
  mark reads of external state
  move those reads to enrichment
  attach source snapshot metadata

do not:
  rename every model
  add process ceremony
  split stages where no replay value exists
```

The rule is a refactoring lens. Apply it where replay or audit can pay rent.
