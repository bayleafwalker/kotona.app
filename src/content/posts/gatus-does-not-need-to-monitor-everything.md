---
title: Gatus does not need to monitor everything
date: 2026-04-08T17:00:00Z
draft: false
summary: "The monitoring split that held up best was also the less ambitious one: keep Gatus on in-cluster checks, keep edge probes in blackbox-exporter, and stop trying to make one checker own every route shape."
tags:
  - note
  - monitoring
  - kubernetes
---

There was a decision point in the cluster monitoring setup where several paths
were still open, and the most interesting outcome is that the smallest one won.

`gatus` now stays focused on internal checks against `*.svc.cluster.local`
targets. Public and edge-path probing stays in `blackbox-exporter`. The extra
hairpin and canary ideas were explored, documented, and then deliberately not
adopted.

That is not a dramatic design result, but it is a useful one.

The temptation in monitoring setups is always the same. Once a tool is already
working, it starts looking like the natural home for adjacent problems. If
Gatus can check internal endpoints, why not public routes too? If the public
routes are slightly awkward because of network policy or hairpin behavior, why
not add a dedicated checker identity and a few more rules? The logic is always
plausible one step at a time.

The problem is that alert ownership gets murkier while operational surface area
gets larger. You end up with multiple tools telling overlapping stories about
the same path, plus more policy, more maintenance commands, and more ways to be
half-right.

The closed Track B decision for Gatus is useful because it declines that whole
trajectory.

The final posture is plain:

- Gatus checks internal services.
- Blackbox Exporter checks edge and public paths.
- New public-path checks do not get added to Gatus.
- Dedicated Track B checker workloads are not introduced just because they are
  technically possible.

I like this decision because it treats architecture as an operational boundary,
not as an optimization puzzle. The docs even say the quiet part out loud: the
chosen option had the lowest operational complexity and avoided duplicate alert
surface.

That is the sort of sentence more infrastructure docs should allow themselves.
Not every decision needs a grand theory. Sometimes the least bad option is the
one that does not create a second thing to maintain in order to prove that the
first thing was incomplete.

There is also a smaller lesson hiding in the maintenance workflow. The repo
insists that validation and debugging for this monitoring split stay Git-managed
and scriptable rather than drifting into one-off runtime state. That matters
because monitoring setups decay through exceptions. First you add one temporary
check, then one policy exception, then a special note in a shell history nobody
else can see, and eventually the monitoring system starts to look like oral
tradition with YAML around it.

The Gatus maintenance docs push the other way. Validate connectivity. Validate
status. Run the known diagnostics when needed. Clean up temporary resources.
Keep the steady state boring.

There is still a limit here. This decision says where checks should live. It
does not magically remove the normal work of keeping endpoint definitions,
policies, and alert ownership in sync with actual service intent. The cluster
already has examples where parked services kept being monitored as though they
were supposed to be serving traffic. No tool split fixes that kind of mismatch
by itself.

But the split does make the mismatch easier to reason about. If a public route
is noisy, it belongs to the public-path probe system. If an internal service is
quietly failing on-cluster DNS or policy, that belongs to Gatus. Fewer tools are
allowed to be confused at the same time.

That is enough of a win for one note.
