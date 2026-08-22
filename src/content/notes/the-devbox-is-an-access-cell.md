---
title: The devbox is an access cell
role: exploration
status: prospective
lifecycle: superseded
lifecycleChanged: 2026-07-22
lifecycleReason: >-
  Its access-cell boundary is now merged with the action-envelope model so
  topology and authority are described together.
supersededBy:
  - authority-must-travel-with-the-action
area: agent infrastructure
published: 2026-07-19
lastRevised: 2026-07-22
projects:
  - vuoro
relates:
  - the-deployment-boundary-was-only-a-place
  - the-boring-auth-boundary-was-right
  - subprocess-not-service
  - the-second-operator-is-the-test
tags:
  - agents
  - infrastructure
  - authorization
  - audit
summary:
  A devbox can bind identity, tools, network reach, and session evidence, but it
  should remain a replaceable access cell rather than becoming the
  organizational authority.
explorePrompt: >-
  This note is superseded by "Authority must travel with the action", which
  merges its boundary with the action-envelope model so topology and authority
  are described together; read that first. This note remains the origin record
  for the topology half. The transferable question: what should the environment
  a session runs in be allowed to decide? The worked answer keeps it small. An
  access cell -- devbox, workstation, CI runner, ephemeral task environment --
  binds identity, offers approved tools, mediates network reach, and emits
  session evidence, and must not become the owner of policy or of what the
  organization authorized. The shape of the cell is a separate trade with its
  own security model: centralized cells make mediation and evidence easy but
  concentrate failure, individual cells reduce shared fate but complicate drift
  and secret distribution, ephemeral cells reduce residue but cost continuity.
  None may change the meaning of an authorization. The model is deliberately not
  Git-shaped: a cell exposing asset tooling can still carry stable identifiers,
  content hashes, tool revisions, capability receipts, and validation results,
  and an external system needs a narrow adapter rather than absorption. The
  design keeps one inconvenience on purpose -- a reachable tool may still refuse
  the operator, which is proof that the wall and the law are different
  mechanisms. Apply the question to an environment you provision. Name what it
  currently decides that it should not. Then read the successor and say what
  changes.
---

The devbox is a good entrance to an operating environment and a bad foundation
for its rules.

Putting a developer or agent behind WireGuard or Tailscale, inside a central or
individual workspace, solves a real problem. The box can expose project tools,
cache context, mediate network traffic, hold a working copy, and collect session
exhaust. It gives an otherwise dispersed environment a concrete operating
surface.

It is tempting to keep going. If every action passes through the box, let the
box hold the secrets. Let it decide permissions. Let it become the audit
authority. Let the centralized box become the substrate.

That turns an access convenience into a privileged computer whose compromise
reaches every system and whose outage stalls every trusted operation. The
environment has not acquired governance. It has acquired a single point of
authority and failure.

The access cell should have a smaller job:

```text
principal
  -> access cell
       binds session identity
       presents project context
       supplies approved tools
       mediates reachable targets
       requests scoped capabilities
       emits session evidence
  -> plane-owned interfaces
       knowledge
       work
       operational targets
```

Network admission answers where a principal can connect. It does not answer what
that principal may claim, which document revision governs an action, or whether
a runtime mutation was authorized. Reachability is an input to policy, not a
substitute for it.

The corresponding authority should remain outside the cell. A project or policy
service decides which capabilities may be issued. Each plane-specific adapter
verifies the capability before accepting a consequential operation. The
knowledge system remains authoritative for ratified context, the work system for
commitments and ownership, and the target system for its effects. The access
cell assembles and carries those authorities; it does not quietly inherit them.

This separation makes deployment topology much less important. A small team can
run one durable devbox. A larger team can issue an ephemeral cell per person,
agent, task, or CI attempt. A workstation can act as a cell when local work is
appropriate. The common contract travels with the principal and session rather
than with the hostname:

- a project identity and authenticated principal
- pinned context rather than a link to whatever is current
- tools and reachable targets declared for the session
- short-lived capabilities for mutations
- durable action and consequence references
- an expiry and teardown rule

Centralized and individualized cells then have ordinary trade-offs instead of
different security models. Centralization makes mediation and evidence
collection easy but concentrates failure and contention. Individual cells reduce
shared fate but make drift, secret distribution, and evidence collection harder.
Ephemeral cells reduce residue but make warm caches and interactive continuity
more expensive. None should be allowed to change the meaning of an
authorization.

The same rule handles systems that do not resemble Git. A game-development cell
might expose Perforce, a build farm, a digital-content tool, object storage, and
playtest environments. The session record cannot depend on a textual diff. It
can still carry stable asset identifiers, content hashes, tool revisions,
capability receipts, derived-build references, and validation results. The
artifact fabric changes; the authority model does not have to.

External systems fit for the same reason. An API unavailable inside the
environment does not need to be absorbed into it. A narrow adapter can exchange
stable identifiers, verify a capability, perform the external effect, and return
a receipt. The governed environment is not defined by owning every system. It is
defined by whether consequential actions can cross its protocol without becoming
anonymous.

There is one deliberate inconvenience in this design: a reachable tool may still
refuse the operator. That is not friction to optimize away. It is proof that the
wall and the law are different mechanisms.

The network boundary determines what can be reached. The access cell determines
how a session enters. Neither gets to decide, by itself, what the organization
has authorized.
