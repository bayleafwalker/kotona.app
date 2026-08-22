---
title: Moving a live cluster to a new subnet
role: project-history
status: guiding
lifecycle: current
area: cluster operations
published: 2026-06-10
lastRevised: 2026-07-13
projects:
  - gitops-cluster
tags:
  - operations
  - kubernetes
summary:
  "Migrating a Talos cluster from a legacy subnet to its own VLAN while it kept
  serving. The design was mostly an ordering problem, plus one bootstrap loop:
  the network controller lives inside the network it manages."
explorePrompt: >-
  Use this note as a worked migration, not a runbook to copy. The transferable
  question: in a live migration, which single step is irreversible, and does
  everything else in the plan exist to prepare for it or clean up behind it? In
  the worked case a Kubernetes cluster moved from a legacy flat subnet to a
  dedicated VLAN while still serving. Preparation was parameterizing every
  hardcoded address and CIDR before touching anything live, with one documented
  exception handled by string replacement at cutover -- the exception went in
  the runbook, which is where exceptions belong. The real constraint was
  announcement coverage: service addresses resolve only while some node still
  announces them, so the gate was a single atomic commit assigning dual
  addresses and updating the resolver override, executed while speakers existed
  on both subnets and necessarily before the last legacy node left. The awkward
  part was self-reference: the controller managing the switching fabric ran
  in-cluster on an address the migration was moving, so fabric and cluster had
  to never both let go at once. Apply the question to a migration you are
  planning. Find the irreversible step, name what must be true at the instant it
  lands, and look for the component that manages the thing it runs on. Say where
  your constraints diverge -- no dual-stack window, no atomic configuration
  commit, a fabric you do not control. Produce the ordering with the
  irreversible step marked.
---

The cluster sat on a legacy flat private subnet — a known debt rather than a
decision — and the target was a dedicated cluster VLAN with an address plan
worth writing down once: API VIP, control-plane range, load-balancer pool, and
static infrastructure each had a declared place. Both MetalLB and Cilium
announce in this cluster, so every pool change means two pairs of resources, not
one.

The prep work was Flux hygiene: parameterize every hardcoded LB IP and CIDR
before touching anything live. Five variables across the cluster settings
covered the registry, Forgejo SSH, the LDAP outpost, Postgres, and the LAN CIDR
in six network policies — with one documented exception, a registry mirror that
uses the IP as a YAML mapping key and gets handled by plain string replacement
at cutover. The exception went in the runbook, which is where exceptions belong.

The migration itself ran node by node with both subnets alive, and the actual
design constraint was L2 announcement coverage. Service IPs only resolve while
some node is around to announce them, so the gate in the sequence was a single
atomic Flux commit — dual-IP assignment for the gateway and DNS, resolver
override updated in the same change — executed while speakers still existed on
both subnets. Once the last legacy node leaves, nobody announces .87.x ever
again; the commit had to land before that, not after. Everything else in the
runbook was either preparation for that commit or cleanup behind it. A small
DNAT bridge kept NFS persistent volumes reachable across the boundary in the
meantime.

The awkward part was self-reference. The Omada controller — the management plane
for the switching fabric the VLANs run on — runs in-cluster, on a LoadBalancer
IP that the migration was in the middle of moving. The tidy ambition of a
separate management VLAN had to bend to that: switch and AP management can live
wherever, but they all need a route to a controller whose address is cluster
state. The fabric depends on the cluster, the cluster runs on the fabric, and
the runbook's job was to make sure they never both let go at once.

Nothing here was clever. The order of operations was the entire design, which is
roughly what you want from a migration: a sequence boring enough to execute on a
weeknight, with the one irreversible step clearly marked.
