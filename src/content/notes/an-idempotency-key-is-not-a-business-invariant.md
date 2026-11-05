---
title: An idempotency key is not a business invariant
role: synthesis
status: exploration
lifecycle: current
area: software assurance
published: 2026-11-05
lastRevised: 2026-11-05
projects:
  - vuoro
relates:
  - authority-must-travel-with-the-action
  - the-context-window-is-not-the-continuity-boundary
  - the-check-has-to-fail-first
  - when-evidence-stops-applying
draft: false
tags:
  - retries
  - idempotency
  - recovery
  - verification
  - agents
summary: >-
  A destination can deduplicate every request correctly and still repeat the
  same business action. Finite recovery models separate request identity,
  business identity, ordering and retained evidence before a successor retries.
explorePrompt: >-
  Examine whether recovery from an uncertain request preserves the receiving
  system's actual business rule. The worked publication example separates a
  request key from a one-publication slot: deduplicating each key still permits
  two keys to satisfy the same obligation. It also shows an idempotent old
  setter overwriting a newer decision, an absent receipt followed by a delayed
  commit, and a destination restore erasing evidence after an external observer
  saw the effect. Safe continuation must preserve the declared invariant across
  the histories still compatible with trusted observations; determining which
  history happened is not always necessary. Apply this to one consequential
  operation in another system. Identify the business identity, request binding,
  outstanding requests, target ordering, authority installation, retention and
  restore assumptions. Challenge the examples where operations commute,
  repetition is harmless, or the destination cannot enforce the proposed rule.
  Produce one minimal counterexample, its smallest effective control and a
  replay procedure, keeping authorization, validity, commitment, acceptance and
  eventual progress distinct. Bound every conclusion to the tested failure
  model; a finite example does not qualify an unbounded deployment.
reference:
  purpose: evaluation-method
  discoverFor:
    - deciding whether an uncertain agent action can be retried safely
    - testing request deduplication against business and ordering invariants
  establishes:
    - executable counterexamples and controls within 19 stated finite models
    - why operation identity, business identity and destination ordering differ
  doesNotEstablish:
    - unbounded correctness or general liveness
    - qualification of any deployed execution service or destination
  supplementWith:
    - the destination's transaction, retention, restore and fencing contracts
---

A worker asks a destination to publish a candidate into an approved slot. The
request times out. A successor starts with the same candidate, generates a new
request ID and tries again. The destination correctly deduplicates requests by
ID. It also commits two publications into the one slot.

Nothing in its deduplication code is broken. The rule it enforces is weaker than
the business rule the recovery needs.

On 30 October I asked an agent to challenge the foundations of this recovery
design. The resulting finite models separate the request, its intended business
obligation, the destination's commitment and the evidence available to the
successor. Both checkers reproduced their recorded results on 5 November. The
[source, assumptions and replay commands](https://github.com/bayleafwalker/kotona.app/tree/a1f79323296e97ced2b7fe12248e4325659f966d/docs/experiments/2026-10-30-effect-recovery)
are public so the examples can be inspected rather than taken as a protocol
claim.

## Give the obligation an identity

The example's business rule is explicit: an identified publication slot may
acquire at most one commitment. A request key identifies one logical operation.
The slot identifies what that operation is allowed to satisfy.

| Recovery choice                      | What the destination can establish                                              |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| Retry the same key and bound payload | It can recognize the existing logical operation if its record survives.         |
| Use a fresh key for the same slot    | Request deduplication alone allows another operation.                           |
| Reuse a key with changed payload     | It must reject the conflicting binding rather than return an unrelated success. |
| Constrain the slot at commitment     | It can enforce the one-publication rule across different request keys.          |

The slot cannot be invented by hashing the payload. Two equal payloads may be
two authorized publications; two different payloads may compete for one
obligation. The identity comes from the domain contract or a trusted admission
decision. In the checker it is an external specification, not something the
recovery algorithm discovers.

This is established API design territory. The
[AWS Builders' Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
uses caller-provided request identity to express intent, retains the parameters
and rejects conflicting reuse. The model asks what additional business identity
and ordering the particular publication requires.

## An idempotent setter can still undo newer work

Consider this history:

```text
commit set(A)
authorize and commit a later set(B)
retry the earlier set(A)
```

`set(A)` is idempotent in isolation. Its retry still overwrites B.

The ordering model catches that violation. A conditional version check or a
retained logical-operation record prevents the stale retry in the modeled
controls. Which one fits depends on whether the caller is repeating the old
operation or asking for a new update against current state. Kubernetes exposes
one familiar implementation of the first boundary:
[conditional updates using resource versions](https://kubernetes.io/docs/reference/using-api/api-concepts/#updates-to-existing-resources).

Worker replacement adds the same question at another level. Allocating a new
authority generation at the coordinator does not instantly install it at a
partitioned target. The target can enforce only the ordering and authority facts
its protocol actually checks. Chubby's
[recipient-checked sequencers](https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/)
are an established example of putting that check at the recipient.

## An absent receipt leaves an outstanding request

A linearizable lookup can truthfully return no receipt. An earlier request may
still be in transit and commit after the lookup. The answer establishes absence
at the query point; it does not close that execution path.

This does not mean the successor must always determine which history happened
before acting. Retrying the same destination-deduplicated operation can be safe
both when the first request never arrived and when it committed without a
visible response. What matters is whether the continuation preserves the
business rule in every history still compatible with trusted observations,
including outstanding requests.

A new key, a forgotten receipt or a changed payload changes that argument. A
timeout by itself settles none of them.

## Durability includes the restore boundary

Writing the effect and its receipt atomically prevents either half from
surviving alone under the modeled transaction failure. It does not settle every
restore scenario.

The restore counterexample commits a publication, lets an external observer see
it, then restores both coordinator and destination to an earlier snapshot. The
old effect and receipt disappear from the restored database. The external
observation survives. Repeating the publication now violates the stated rule.

Restoring only the coordinator is a different case: the destination's retained
operation record can still prevent repetition. Recovery documentation has to
name which system may roll back, which observers survive and how long the
deduplication evidence is retained.

## What the models establish

The 19 separate finite scenarios contain ten safety counterexamples, eight
controls whose reachable graphs exhaust without a safety violation, and a safe
model with an allowed infinite-idle execution. Never dispatching is excellent at
avoiding duplicate publications and poor at finishing work.

The results depend on the declared finite state spaces and trusted enforcement
points. They do not prove an unbounded implementation correct. The checker also
has verification-only histories that a real coordinator cannot read.

For an actual recovery path, write the business invariant first, then identify
the request binding, target precondition, outstanding requests, authority
installation, receipt retention and restore assumptions. Exercise both the weak
protocol and its proposed control. Keep permission, business validity,
commitment and acceptance as separate answers. A correct receipt for the wrong
candidate does not establish that the requested work was done.

The next useful check is one real destination adapter under response loss,
worker replacement and restore. Its safe continuation must follow from the
destination contract, not from the successor's confidence that the first call
probably failed.
