# Finite models of effect recovery

Prepared on 30 October 2026. Replayed on 5 November 2026; both checkers
reproduced the recorded JSON results exactly. The examples use invented
publication slots, requests and authority generations. They contain no
operational data.

The question is whether a successor can safely act after an earlier request has
an uncertain outcome. Request identity, business identity, ordering, authority
installation and receipt durability are modeled separately.

## Run

Python 3.10 or later; no dependencies, network, credentials or infrastructure:

```bash
python3 effect_recovery_model.py --json /tmp/protocol-results.json
python3 ordering_models.py --json /tmp/ordering-results.json
```

Run from this directory. Compare the two outputs with `protocol_results.json`
and `ordering_results.json`. `RESULTS.txt` contains the original concise result
inventory and counterexample traces. The checkers exit nonzero if an expected
outcome is missing; an expected counterexample is a successful exercise of a
deliberately weak protocol.

## Result and bounds

The 19 separate finite models produced 10 safety counterexamples, eight controls
whose reachable graphs were exhausted without a safety violation, and one safe
model with an explicitly permitted infinite-idle execution. Across those
separate explorations the checkers discovered 419 states and checked 617
transitions. These totals do not describe one combined system.

The passing controls rely on their declared assumptions: atomic destination
transitions, retained operation bindings and receipts, trusted business
identity, authenticated authority and mediation of every relevant mutation. The
restore examples explicitly distinguish coordinator rollback from destination
rollback after an external observer has seen a commitment. Ghost histories used
by the checker are not observations available to a real coordinator.

A finite graph result is bounded evidence about the stated abstraction. It is
neither an unbounded proof nor qualification of an implementation, database,
provider or deployed agent service. The idle-cycle example demonstrates a
progress failure; it is not a general liveness checker. Inspect each model's
assumptions before applying its result.

## Source material

- [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
  discusses caller intent, retained request identity and conflicting parameters.
- [Burrows: The Chubby lock service](https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/)
  describes sequencers that a recipient can check to reject delayed requests.
- [Kubernetes API concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/)
  documents conditional updates using resource versions.

Those sources supply established mechanisms. The new evidence here is the
explicit finite models, their assumptions and their executable counterexamples.
