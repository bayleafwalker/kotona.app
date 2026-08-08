---
title: Account for node-local state in GitOps recovery
role: project-history
status: guiding
lifecycle: current
area: GitOps operations
published: 2026-08-06
lastRevised: 2026-08-08
projects:
  - gitops-cluster
relates:
  - a-gitops-rollback-needs-time-to-reach-git
  - derived-status-is-earned
draft: false
tags:
  - operations
  - gitops
  - talos
  - storage
  - preflight
  - rollback
summary: >-
  Two upgrade failures came from persistent node-local state outside Git:
  malformed UEFI NVRAM and an iSCSI record that poisoned shared parsing. The
  fix was bounded exceptions, preflight checks, controlled migration and
  verification.
explorePrompt: >-
  Use this note as a worked instantiation, not a universal rule. The transferable
  question is: which persistent state stores sit below a declared or reconciled
  system and can invalidate an upgrade, rollback, or recovery test? In this
  instantiation, one node carried malformed UEFI NVRAM that broke a bootloader
  management step after the target system version was already running; another
  carried an iSCSI node record whose unsupported field caused shared parsing to
  fail across volume attachments. The resulting controls were deliberately
  different: a narrowly scoped operational exception with post-upgrade
  verification for the firmware case, and preflight detection, graceful drain,
  and targeted record migration for the storage case. Apply the question to a
  system you operate. Identify each relevant local state store, the actuator that
  reads it, whether it can be recreated, validated, migrated, or only accepted,
  and how it affects rollback evidence. Challenge the conclusions where your
  platform makes local state immutable, disposable, or externally authoritative.
  Produce a state-boundary table plus a concrete preflight and rollback design.
---

Two upgrade problems initially looked like software regressions. Neither was
fully described by the desired state in Git, the cluster manifests, or the
selected operating-system image.

On one node, a Talos upgrade command failed while reading malformed UEFI NVRAM,
even though the node had already booted the intended Talos version. On another,
fresh Longhorn volume attachment failed because one persistent iSCSI node record
contained a field the installed tooling could not parse. The parser consulted
the shared node database, so one bad record could interfere with attachments
that had nothing to do with the record that caused the problem.

The incidents were in different layers and required different decisions. Their
common boundary was simpler:

> The machine participates in reconciliation with state that reconciliation
> neither declares nor recreates.

The rollout eventually completed on every node. The lasting result was not a
larger manifest. It was a bounded firmware exception, a node preflight test,
controlled migration of faulty storage records, and a stricter definition of
what an upgrade or rollback result actually proves.

## The authority chain had missing inputs

The intended operating model was roughly:

```text
Git-managed configuration
        ↓
reconciliation and upgrade tooling
        ↓
running node
```

That model was not wrong. It was incomplete. The tools also consulted state
already present on the machine:

```text
UEFI NVRAM ───────────────→ bootloader management
/var/lib/iscsi/nodes/ ────→ volume discovery and attachment
```

Neither store belonged in Git. Firmware variables are maintained by firmware
and boot tooling. The iSCSI database is runtime state maintained by storage
clients. Persisting them is normal.

The mistake would be assuming that normal persistence makes them irrelevant to
declarative operations. A clean Git tree proves that the declaration is clean.
It says nothing about whether every local state store consulted while realizing
that declaration is valid, compatible, or even parseable.

## The upgrade that had already succeeded

One node reported this failure during a Talos upgrade:

```text
failed to install bootloader:
failed to get boot entry Boot0004:
failed unmarshaling ExtraPath:
dangling bytes at the end of device path: 0000
```

The failing input was a malformed EFI device path stored in UEFI NVRAM. Talos
could enumerate the boot entry far enough to find it, but not deserialize the
extra path attached to it.

The important observation came after the command failed: the node was already
running the target Talos version.

That did not make the error imaginary. Bootloader management had still failed,
and a future upgrade could encounter the same firmware state. It did mean that
the command's final status was not a sufficient description of the node's final
state. Treating the whole operation as an atomic "upgrade failed" would have
hidden the more useful distinction:

```text
target system version installed and booted
bootloader-management cleanup failed
```

Repairing malformed firmware state was possible in principle. It was not
obviously the lowest-risk action. Resetting firmware defaults or rewriting boot
entries would widen the intervention from a known upgrade inconvenience into
the machine's boot configuration. That is a poor trade merely to make the next
automation run end in green.

The accepted resolution was therefore an explicit exception:

1. Leave the known NVRAM defect in place for now.
2. After an upgrade on that node, reboot it deliberately.
3. Verify the running Talos version, Kubernetes readiness, and workload health.
4. Accept only the known error signature on the known node.

This is not a general instruction to ignore bootloader errors. The exception is
bounded by identity, symptom, and required evidence. A different node, a
different NVRAM error, or a failure to boot the target version remains a failed
upgrade.

The local imperfection stays visible without being promoted into an emergency.

## The rollback that retained the suspect state

The storage incident began with a different shape. After an upgrade, a fresh
Longhorn volume engine would not reach a running state. The original symptom was
low-level enough to support several stories, including a kernel or release
regression.

Rolling the node back did not restore normal attachment. Instead, the rollback
produced a more specific failure: an `iscsiadm` operation exited with status 7
while trying to show a node record.

The record lived under the ordinary persistent database:

```text
/var/lib/iscsi/nodes/<target>/<portal>/default
```

It contained a parameter the parser did not recognize:

```text
node.session.sess_reopen_log_freq = 1
```

The record was recently modified, not harmless archaeological debris. More
importantly, the failing command parsed the shared iSCSI node database. One
malformed or incompatible record could therefore break operations beyond the
single target represented by its directory.

The directory layout suggested isolation. The parser supplied the actual blast
radius.

The rollback had changed the operating-system version but preserved
`/var/lib/iscsi`. That matters because a rollback is a useful version experiment
only when the state entering each run is known. Restoring binaries after the
candidate system has created or modified persistent state is not a replay of the
pre-upgrade machine.

The failed rollback therefore did not establish that the newer release was
innocent, and it did not establish that the older release was broken. It
established something narrower and more useful: the node carried persistent
state capable of surviving the version change and continuing to block storage
startup.

A rollback can restore code without restoring the conditions under which the
old code last worked.

## The fix was an operating control, not a theory

The cluster did not need a universal explanation of every possible iSCSI record
mutation before upgrades could continue. It needed a way to detect the concrete
blocker before moving workloads onto an affected node.

A tester script was created to identify upgrade blockers in the persisted iSCSI
state. With the failure made visible before the disruptive step, nodes could take
one of two controlled paths:

- drain gracefully and proceed when their local state passed the checks;
- migrate the faulty node records deliberately before proceeding when it did
  not.

Every node was then updated to the target release. The storage issue was not
resolved by deleting the whole database and hoping discovery rebuilt something
acceptable. The faulty state was identified and handled at its own boundary.

That changed the upgrade procedure from:

```text
upgrade → observe storage failure → investigate node residue
```

to:

```text
inspect persistent state
        ↓
drain or migrate as required
        ↓
upgrade
        ↓
verify node and storage health
```

The script is more valuable than the individual repaired records. The records
were incident data. The preflight is retained operating capability.

## Two incidents, two valid dispositions

The shared lesson is not that all local state should be eliminated. The two
incidents ended differently because their risk and available controls differed.

| State store         | Failure mode                                                                                            | Chosen disposition                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| UEFI NVRAM          | A malformed boot entry breaks a bootloader-management step after the target version is already running. | Accept a node-specific exception; reboot and verify after upgrades.                 |
| iSCSI node database | One faulty record breaks shared parsing and can block unrelated volume attachments.                     | Detect in preflight; drain normally or migrate the affected records before upgrade. |

The firmware state was accepted because its consequence was bounded and the
alternative intervention had a larger boot risk. The storage state was migrated
because it could block normal workload movement and there was a targeted way to
repair the condition.

"State outside Git" is not itself a defect classification. It is a prompt to
decide who owns the state and what control applies to it.

For a local state store that can affect upgrades, there are four useful
dispositions:

1. **Recreate it** when it is genuinely disposable and reconstruction is tested.
2. **Validate it** when malformed or incompatible content can be detected safely.
3. **Migrate it** when the state is necessary but its representation changes.
4. **Accept it explicitly** when remediation is riskier than a bounded
   operational workaround.

Anything else is usually accidental persistence with an optimistic name.

## What an upgrade preflight now has to ask

Manifest validation and image compatibility remain necessary. They are no
longer the whole preflight.

For each persistent node-local store that participates in the operation, the
procedure should be able to answer:

- Which component reads it during upgrade, boot, drain, or workload recovery?
- Can the target tooling parse and use its current contents?
- If it fails, is the safe action recreation, migration, or an explicit
  exception?
- What evidence after the operation distinguishes a successful system from a
  command that merely returned success?

The last question matters in both directions. The UEFI case produced a failing
command around a node that had reached the intended runtime version. Storage
tooling can also return through several apparently successful setup steps before
a later parser exposes the persistent blocker.

The authoritative result is therefore a set of observed postconditions, not the
exit code of the most prominent command:

```text
target version is running
node is Ready
required storage paths attach
workloads recover
known exceptions match their declared scope
```

A green command without those postconditions is weak evidence. A known,
understood command error with those postconditions can be an accepted result,
but only when the exception was declared in advance.

## Rollback needs a state model

The earlier lesson from
[A GitOps rollback needs time to reach Git](/notes/a-gitops-rollback-needs-time-to-reach-git/)
was that a live correction is temporary until the desired state is corrected.
This incident adds a lower layer: restoring the desired version is not
necessarily enough when mutable state below Git survives the rollback.

Before using rollback as causal evidence, record at least:

```text
version being changed
persistent stores the version can read or mutate
which stores survive the rollback
which stores were modified during the failed attempt
postconditions used to compare the runs
```

Without that state model, "it also failed after rollback" is an observation, not
a clean exclusion of version causality. The newer version may have left behind
state that the older version then inherited, or both versions may be consulting
a pre-existing defect outside the package boundary.

Rollback remains useful. It simply does not travel backward in time.

## The resulting operating boundary

The cluster now has a more accurate upgrade model:

```text
realized behavior =
    declared desired state
  + actuator and parser versions
  + persistent node-local state
  + accepted operational exceptions
```

The answer is not to put firmware variables and runtime databases under Git.
That would confuse authority rather than improve it. The answer is to inventory
the local stores that can materially change an operation and assign each one a
control: recreate, validate, migrate, or accept.

The rollout ended with all nodes on the target version. Faulty iSCSI records were
handled through graceful drain or deliberate migration. The known UEFI defect
was not subjected to speculative surgery; its consequence is covered by a
node-specific reboot and verification procedure. The tester script now moves the
storage failure from post-upgrade diagnosis into preflight.

Git still describes the system intended to be built. The node still remembers
things Git does not. Reliable operations require knowing which memories can
change the build.
