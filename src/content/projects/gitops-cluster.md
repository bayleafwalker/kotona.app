---
title: Running a homelab cluster as a Git repository, not as muscle memory
summary: >-
  Appservice is the operations repository for a Talos-based Kubernetes cluster.
  Desired state and operating procedures live in Git. Repository review and
  dated runtime evidence are kept separate rather than implying live health.
published: 2026-04-07
lastRevised: 2026-10-12
lastVerified: 2026-10-12
draft: false
project: appservice
kind: engineering
status: Operations repository; runtime evidence is separately dated
featured: true
repoUrls: []
evidence:
  capability: >-
    The reviewed repository documents Talos and Kubernetes desired state, Flux
    reconciliation, encrypted secrets, and operating procedures. The July 2026
    upgrade and offline restore results remain historical evidence.
  latest: Repository scope reviewed; July runtime results not re-verified
  proofLinks:
    - label: Rollback and reconciliation rule
      href: /notes/a-gitops-rollback-needs-time-to-reach-git/
    - label: Live subnet migration record
      href: /notes/moving-a-live-cluster-to-a-new-subnet/
  integrations:
    - Flux
    - SOPS and age
    - VolSync
    - external snapshot storage
  knownLimitation: >-
    A repository review does not verify current cluster health, deployed
    versions, backup freshness, or a production control-plane restore.
  nextProof: >-
    Renew the independent restore evidence and verify agreement between Git,
    live upgrade plans, and the selected target before node changes.
tags:
  - gitops
  - kubernetes
  - operations
terms:
  - term: Appservice
    definition:
      The private GitOps repository that holds desired state, recovery rules,
      and operational evidence for the cluster.
reference:
  purpose: current-project-orientation
  discoverFor:
    - running a Kubernetes cluster from a Git repository
    - recovery and upgrade evidence for a Talos cluster
  establishes:
    - the repository's declared responsibilities as reviewed in October 2026
    - the distinction between source configuration and dated runtime evidence
  doesNotEstablish:
    - current cluster health, deployed versions, or backup freshness
    - a new restore drill or disruptive production control-plane restore
  supplementWith:
    - the live cluster's reconciliation status, upgrade plan, and recovery
      checks
---

## Overview

Appservice is the operations repository for a Talos-based Kubernetes cluster. It
declares workloads, but that is the least interesting part. The repository also
holds the secret model, upgrade rules, recovery procedures, health-check
protocols, and sanitized incident records needed to operate the cluster after
the bootstrap excitement has worn off.

The architecture is the result of migrations rather than a pristine first draft.
Networking, storage, DNS, database recovery, and application backups acquired
their rules through failures that were reproduced and written down. Controller
choices and version pins belong in the current manifests, not in a paragraph
that silently becomes an old inventory.

## System shape

The repository describes Talos and Kubernetes as the cluster base, Flux as the
reconciliation layer, and SOPS with age for encrypted secrets. Networking,
storage, application workloads, monitoring, and upgrade configuration are
organized through the desired-state tree. This describes the repository's
responsibilities; checking that the running cluster agrees is a separate step.

The recovery model recorded here separates application data from control-plane
state. Its July evidence covered the external control-plane snapshot path:
encrypted upload, remote verification, and an independent offline restore drill.
Those results remain useful history, but their age must not disappear when this
page receives an editorial update.

## Current verification scope

The review on 12 October 2026 checked the repository's current README and its
declared layout and operating workflow. It confirmed the source's stated role as
a Talos/Kubernetes GitOps operations repository with Flux reconciliation and
encrypted secrets. No live cluster query, upgrade, backup retrieval, or restore
drill was performed for this review.

The verification date above applies to that repository-scope assessment. It does
not refresh the July operational results below. The repository is private; this
page publishes only the bounded architectural account and already-public
historical evidence, not private manifests, addresses, or operational records.

## Historical operating evidence: July 2026

The 13 July 2026 version of this page recorded retirement of the old in-cluster
control-plane snapshot writer after the external path passed upload, checksum,
encryption, remote verification, scheduled monitoring, and an offline restore
drill. The retired namespace and Flux resource were then verified absent.

That record also described a serialized upgrade to Talos 1.13.6 and Kubernetes
1.36.2, with healthy post-upgrade control-plane state, workloads, storage, DNS,
monitoring, and a new verified snapshot. Those are the versions and results of
that dated operation, not a claim about what is deployed today.

The sequence matters more than the version numbers. An early readiness check
stopped when Talos access and snapshot posture were broken. The work resumed
only after rollback evidence existed, and the obsolete backup path was removed
only after its replacement had survived an independent check and restore
exercise.

## Open edges

The historical drill showed that an externally stored snapshot could be
retrieved, checked, decrypted, and read with compatible tooling. It did not
establish a production control-plane restore. Both the stored artifacts and the
current recovery procedure need fresh checks before another consequential
operation.

The recorded design spans the cluster repository and separate host
configuration. Interface drift, provider-specific storage behavior, and stale
version pins remain reasons to verify the complete path rather than trust a
previous successful run. A manual upgrade is not complete while a reconciler
still declares the old target.

Git owns desired state, but not every stateful surface involved in realizing it.
UEFI variables, boot entries, storage-client databases, and other host-local
records can survive reconciliation and invalidate an otherwise correct rollout.
Their health belongs in maintenance preflight and recovery procedures.
