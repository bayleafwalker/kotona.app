---
title: Plan migrations through verified intermediate states
role: operating
status: guiding
lifecycle: current
area: homelab operations
published: 2026-08-08
lastRevised: 2026-08-08
projects:
  - gitops-cluster
relates:
  - moving-a-live-cluster-to-a-new-subnet
  - a-gitops-rollback-needs-time-to-reach-git
  - the-node-remembers-what-git-does-not
draft: false
tags:
  - operations
  - migrations
  - homelab
  - gitops
  - systems-design
summary: A live migration needs more than a target diagram. Before changing the first node, name the temporary configurations, the checks between them, who controls each handoff, and the point after which rollback stops being cheap.
explorePrompt: >-
  Use this note as a worked instantiation, not a runbook to copy. The
  transferable question is how to design a live migration when the target
  diagram omits the temporary system that must remain operable during change.
  This note concludes that the plan should model named transition states,
  invariants, authority handoffs, evidence gates, persistent state, and
  state-dependent rollback before implementation commands are written. Its
  constraints include coexisting old and new paths, asynchronous reconcilers,
  cached client state, controllers that depend on what they control, and a
  rollback boundary that becomes more expensive after authority or writes move.
  Apply the question to one migration in your own environment. Identify the
  baseline and target authorities, enumerate only the temporary states that can
  actually occur, state testable invariants and observation points, and mark the
  last cheap rollback point. Explicitly challenge the method where the change is
  truly atomic, offline restoration is cheaper, or added transition machinery
  creates more risk than it removes. Produce a transition-state table, an
  authority map, gates with retained evidence, and a rollback matrix that
  distinguishes reversal from restoration, reconstruction, and forward repair.
---

Before moving the first component, write down the temporary configurations the
system will pass through. Give each one a test and a recovery action.

This rule came from a live cluster subnet migration. During the move, nodes
existed on both the old and new networks. Service addresses were announced on
both sides, DNS and gateway addresses changed together, a temporary DNAT rule
kept NFS reachable, and the network controller ran inside the cluster whose
network it was changing. None of that appeared in the target diagram. Nearly all
of the risk lived there.

Use this method when old and new paths will coexist, clients cache connection
details, data can change during the move, or a controller may undo manual work.
A genuinely offline replacement with a tested restore needs a shorter runbook.

## Write the states before the commands

A useful starting sequence is:

```text
S0  old path only
S1  old and new paths available; old still decides
S2  new path decides; old path remains for recovery
S3  new path only; temporary scaffolding remains
S4  scaffolding removed; recovery uses the new design
```

Delete states that cannot occur. Add states when they change who controls the
system, what must remain true, or how recovery works. A state may last for five
minutes or several days; duration is not what makes it important.

For each state, record:

| Item            | Question to answer                                                               |
| --------------- | -------------------------------------------------------------------------------- |
| Active paths    | Which addresses, routes, replicas, or credentials can still be used?             |
| Decision point  | Which Git revision, DNS record, writer, issuer, or controller currently decides? |
| Checks          | What must pass before entering the next state?                                   |
| Persistent data | What survives if software or configuration is rolled back?                       |
| Recovery        | What exact action returns service, and what does it leave behind?                |

A numbered command list comes after this table. Without the table, command 15
may be perfectly clear while nobody knows whether it is safe to run.

## Name what must remain true

Write conditions that can be tested from a named observation point. For the
subnet migration, these were representative checks:

```yaml
invariants:
  - claim: At least one approved management path reaches the cluster API.
    test: talosctl and kubectl succeed from the recovery workstation.

  - claim: Every service subnet still in use has a working announcer.
    test: A client on each active subnet reaches the test service.

  - claim: Production DNS returns only reachable service addresses.
    test: Resolve through each production resolver and connect to every result.

  - claim: Required persistent storage remains readable and writable.
    test: A disposable pod writes, reads, syncs, and removes a test file.

  - claim: Git describes the intended configuration, or reconciliation is recorded as suspended.
    test: Flux status and the repository revision match the runbook state.
```

“Services remain healthy” is not enough. Name the services, where the check
runs, and what success looks like. In this migration, individual nodes could
leave and rejoin. The important condition was that control paths and service
announcements never disappeared from both subnets at once.

## Group changes that establish one usable path

DNS, routes, load-balancer announcements, certificates, and policy may live in
different files and be applied by different controllers. They still combine to
form one endpoint.

In the subnet move, DNS and gateway changes had to land while speakers remained
on both networks. One reviewed Git revision grouped the intended change. That
did not make several reconcilers atomic; it made partial convergence safe. The
old path stayed available while each controller caught up.

Record the handoff directly:

```yaml
cutover:
  changes:
    - production DNS begins returning the new service address
    - new-subnet speakers already announce that address
  old_path_retained: true
  proceed_when:
    - every returned address is reachable
    - the cluster API is reachable from the recovery workstation
    - representative services and storage probes pass
```

Other migrations have different handoffs: disabling writes on an old database,
accepting tokens from a new issuer, moving a virtual IP, or merging the Git
revision that selects a new version. Name the event. “Cut over” is not a test.

## Put a gate after every change of state

A gate states what to inspect and what happens on failure:

```yaml
gate:
  state_entered: S2
  evidence:
    - cluster API reachable from management and client networks
    - all nodes report expected addresses
    - production DNS returns only reachable endpoints
    - representative direct and ingress checks pass
    - storage write and read probe passes
    - Flux reports the expected revision
  pass: remove old announcement coverage
  fail: restore previous records and retain dual-subnet operation
  retain:
    - command transcript
    - resolved addresses
    - controller status
    - Git revision
```

Use checks that do not all depend on the path being changed. A green dashboard
inside the cluster cannot, by itself, prove that the cluster is reachable from
the recovery workstation.

Typical commands include:

```bash
flux get all -A
kubectl get nodes -o wide
kubectl get pods -A -o wide
dig +short service.example.internal @resolver.example.internal
kubectl get endpointslices -A
ip route get 192.0.2.20
```

The commands are examples. The claims they test belong in the runbook.

## Mark the last cheap rollback point

Rollback changes as the system moves:

| Current state                           | Example failure                 | Recovery                                                                    |
| --------------------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| Both paths available; old still decides | New path is unreachable         | Remove the new route or address.                                            |
| New path decides; bridge remains        | Clients fail after cutover      | Restore the old record, keep the bridge, and revert the Git change.         |
| Old announcer removed                   | An old client still exists      | Restore an old-side announcer or move one node back.                        |
| Storage writes moved                    | New target is incomplete        | Stop writers, reconcile the difference, then choose the authoritative copy. |
| Cleanup complete                        | A hidden old dependency appears | Reconstruct a compatibility path or repair forward.                         |

The first row is cheap. The last may not be rollback at all. It can be
restoration, reconstruction, or forward repair.

Mark the last cheap point in the runbook. Before crossing it, confirm that the
old address, certificate, export, node configuration, or manifest needed for
recovery still exists.

## Check data that survives the rollback

Restoring an earlier image or Git revision does not restore the whole machine.
Firmware variables, iSCSI records, caches, generated credentials, database
migrations, storage metadata, and controller journals can remain changed.

Record those stores beside the disruptive step:

```yaml
persistent_state:
  - store: /var/lib/iscsi/nodes
    used_by: storage client and upgrade tooling
    survives_version_rollback: true
    before_cutover: parse every retained node record
    recovery_check: representative volumes attach and pass read/write probes
```

Choose one treatment for each store:

- recreate it when reconstruction is tested and cheap;
- validate it when it must survive unchanged;
- migrate it when its format or owner changes; or
- accept a specific defect when repair is riskier than a documented exception.

An earlier software version running against changed local data is a new
configuration. Test it as one.

## Account for controllers and bootstrap loops

GitOps, DHCP, DNS, load balancers, and Kubernetes operators keep acting while a
runbook is being executed. For every state, say whether the controller is active
and which configuration it will restore.

During emergency work, a supported suspend-and-resume operation may be safer
than fighting reconciliation. Flux provides
[suspend](https://fluxcd.io/flux/cmd/flux_suspend_helmrelease/) and
[resume](https://fluxcd.io/flux/cmd/flux_resume_helmrelease/) commands. Record
the reason, the exit condition, and the maximum duration. Resume only after Git
and the live system agree again.

Also identify loops such as:

- the network controller running on the network it controls;
- DNS running in the cluster reached through that DNS name;
- storage needed by the nodes being rebuilt; or
- recovery instructions stored only in the service being recovered.

Keep one side of each loop available. That may require an out-of-band route, a
local copy of manifests, a second resolver, a pinned image, or careful ordering.

## Finish the migration

The new path working is not the final state. Remove temporary routes, addresses,
proxies, certificates, and policy exceptions. Resume reconcilers. Prove expected
clients no longer use the old endpoint. Test recovery through the new design.

The final gate is:

```text
new path works
AND old path receives no expected traffic
AND old configuration cannot resume by accident
AND recovery no longer needs temporary scaffolding
```

If a bridge must remain, give it an owner and a review date. Otherwise the
migration has created a second architecture that nobody intended to operate.

## Review the runbook before execution

A fresh operator should be able to answer these questions without mentally
simulating every command:

- Which state are we in?
- What currently decides DNS, configuration, writes, and service reachability?
- Which checks permit the next step?
- Where is the last cheap rollback point?
- Which data survives reversal?
- How is the system reached if its normal controller is unavailable?
- What proves cleanup is complete?

If two states have the same answers, combine them. The method should expose
decisions, not manufacture paperwork.

The concrete records behind this rule are [Moving a live cluster to a new
subnet](/notes/moving-a-live-cluster-to-a-new-subnet/), [A GitOps rollback needs
time to reach Git](/notes/a-gitops-rollback-needs-time-to-reach-git/), and
[Account for node-local state in GitOps
recovery](/notes/the-node-remembers-what-git-does-not/).

## Sources and further study

- [The TOGAF Standard](https://www.opengroup.org/togaf), including baseline,
  target, transition architectures, roadmaps, and migration planning
- [Kubernetes controller-manager](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/)
- [Declarative management of Kubernetes objects](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/)
- [Flux suspend HelmRelease](https://fluxcd.io/flux/cmd/flux_suspend_helmrelease/)
- [Flux resume HelmRelease](https://fluxcd.io/flux/cmd/flux_resume_helmrelease/)
