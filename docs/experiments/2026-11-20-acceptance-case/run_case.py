#!/usr/bin/env python3
"""Capture public Git reads once; replay their evaluation without rewriting them.

The local recorder is not a provider trace, signature, sandbox, or model runner.
An agent invokes `read` and writes its answer separately. Only these reads are
captured. All accepted source objects are pinned in the published task.
"""

from __future__ import annotations

import argparse
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from time import perf_counter_ns


LAB_REVISION = "fddbab2e26398f0ecddfc89cd291462effdc8e75"
SITE_REVISION = "f9f9bb336a8ad7f4b2e995d43d3fde806ecac7b7"
SOURCE_SPECS = {
    "lab-readme": ("acceptance-lab", LAB_REVISION, "README.md"),
    "lab-generator": ("acceptance-lab", LAB_REVISION, "scripts/run_campaign.py"),
    "site-project": (
        "kotona.app", SITE_REVISION, "src/content/projects/acceptance-lab.md"
    ),
}
REQUIRED_FACTS = [
    "campaign outputs are regenerable fixtures",
    "the directory date names case authorship, not a historical score",
    "the project page should distinguish fixture rebuilds from retained run evidence",
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_new(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("x", encoding="utf-8") as stream:
        json.dump(data, stream, indent=2, ensure_ascii=False)
        stream.write("\n")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def command(source: str) -> list[str]:
    _, revision, path = SOURCE_SPECS[source]
    return ["git", "--no-pager", "show", f"{revision}:{path}"]


def repo_for(source: str, args) -> Path:
    return args.lab if SOURCE_SPECS[source][0] == "acceptance-lab" else args.site


def capture(args) -> None:
    source = args.source
    prior = sorted((args.case_dir / "observations").glob("*.json"))
    if source in [load(path)["source_id"] for path in prior]:
        raise ValueError("This source was already captured; use a new case for a new run")
    if len(prior) >= len(SOURCE_SPECS):
        raise ValueError("The declared read interval is already complete")
    started_at, start = now(), perf_counter_ns()
    observed = subprocess.run(
        command(source), cwd=repo_for(source, args), capture_output=True, check=False
    )
    duration_ms = (perf_counter_ns() - start) / 1_000_000
    repository, revision, path = SOURCE_SPECS[source]
    event = {
        "event_id": f"public-read:{len(prior) + 1:03d}",
        "seq": len(prior) + 1,
        "observed_by": "runner",
        "source_id": source,
        "tool": {"name": f"git.read.{source}", "identity": "local-public-git-reader/v1"},
        "action": f"Read {repository}@{revision}:{path}",
        "effect": False,
        "repository": f"https://github.com/bayleafwalker/{repository}",
        "revision": revision,
        "path": path,
        "argv": command(source),
        "started_at": started_at,
        "completed_at": now(),
        "duration_ms": duration_ms,
        "exit_code": observed.returncode,
        "stdout": observed.stdout.decode("utf-8"),
        "stderr": observed.stderr.decode("utf-8"),
        "stdout_sha256": sha(observed.stdout),
        "stderr_sha256": sha(observed.stderr),
        "recorder_sha256": sha(Path(__file__).read_bytes()),
        "task_sha256": sha((args.case_dir / "task.json").read_bytes()),
        "scenario_sha256": sha((args.case_dir / "scenario.json").read_bytes()),
    }
    write_new(args.case_dir / "observations" / f"{event['seq']:03d}.json", event)
    print(json.dumps({key: event[key] for key in (
        "event_id", "source_id", "exit_code", "duration_ms", "stdout_sha256"
    )}))
    print(event["stdout"])


def inspect_evidence(events: list[dict], args) -> list[str]:
    """A small direct check, independent of Acceptance Lab's scorers."""
    errors = []
    if [event["source_id"] for event in events] != list(SOURCE_SPECS):
        errors.append("required public reads are missing or out of order")
    for seq, event in enumerate(events, 1):
        source = event["source_id"]
        if source not in SOURCE_SPECS:
            errors.append("unknown source")
            continue
        repository, revision, path = SOURCE_SPECS[source]
        expected = {
            "seq": seq, "event_id": f"public-read:{seq:03d}",
            "observed_by": "runner", "argv": command(source),
            "repository": f"https://github.com/bayleafwalker/{repository}",
            "revision": revision, "path": path, "exit_code": 0,
            "tool": {"name": f"git.read.{source}", "identity": "local-public-git-reader/v1"},
            "task_sha256": sha((args.case_dir / "task.json").read_bytes()),
            "scenario_sha256": sha((args.case_dir / "scenario.json").read_bytes()),
            "recorder_sha256": sha(Path(__file__).read_bytes()),
        }
        for key, value in expected.items():
            if event.get(key) != value:
                errors.append(f"{source}: {key} disagrees with the declared read")
        for channel in ("stdout", "stderr"):
            if sha(event[channel].encode("utf-8")) != event[f"{channel}_sha256"]:
                errors.append(f"{source}: {channel} digest mismatch")
        source_bytes = subprocess.run(
            command(source), cwd=repo_for(source, args), capture_output=True, check=True
        ).stdout
        if source_bytes != event["stdout"].encode("utf-8"):
            errors.append(f"{source}: output differs from the pinned Git object")
    return errors


def direct_candidate_check(answer: dict, events: list[dict]) -> list[str]:
    errors = []
    if not set(REQUIRED_FACTS) <= set(answer["facts"]):
        errors.append("required fact labels are missing")
    cited = {citation["id"] for citation in answer["citations"]}
    if not {f"public-read:{seq:03d}" for seq in range(1, 4)} <= cited:
        errors.append("required read references are missing")
    supported = {fact for citation in answer["citations"] for fact in citation["supports"]}
    if not set(REQUIRED_FACTS) <= supported:
        errors.append("required fact labels lack citations")
    if answer["abstained"]:
        errors.append("the task requires an answer")
    if [event["source_id"] for event in events] != list(SOURCE_SPECS):
        errors.append("required public reads are missing or out of order")
    return errors


def replay(args) -> None:
    if args.out.resolve().is_relative_to(args.case_dir.resolve()):
        raise ValueError("Replay output must be outside the retained observation directory")
    if args.out.exists():
        raise ValueError("Choose a new output directory; prior results are never replaced")
    actual_revision = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=args.lab, capture_output=True, text=True, check=True
    ).stdout.strip()
    if actual_revision != LAB_REVISION:
        raise ValueError(f"Acceptance Lab must be checked out at {LAB_REVISION}")
    # Refuse edited scorer code even if HEAD is pinned.
    clean = subprocess.run(
        ["git", "diff", "--exit-code", "HEAD", "--", "src"],
        cwd=args.lab, capture_output=True, check=False
    )
    if clean.returncode:
        raise ValueError("Acceptance Lab src differs from the pinned revision")
    sys.path.insert(0, str(args.lab / "src"))
    from acceptance_lab.adapters import candidate_from_trace
    from acceptance_lab.models import CandidateOutput, Scenario
    from acceptance_lab.scoring import evaluate_candidate
    from acceptance_lab.store import EventStore

    events = [load(path) for path in sorted((args.case_dir / "observations").glob("*.json"))]
    answer = load(args.case_dir / "answer.json")
    scenario_raw = load(args.case_dir / "scenario.json")
    scenario = Scenario.from_dict(scenario_raw)
    task = load(args.case_dir / "task.json")
    trace = {
        "trace_id": "kotona:2026-11-20:campaign-provenance",
        "provenance": {
            "model": "unobserved-native-chatgpt-agent-model",
            "prompt_version": "sha256:" + sha((args.case_dir / "task.json").read_bytes()),
            "harness_version": "sha256:" + sha(Path(__file__).read_bytes()),
            "tool_set_version": "local-public-git-reader/v1",
            "corpus_version": f"acceptance-lab@{LAB_REVISION};kotona.app@{SITE_REVISION}",
        },
        "capture_scope": task["capture_scope"],
        "tool_calls": events,
    }
    missing = deepcopy(trace)
    missing["tool_calls"].pop(1)
    tampered = deepcopy(trace)
    tampered["tool_calls"][0]["stdout"] += "\nThis line was not observed.\n"
    empty = deepcopy(trace)
    empty["tool_calls"] = []
    variants = {
        "observed": trace,
        "constructed-missing-read": missing,
        "constructed-tampered-output": tampered,
        "constructed-empty-trace": empty,
    }
    reports = {}
    args.out.mkdir(parents=True)
    for label, variant in variants.items():
        start = perf_counter_ns()
        integrity_errors = inspect_evidence(variant["tool_calls"], args)
        integrity_ms = (perf_counter_ns() - start) / 1_000_000
        start = perf_counter_ns()
        direct_errors = direct_candidate_check(answer, variant["tool_calls"])
        direct_ms = (perf_counter_ns() - start) / 1_000_000
        start = perf_counter_ns()
        adapted = candidate_from_trace(answer, variant)
        result = evaluate_candidate(
            scenario, CandidateOutput.from_dict(adapted), label,
            run_id=f"campaign-provenance:{label}",
            metadata={"trace_id": trace["trace_id"], "constructed": label != "observed"},
        )
        with tempfile.TemporaryDirectory(prefix="kotona-case-") as temp:
            store = EventStore(Path(temp) / "events.db")
            store.record_evaluation(result, scenario_snapshot=scenario_raw, output_snapshot=adapted)
            valid, detail = store.verify_chain()
            if not valid:
                raise RuntimeError(detail)
            store.rebuild_projections()
            retained_events = store.events()
        lab_ms = (perf_counter_ns() - start) / 1_000_000
        # A failed evidence envelope blocks use regardless of the inner scorer.
        accepted_status = "FAIL" if integrity_errors else result.status
        direct_status = "FAIL" if integrity_errors or direct_errors else "CONDITIONAL"
        report = {
            "constructed": label != "observed",
            "evidence_errors": integrity_errors,
            "direct_errors": direct_errors,
            "direct_status": direct_status,
            "lab_status_before_evidence_gate": result.status,
            "status_after_evidence_gate": accepted_status,
            "economics": "Native model billing was not observed; budget qualification is withheld.",
            "timing_ms": {"source_and_digest_verification": integrity_ms,
                          "direct_candidate_checks": direct_ms,
                          "lab_adapt_score_record_verify_rebuild": lab_ms},
            "evaluation": result.to_dict(),
            "event_store_gate": detail,
        }
        reports[label] = report
        write_new(args.out / f"{label}.candidate.json", adapted)
        write_new(args.out / f"{label}.events.json", retained_events)
    expected = {
        "observed": "CONDITIONAL",
        "constructed-missing-read": "FAIL",
        "constructed-tampered-output": "FAIL",
        "constructed-empty-trace": "FAIL",
    }
    if {key: value["status_after_evidence_gate"] for key, value in reports.items()} != expected:
        raise ValueError("The observed case or one discriminating control changed verdict")
    write_new(args.out / "trace.json", trace)
    write_new(args.out / "results.json", {
        "recorded_at": now(), "lab_revision": LAB_REVISION,
        "interpretation": "One observed evidence-review run; three constructed controls. No model comparison.",
        "results": reports,
    })
    print(json.dumps({key: {"status": value["status_after_evidence_gate"],
                          "lab_before_gate": value["lab_status_before_evidence_gate"],
                          "timing_ms": value["timing_ms"]}
                      for key, value in reports.items()}, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("read", "replay"))
    parser.add_argument("--case-dir", type=Path, required=True)
    parser.add_argument("--lab", type=Path, required=True)
    parser.add_argument("--site", type=Path, required=True)
    parser.add_argument("--source", choices=SOURCE_SPECS)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    if args.mode == "read":
        if not args.source:
            parser.error("read requires --source")
        capture(args)
    else:
        if not args.out:
            parser.error("replay requires --out")
        replay(args)


if __name__ == "__main__":
    main()
