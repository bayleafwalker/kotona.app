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
repoUrl: https://github.com/bayleafwalker/appservice
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

## Current state

This is an active operations repo, not a frozen reference. Recent history shows
the repository being used to handle live incidents, including a workload image
rollback after a CrashLoopBackOff issue, remediation documentation, health
check updates, and cluster-health training material.

That history matters because it shows the repo being used for day-two work, not
only for initial setup. The cluster state, the decisions around it, and the
incident response notes are being kept together instead of drifting apart.

## Open edges

Some recovery paths are still thinner than the rest of the operating model.
Backup health, certificate renewal failure, and first-time operator bootstrap
still need tighter runbook coverage.

The operator surface is also still being narrowed. The minimal MCP service is a
placeholder, and some access patterns are described with more caution than
closure. The repo already has a clear operational stance, but a few boundary
decisions are still being tightened.
