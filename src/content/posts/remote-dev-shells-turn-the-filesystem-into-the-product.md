---
title: Remote dev shells turn the filesystem into the product
date: 2026-04-08T14:00:00Z
draft: false
summary: The interesting part of the remote dev shell cutover was not SSH or code-server. It was moving the real working state onto shared storage without corrupting repo-local databases or pretending two writable trees could coexist peacefully.
tags:
  - note
  - remote-development
  - infrastructure
---

It is easy to describe a remote development shell as an application.

There is an image. There is an SSH service. There is a deployment. There is a
Gateway route. Those are all real pieces, but they are not the part that makes
the cutover delicate.

The delicate part is the filesystem.

The runbook for the `vscode-shell` cutover makes this fairly plain. The workload
itself needs a shared workspace PVC, a persistent home directory, a predictable
toolchain in the image, DNS, routing, and authentication. None of that is very
surprising. The interesting part starts when the workstation source tree is no
longer treated as merely local and gets migrated into the shared TrueNAS-backed
workspace used by both the shell pod and the workstation.

At that point the storage path stops being background infrastructure. It becomes
the thing you are actually moving.

The runbook even calls out the parts that are easy to damage:

- preserve `.git`
- preserve `.claude`
- preserve repo-local `.sprintctl` and `.kctl` state
- preserve worktrees
- do not run the same repo-local SQLite-backed tooling from two places at once
- do not keep writing to both the old and migrated trees simultaneously

That last point is the one I like most because it is both obvious and routinely
ignored in practice. There is always a temptation to do a "gradual" cutover that
quietly leaves two writable trees alive for a while because the real switchover
is inconvenient. That can work right up until the state you care about is not
plain source code anymore.

Once repo-local databases, claims, handoff files, and worktrees are part of the
day-to-day workflow, the filesystem is carrying coordination state, not just
files you can re-clone later. A sloppy migration is not merely untidy. It can
create genuinely ambiguous ownership and history.

There is also a nice minor lesson in the earlier shell rollout failure. The
training docs record that an NFS-backed home path first failed at the storage
layer and then failed again at container startup because the image entrypoint
made ownership assumptions that did not survive root-squashed NFS. That is a
good example of one infrastructure problem masking another. Fixing the mount did
not fix the runtime behavior because the runtime had quietly assumed it would be
allowed to `chown` things on startup.

That sort of assumption is easy to miss when developing against local disks.

The overall cutover plan is reassuringly cautious: prepare the storage paths,
build and publish the image, reconcile the cluster in dependency order, do an
initial sync, stop active writes, do a final sync, repoint the workstation, and
verify both the shell and the repo-local state paths afterwards. There is even a
clean rollback story: keep the workstation on the old tree, suspend shell use,
revert the GitOps changes, and do not continue dual-writing.

That is a better shape than the usual remote-dev pitch, which tends to focus on
how convenient it will be once the browser opens and the prompt appears.

Convenience matters, of course. But the actual product here is a shared working
state that can be used from multiple environments without lying about where the
source of truth lives.

The note I would keep from this is simple enough:

Remote development stops being "just another workload" as soon as the important
state is no longer disposable. After that, the storage layout, migration order,
and write-exclusivity rules matter at least as much as the shell image.

`[TODO: confirm whether the workstation bind-mount cutover was completed exactly
as the runbook describes, or whether the final state diverged in some practical
way.]`

Either way, the design pressure is clear. Once the filesystem carries repo code,
credentials, worktrees, and local execution state, it is not a plumbing detail
anymore. It is the actual product surface you are cutting over.
