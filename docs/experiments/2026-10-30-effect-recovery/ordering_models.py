#!/usr/bin/env python3
"""Small, dependency-free counterexamples for agent effect recovery.

These are finite transition systems, not an implementation of an executor.
Breadth-first search enumerates every reachable state within each explicitly
bounded model and records a shortest safety counterexample. Counts include
self-loop edges. Ghost history/observer fields are never restored with a target.

The controls establish only their stated properties under the listed model
assumptions. In particular, no result proves arbitrary program correctness,
Byzantine safety, unbounded liveness, or safe recovery after every kind of loss.

Run:
    python ordering_models.py
    python ordering_models.py --json
    python ordering_models.py --json ordering_results.json

Public interface: run_all() -> list[dict], all JSON serializable.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import asdict, dataclass, replace
import json
from typing import Any, Callable, Iterable


def _explore(
    *,
    name: str,
    initial: Any,
    successors: Callable[[Any], Iterable[tuple[str, Any]]],
    violation: Callable[[Any], str | None],
    property_text: str,
    expected_holds: bool,
    bounds: dict[str, Any],
    assumptions: list[str],
) -> dict[str, Any]:
    """Exhaustively traverse a finite graph, retaining the first BFS violation."""
    pending = deque([initial])
    predecessor: dict[Any, tuple[Any, str] | None] = {initial: None}
    bad_state = initial if violation(initial) else None
    edge_count = 0
    while pending:
        state = pending.popleft()
        for action, following in successors(state):
            edge_count += 1
            if following in predecessor:
                continue
            predecessor[following] = (state, action)
            pending.append(following)
            if bad_state is None and violation(following):
                bad_state = following

    trace = None
    if bad_state is not None:
        path: list[tuple[str, Any]] = []
        cursor = bad_state
        while predecessor[cursor] is not None:
            previous, action = predecessor[cursor]  # type: ignore[misc]
            path.append((action, cursor))
            cursor = previous
        path.append(("initial", initial))
        path.reverse()
        trace = [
            {"step": index, "action": action, "state": asdict(state)}
            for index, (action, state) in enumerate(path)
        ]

    holds = bad_state is None
    return {
        "model": name,
        "kind": "bounded_safety_exploration",
        "property": property_text,
        "property_holds": holds,
        "expected_property_holds": expected_holds,
        "expectation_met": holds == expected_holds,
        "finite_state_space_exhausted": True,
        "states_discovered": len(predecessor),
        "states_explored": len(predecessor),
        "transitions_explored": edge_count,
        "shortest_counterexample": trace,
        "violation": None if bad_state is None else violation(bad_state),
        "bounds": bounds,
        "assumptions": assumptions,
    }


@dataclass(frozen=True)
class SetterState:
    value: str = "initial"
    version: int = 0
    a_deliveries: int = 0
    a_receipt: bool = False
    b_authorized: bool = False
    b_expected_version: int = -1
    b_delivered: bool = False
    b_committed: bool = False  # Ghost fact; a stale write cannot erase it.


def setter_model(mode: str) -> dict[str, Any]:
    """Two intended writes, with at most one duplicate delivery of old A.

    Each plain setter is mathematically idempotent on target state (value,
    version): writing the existing value also leaves the version unchanged.
    Schedule counters and the historical ghost flag are instrumentation.
    """
    if mode not in {"plain", "version_conditional", "remembered_operation"}:
        raise ValueError(mode)

    def write(state: SetterState, value: str) -> SetterState:
        if state.value == value:
            return state
        return replace(state, value=value, version=state.version + 1)

    def successors(state: SetterState) -> Iterable[tuple[str, SetterState]]:
        if state.a_deliveries < 2:
            first = state.a_deliveries == 0
            next_state = replace(state, a_deliveries=state.a_deliveries + 1)
            if mode == "remembered_operation" and state.a_receipt:
                yield "retry A: return its remembered receipt", next_state
            elif mode == "version_conditional" and state.version != 0:
                yield "retry A: reject stale expected version 0", next_state
            else:
                label = "commit A" if first else "retry A: set value to A"
                committed = write(next_state, "A")
                if mode == "remembered_operation":
                    committed = replace(committed, a_receipt=True)
                yield label, committed
        if state.a_deliveries >= 1 and not state.b_authorized:
            yield "authorize later B against current version", replace(
                state, b_authorized=True, b_expected_version=state.version
            )
        if state.b_authorized and not state.b_delivered:
            next_state = replace(state, b_delivered=True)
            if mode == "version_conditional" and (
                state.version != state.b_expected_version
            ):
                yield "B: reject changed expected version", next_state
            else:
                yield "commit later B", replace(
                    write(next_state, "B"), b_committed=True
                )

    return _explore(
        name=f"setter_{mode}",
        initial=SetterState(),
        successors=successors,
        violation=lambda state: (
            "Old A overwrote an already committed, later authorized B."
            if state.b_committed and state.value != "B" else None
        ),
        property_text="After later B commits, retrying old A cannot regress it.",
        expected_holds=mode != "plain",
        bounds={"intended_operations": 2, "A_deliveries": 2, "B_deliveries": 1},
        assumptions=[
            "B is authorized after the first A commit; no later intended C exists.",
            "Every modeled target write is atomic and durable; no restoration occurs.",
            "The version control retains A's original expected version; it never rebases.",
            "The remembered-operation control retains A's identity and receipt permanently.",
            "Idempotence of a setter does not imply commutativity with a different setter.",
        ],
    )


@dataclass(frozen=True)
class BudgetState:
    right_owner: str = "none"
    a_allocated: bool = False
    b_allocated: bool = False
    merged: bool = False


def budget_model(reserved: bool) -> dict[str, Any]:
    """Merge two replica-local decisions against a one-unit allocation limit."""
    def successors(state: BudgetState) -> Iterable[tuple[str, BudgetState]]:
        if state.merged:
            return
        if reserved and state.right_owner == "none":
            for owner in ("A", "B"):
                yield f"atomically reserve the unique right for {owner}", replace(
                    state, right_owner=owner
                )
        if not state.a_allocated and (not reserved or state.right_owner == "A"):
            yield "A accepts one allocation locally", replace(state, a_allocated=True)
        if not state.b_allocated and (not reserved or state.right_owner == "B"):
            yield "B accepts one allocation locally", replace(state, b_allocated=True)
        yield "merge the allocation records", replace(state, merged=True)

    return _explore(
        name="budget_reserved_right" if reserved else "budget_independent_local_checks",
        initial=BudgetState(),
        successors=successors,
        violation=lambda state: (
            "Two locally valid allocations merge into a total above the global limit 1."
            if state.merged and int(state.a_allocated) + int(state.b_allocated) > 1
            else None
        ),
        property_text="The merged allocation set contains at most one allocation.",
        expected_holds=reserved,
        bounds={"replicas": 2, "global_budget": 1, "allocations_per_replica": 1, "merges": 1},
        assumptions=[
            "Without reservation, both replicas initially observe one available unit.",
            "Merge is set union of distinct allocation records; it does not undo acceptance.",
            "Reservation is one authoritative atomic allocation of a unique, nonduplicable right.",
            "The right is not transferred, restored, forged, or consumed twice in this model.",
            "This is a specific nonconfluent-invariant example, not a general confluence checker.",
        ],
    )


@dataclass(frozen=True)
class RollbackState:
    deliveries: int = 0  # Ghost bound; retained by the exploration harness.
    target_published: bool = False
    target_receipt: bool = False
    reply_pending: bool = False
    coordinator_done: bool = False
    rollback_used: bool = False
    observations_pending: int = 0
    external_observations: int = 0  # External history is not in either backup.


def rollback_model(restore_target: bool) -> dict[str, Any]:
    """An external observer can retain facts lost by destination restoration.

    Publication and receipt always commit together. Each actual publication
    creates a distinct visibility event. An outside observer records those
    events without its own deduplication. This models a stronger end-to-end
    once claim than merely finding one current row in the restored database.
    """
    def successors(state: RollbackState) -> Iterable[tuple[str, RollbackState]]:
        if not state.coordinator_done and state.deliveries < 2:
            next_state = replace(
                state, deliveries=state.deliveries + 1, reply_pending=True
            )
            if state.target_receipt:
                yield "deliver same operation: return target receipt", next_state
            else:
                yield "atomically commit publication and receipt", replace(
                    next_state,
                    target_published=True,
                    target_receipt=True,
                    observations_pending=state.observations_pending + 1,
                )
        if state.observations_pending:
            yield "external observer records a committed publication", replace(
                state,
                observations_pending=state.observations_pending - 1,
                external_observations=state.external_observations + 1,
            )
        if state.reply_pending:
            yield "coordinator records completion", replace(
                state, reply_pending=False, coordinator_done=True
            )
        if (
            not state.rollback_used
            and state.coordinator_done
            and state.external_observations >= 1
        ):
            next_state = replace(
                state, rollback_used=True, coordinator_done=False, reply_pending=False
            )
            if restore_target:
                # The effect AND receipt disappear together. Historical outside
                # observations do not. The operation identity still exists.
                yield "restore coordinator AND target before publication", replace(
                    next_state, target_published=False, target_receipt=False
                )
            else:
                yield "restore coordinator only; retain target transaction", next_state

    return _explore(
        name="rollback_target_and_coordinator" if restore_target else "rollback_coordinator_only",
        initial=RollbackState(),
        successors=successors,
        violation=lambda state: (
            "Outside observer saw two committed publications for the same operation."
            if state.external_observations > 1 else None
        ),
        property_text="One operation produces at most one externally observed publication.",
        expected_holds=not restore_target,
        bounds={"logical_operations": 1, "deliveries": 2, "restorations": 1},
        assumptions=[
            "The operation ID survives restoration and is identical on both deliveries.",
            "Effect and receipt are committed or restored together in one destination database.",
            "Restoration happens after an external observer saw a publication and completion was recorded.",
            "The outside observer is not restored and has no independent operation deduplication.",
            "No other publisher, forged receipt, partial database transaction, or third delivery exists.",
            "The claimed property concerns historical visibility, not uniqueness of current stored rows.",
        ],
    )


@dataclass(frozen=True)
class ProgressState:
    admitted: bool = True
    completed: bool = False
    publications: int = 0


def safety_without_progress_model() -> dict[str, Any]:
    """Exhibit an unfair infinite idle run; do not perform general liveness checking."""
    initial = ProgressState()

    def successors(state: ProgressState) -> Iterable[tuple[str, ProgressState]]:
        yield "idle", state
        if not state.completed:
            yield "dispatch and complete once", replace(
                state, completed=True, publications=1
            )

    result = _explore(
        name="safety_without_dispatch_fairness",
        initial=initial,
        successors=successors,
        violation=lambda state: "Duplicate publication." if state.publications > 1 else None,
        property_text="At most one publication occurs.",
        expected_holds=True,
        bounds={"operations": 1, "states": 2},
        assumptions=[
            "Dispatch is enabled continuously in the initial state, but is not required to occur.",
            "The idle transition is always enabled; no scheduling fairness is assumed.",
            "Successful dispatch and completion are collapsed into one atomic step in this tiny example.",
        ],
    )
    result["explicit_progress_counterexample"] = {
        "claim": "Every admitted operation eventually completes.",
        "prefix": [{"action": "initial", "state": asdict(initial)}],
        "cycle": [{"action": "idle", "state": asdict(initial)}],
        "explanation": (
            "Repeating the exhibited idle self-loop forever is an allowed run. "
            "It never completes and never violates safety. Weak fairness for the "
            "continuously enabled dispatch transition would exclude this run. "
            "This is an explicit liveness witness, not a general liveness model check."
        ),
    }
    return result


def run_all() -> list[dict[str, Any]]:
    return [
        setter_model("plain"),
        setter_model("version_conditional"),
        setter_model("remembered_operation"),
        budget_model(False),
        budget_model(True),
        rollback_model(True),
        rollback_model(False),
        safety_without_progress_model(),
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--json", nargs="?", const="-", metavar="PATH",
        help="write JSON to PATH; omit PATH or use '-' to print JSON",
    )
    arguments = parser.parse_args()
    results = run_all()
    if arguments.json is not None:
        serialized = json.dumps(results, indent=2, sort_keys=True) + "\n"
        if arguments.json == "-":
            print(serialized, end="")
        else:
            with open(arguments.json, "w", encoding="utf-8") as output:
                output.write(serialized)
    else:
        for result in results:
            status = "HOLDS WITHIN MODEL" if result["property_holds"] else "COUNTEREXAMPLE"
            print(f"{result['model']}: {status}")
            print(
                f"  {result['states_explored']} states, "
                f"{result['transitions_explored']} transitions"
            )
            trace = result["shortest_counterexample"]
            if trace:
                print(f"  {result['violation']}")
                for step in trace:
                    print(f"    {step['step']}. {step['action']}")
            if "explicit_progress_counterexample" in result:
                print("  Progress witness: initial -> idle -> idle -> ...; never completes.")
        print("All claims are limited to the explicit finite models and assumptions.")
    return 0 if all(result["expectation_met"] for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
