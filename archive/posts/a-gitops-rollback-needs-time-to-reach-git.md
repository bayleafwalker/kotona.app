---
title: A GitOps rollback needs time to reach Git
date: 2026-04-08T18:00:00Z
contextWindow: cluster operations, 2025-2026
draft: false
summary: A live rollback fixed a crashlooping workload, but the more interesting part was needing to suspend reconciliation long enough for the fix to become the desired state instead of a temporary lie.
tags:
  - note
  - operations
  - gitops
---

The immediate problem was simple enough. A workload started crashlooping after a
newer image revision landed. The sidecar in the same pod was healthy, which was
useful mostly as a reminder that pod health can still be a slightly dishonest
summary of application health.

The rollback itself was straightforward. The live HelmRelease was patched back
to an earlier safe revision, the deployment rolled, and the service recovered.

What made the incident worth writing down was the part after that.

In a GitOps setup, a live rollback is not the end of the story. It is a local
correction to a declarative system that still believes something else. If Git is
left pointing at the bad revision, reconciliation will eventually helpfully put
the problem back.

So the real fix had two parts.

First, restore the workload live.

Second, suspend reconciliation for that slice long enough to update the repo to
the known-safe state. Until that happens, the rollback is real but not yet
durable.

That distinction is easy to miss when GitOps is discussed in broad, tidy terms.
The automation is supposed to converge reality back to the declared state. This
is exactly why it occasionally needs to be paused while you correct the
declaration itself.

The same remediation note also described a second issue around an Immich
backup-path workaround. That one is useful as a contrast. A previously failing
Longhorn RWX mount path was re-tested directly with a disposable pod on the
earlier suspect worker, the mount succeeded, and the temporary affinity override
was removed.

That is the cleaner kind of recovery: verify the path, remove the workaround,
return the manifest to something boring.

The rollback case was messier in a more operational way. The service was healthy
again, but the system was temporarily carrying an explicit divergence between
live state and Git-managed state. That is acceptable for a while. It is not a
steady operating mode.

The useful lesson is narrower than "patch production live when needed" and also
narrower than "never patch production live." Both slogans are too neat to be
useful.

What seems true instead is this:

1. A live rollback is reasonable when it is clearly part of a path back to Git.
2. A suspended reconciliation is a short-term containment tool, not a new home.
3. Sidecars can make failure shape less obvious by letting a pod look more alive
   than the application really is.

I also like that the event ended up as a training artifact instead of only as a
fix. The remediation material records the command path, the risk call, and the
remaining follow-up. That is more useful than pretending the live patch never
happened.

There is still one unresolved part I would want to close before claiming the
incident is fully understood: the reviewed material is clear about which image
revision regressed and which revision recovered, but not yet about what changed
inside the bad image strongly enough to cause the crashloop.

That gap does not block the operational conclusion. The service came back, the
dangerous state was contained, and the remaining work is procedural rather than
urgent. But if the point is to learn from the incident and not only survive it,
then the repo should eventually say what actually regressed and not only which
earlier revision happened to behave.

Until then, the main lesson is pleasantly ordinary. GitOps is very good at
restoring declared state. This also means you occasionally need to stop it from
restoring the wrong declared state faster than you can correct the declaration.
