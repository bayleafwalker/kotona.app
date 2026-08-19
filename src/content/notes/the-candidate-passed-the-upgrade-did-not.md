---
title: The candidate passed. The upgrade did not.
role: project-history
status: guiding
lifecycle: current
area: release engineering
published: 2026-08-03
lastRevised: 2026-08-08
draft: false
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
explorePrompt: >-
  Use this note as one worked instantiation, not a rule to copy. The
  transferable question: when a release qualification suite passes every
  gate and the release still fails on contact with production, what class of
  claim did the suite never make? This instantiation concludes that
  compatibility-with-destination and admissibility-of-the-transition-from-
  the-actual-current-state are separate claims, that disposable-database
  fixtures silently encode an assumed starting schema version instead of the
  one production is actually running, and that the fix is a state-transition
  contract (S0 through R0) where the untested edge -- not the destination --
  is where fixtures must be built. Its constraints are a system with staged,
  numbered schema migrations, a runtime that fails closed rather than
  discovering mismatch mid-transaction, and a cheap image-only rollback
  because no persistent state had changed yet. Apply the question to your
  own release pipeline. Name where your constraints diverge -- unversioned
  schemas, migrations that run automatically rather than being staged
  separately, rollbacks that are not cheap -- and say which parts of this
  method still transfer. Produce the state-transition diagram for your own
  release edges and name which arrow currently has no test.
---

At 22:36 UTC on 2026-08-02, I pinned Vuoro `v0.1.33` into both
containers of the `vuoro-shared` deployment. Six minutes later I merged the
rollback.

The new pod had failed at startup:

```text
CompositionError: runtime compatibility failed for: work, execution
```

The old pod stayed `2/2 Ready` and continued serving. The rollback restored
digest `sha256:9c1d0e53...`. Replicas, jobs, sentinels, backups, schemas, and
producers did not change, and no database migration ran.

The containment worked. The release qualification did not.

## What had passed

The rejected image was digest `sha256:b980c34e...`. Before deployment it had
passed:

- image-alias checks;
- maximum SLSA provenance, SPDX SBOM, and GitHub attestation verification
  against the exact source and tag;
- the producer, session, and claim gate;
- full validation and both root and focused Kustomize renders;
- the preflight harness, a client dry-run, the SOPS commit hook, and exact static
  assertions; and
- independent review.

The pull request also limited itself to changing the image pin. It did not
claim to migrate schemas, resume producers, replace sentinels, or alter
replicas.

All of that evidence was valid. It answered the wrong release question.

## The state the tests had skipped

The candidate had been tested with disposable databases already constructed at
schema version 6. Production still had work schema 5 and execution schema 3.
Nothing in the gate named that starting point.

The image was compatible with the state expected after migration. The upgrade
needed it to start before that migration was complete. The difference only
became visible when the real pod met the real ledgers.

The runtime then did what it was meant to do. It refused to serve against
unsupported schemas instead of discovering the mismatch during a transaction.
The deployment kept the old pod available, and the image-only rollback remained
cheap because no persistent state had changed.

## Testing the move

The replacement qualification used the exact adapter releases shipped in the
image and created every database fixture inside that image. It exercised four
states:

| State                                           | Expected      | Result |
| ----------------------------------------------- | ------------- | ------ |
| work 5 + staged maintenance bridge, execution 3 | ready, no DDL | pass   |
| the same state after restart                    | ready, no DDL | pass   |
| work 6 + execution 6, capability marker granted | ready         | pass   |
| work 6 without the marker grant                 | fails closed  | pass   |

The first row reproduces the production starting point. The second catches
software that performs hidden work only on first start. The last row fails with
`InsufficientPrivilege: permission denied for table sprintctl_schema_capability`.
That failure established a migration requirement: grant `SELECT` on the
capability table in the same transaction that creates it.

The four-state matrix was then run against the published digest, rather than
only a local build. When a later adapter release changed which clock governed
capability transitions, the same matrix was run again against the repinned
image.

## The release contract now names the edges

```text
S0  live starting state          work 5, execution 3, no staged bridge
S1  additive bridge staged       maintenance relations present, no DDL on start
S2  new image deployed           runs against S1, restart-stable
R1  image rollback at S1         prior digest, bridge left in place
R0  bridge rollback              only where proven additive and reversible
```

Each arrow needs a test. In particular, deploying the new image at `S1`,
restarting it at `S1`, and returning to the old image at `S1` are separate
claims. The additive bridge makes the image rollback possible without first
undoing the schema change.

The original tests proved the candidate worked at the destination. They never
proved it could leave the state production was actually in.

## Still open (as of 2026-08-08)

The maintenance bridge is staged, but the cutover is not complete. The failing
permission test has specified the required grant, but that grant has not yet
been applied to the live ledgers. The transition has been proved state by
state in disposable databases; it has not yet been walked end to end in
production.

That unfinished walk is the next release gate.
