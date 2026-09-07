---
title: Schema on split
role: operating
status: guiding
lifecycle: current
area: data architecture
published: 2026-05-15
lastRevised: 2026-09-07
projects:
  - household-operating-platform
relates:
  - log-as-system
terms:
  - term: Homelab Analytics
    definition:
      The household data and decision platform that owns long-lived semantics,
      scenarios, policies, and approvals.
tags:
  - data-platforms
  - replay
  - audit
summary:
  "A pipeline rule: land raw, split deterministically, enrich point-in-time,
  then shape for consumers."
explorePrompt: >-
  Use this note as a worked rule, not a naming scheme to adopt. The transferable
  question: in a data pipeline, which transformations can be replayed from their
  inputs alone, and where does the boundary between those and the rest actually
  fall? The worked answer draws the line at purity. A split may read the raw
  payload, the parser code, and mapping tables bundled with that code; anything
  reading current time, a catalog, a geocoder, an FX service, or mutable
  reference data is enrichment, not splitting. The operational test is direct:
  if the same input bytes and the same splitter version stop producing the same
  output later, it was enrichment all along, and hiding it in the normalization
  layer is where replay stories rot. Enriched output can only be reproduced if
  its sources were captured as content-addressed snapshots or, more weakly,
  version strings. Apply the question to a pipeline you own. Find every
  transform in your normalization layer, mark the ones that read external state,
  and say what it would cost to move them or to snapshot their sources. Say
  where your constraints diverge -- current-state recomputation is the desired
  behaviour, no replay or audit pressure exists, or the split is only type
  coercion. Produce a classification of your existing transforms with the
  lineage each would need, not a layer-renaming plan.
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

If the same input bytes and same splitter version do not produce the same output
later, the operation was enrichment.

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

Enrichment is not dirty. It is the expensive layer that needs stronger lineage.

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

## Worked example, synthetic

Three purchase payloads land in bronze on 2026-05-02. Splitter v1 has a real
bug: it drops the decimal comma, so `12,50` parses as `1250`. v2 fixes decimal
commas and space grouping. Enrichment converts to EUR from a snapshotted rate
table.

```text
bronze, landed 2026-05-02:
  p-101  {"amount": "12,50",    "currency": "SEK"}
  p-102  {"amount": "9.90",     "currency": "EUR"}
  p-103  {"amount": "1 299,00", "currency": "SEK"}

fx snapshots (EUR per SEK):
  fx@2026-05-02  0.0871
  fx@2026-09-07  0.0912
```

The same three inputs then support three recomputations that are meant to
disagree:

| Record | Original replay (v1 + fx@05-02) | Corrected recomputation (v2 + fx@05-02) | Current state (v2 + fx@09-07) |
| ------ | ------------------------------- | --------------------------------------- | ----------------------------- |
| p-101  | €108.88                         | €1.09                                   | €1.14                         |
| p-102  | €9.90                           | €9.90                                   | €9.90                         |
| p-103  | €11,314.29                      | €113.14                                 | €118.47                       |

Each column answers a different question. The original replay reproduces what
the system actually said in May, bug included — that is what an audit asks for,
and it is only possible because bronze kept the bytes, the splitter digest was
recorded, and the fx snapshot survived. The corrected recomputation is the
backfill: what the records should have said at their own point in time, new
splitter against the historical snapshot. The current-state column is what a
pipeline without snapshots silently produces — plausible, internally consistent,
and not what happened. p-102 changes in none of them, which is the other half of
the point: a well-drawn boundary leaves the unaffected records provably
unaffected.

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
