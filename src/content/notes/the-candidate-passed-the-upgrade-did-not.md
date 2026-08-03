---
title: The candidate passed. The upgrade did not.
role: project-history
status: guiding
lifecycle: current
area: release engineering
published: 2026-08-03
lastRevised: 2026-08-03
draft: true
projects:
  - vuoro
relates:
  - compatibility-reports-should-be-a-little-rude
  - a-gitops-rollback-needs-time-to-reach-git
  - derived-status-is-earned
  - the-deployment-boundary-was-only-a-place
  - authority-must-travel-with-the-action
tags:
  - release-engineering
  - verification
  - contracts
  - operations
summary: A release candidate passed every gate and failed on contact with production six minutes later. The gates proved compatibility with the target database state; nothing had proved the transition from the state actually running.
---

The release candidate passed every gate I had written. It still could not start in
production. The evidence proved the image was compatible with a database state
that did not yet exist — the post-migration one. The live ledgers were still
pre-migration. The missing artifact was not another image test. It was proof of
the transition from the state actually running.

Nothing was lost. That is the part worth recording, and it is not the same thing
as nothing having gone wrong.

## The candidate that passed

Vuoro `v0.1.33`, image digest `sha256:b980c34e...`, pinned into the GitOps tree
for both containers of the `vuoro-shared` deployment. The pin merged at 22:36 UTC
on 2026-08-02.

The evidence attached to it was not thin:

- image aliases agree; maximum SLSA provenance, an SPDX SBOM, and a GitHub
  attestation all verified against the exact Vuoro source and tag;
- a fresh main and Flux revision, a healthy running service, one ready endpoint;
- the pre-scale producer, session, and claim gate passed;
- full validation, root and focused Kustomize renders, verification artifacts,
  the preflight harness, a client dry-run, the SOPS commit hook, and exact static
  assertions;
- independent review: approve.

The change was also deliberately narrow, and said so: image-pin only. It did not
change replicas, create a backup, replace sentinels, unsuspend jobs, migrate
schemas, resume producers, or reconcile the cluster.

Every one of those statements is true. The upgrade still could not proceed.

## The hidden starting-state assumption

The candidate had been qualified against **disposable v6 backends** — databases
constructed at the target schema for the test. The live ledgers were still
pre-migration: work schema 5, execution schema 3.

That gap is invisible in the gate list, because no gate names a starting state.
Each one asks a version of "is this artifact sound?" and the answer was yes. The
unasked question was "sound _from where?_"

## Six minutes

The new pod failed closed on startup:

```text
CompositionError: runtime compatibility failed for: work, execution
```

The old v3 pod stayed 2/2 Ready and kept the service endpoint. The rollback
merged at 22:42 UTC — six minutes after the pin — restoring the prior healthy
digest `sha256:9c1d0e53...` and preserving replicas, jobs, sentinels, backups,
schemas, and producers unchanged. No migration or database mutation occurred.

So the runtime behaved exactly as designed. The composition layer refused to run
against ledgers it could not satisfy, rather than starting and discovering the
mismatch mid-transaction; the deployment surface kept the healthy pod serving
while the candidate crashlooped; and the rollback was one file, two references,
with inverse assertions verifying it.

A failure this cheap is a property of the system, not luck. It is also the reason
the incident is worth writing up rather than quietly fixing: the recovery was
already engineered, and the qualification was not.

## What the gates were actually proving

The correction was to stop qualifying an artifact and start qualifying a
transition. The remediation built a pre-migration image pinning the exact
qualified adapter releases, and proved it against four states — with all schema
construction running inside the image under test, using the pinned wheels it
ships rather than a working tree:

| State                                           | Expected      | Result |
| ----------------------------------------------- | ------------- | ------ |
| work 5 + staged maintenance bridge, execution 3 | ready, no DDL | pass   |
| the same state after restart                    | ready, no DDL | pass   |
| work 6 + execution 6, capability marker granted | ready         | pass   |
| work 6 without the marker grant                 | fails closed  | pass   |

The first state is the one the original gate set never had: the live starting
state, not the target. The second is the one people forget — a first start that
succeeds by applying something is not the same as a restart that stays ready
without reapplying it.

The fourth state is the most useful. It fails with
`InsufficientPrivilege: permission denied for table sprintctl_schema_capability`,
which turns a design assumption into a checked fact: the v6 migration must grant
`SELECT` on that table in the same transaction, or startup dies reading the
bridge it was meant to consult. A negative state, deliberately provoked,
specified the migration.

The proof was then re-run against the **published digest**, not just a locally
built image, so the evidence covers the artifact that would actually be deployed.
When a later adapter release changed which clock is authoritative for capability
transitions, the same four-state matrix was re-run against the repinned image and
produced the same results.

## The transition contract

What a release claim has to name, going forward:

```text
S0  live starting state          work 5, execution 3, no staged bridge
S1  additive bridge staged       maintenance relations present, no DDL on start
S2  new image deployed           runs against S1, restart-stable
R1  image rollback at S1         prior digest, bridge left in place
R0  bridge rollback              only where proven additive and reversible
```

Each edge needs its own evidence, and the rollback edges are edges — not a
sentence about intent. The rollback that saved this deployment was R1's shape
executed at S0: image-only, with no schema state to undo. R1 proper has to hold
once the bridge is staged, and it can, because the bridge is additive — rolling
the image back does not require rolling the schema back.

The generalizable failure is narrower than "test against production." It is:

> Target-state compatibility can pass in full while transition compatibility
> remains entirely untested.

A gate that constructs its own fixture answers a question about the artifact. A
release needs an answer about the move. Those are different questions, and a
complete set of the first kind produces exactly the confidence that made this
pin look ready.

## Still open

The bridge staging and the cutover are not complete, so this note records a
corrected method and one avoided outage, not a finished rollout. The capability
marker grant has been specified by a failing test but not yet executed against
the live ledgers, and the transition contract above has been proven state by
state in a disposable environment rather than walked end to end on the live
databases. That walk is the next real proof.
