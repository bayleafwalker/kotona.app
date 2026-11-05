#!/usr/bin/env python3
"""Bounded executable models of effect recovery under partial observation.

Run with Python 3.10+; no dependencies are required::

    python3 effect_recovery_model.py
    python3 effect_recovery_model.py --json effect_recovery_results.json
    python3 effect_recovery_model.py --scenario 07_absence_is_not_closure

The explorer performs breadth-first reachability search. A reported
counterexample is a shortest trace in this model's transition vocabulary.
"State space exhausted" means all reachable states of the specified finite
model were examined, not that an unbounded implementation has been proved.
Expected failures are successful demonstrations and produce exit status zero;
an unexpected outcome or an exploration limit produces nonzero exit status.

BOUNDS: one destination and one explicitly supplied approved publication slot;
two send attempts; keys k0/k1; digests p0/p1; authority generations 0/1; at most
one timeout/replacement, epoch allocation, fence installation, status lookup,
terminal nonexecution declaration, and receipt-forgetting event. Each request
is delivered at most once. Repeated sends model retries; a transport-level
duplicate and an additional retry beyond these two attempts are out of scope.

ASSUMPTIONS FOR POSITIVE CASES: destination transactions are atomic and durable;
all modeled effects pass through that destination; operation identity, slot,
and authority are authenticated and correctly scoped; destination fences do
not roll back; receipts do not expire or disappear unless the scenario enables
forgetting; intent digests are collision-free abstract labels. Epoch validity
is checked at commitment. Existing-receipt retrieval is a read, not a new
mutation. Request admission/expiry and output-release authorization are not
modeled. Neither arbitrary shell effects nor compound business workflows are
covered. Preparation, validation correctness, causal ordering between distinct
business operations, malicious participants, clock bounds, and full backup
recovery are not modeled.

The slot is an explicit specification field, never an inferred equivalence of
free-text intentions. The default receiver deduplicates only by request key;
scenario 11 adds a destination uniqueness constraint for the supplied slot.

Messages and replies may be delayed; replies may be lost. Safety exploration
imposes no fairness. Rejections are terminal request outcomes, not successful
work completion. This program checks neither eventual success nor liveness.

The intentionally broken split-write scenarios model independently visible,
durable writes. A real uncommitted database transaction is not represented by
those broken transitions. For digest mismatch scenarios, the initial receipt
must exist before the changed retry. For explicit crash scenarios, replacement
submission waits for the first handler to finish or crash; these gates are
reported in the JSON output.
"""

from __future__ import annotations

import argparse
from collections import Counter, deque
from dataclasses import asdict, dataclass, replace
import json
from pathlib import Path
import sys
from typing import Callable, Generic, Hashable, Iterable, TypeVar


MODEL_VERSION = "1.0.0"
SLOT = "approved-publication-slot-S"
BOUNDS = {
    "destinations": 1,
    "explicit_publication_slots": 1,
    "request_attempts": 2,
    "request_keys": ["k0", "k1"],
    "intent_digests": ["p0", "p1"],
    "authority_generations": [0, 1],
    "maximum_timeout_replacements": 1,
    "maximum_queries": 1,
    "maximum_receipt_forgetting_events": 1,
    "maximum_deliveries_per_request": 1,
}
ASSUMPTIONS = [
    "Positive cases use one atomic, durable destination transaction for its new effect and successful receipt.",
    "All modeled effects pass through the destination; request namespace, explicit slot, and authority are trusted inputs.",
    "Digest labels are collision-free abstractions; semantic equality is not inferred from text.",
    "Receipts and installed authority persist unless a scenario explicitly enables their loss.",
    "Destination fence checks and installation serialize at the effect commitment point.",
    "Returning an existing receipt is a read and does not constitute a new effect.",
    "Rejections are permitted request outcomes and are never labeled successful work completion.",
    "No fairness, progress, liveness, general business correctness, or unbounded proof is claimed.",
]
OUT_OF_SCOPE = [
    "More than two attempts, transport duplication beyond modeled resends, multiple destinations or slots.",
    "Adversarial authority forgery, data confidentiality, credential distribution, clocks, lease expiry.",
    "Preparation correctness, semantic acceptance, compound workflows, external nontransactional side effects.",
    "Causal ordering between different approved operations, full snapshot restoration, fence rollback.",
]


@dataclass(frozen=True)
class Request:
    attempt: int
    key: str
    digest: str
    epoch: int
    slot: str = SLOT


@dataclass(frozen=True)
class Receipt:
    key: str
    digest: str
    slot: str
    result: str


@dataclass(frozen=True)
class Response:
    kind: str                         # committed or rejected
    receipt: Receipt | None = None
    reason: str | None = None


@dataclass(frozen=True)
class Effect:
    key: str
    digest: str
    slot: str
    epoch: int
    fence_at_commit: int
    issued_epoch_at_commit: int


@dataclass(frozen=True)
class State:
    issued_epoch: int = 0
    installed_fence: int = 0
    phases: tuple[str, str] = ("unsent", "unsent")
    reply_phases: tuple[str, str] = ("none", "none")
    responses: tuple[Response | None, Response | None] = (None, None)
    receipts: tuple[Receipt | None, Receipt | None] = (None, None)
    effects: tuple[Effect, ...] = ()
    slot_publication: Receipt | None = None
    replaced: bool = False
    query_observation: str = "not_queried"
    terminal_no_effect: bool = False
    receipt_forgotten: bool = False


COMMON_INVARIANTS = (
    "slot_uniqueness",
    "per_key_uniqueness",
    "effect_intent_integrity",
    "successful_reply_matches_request",
    "successful_receipt_has_effect",
    "installed_fence_at_commit",
    "terminal_nonexecution_is_closed",
)


@dataclass(frozen=True)
class Scenario:
    id: str
    title: str
    expected: str                     # state_space_exhausted or counterexample
    expected_violation: str | None = None
    keys: tuple[str, str] = ("k0", "k0")
    digests: tuple[str, str] = ("p0", "p0")
    epochs: tuple[int, int] = (0, 0)
    atomicity: str = "atomic"
    ignore_digest_mismatch: bool = False
    allow_epoch_allocation: bool = False
    allow_fence_installation: bool = False
    allow_query: bool = False
    allow_terminal_claim: bool = False
    allow_receipt_forgetting: bool = False
    enforce_slot_uniqueness: bool = False
    retry_gate: str = "any"
    invariants: tuple[str, ...] = COMMON_INVARIANTS
    note: str = ""

    def requests(self) -> tuple[Request, Request]:
        return tuple(  # type: ignore[return-value]
            Request(i, self.keys[i], self.digests[i], self.epochs[i])
            for i in range(2)
        )


def prioritize(name: str, *extra: str) -> tuple[str, ...]:
    return tuple(dict.fromkeys((name, *extra, *COMMON_INVARIANTS)))


SCENARIOS = (
    Scenario(
        "01_atomic_same_key", "Atomic destination, stable-key retries",
        "state_space_exhausted",
        note="Timeout can precede delivery; requests and replies can arrive in either order.",
    ),
    Scenario(
        "02_fresh_key_same_slot", "Fresh key repeats the same approved slot",
        "counterexample", "slot_uniqueness", keys=("k0", "k1"),
        retry_gate="first_reply_lost",
        note="First commit and lost reply precede the fresh-key retry. Per-key deduplication still holds.",
    ),
    Scenario(
        "03_changed_digest_rejected", "Changed digest under an existing key is rejected",
        "state_space_exhausted", digests=("p0", "p1"),
        retry_gate="first_receipt_exists",
        note="The initial digest is durably bound before the changed request can be submitted.",
    ),
    Scenario(
        "04_changed_digest_ignored", "Faulty receiver returns success for a mismatched request",
        "counterexample", "successful_reply_matches_request",
        digests=("p0", "p1"), ignore_digest_mismatch=True,
        retry_gate="first_receipt_exists",
        invariants=prioritize("successful_reply_matches_request"),
        note="The first binding exists; the receiver omits digest validation and returns its old success.",
    ),
    Scenario(
        "05_effect_before_receipt", "Crash between effect and receipt permits a duplicate",
        "counterexample", "per_key_uniqueness",
        atomicity="effect_before_receipt", retry_gate="first_handler_finished",
        invariants=prioritize("per_key_uniqueness"),
        note="Independently durable effect is followed by a separate receipt write; a crash can separate them.",
    ),
    Scenario(
        "06_receipt_before_effect", "Crash between successful receipt and effect permits false success",
        "counterexample", "successful_receipt_has_effect",
        atomicity="receipt_before_effect", retry_gate="first_handler_finished",
        invariants=prioritize("successful_receipt_has_effect"),
        note="The separately written receipt claims committed success, not merely accepted/pending.",
    ),
    Scenario(
        "07_absence_is_not_closure", "Linearizable absence does not close an in-flight request",
        "counterexample", "terminal_nonexecution_is_closed",
        allow_query=True, allow_terminal_claim=True,
        invariants=prioritize("terminal_nonexecution_is_closed"),
        note="The lookup is linearizable. The faulty client promotes its absent result to terminal nonexecution.",
    ),
    Scenario(
        "08_remote_allocation_not_revocation", "Remote allocation does not install target revocation",
        "counterexample", "claimed_immediate_remote_revocation",
        epochs=(0, 1), allow_epoch_allocation=True,
        invariants=prioritize("claimed_immediate_remote_revocation"),
        note="The claimed remote-revocation property is intentionally stronger than the implemented installed fence.",
    ),
    Scenario(
        "09_installed_fence", "Installed fence serializes with destination commitment",
        "state_space_exhausted", epochs=(0, 1),
        allow_epoch_allocation=True, allow_fence_installation=True,
        invariants=prioritize("installed_fence_at_commit"),
        note="An old effect committed before installation remains historically valid. Rejected work need not progress.",
    ),
    Scenario(
        "10_forgotten_receipt", "Receipt loss with surviving effect defeats same-key deduplication",
        "counterexample", "per_key_uniqueness",
        allow_receipt_forgetting=True, retry_gate="first_receipt_forgotten",
        invariants=prioritize("per_key_uniqueness"),
        note="One explicit forget transition removes destination deduplication while preserving the effect.",
    ),
    Scenario(
        "11_explicit_slot_constraint", "Destination slot constraint handles two different request IDs",
        "state_space_exhausted", keys=("k0", "k1"),
        enforce_slot_uniqueness=True,
        note="The supplied approved slot has an atomic destination uniqueness guard. A conflicting new key is rejected.",
    ),
)


T = TypeVar("T")


def put(values: tuple[T, ...], index: int, value: T) -> tuple[T, ...]:
    return values[:index] + (value,) + values[index + 1:]


def key_index(key: str) -> int:
    return {"k0": 0, "k1": 1}[key]


def make_receipt(request: Request) -> Receipt:
    return Receipt(request.key, request.digest, request.slot, "published:" + request.digest)


def append_effect(state: State, request: Request) -> State:
    effect = Effect(
        request.key, request.digest, request.slot, request.epoch,
        state.installed_fence, state.issued_epoch,
    )
    return replace(state, effects=state.effects + (effect,))


def write_receipt(state: State, request: Request, scenario: Scenario) -> State:
    receipt = make_receipt(request)
    return replace(
        state,
        receipts=put(state.receipts, key_index(request.key), receipt),
        slot_publication=receipt if scenario.enforce_slot_uniqueness else state.slot_publication,
    )


def respond(state: State, index: int, response: Response) -> State:
    return replace(
        state, phases=put(state.phases, index, "finished"),
        reply_phases=put(state.reply_phases, index, "pending"),
        responses=put(state.responses, index, response),
    )


def retry_allowed(state: State, scenario: Scenario) -> bool:
    if not state.replaced:
        return False
    if scenario.retry_gate == "any":
        return True
    if scenario.retry_gate == "first_reply_lost":
        return state.reply_phases[0] == "lost"
    if scenario.retry_gate == "first_receipt_exists":
        return state.receipts[key_index(scenario.keys[0])] is not None
    if scenario.retry_gate == "first_handler_finished":
        return state.phases[0] == "finished"
    if scenario.retry_gate == "first_receipt_forgotten":
        return state.receipt_forgotten
    raise ValueError("Unknown retry gate: " + scenario.retry_gate)


def successors(state: State, scenario: Scenario) -> Iterable[tuple[str, State]]:
    requests = scenario.requests()
    for index, request in enumerate(requests):
        if state.phases[index] != "unsent":
            continue
        if index == 1 and not retry_allowed(state, scenario):
            continue
        if request.epoch > state.issued_epoch:
            continue
        yield (
            f"send attempt {index + 1}: key={request.key}, digest={request.digest}, "
            f"slot={request.slot}, epoch={request.epoch}",
            replace(state, phases=put(state.phases, index, "in_flight")),
        )

    if (not state.replaced and state.phases[0] != "unsent"
            and state.reply_phases[0] != "received"):
        yield "timeout; replace worker; leave outstanding request unchanged", replace(state, replaced=True)

    if (scenario.allow_epoch_allocation and state.issued_epoch == 0
            and state.phases[0] != "unsent"):
        yield "allocate authority epoch 1 remotely; destination fence unchanged", replace(state, issued_epoch=1)

    if (scenario.allow_fence_installation and state.issued_epoch == 1
            and state.installed_fence == 0):
        yield "install destination fence 1, serialized with destination commits", replace(state, installed_fence=1)

    if (scenario.allow_query and state.query_observation == "not_queried"
            and state.phases[0] != "unsent"):
        present = state.receipts[key_index(requests[0].key)] is not None
        observation = "present" if present else "absent"
        yield (
            f"linearizable receipt lookup for {requests[0].key} returns {observation}",
            replace(state, query_observation=observation),
        )

    if (scenario.allow_terminal_claim and state.query_observation == "absent"
            and not state.terminal_no_effect):
        yield "declare terminal nonexecution from the earlier absent lookup", replace(state, terminal_no_effect=True)

    if (scenario.allow_receipt_forgetting and not state.receipt_forgotten
            and state.phases[0] == "finished"
            and state.receipts[key_index(requests[0].key)] is not None):
        yield (
            "forget destination receipt; retain committed external effect",
            replace(state, receipts=put(state.receipts, key_index(requests[0].key), None), receipt_forgotten=True),
        )

    for index, request in enumerate(requests):
        phase = state.phases[index]
        if phase == "in_flight":
            receipt = state.receipts[key_index(request.key)]
            if receipt is not None:
                if receipt.digest != request.digest and not scenario.ignore_digest_mismatch:
                    yield (
                        f"destination rejects attempt {index + 1}: key reused with another digest",
                        respond(state, index, Response("rejected", reason="intent_mismatch")),
                    )
                else:
                    qualifier = " (BUG: digest mismatch ignored)" if receipt.digest != request.digest else ""
                    yield (
                        f"destination returns stored receipt for attempt {index + 1}{qualifier}",
                        respond(state, index, Response("committed", receipt=receipt)),
                    )
            elif scenario.enforce_slot_uniqueness and state.slot_publication is not None:
                yield (
                    f"destination rejects attempt {index + 1}: approved slot already published",
                    respond(state, index, Response("rejected", reason="slot_already_published")),
                )
            elif request.epoch != state.installed_fence:
                yield (
                    f"destination rejects attempt {index + 1}: epoch {request.epoch} != installed fence {state.installed_fence}",
                    respond(state, index, Response("rejected", reason="authority_fence_mismatch")),
                )
            elif scenario.atomicity == "atomic":
                committed = write_receipt(append_effect(state, request), request, scenario)
                yield (
                    f"destination atomically commits effect and receipt for attempt {index + 1}",
                    respond(committed, index, Response("committed", receipt=make_receipt(request))),
                )
            elif scenario.atomicity == "effect_before_receipt":
                partial = append_effect(state, request)
                yield (
                    f"destination persists effect for attempt {index + 1}; receipt not yet written",
                    replace(partial, phases=put(partial.phases, index, "effect_only")),
                )
            elif scenario.atomicity == "receipt_before_effect":
                partial = write_receipt(state, request, scenario)
                yield (
                    f"destination persists successful receipt for attempt {index + 1}; effect not yet written",
                    replace(partial, phases=put(partial.phases, index, "receipt_only")),
                )
            else:
                raise ValueError("Unknown atomicity: " + scenario.atomicity)

        elif phase in ("effect_only", "receipt_only"):
            if phase == "effect_only":
                completed = write_receipt(state, request, scenario)
                description = "write the separate receipt"
            else:
                completed = append_effect(state, request)
                description = "perform the separate effect"
            yield (
                f"destination completes attempt {index + 1}: {description}",
                respond(completed, index, Response("committed", receipt=make_receipt(request))),
            )
            yield (
                f"crash handler for attempt {index + 1}; lose volatile continuation, retain prior durable write",
                replace(state, phases=put(state.phases, index, "finished")),
            )

        if state.reply_phases[index] == "pending":
            yield (
                f"deliver response for attempt {index + 1}",
                replace(state, reply_phases=put(state.reply_phases, index, "received")),
            )
            yield (
                f"lose response for attempt {index + 1}",
                replace(state, reply_phases=put(state.reply_phases, index, "lost")),
            )


def invariant_checks(state: State, scenario: Scenario) -> dict[str, dict[str, object]]:
    effects = state.effects
    slot_counts = Counter(effect.slot for effect in effects)
    key_counts = Counter(effect.key for effect in effects)
    requests = scenario.requests()
    checks: dict[str, tuple[bool, str]] = {}
    checks["slot_uniqueness"] = (
        all(count <= 1 for count in slot_counts.values()),
        "At most one committed publication for the explicitly supplied approved slot.",
    )
    checks["per_key_uniqueness"] = (
        all(count <= 1 for count in key_counts.values()),
        "At most one committed effect per destination-scoped operation key.",
    )
    checks["effect_intent_integrity"] = (
        all(len({effect.digest for effect in effects if effect.key == key}) <= 1 for key in key_counts),
        "Committed effects under one key never use different intent digests.",
    )
    matching_replies = True
    sound_replies = True
    for index, request in enumerate(requests):
        response = state.responses[index]
        if state.reply_phases[index] != "received" or response is None or response.kind != "committed":
            continue
        receipt = response.receipt
        matching_replies &= bool(receipt and (receipt.key, receipt.digest, receipt.slot)
                                 == (request.key, request.digest, request.slot))
        sound_replies &= bool(receipt and any(
            (effect.key, effect.digest, effect.slot) == (receipt.key, receipt.digest, receipt.slot)
            for effect in effects
        ))
    checks["successful_reply_matches_request"] = (
        matching_replies, "Every received success is bound to that request's key, digest, and approved slot.",
    )
    checks["successful_receipt_has_effect"] = (
        sound_replies, "Every received successful receipt has a matching actual committed effect.",
    )
    checks["installed_fence_at_commit"] = (
        all(effect.epoch == effect.fence_at_commit for effect in effects),
        "Every new effect used the destination-installed epoch at the instant of commitment.",
    )
    checks["terminal_nonexecution_is_closed"] = (
        not (state.terminal_no_effect and any(effect.slot == SLOT for effect in effects)),
        "An operation declared terminally unexecuted has no past or subsequent committed effect.",
    )
    checks["claimed_immediate_remote_revocation"] = (
        all(effect.epoch == effect.issued_epoch_at_commit for effect in effects),
        "Intentionally stronger claim: every commit immediately reflects remote authority allocation.",
    )
    return {name: {"holds": checks[name][0], "meaning": checks[name][1]} for name in scenario.invariants}


def first_violation(state: State, scenario: Scenario) -> str | None:
    return next((name for name, check in invariant_checks(state, scenario).items() if not check["holds"]), None)


U = TypeVar("U", bound=Hashable)


@dataclass
class Exploration(Generic[U]):
    outcome: str
    states_discovered: int
    states_explored: int
    transitions_checked: int
    frontier_remaining: int
    violation: str | None
    witness: list[tuple[str | None, U]]


def explore(
    initial: U,
    next_states: Callable[[U], Iterable[tuple[str, U]]],
    violates: Callable[[U], str | None],
    max_states: int,
) -> Exploration[U]:
    """Reusable BFS with shortest witnesses and explicit incomplete-search status."""
    parents: dict[U, tuple[U | None, str | None]] = {initial: (None, None)}
    frontier = deque([initial])
    explored = transitions = 0

    def witness(end: U) -> list[tuple[str | None, U]]:
        path: list[tuple[str | None, U]] = []
        current = end
        while True:
            previous, action = parents[current]
            path.append((action, current))
            if previous is None:
                break
            current = previous
        path.reverse()
        return path

    violation = violates(initial)
    if violation:
        return Exploration("counterexample", 1, 0, 0, 1, violation, witness(initial))

    while frontier:
        current = frontier.popleft()
        explored += 1
        for action, following in next_states(current):
            transitions += 1
            if following in parents:
                continue
            if len(parents) >= max_states:
                return Exploration("state_limit_reached", len(parents), explored, transitions,
                                   len(frontier), None, [])
            parents[following] = (current, action)
            violation = violates(following)
            if violation:
                return Exploration("counterexample", len(parents), explored, transitions,
                                   len(frontier), violation, witness(following))
            frontier.append(following)
    return Exploration("state_space_exhausted", len(parents), explored, transitions, 0, None, [])


def run_scenario(scenario: Scenario, max_states: int) -> dict[str, object]:
    result = explore(State(), lambda state: successors(state, scenario),
                     lambda state: first_violation(state, scenario), max_states)
    expected_match = result.outcome == scenario.expected
    if scenario.expected_violation is not None:
        expected_match &= result.violation == scenario.expected_violation
    final_state = result.witness[-1][1] if result.witness else None
    return {
        "id": scenario.id,
        "title": scenario.title,
        "expected_outcome": scenario.expected,
        "expected_violation": scenario.expected_violation,
        "outcome": result.outcome,
        "expected_result_observed": bool(expected_match),
        "full_reachable_finite_space_exhausted": result.outcome == "state_space_exhausted",
        "states_discovered": result.states_discovered,
        "states_explored": result.states_explored,
        "transitions_checked": result.transitions_checked,
        "frontier_remaining_when_stopped": result.frontier_remaining,
        "violated_invariant": result.violation,
        "shortest_witness_transition_count": len(result.witness) - 1 if result.witness else None,
        "witness": [
            {"step": index, "action": action or "initial state", "state": asdict(state)}
            for index, (action, state) in enumerate(result.witness)
        ],
        "invariants_at_counterexample": invariant_checks(final_state, scenario) if final_state else None,
        "scenario_configuration": asdict(scenario),
        "requests": [asdict(request) for request in scenario.requests()],
    }


def print_report(results: list[dict[str, object]]) -> None:
    print("Effect recovery: finite-state safety exploration")
    print("Two attempts, one destination, one explicit approved publication slot.")
    print("Expected counterexamples are demonstrations; exhaustion is bounded safety, not liveness.\n")
    for result in results:
        marker = "EXPECTED" if result["expected_result_observed"] else "UNEXPECTED"
        print(f"[{marker}] {result['id']}: {result['title']}")
        print(f"  outcome={result['outcome']}; discovered={result['states_discovered']}; "
              f"explored={result['states_explored']}; transitions={result['transitions_checked']}")
        if result["violated_invariant"]:
            print(f"  violated={result['violated_invariant']}; "
                  f"shortest witness={result['shortest_witness_transition_count']} transitions")
            for step in result["witness"]:  # type: ignore[union-attr]
                if step["step"]:
                    print(f"    {step['step']}. {step['action']}")
        else:
            print("  full reachable finite state space exhausted="
                  f"{result['full_reachable_finite_space_exhausted']}")
        print()
    matched = sum(bool(result["expected_result_observed"]) for result in results)
    print(f"Expected outcomes observed: {matched}/{len(results)}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--json", type=Path, metavar="PATH", help="Write full results and witness states as JSON.")
    parser.add_argument("--scenario", action="append", choices=[scenario.id for scenario in SCENARIOS],
                        help="Run only selected scenario(s); can be repeated.")
    parser.add_argument("--max-states", type=int, default=200_000,
                        help="Per-scenario unique-state budget; reaching it is not a pass (default: 200000).")
    parser.add_argument("--quiet", action="store_true", help="Suppress the readable report; useful with --json.")
    args = parser.parse_args(argv)
    if args.max_states < 1:
        parser.error("--max-states must be positive")
    selected = [scenario for scenario in SCENARIOS if not args.scenario or scenario.id in args.scenario]
    results = [run_scenario(scenario, args.max_states) for scenario in selected]
    report = {
        "model_version": MODEL_VERSION,
        "method": "Breadth-first exhaustive reachable-state exploration of each finite scenario.",
        "claim": "Safety results apply only to the stated finite abstraction; no liveness or unbounded proof.",
        "bounds": BOUNDS,
        "assumptions": ASSUMPTIONS,
        "out_of_scope": OUT_OF_SCOPE,
        "state_budget_per_scenario": args.max_states,
        "all_expected_results_observed": all(result["expected_result_observed"] for result in results),
        "scenarios": results,
    }
    if args.json:
        args.json.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if not args.quiet:
        print_report(results)
    return 0 if report["all_expected_results_observed"] else 1


if __name__ == "__main__":
    sys.exit(main())
