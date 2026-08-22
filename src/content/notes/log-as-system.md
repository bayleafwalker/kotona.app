---
title: Log as system
role: exploration
status: prospective
lifecycle: current
area: data architecture
published: 2026-05-15
lastRevised: 2026-05-15
projects:
  - household-operating-platform
relates:
  - schema-on-split
tags:
  - event-sourcing
  - audit
  - systems
summary:
  A reference design for audit-native systems where code, layout, control
  decisions, and data are all log artifacts.
explorePrompt: >-
  Use this note as a reference design held deliberately in reserve, not a target
  architecture. The transferable question: what would it cost to make a system
  where no authoritative state exists outside an append-only log, and which
  workloads actually need to pay that? The worked design puts everything derived
  -- tables, indexes, projections, materialized views, caches, placement state,
  running operators -- downstream of the log, makes deployment a logged binding
  change so there is no ambient current version the audit trail has to trust,
  and turns control decisions and rollbacks into further events. It names the
  irreducible non-log kernel honestly: storage drivers, bootstrap reader, effect
  emitter, root identity. The discipline is keeping that kernel named and small.
  Its own verdict is that the portable fragment -- pure split, then
  point-in-time enrichment, then consumer output -- is what to use now, and the
  full substrate stays prospective until a workload demands it, plausibly
  regulated submissions, model reporting, clinical pipelines, or forensic
  reconstruction. Apply the question to a system you operate. Identify what is
  authoritative outside your log today and what an auditor would have to trust
  that no event records. Say where your constraints diverge -- no replay
  pressure, state that cannot be reconstructed, latency budgets that forbid
  projection. Produce the smallest lineage additions that would pay rent now,
  and the trigger that would justify the full substrate.
---

## Thesis

Conventional systems:

```text
database state
  + side log
  + deployed code
  + control plane
  + physical layout
```

Log-as-system:

```text
append-only log
  -> operators
  -> projections
  -> placement
  -> control state
  -> outputs
```

The system has no authoritative state outside the log. Everything else is a
cache, a projection, or an effect boundary.

## Commitments

```text
authority:
  log

derived:
  tables
  indexes
  projections
  materialized views
  entity caches
  placement state
  running operators
```

Snapshots accelerate replay. They do not become truth.

Operators are data:

```text
operator_blob = sha256(...)
binding_event = {
  stream,
  offset_range,
  operator_blob,
  config_blob
}
```

Deployment is a logged binding change. There is no ambient "current splitter"
that the audit trail has to trust.

Control decisions are data:

```text
placement_event
retention_event
rebalance_event
schema_binding_event
manual_supersession_event
```

Rollback is another event.

## Kernel

The log cannot contain the machinery needed to first read the log.

```text
non-log kernel:
  storage drivers
  bootstrap reader
  external effect emitter
  root identity / authority

log-governed surface:
  operators
  schemas
  placement policy
  projection definitions
  retention policy
  repair events
```

The kernel is real. The discipline is to keep it named and small.

## Lineage

Every artifact carries its own proof shape:

```text
artifact = {
  content,
  inputs: [content_hash...],
  operator: content_hash,
  config: content_hash,
  environment: content_hash,
  output_digest: content_hash,
  produced_at_offset
}
```

Metadata stored elsewhere is not enough. Lineage must travel with the artifact
or be reconstructable from immutable log references.

## Reproducibility

```text
replay claim:
  same log
  + same operator blob
  + same config blob
  + same environment digest
  = same output digest
```

Bit-identical code is not sufficient. Runtime drift can still change output.
Known output digests at known offsets are the check.

## Fit

Bad default:

| Workload                 | Better tool |
| ------------------------ | ----------- |
| OLTP                     | Postgres    |
| analytical scans         | ClickHouse  |
| distributed transactions | CockroachDB |
| high-throughput streams  | Kafka       |

Useful only where the deliverable is reconstruction:

```text
show:
  exact inputs
  exact code
  exact operator binding
  exact environment
  exact output
  exact correction history
```

Plausible domains:

- regulated financial submissions
- insurance model reporting
- clinical-trial analysis pipelines
- contractual forensic reconstruction
- multi-tenant audit platforms

Everything else should probably use ordinary tools plus stronger lineage.

## Relationship To Schema On Split

Schema-on-split is the portable fragment:

```text
raw log
  -> pure split
  -> point-in-time enrichment
  -> consumer output
```

Log-as-system is the hard version:

```text
raw log
  + splitter blob
  + enrichment source snapshot
  + placement event
  + projection spec
  + output digest
  = audited system state
```

Use the fragment now. Keep the full substrate as a reference design until a
workload actually requires it.

## Open Questions

- What is the smallest workload that needs the full substrate?
- How small can the kernel be before identity becomes impossible to ground?
- When do checkpoints become operationally authoritative despite the model?
- What is the cost ceiling for audit-native replay?

Current status: prospective. Not load-bearing.
