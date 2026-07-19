---
title: The second operator is the test
status: exploration
lifecycle: current
area: agent workflow
published: 2026-07-19
lastRevised: 2026-07-19
projects:
  - sprintctl-and-kctl
relates:
  - the-missing-layer-is-binding-not-intelligence
  - the-work-between-the-ticket-and-the-agent
tags:
  - agents
  - workflow
  - coordination
summary: sprintctl and actionq enforce useful execution discipline, but five current invariants rely on one operator remaining the only source of identity, authority, and audit judgment.
---

No second human operator, no coordination system. Only disciplined
self-management.

Within the
[sprintctl and kctl project](/projects/sprintctl-and-kctl/), sprintctl owns work
items, claims, dependencies, and handoffs; actionq owns queued machine actions
and their execution lifecycle. Both can arbitrate concurrent worker sessions.
That is not the same as arbitrating between people. Their current contracts
assume one human authority behind every actor string, claim token, queue worker,
and completion decision. Here `N=2` means two independent human authorities,
not two agents operating for the same person. The single-operator assumption is
load-bearing in five places.

## The claimant can certify completion

An active exclusive execute claim is sufficient completion authority.
[`item done-from-claim`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/sprintctl/cli.py#L1094)
checks the claim type, exclusivity, expiry, ID, and token, then moves the work
item to `done` and normally releases the claim. The
[`work_item` schema](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/sprintctl/pg.py#L106)
has one status and no submission, review, or acceptance relation. With one
operator, execution proof and the decision that the work is sufficient can be
the same act. At N=2, the implementer can certify their own result and the
system cannot express a reviewer disagreeing without rewriting the item state
by convention.

## Names stand in for principals

Actor labels are descriptive text, not authenticated identity. The sprintctl
schema stores work-item `assignee`, event `actor`, and claim `agent` as
[`text`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/sprintctl/pg.py#L106),
while its own operating guide says actor, instance, host, and process metadata
are
[`advisory only`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/AGENTS.md#L183).
Actionq likewise stores `created_by`, `claimed_by`, and event `actor` as
[`TEXT`](https://github.com/bayleafwalker/actionq/blob/85b72bd824dbe1af1a83ceaec7e253a1eca28ebb/actionq/migrations/001_init.sql#L4),
and its CLI accepts the worker and actor labels from the caller. With one
operator, a name is a useful note because the reader already knows who caused
the event. At N=2, either operator can write the other's name, assignment
cannot grant permission, and the audit log records a claim about identity
rather than identity established by the system.

## Expired ownership is disposable

> **Update, 2026-07-19 — partially fixed.** PostgreSQL expiry now marks active
> claims `expired` and retains their rows. Reacquisition preserves the old row
> before creating its replacement. The current
> [verification note](https://github.com/bayleafwalker/sprintctl/blob/80aaa9782cb51fde6d645b6225c2b4be1b285b5c/docs/verification/claim-history-retention.md)
> also states the remaining boundary: SQLite expiry still deletes, and
> proof-bearing release still deliberately deletes an active claim. The
> original paragraph below records the behavior at the audited commit; it is no
> longer the complete PostgreSQL behavior.

Expired sprintctl claims are deleted, not retained as claim history. The
SQLite maintenance path executes
[`DELETE FROM claim`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/sprintctl/maintain.py#L156),
and the PostgreSQL path does the
[`same`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/sprintctl/pg.py#L2360)
for rows past backend time. The documented remote-mode checklist still tells an
operator to schedule that purge. No retained claim-history model exists in
these paths: claim creation and expiry purge do not append matching lifecycle
events. With one operator, deletion is tolerable because the person
reconstructing the incident is the person who held the claim. At N=2, expiry
erases who occupied the work, when their authority lapsed, and which later
attempt replaced it; the remaining item state cannot reconstruct the deleted
lease.

## Expiry disciplines the holder but does not fence them

> **Update, 2026-07-19 — schema landed, fencing did not.** Sprintctl now stores
> a `lease_epoch`: remote token rotation increments it, and remote reacquisition
> advances it across retained claim rows. The
> [completion note](https://github.com/bayleafwalker/sprintctl/blob/80aaa9782cb51fde6d645b6225c2b4be1b285b5c/docs/verification/lease-epoch-schema.md)
> says there is no `expected_epoch` command input and no downstream enforcement.
> The old “no epoch” statement is now historical. The invariant in this section
> remains: expiry still cannot fence a stale holder's external work, and actionq
> still does not bind terminal transitions to its current worker.

A claim deadline is a coordination cue, not a fencing epoch. Sprintctl's
[`claim ownership protocol`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/docs/protocols/claim-ownership.md#L49)
states that expiry cannot reject stale downstream work, and its retained direct
backend admits a stale heartbeat after another owner has claimed the item; the
opt-in remote arbiter repairs that renewal history but still makes no downstream
fencing claim. The claim schema has tokens and expiry but no epoch. Actionq is
looser: its
[`complete`, `fail`, and `reject` transitions](https://github.com/bayleafwalker/actionq/blob/85b72bd824dbe1af1a83ceaec7e253a1eca28ebb/actionq/db.py#L645)
check only that the action is currently `claimed`, not that the caller is the
current `claimed_by` worker, and its protocol names this limitation explicitly.
With one operator, TTL and sweep are self-discipline. At N=2, a timed-out worker
can continue external writes or win a terminal transition after reassignment,
so the newer claim does not make the older execution harmless.

## Repository identity carries project authority

The repository is both storage scope and authority scope. `PgStore` carries a
`repo_id` that is
[`prepended to every query as a tenant discriminator`](https://github.com/bayleafwalker/sprintctl/blob/11519c42f905a26542bea329d111d91d866e6d5a/sprintctl/pg.py#L1),
and backend resolution derives that ID from the repository directory or marker.
Actionq's dispatch server requires one concrete `repo_id` and writes it directly
into the action's
[`project`](https://github.com/bayleafwalker/actionq/blob/85b72bd824dbe1af1a83ceaec7e253a1eca28ebb/actionq/server.py#L33)
field. There is no separate project, membership, or principal boundary in these
schemas. With one operator, project equals repository because both names point
to the same personal scope. At N=2, a project spanning repositories has split
authority, two projects sharing a repository cannot have separate policy, and
database access to a repository tenant is indistinguishable from permission to
operate all of it.

## Five things, not one

The conceptual repair is small even if an implementation would not be:
**assignment** names the accountable party; a **claim** grants temporary
execution rights; an **attempt** records one session and its artifacts; a
**submission** presents an attempt for judgment; **acceptance** is the
authorized decision that the work item is complete. None implies the next.
This is what a multi-operator fix would have to express, not a statement of
build intent.

## Verification boundary

This inventory was checked against sprintctl commit
[`11519c4`](https://github.com/bayleafwalker/sprintctl/commit/11519c42f905a26542bea329d111d91d866e6d5a)
and actionq commit
[`85b72bd`](https://github.com/bayleafwalker/actionq/commit/85b72bd824dbe1af1a83ceaec7e253a1eca28ebb)
on 2026-07-19. Code, current schema, tests, and protocol documents outrank the
project narrative. The claims above are limited to those two revisions. The
N=2 consequences and five-part resolution are analysis, not implemented state.
The dated updates were checked against sprintctl commit
[`80aaa97`](https://github.com/bayleafwalker/sprintctl/commit/80aaa9782cb51fde6d645b6225c2b4be1b285b5c);
actionq remained at the audited revision.

Coordination infrastructure without a second operator is design theater. The
correct output is the analysis.
