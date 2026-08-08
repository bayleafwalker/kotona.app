---
title: The target state is not the plan
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
summary: A target diagram describes where a system should settle, not the temporary systems that must remain operable on the way there. Model coexistence, authority handoffs, gates, persistent state and rollback before changing the first node.
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

A target-state diagram describes where the system should settle. It does not describe the system that must keep working while old and new addresses, controllers, data paths, and declarations coexist.

The target state is not the plan.

A migration plan is the architecture of the temporary systems operated between baseline and target.

For a live homelab change, the useful planning unit is not a task such as “move node 2” or “change the subnet.” It is a **transition state**: a configuration that may exist for minutes or days, has explicit dependencies, and must remain operable long enough to validate or reverse.

The rule is:

> Before changing the first component, describe each temporary state, the invariants it must preserve, the event that changes authority, the evidence required to continue, and the last cheap rollback point.

This applies to subnet moves, DNS changes, storage migrations, ingress replacement, identity-provider changes, GitOps controller upgrades, and most other infrastructure work where the old and new worlds cannot be switched atomically.

## Scope

Use this method when at least one of the following is true:

- old and new endpoints will coexist;
- a controller is moving a system it also depends on;
- clients cache names, routes, credentials, or sessions;
- data can change during migration;
- a reconciler may undo live work;
- rollback becomes harder after a particular node, record, or authority moves;
- temporary bridges, routes, replicas, or compatibility layers are required.

For a genuinely offline replacement with a tested restore, a shorter runbook is enough. Do not produce a miniature enterprise architecture programme for changing a fan. The fan will not respect it.

## The five required artifacts

A practical migration plan needs five things:

1. **Baseline and target boundaries** — what is authoritative before and after.
2. **Transition-state table** — which old and new components coexist at each step.
3. **Invariants** — what must remain true throughout the move.
4. **Cutover and validation gates** — which event changes authority and what proves the new state works.
5. **Rollback matrix** — what reversal means before and after each threshold.

A checklist of commands is useful only after these exist. Otherwise the commands are an implementation of an unstated theory, which is a slightly grand way of saying “we will discover the dependency graph while production is down.”

## 1. Define authority before drawing arrows

For each affected concern, state what currently decides truth and what will decide it after the migration.

| Concern               | Baseline authority                       | Target authority                 | Common hidden state                              |
| --------------------- | ---------------------------------------- | -------------------------------- | ------------------------------------------------ |
| Desired configuration | Git, live objects, appliance UI          | Git                              | suspended reconciliation, manual patches         |
| Name resolution       | existing DNS record and caches           | new record or resolver           | TTLs, local overrides, stale search domains      |
| Service reachability  | old address, route, or announcer         | new address, route, or announcer | ARP/ND caches, load-balancer speakers            |
| Storage path          | old export and network route             | new export or route              | open handles, mount retries, node-local state    |
| Identity              | old issuer, keys, and sessions           | new issuer or endpoint           | cached tokens, redirect URIs, clock skew         |
| Control plane         | current API endpoint and management path | new endpoint and path            | workstation routing, certificates, VIP ownership |

A migration can tolerate temporary duplication. It cannot tolerate ambiguity about which copy is allowed to make the next decision.

If the live system and Git disagree, record whether reconciliation is active. If two DNS records exist, state whether both are valid or one is only a fallback. If two storage copies can accept writes, state which one is authoritative and how divergence is prevented.

## 2. Model the temporary states

A useful generic sequence is:

```text
S0  old only
    The baseline is healthy and recoverable.

S1  old + new reachable
    Compatibility exists; authority has not moved.

S2  authority shifted, bridge retained
    New path is primary; old path still enables rollback.

S3  new only, cleanup pending
    Old authority is disabled; temporary scaffolding remains.

S4  new only, old path proven dead
    Bridges and exceptions are removed; recovery uses the new design.
```

Not every migration needs all five states. Every state that does exist needs a name and a gate.

For the recent cluster subnet migration, the important temporary system had:

- nodes on both old and new subnets;
- service announcements available on both sides;
- DNS and gateway addresses changing together;
- a temporary DNAT path preserving NFS reachability;
- an in-cluster network controller managing the fabric being changed;
- GitOps resources that had to converge in a particular order.

The target diagram contained none of that. The transition state contained almost all of the operational risk.

## 3. Write invariants, not aspirations

An invariant is a statement that must remain true across every permitted transition state. It should be specific enough to test.

For a live cluster network move, useful invariants might be:

```yaml
invariants:
  - id: CONTROL-PLANE-REACHABLE
    claim: At least one approved management path reaches the cluster API.
    test: talosctl and kubectl succeed from the recovery workstation.

  - id: ACTIVE-SUBNET-ANNOUNCED
    claim: Every service subnet still in use has at least one functioning announcer.
    test: A client on each active subnet resolves and reaches the test service.

  - id: DNS-POINTS-TO-REACHABLE-SERVICE
    claim: Every published service address is currently routable and announced.
    test: Resolve through each production resolver, then connect to every returned address.

  - id: STORAGE-AVAILABLE
    claim: Existing workloads retain read/write access to required persistent storage.
    test: A disposable pod performs a write, read, sync, and cleanup on each affected class.

  - id: DESIRED-STATE-EXPLICIT
    claim: Git describes the intended state, or reconciliation is deliberately suspended and recorded.
    test: flux status and repository revision agree with the runbook state.

  - id: NETWORK-CONTROLLER-RECOVERABLE
    claim: The switching and access-point controller remains reachable through a documented path.
    test: Open the controller and verify device contact from the recovery network.
```

“Services remain healthy” is not an invariant until the service set, observation point, and health test are named.

The best invariants reveal the shape of the migration. In the subnet move, the critical invariant was not “all nodes stay ready.” Individual nodes could leave and rejoin. The stronger requirement was that service announcements and control paths never disappeared from both subnets at once.

## 4. Identify the authority handoff

Most live migrations contain one event after which the new path is no longer merely a candidate. Examples include:

- DNS begins returning the new address;
- a virtual IP moves to new announcers;
- writes are disabled on the old storage target;
- a new identity issuer signs accepted tokens;
- Git changes the desired version or endpoint;
- the final node capable of serving the old network leaves it.

Name this event explicitly. Group changes that must be consistent into one reviewed unit.

In the subnet migration, DNS, gateway addressing, resolver behaviour, and load-balancer announcement coverage were coupled. Applying them as unrelated edits would have created valid-looking intermediate configurations in which names resolved to addresses nobody announced. The useful cutover unit was therefore one reviewed Git revision, applied while speakers still existed on both networks.

Git grouped the intended change. It did not turn several Kubernetes and network reconcilers into a distributed transaction. The transition states still had to tolerate partial convergence while those actors observed and applied the revision.

The principle is not “everything in one commit.” It is:

> Changes that jointly establish reachability should cross the authority boundary together, while the old recovery path still exists.

## 5. Put a gate after every state change

A gate is a decision point, not a decorative green check.

Each gate should specify:

```yaml
gate:
  state_entered: S2
  evidence:
    - cluster API reachable from management and client networks
    - all nodes report expected addresses
    - production DNS returns only reachable endpoints
    - representative services pass direct and ingress checks
    - storage write/read probe succeeds
    - Flux reports the expected revision and no blocked reconciliation
  decision:
    pass: proceed to remove old announcement coverage
    fail: restore previous records and retain dual-subnet state
  evidence_retention:
    - command transcript
    - resolved addresses
    - relevant controller status
    - Git revision
```

Representative commands depend on the system, but the pattern is stable:

```bash
# Desired state and reconciliation
flux get all -A
kubectl get helmreleases,kustomizations -A

# Cluster and node placement
kubectl get nodes -o wide
kubectl get pods -A -o wide

# Name and endpoint agreement
dig +short service.example.internal @resolver.example.internal
kubectl get endpointslices -A

# Test the exact endpoint even before normal DNS changes
curl --fail --show-error --resolve \
  service.example.internal:443:192.0.2.20 \
  "$SERVICE_URL/health"

# Route and neighbour visibility
ip route get 192.0.2.20
ip neigh show
```

A green dashboard can support a gate. It should not be the whole gate when the dashboard depends on the same DNS, route, or cluster being migrated.

## 6. Make rollback state-dependent

“Rollback: revert the change” is only true before the change has consequences.

Use a matrix:

| State                                | Failure                          | Rollback action                                                | Cost or hazard                                             |
| ------------------------------------ | -------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| S1: dual reachability                | new path unavailable             | remove new route/address; leave old authority untouched        | low                                                        |
| S2: authority shifted, bridge active | clients fail on new path         | restore old authority record; keep bridge; revert Git unit     | moderate; cache expiry may delay recovery                  |
| S3: old announcer removed            | old clients still exist          | reintroduce an old-side announcer or move one node back        | higher; requires preserved config and address availability |
| S3: storage writes moved             | new target corrupt or incomplete | stop writers, reconcile delta, restore old target as authority | potentially high; data divergence matters                  |
| S4: cleanup complete                 | hidden old dependency discovered | re-create a deliberately removed compatibility path            | highest; may require reconstruction rather than reversal   |

Mark the **last cheap rollback point** in the runbook. Do not call later recovery steps rollback when they are actually restoration, reconstruction, or forward repair.

Before crossing that point, verify that the evidence justifies it and that the recovery materials are still available. This can mean retaining an old address assignment, export, certificate, node configuration, or manifest for one more state than aesthetic tidiness would prefer.

## 7. Rollback restores a state, not a date

A rollback is another forward operation performed on the system that exists now. It can restore a version, declaration, route, or endpoint without restoring every state that the failed attempt read or changed.

This matters below Git as well as above it. A node can retain firmware variables, iSCSI records, caches, generated credentials, database migrations, storage metadata, or controller journals across a software rollback. The earlier version then inherits a machine it has never previously operated. A failed rollback does not cleanly prove that the version was irrelevant; it may only prove that the changed state survived it.

For every disruptive step, record the state that can outlive the apparent reversal:

```yaml
persistent_state:
  - store: /var/lib/iscsi/nodes
    read_or_changed_by: storage client and upgrade tooling
    survives_version_rollback: true
    preflight: parse every retained node record
    disposition: validate-or-migrate
    recovery_evidence: representative volumes attach and pass read/write probes
```

The useful dispositions are small:

- **Recreate** state that is genuinely disposable and whose reconstruction has been tested.
- **Validate** state that must survive but can be checked for compatibility before cutover.
- **Migrate** state whose representation or authority must change.
- **Accept** a bounded imperfection when repair is riskier than an explicit operational exception.

Rollback planning should therefore name both the version being restored and the state stores that remain. Otherwise “revert” means “repeat the experiment with several undocumented variables retained,” which is less a recovery plan than a sequel.

## 8. Treat reconciliation as an actor

In Kubernetes and GitOps systems, controllers continuously move current state toward declared desired state. The [Kubernetes controller model](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/) is helpful during ordinary operation and very capable of undoing an emergency change whose declaration was not updated.

The operating choices are:

1. change Git first and let reconciliation perform the transition;
2. suspend the relevant reconciliation, change live state, then update Git before resuming;
3. patch live state for containment, knowing it is explicitly temporary and may be overwritten.

Flux provides supported [suspend](https://fluxcd.io/flux/cmd/flux_suspend_helmrelease/) and [resume](https://fluxcd.io/flux/cmd/flux_resume_helmrelease/) operations for this purpose.

Record which actor is authoritative in every state:

```yaml
state: S2
configuration_authority: live cluster
reconciliation: suspended
reason: emergency restoration while repository change is prepared
exit_condition:
  - safe revision merged
  - source artifact available
  - reconciliation resumed
  - live and declared revision agree
maximum_duration: one maintenance window
```

A suspended reconciler is a bridge. Bridges are useful because they cross something, not because they make good permanent housing.

## 9. Design self-reference explicitly

The dangerous homelab migrations are often recursive:

- the network controller runs on the network it controls;
- DNS runs in the cluster whose API is reached through DNS;
- storage for the control plane depends on the nodes being rebuilt;
- GitOps needs the registry or source service it is migrating;
- the recovery documentation is stored only inside the service being recovered.

For each controller or authority, ask:

```text
What does it control?
What does it depend on?
Can that dependency change without the controller?
Can the controller be reached if the normal path fails?
What minimum external state is required to bootstrap it?
```

The answer may be an out-of-band path, a temporary static route, a local copy of manifests, a second resolver, a pinned image, or simply a carefully ordered move. The goal is not to eliminate all circularity. Small systems often cannot. The goal is to stop both sides of the loop from letting go at the same time.

## 10. Cleanup is a migration state

A migration is not finished when the new path works. It is finished when temporary authority, compatibility, and ambiguity have been removed or deliberately retained with an owner and expiry condition.

Cleanup should include:

- remove dual addresses, temporary routes, DNAT, proxies, and compatibility records;
- resume reconcilers and verify convergence;
- remove obsolete firewall and network-policy exceptions;
- prove no expected client still uses the old endpoint;
- archive or delete old secrets and certificates according to the recovery plan;
- update diagrams, inventory, and bootstrap documentation;
- test recovery using the target design rather than the migration bridge;
- record any temporary element intentionally retained, including why and until when.

A useful final gate includes negative evidence:

```text
new path works
AND old path receives no expected traffic
AND old authority cannot resume accidentally
AND recovery no longer depends on temporary scaffolding
```

Without that gate, the migration tends to leave behind a second, unofficial architecture. Homelabs are particularly good at this because nobody sends the temporary route a retirement letter.

## Reusable migration skeleton

```yaml
migration:
  objective: ""
  scope: []

  baseline:
    authorities: {}
    dependencies: []
    recovery_path: ""

  target:
    authorities: {}
    dependencies: []
    recovery_path: ""

  states:
    - id: S0
      description: "old only"
      active_paths: []
      authority: {}
      entry_conditions: []
      exit_gate: ""

  invariants:
    - id: ""
      claim: ""
      test: ""
      observation_point: ""

  cutovers:
    - id: ""
      authority_changed: ""
      atomic_changes: []
      prerequisites: []
      last_cheap_rollback_point: false

  validation:
    - gate: ""
      evidence: []
      pass_action: ""
      fail_action: ""

  rollback:
    - from_state: ""
      trigger: ""
      action: ""
      data_reconciliation: ""
      known_limit: ""

  persistent_state:
    - store: ""
      touched_by: []
      survives_rollback: true
      disposition: "recreate|validate|migrate|accept"
      recovery_evidence: []

  cleanup:
    temporary_elements: []
    negative_checks: []
    recovery_test: ""
```

## Failure patterns

### Target-only planning

The baseline and target are documented; coexistence is hand-waved. Hidden temporary systems then appear during execution without review.

### Task lists without state

Commands are ordered, but nobody can say what is supposed to be true after command 14 or whether command 15 is safe.

### Independent edits to one reachability boundary

DNS, routes, addresses, announcements, certificates, and policy are changed separately even though they jointly establish one usable endpoint.

### Rollback that assumes the old system stood still

The old copy continued receiving writes, tokens expired, clients cached the new path, or the last old-side speaker disappeared. Reversal is no longer symmetric.

### Controllers treated as passive tools

GitOps, DHCP, DNS, load balancers, operators, and appliance controllers continue acting while the runbook imagines the operator is the only source of change.

### Cleanup by optimism

The new path works, so temporary bridges are left in place. Six months later they are undocumented dependencies with firewall rules nobody dares remove.

## Validation and rollback of the method

Before executing a migration, another operator—or a fresh session with no unstated context—should be able to answer:

- What state are we in now?
- Which authority is active for each concern?
- Which invariants must hold?
- What evidence permits the next step?
- What is the last cheap rollback point?
- How do we recover if the normal controller is unreachable?
- What proves cleanup is complete?

If those answers require reading every command and mentally simulating the system, the runbook is not yet a migration model.

The rollback for excessive planning is also simple: collapse states that have identical authority, invariants, and recovery behaviour. A five-minute DNS edit does not need seven transition architectures. Keep only distinctions that change an operational decision.

## Related local records

- [Moving a live cluster to a new subnet](/notes/moving-a-live-cluster-to-a-new-subnet/) records the concrete Talos, Cilium, MetalLB, DNS, NFS, and controller ordering problem from which this method was extracted.
- [A GitOps rollback needs time to reach Git](/notes/a-gitops-rollback-needs-time-to-reach-git/) records the narrower case where live recovery and declared state temporarily diverged.
- [The node remembers what Git does not](/notes/the-node-remembers-what-git-does-not/) records two cases where persistent node-local state survived the declared version boundary and changed what rollback could prove.

The larger architecture literature calls these intermediate configurations **transition architectures**. The useful homelab translation is less ceremonial: design the system you will actually operate between the old state and the new one.

That is where the migration happens.

## Sources and further study

- [The TOGAF Standard](https://www.opengroup.org/togaf), including its treatment of baseline, target, transition architectures, roadmaps, and migration planning
- [Kubernetes controller-manager](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/)
- [Declarative management of Kubernetes objects](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/)
- [Flux suspend HelmRelease](https://fluxcd.io/flux/cmd/flux_suspend_helmrelease/)
- [Flux resume HelmRelease](https://fluxcd.io/flux/cmd/flux_resume_helmrelease/)
