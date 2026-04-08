---
title: Running a homelab cluster as a Git repository, not as muscle memory
summary: The recurring problem was not bootstrapping Kubernetes but keeping day-two changes, secrets, and upgrades recoverable in a small environment. The repo chose a strict Flux, Talos, and SOPS operating model with explicit runbooks and incident docs, which costs some convenience but gives the cluster an auditable recovery story.
date: 2026-04-07
draft: false
project: appservice
status: Active operations repo
tags:
  - gitops
  - kubernetes
  - operations
---

## Summary

This repo is less about creating a cluster than about refusing to let it turn
into folklore. The chosen operating model is strict GitOps around Talos, Flux,
and SOPS or age, with explicit docs for upgrades, secrets, disabled services,
and health checks. That means even small fixes pass through more YAML and more
process than they would in a hand-managed cluster, but the trade is deliberate:
recovery and auditability matter more than short-term convenience.

## Context

The repository describes a Talos-based Kubernetes cluster with Flux managing the
state under `clusters/main`, SOPS-encrypted secrets, Cilium networking,
MetalLB, Longhorn and OpenEBS storage, VolSync, Prometheus and Loki, and a mix
of internal and edge health checks.

The docs are also explicit that day-two operations are part of the design, not
an afterthought. There is a release guide, operations guide, secrets policy,
disabled-services decision log, and guidance for controlled Talos and
Kubernetes upgrades through System Upgrade Controller plans.

## Problem

The real recurring problem was cluster drift. It is easy to end up with a
working homelab cluster that nobody can reliably rebuild because secrets live in
someone's shell history, upgrades happen from memory, and the only record of a
service being disabled is that it quietly never came back.

That gets worse once the cluster starts carrying storage, ingress, certificate,
and monitoring concerns at the same time. A small environment does not remove
operational complexity. It mostly removes the illusion that someone else will
clean it up later.

## Constraints

- Secrets had to stay encrypted at rest while still living inside the GitOps
  flow.
- Manual cluster mutations were treated as drift, not as normal maintenance.
- Talos and Kubernetes upgrades needed a controlled rollout path rather than
  hopeful sequencing.
- Operator access had to stay internal and restrained; the docs explicitly warn
  against casually widening MCP or code-server exposure.
- Health checks had to distinguish internal service availability from edge and
  public-path reachability.
- Disabled services needed a visible lifecycle instead of being left to memory.

## Options considered

The docs do not spell these out as a formal ADR matrix, but the practical
choices are visible.

- Run the cluster mostly by hand with `kubectl`, `helm`, and local notes. This
  keeps the feedback loop short, but it is exactly how configuration drift and
  operator-specific knowledge become the system.
- Keep a declarative repo for workloads while leaving secrets, upgrades, and
  recovery steps outside it. That lowers the barrier to entry, but it breaks the
  claim that the repo is actually the operating surface.
- Treat incidents and temporary service shutdowns as ad hoc exceptions. That is
  common and easy, but it produces a cluster that looks healthy in Git while the
  real operating history lives elsewhere.
- The chosen direction was to keep the repo as the source of truth, encrypt the
  sensitive parts, and document operational deviations as first-class artifacts.

## What was built

The core shape is straightforward: Talos machine definitions, Flux bootstrap and
reconciliation entrypoints, secondary Helm, Git, and OCI repositories, and a
tree of manifests organized by cluster function. Secrets stay encrypted through
SOPS rules, and version substitution flows through cluster-config and
upgrade-settings.

The more interesting part is the operating model around that tree. Upgrades are
gated through System Upgrade Controller plans. Internal service checks use
Gatus against in-cluster DNS names, while Blackbox Exporter handles public and
edge probes. Disabled services are tracked in a decision log. Operator access is
documented with deliberate guardrails around code-server and MCP exposure.

## How it held up

The strongest evidence is operational rather than architectural.

Recent history shows the repo being used to handle live incidents: one workload
image bump was rolled back after a CrashLoopBackOff issue, and the same change
set added remediation documentation for the incident. Nearby commits also add
health checks, adjust service replicas, and update cluster-health training docs.

That does not prove the cluster is always calm. It does show that the repo is
actually being used as the place where incidents, decisions, and reconciled
state meet instead of being split across memory, shell history, and vague good
intentions.

## Trade-offs and limits

This approach is heavier than hand-managed Kubernetes. Small changes cost more
because the operating model insists on reconciliation, documentation, and secret
handling discipline.

There are also visible gaps. The minimal MCP service is still a placeholder in
the docs, some recovery paths are referenced more than fully written, and the
operator-surface story is still being evaluated rather than completely settled.

## What I'd change

The next improvements are fairly practical: close the remaining runbook gaps for
backup health, certificate renewal failure, and first-time operator bootstrap,
then narrow the operator-access story so the repo stops carrying multiple half-
decided options.

I would also keep leaning into incident capture. For a cluster like this, a
short, slightly boring remediation note is worth more than another abstract
architecture diagram.
