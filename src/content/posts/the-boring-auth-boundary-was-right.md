---
title: The boring auth boundary was right
date: 2026-04-08T16:00:00Z
draft: false
summary: Homelab analytics had enough auth surface to accidentally grow a second identity product. The useful decision was to keep identity proof upstream, keep authorization local, and demote local login to a narrow break-glass path.
tags:
  - note
  - auth
  - architecture
---

There is a stage in many internal tools where authentication and authorization
are both "working," which is exactly when they become dangerous.

The platform already supported local session login, OIDC login, bearer-token
validation, service tokens, and group-to-role mapping. That is enough surface
area to accidentally grow a second identity system inside the application while
telling yourself you are only being practical.

The decision that followed is one of my favourite kinds because it is mostly a
boundary clarification.

Identity proof belongs upstream by default. Authorization stays in the app.
Machine access uses the same internal permission kernel. Local auth is demoted
to a narrow single-user or break-glass path instead of being allowed to evolve
into a parallel multi-user identity product.

This is not especially novel. That is part of the appeal.

The repo is very explicit about what the application should not own: MFA,
password reset, account recovery, or general user lifecycle features. Upstream
OIDC providers are better placed to handle those, and the application does not
become more elegant by reimplementing them poorly.

At the same time, the application keeps authorization local because the actual
permission semantics are specific to the platform. This is the part that often
gets flattened in lazy auth discussions. "Use an identity provider" and "let an
external system decide all authorization semantics" are not the same idea.

In this repo, they are intentionally separated.

That split seems right for at least three reasons.

First, it keeps the security maintenance surface smaller. Identity lifecycle is
messy in a very well-understood way. If you can avoid owning it, you should have
a concrete reason not to.

Second, it preserves app-specific semantics. The platform knows what its roles,
permissions, scoped actions, and audit events actually mean. Handing those away
just to sound integrated would mostly amount to moving the problem into a less
informed place.

Third, it keeps machine access from becoming a special kingdom with its own
rules. Service tokens and optional upstream machine JWTs are both mapped through
the same permission model. That is a cleaner result than maintaining one policy
system for humans and a second, slightly feral one for automation.

The local-auth posture is probably the most useful part of the note. Instead of
pretending local username/password should stay as a full parallel mode forever,
the ADR narrows it on purpose. Local auth becomes `local_single_user` and
break-glass access: explicit, temporary, internal-only, and auditable.

That is more honest than keeping a "temporary" local mode around until it has
quietly accumulated the expectations of a real product surface.

There is a trade-off, obviously. Narrowing local auth makes some workflows less
comfortable in shared deployments. It also forces a cleaner dependency on an
upstream identity provider. But those are sensible costs if the alternative is
carrying an accidental identity subsystem forever because it was once handy
during bootstrap.

The only part I would still want to keep an eye on is migration residue. The
runtime still carries compatibility inputs like `HOMELAB_ANALYTICS_AUTH_MODE`
alongside the clearer `HOMELAB_ANALYTICS_IDENTITY_MODE`. That is normal enough,
but these aliases have a habit of surviving longer than anyone intended.

So the note is not "auth is solved." It is narrower than that.

The note is that the repo drew the boring line in the right place. Upstream
systems prove who you are. The app decides what that means here. Local login is
an escape hatch, not a competing worldview.

That is not exciting, but it is exactly the kind of non-excitement that keeps a
platform from becoming weirder than it needs to be.