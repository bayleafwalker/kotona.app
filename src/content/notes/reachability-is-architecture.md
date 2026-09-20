---
title: Reachability is architecture
seoTitle: Reachability is architecture for hosted agent runtimes
role: exploration
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-09-19
lastRevised: 2026-09-20
projects:
  - vuoro
relates:
  - the-agent-is-not-the-application
  - authority-must-travel-with-the-action
  - why-production-access-changes-the-shape-of-agent-tooling
  - where-agent-tooling-fits
  - a-personal-knowledge-system-that-happens-to-render-as-a-website
draft: false
tags:
  - agents
  - infrastructure
  - mcp
  - coordination
  - availability
  - authorization
summary:
  The coordination services behind my agent work kept running after the agents
  moved into hosted runtimes. Because those runtimes could not reach them, the
  record became partial without producing an error.
explorePrompt: >-
  Use this note as a worked instantiation of a reachability failure, not as a
  recommendation to put every internal service on the internet. The worked case
  is a personal agent-coordination system that remained healthy and
  authoritative for local runs while hosted agent runtimes could not reach its
  private interface. The resulting record became silently partial. The proposed
  correction is a narrowly exposed, remotely reachable MCP adapter: public
  routing but authenticated access, explicit state handles but authorization on
  every call, and coordination records crossing the boundary while effect
  credentials and merge or deployment authority remain inside. The first test is
  read-only and must prove value beyond state already available in Git before
  any write surface is added. Apply the question to a system you operate: which
  actors does it claim to coordinate, which of them can actually reach its
  authoritative interface, and which omissions leave no error? Separate service
  health, declared-host reachability, observed participation, authorization,
  attestation, and effect authority. Produce a reachability matrix, an external
  observation plan, a boundary map of what may cross, and a bounded experiment
  with an explicit promotion or kill condition. Challenge the worked conclusion
  where narrowing the system's claim is cheaper and more honest than making it
  remotely reachable.
---

The first sign of failure was that nothing looked broken.

I had built the system around machines I controlled: command-line tools in the
working environment, a Postgres-backed service on a private network, and an
operator view over the resulting state. A run could register its intent, acquire
the relevant coordination state, leave evidence, and settle its outcome. The
record was incomplete in ordinary ways, but at least the path existed.

Then a growing share of the work moved elsewhere. A task started from a phone, a
cloud coding session, a scheduled run, or a repository event now executes in a
runtime I do not host. That runtime cannot reach a service on my private
network, and its egress policy is not mine to amend.

The local path kept working. The database passed its checks. The queue and
cockpit still looked coherent. Hosted work simply happened outside the record:
no intent registered, no run associated with the work, no evidence attached.
Nothing failed because nothing on the working path knew that a call had been
omitted.

**Working model.** If a coordination system claims to cover work performed by
hosted runtimes, remote reachability is part of its architecture. A service that
only the old execution environment can reach has not remained authoritative; it
has retained availability for a shrinking subset of the work.

The cheaper alternative may be to narrow the claim. The rest of this note is an
experiment for deciding which answer is honest.

## Healthy service, partial record

Most service checks observe the service, not the population of work that should
have used it.

A database can be available while half the relevant runs never connect. A queue
can contain no stuck items because the missing work was never enqueued. An audit
index can be internally complete while omitting every event produced beyond its
network boundary. These systems fail cleanly when a known request is rejected;
they are much less helpful when the request has no route to exist.

That makes two coverage properties separate from health:

```text
service health: can the coordination service process the requests it receives?
reachability coverage: can every declared runtime submit the records the system claims to own?
participation coverage: did every relevant run actually use that route?
```

The two questions need different denominators. Reachability coverage uses the
declared set of supported hosts and can be tested with a probe from each one.
Participation coverage needs a run count observed outside the coordination
service. If the service is the only source for "which runs occurred," it cannot
detect the class of run that bypassed it.

The two legs are not equally automatable. Anthropic's
[Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api) is
unavailable to individual accounts, while its supported
[consumer data export](https://support.claude.com/en/articles/9450526-export-your-claude-data)
is an asynchronous account export rather than an operational feed. A manual
interface count or an occasional export-derived count is adequate for a bounded
experiment. It is inadequate as a standing guarantee. Otherwise the dashboard is
capable of becoming more reassuring as its participation gets worse.

## Publicly routable is not publicly usable

The service needs a public face. It does not need a public audience.

Those are different design decisions. A public route answers whether a runtime
outside my network can open a connection. Authentication and authorization
answer whether that caller can use the service and what it can do. Treating
internet reachability as synonymous with anonymous access would be an excellent
reason never to finish anything.

The database is not that face. Postgres stays private. The existing tools and
services remain the owners of work, evidence, and acceptance state. The public
surface is a narrow adapter over their domain operations, with its own request
limits, revocation path, and audit trail.

Remote MCP is a plausible adapter because it gives agent hosts a standard HTTP
surface for tools and resources. The
[MCP guide to remote servers](https://modelcontextprotocol.io/docs/2026-07-28/develop/connect-remote-servers)
describes them as internet-hosted services available to compatible clients, and
Anthropic documents
[Custom Connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
for registering such a server in Claude. That is enough to make the smallest
experiment cheap.

It is not enough to assume one registration reaches every product. Claude Code
documents
[its own MCP configuration](https://docs.anthropic.com/en/docs/claude-code/mcp),
and scheduled or cloud execution surfaces may add another boundary. The stable
architecture is one remote endpoint that intended hosts can reach and authorize.
Shared registration is a client convenience to verify, not a system property to
build around.

The same caution applies to sandbox egress. A host may perform connector calls
through infrastructure outside the coding sandbox, which makes an otherwise
unreachable endpoint usable. That is an observed client behaviour, not a
protocol guarantee. Each host belongs in the reachability test.

## The protocol fits, but it does not own the model

The July 2026 MCP revision made this boundary less awkward. The
[2026-07-28 release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
removed protocol-level sessions. The
[current core is stateless](https://modelcontextprotocol.io/specification/2026-07-28/basic):
requests carry their own protocol context, and application state spanning
requests must be referenced by an explicit identifier supplied on each call.

That resembles the coordination model I already need. A run, work item,
reservation, evidence set, or external execution can be referred to by an opaque
server-minted handle. A later call can carry that handle without relying on the
same connection, process, conversation, or model context still existing.

The resemblance has a limit. An MCP task ID or application handle is a reference
to state, not proof that the caller may read or change it. The
[MCP Tasks extension](https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks)
requires authentication and authorization checks on every task request even when
task IDs are unguessable. The same rule belongs here: possession may help locate
a record; it does not grant authority over it.

MCP also should not become another source of truth. Its tools translate a
portable request into an operation owned by the underlying coordination system.
They do not invent a second lifecycle called an MCP lifecycle, reinterpret a
reservation as a bearer credential, or decide that a successful transport call
means the work was accepted. The protocol earns its place by carrying the
existing contract across a missing route.

## What crosses the boundary

The remote surface should carry coordination material and stop before effect
authority.

| May cross to or from a hosted runtime                         | Stays inside the controlled perimeter                    |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| Work references and current readiness                         | Database credentials and direct table access             |
| Run identity and external execution handle                    | Cluster, production, and secret-store credentials        |
| Redacted, request-scoped context from a server-side allowlist | Unredacted operational data not required by the task     |
| Proposed evidence and content-addressed references            | The right to declare evidence sufficient                 |
| Candidate branch, patch, or proposal metadata                 | Merge, release, deployment, and reconciliation authority |
| Status observations and explicit unknowns                     | Final acceptance of a consequential effect               |

The hosted session's best outcome is therefore often a candidate rather than an
effect: an unmerged branch, a proposed record, or a queued change. Something
inside the perimeter retrieves it and applies the existing review, merge,
signature, or GitOps path.

The coordination service bounds context, not the caller's self-restraint. Each
tool exposes a typed projection with field and size limits. The caller may
narrow that projection; it cannot widen it.

This is the familiar Git-to-cluster split in a less convenient location. I
already accept that an agent with a worktree but no cluster credential is
contained. Moving that agent into a vendor runtime changes what I can attest
about its environment and execution history. It does not require giving the
runtime production credentials to compensate.

Attestation and containment should stay separate. Evidence emitted by an opaque
host may support a claim, but it is not automatically proof of the host's
integrity or of every command it ran. Independent checks can re-observe the
candidate and its effects. A recorded run manifest buys reconstruction: it
preserves what the host claimed to do and gives independent checks something
concrete to test. It does not prove that the claim is complete or truthful. The
lack of effect authority still limits what a compromised or mistaken session can
do.

## Read before writing

The first useful surface is deliberately unimpressive:

```text
work.ready       list work that is actually eligible to start
work.get         retrieve one work item and its governing references
run.get          inspect a known run or external execution reference
evidence.list    retrieve the evidence already attached to the work
```

Names are provisional; the boundary is not. These tools read redacted
projections through a dedicated read-only identity. They cannot reserve work,
create a run, attach evidence, settle an outcome, or alter the underlying
records.

That does not repair participation coverage. It tests whether remote
reachability is useful before I make it authoritative. For one month I can use
the read surface from naturally occurring hosted sessions and record four
things:

- which host and product surface made the call;
- whether the retrieved state changed routing, prevented duplicate work, or
  avoided a manual copy;
- whether equivalent state was absent, equivalent, stale, or unknown in the
  repository at the start of the session; and
- which unavailable write would have been the next justified operation.

The experiment advances only if all of these conditions hold within the month:

- at least five naturally occurring hosted sessions use the surface;
- at least two distinct host or product surfaces are represented;
- at least three sessions change routing, prevent duplicate work, or avoid a
  manual copy;
- at least one of those decisions depends on state that was absent or stale in
  the repository; and
- no useful call requires widening the declared read boundary.

The next slice is one low-authority write, probably registering an external run
and its intent. Evidence attachment comes later; reservation, completion, and
acceptance later still, if at all.

If fewer than five eligible sessions occur, the result is inconclusive and the
experiment may be extended once. If enough sessions occur but the other gates
fail, or Git already supplies the useful state cheaply enough, the correct
result is deletion. The coordination system then narrows its claim to managed
runtimes and remains private. An internet service for a team of one does not
become sensible merely because OAuth can be configured correctly.

## The failure that would remain

Even a successful remote adapter does not make participation mandatory. A host
can still run without calling it. The record becomes complete only when each
supported start and finish path either writes the required coordination record
or visibly declares that it cannot.

That is a later integration problem. It may require host hooks, scheduled
wrapper tasks, repository checks, or a comparison between vendor run history and
recorded runs. MCP supplies a route. It cannot force a client to take it.

For now the narrower test is enough. I have observed work moving across a
network boundary while the system that claims to coordinate it stayed behind.
Making that system remotely reachable is a plausible correction. If I never use
the route, the more honest correction is to stop claiming that the system covers
the work on the other side.

Reachability is architecture when the unreachable actor is already inside the
system's claimed boundary. Otherwise it is just another endpoint waiting to be
maintained.
