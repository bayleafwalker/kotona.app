---
title: Running a homelab cluster as a Git repository, not as muscle memory
summary: >-
  Appservice is the operations repository for a Talos-based Kubernetes cluster.
  Reconciliation, encrypted secrets, recovery gates, upgrades, and incident
  evidence live with the desired state instead of in operator memory.
published: 2026-04-07
lastRevised: 2026-07-13
lastVerified: 2026-07-13
draft: false
project: appservice
kind: engineering
status: Active operations repo
featured: true
repoUrls: []
tags:
  - gitops
  - kubernetes
  - operations
---

## Overview

Appservice is the operations repository for a Talos-based Kubernetes cluster.
It declares workloads, but that is the least interesting part. The repository
also holds the secret model, upgrade rules, recovery procedures, health-check
protocols, and sanitized incident records needed to operate the cluster after
the bootstrap excitement has worn off.

The architecture is the result of migrations rather than a pristine first
draft. Ingress eventually settled on Envoy Gateway API after earlier controller
choices became poor fits. Storage, DNS, database recovery, and application
backups acquired their current rules through failures that were reproduced and
written down. The repo is an operating surface, not a diagram of the system I
once intended to build.

## System shape

Talos and Kubernetes provide the cluster base; Flux owns reconciliation; SOPS
and age keep committed secrets encrypted. Networking, load balancing, storage,
application backup, databases, monitoring, and synthetic probes are composed
through the same desired-state tree. Manual mutation is for diagnosis or
contained recovery, and any durable fix belongs back in Git.

Recovery is split by failure domain. Application data uses storage snapshots,
VolSync, and database-native backups with scheduled restore drills. Control
plane state is written from outside the cluster, encrypted before upload,
validated, stored under immutable retention, and checked by an independent
monitor. A pre-upgrade gate rejects snapshots that are missing, stale, or
unverified.

## Current state

On 13 July 2026, the old in-cluster control-plane snapshot writer was retired
through GitOps after the external path passed upload, checksum, encryption,
remote verification, scheduled monitoring, and an offline restore drill. The
retired namespace and Flux resource were then verified absent. Backup recovery
is no longer the thin edge described by the original version of this page.

The same gate was used before a serialized upgrade to Talos 1.13.6 and
Kubernetes 1.36.2. The upgrade finished with healthy control-plane state,
workloads, storage, DNS, monitoring, and a new verified post-upgrade snapshot.
The version pins and runtime compatibility fixes are now recorded in the
repository.

That sequence matters more than the version numbers. An early readiness check
stopped when Talos access and snapshot posture were broken. The work resumed
only after rollback evidence existed, and the obsolete backup path was removed
only after its replacement had survived an independent check and restore
exercise.

## Open edges

The restore drill proves that an externally stored snapshot can be retrieved,
checked, decrypted, and read with compatible tooling. It does not pretend to be
a production control-plane restore; that remains a disruptive incident path.
The evidence also has to be renewed on schedule rather than treated as a
one-time achievement.

The external backup spans this repository and a separate host-configuration
repository, so interface drift between the two is a real maintenance risk.
Provider-specific storage behavior remains part of the recurring validation.
Neither is a reason to restore the retired in-cluster writer, but both belong in
the operating backlog.

The upgrade found another useful edge: an automation controller with stale
version pins can try to undo a manual upgrade. Future runs now need both the
backup gate and agreement between Git, live plans, and the selected target
before the first node changes.
