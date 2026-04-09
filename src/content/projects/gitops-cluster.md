---
title: Running a homelab cluster as a Git repository, not as muscle memory
summary: >-
  Appservice is the operations repo for a Talos-based homelab cluster. It
  treats reconciliation, encrypted secrets, upgrades, and incident capture as
  repository state rather than operator memory.
date: 2026-04-07
draft: false
project: appservice
status: Active operations repo
repoUrls:
  - https://github.com/bayleafwalker/appservice
tags:
  - gitops
  - kubernetes
  - operations
---

## Overview

Appservice is the operations repo for a Talos-based homelab cluster. The point
of the repository is not only to declare workloads, but to keep the cluster
recoverable by storing the expected state, the secret handling model, the
upgrade path, and the operating notes in one place.

The repo is therefore closer to an operating surface than to a bootstrap
artifact. It is meant to reduce the amount of cluster knowledge that lives in
shell history or individual operator habits.

The cluster's current shape is the result of several deliberate migrations
rather than an initial design that held. Ingress moved from Traefik to NGINX to
Envoy Gateway API, each time because the previous choice had either outgrown
its operational model or was fighting the rest of the stack. The DNS layer
settled on a split between OPNsense, AdGuard Home, and Unbound, which is more
moving parts than anyone would choose from scratch but reflects a layered
resolution of ad blocking, local DNS, and upstream forwarding that actually
stayed stable once the port allocation was explicit.

The underlying storage is TrueNAS with ZFS pools, and the relationship between
TrueNAS and the cluster has its own operational history. Earlier iterations
included running TalosOS and ArgoCD on TrueNAS Scale VMs,
CNPG/PostgreSQL with documented reboot-recovery procedures, and enough
failure-and-fix cycles that the current recovery documentation is a product of
experience rather than speculation.

## System shape

The operating model is strict GitOps around Talos, Flux, and SOPS. Cluster
state lives under the main cluster tree, secrets stay encrypted, and changes
are expected to reconcile through the repo rather than through manual cluster
mutation.

Around that core, the repo defines the rest of the platform boundary: Cilium
networking, MetalLB, Longhorn and OpenEBS storage, VolSync, Prometheus and
Loki, internal health checks with Gatus, and external probing with Blackbox
Exporter. Runbooks, disabled-service notes, and upgrade guidance are treated as
part of the same operating model.

Network access runs through WireGuard and Tailscale, with OPNsense handling the
firewall boundary. The combination of VPN layers is deliberate: WireGuard
provides the raw tunnel for infrastructure access, Tailscale covers the
convenience-access cases that benefit from its mesh model and identity layer,
and OPNsense stays as the boundary device rather than being bypassed by either.

This is, again, more of a resolution of slow operational changes than explicit
architecture. WireGuard was the original VPN of choice allowing ingress into
LAN from external networks, but later multi-cluster setups and scaling of nodes
resulted in Tailscale filling a more meaningful role (lovely onboarding there).

## Current state

This is an active operations repo, not a frozen reference. Checking out my recent
repository work history shows the repository being used to handle live incidents
, including a workload image rollback after a CrashLoopBackOff issue, remediation
documentation, health check updates, and cluster-health training material.

That history matters because it shows the repo being used for day-two work, not
only for initial setup. The cluster state, the decisions around it, and the
incident response notes are being kept together instead of drifting apart.

Of all my projects, this is pretty much the longest lasting and maybe surprisingly
_not_ the most updated. I'm pretty happy with the scope of operating my homelab
from the kubernetes cluster, especially running on talos nodes which have been
very hands off and easy to maintain after initial stress on understanding their
very different maintenance model.

## Open edges

Some recovery paths are still thinner than the rest of the operating model.
Backup health, certificate renewal failure, and first-time operator bootstrap
still need tighter runbook coverage.

The operator surface is also still being narrowed. The minimal MCP service is a
placeholder, and some access patterns are described with more caution than
closure. The repo already has a clear operational stance, but a few boundary
decisions are still being tightened.

The ingress migration history also left some documentation gaps. The reasons for
each transition are clear in commit history and operator memory but not fully
captured as decision records in the repo itself. Writing those down, even
briefly, would make the current Envoy Gateway API choice easier to evaluate for
anyone who was not present for the previous two iterations.
