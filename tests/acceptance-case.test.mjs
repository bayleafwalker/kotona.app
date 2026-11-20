import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const directory = resolve(
  "public/evidence/acceptance-lab/2026-11-20-campaign-provenance",
);
const bytes = (name) => readFileSync(resolve(directory, name));
const load = (name) => JSON.parse(bytes(name));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const manifest = load("manifest.json");
const observations = [1, 2, 3].map((seq) =>
  load(`observations/${String(seq).padStart(3, "0")}.json`),
);

test("retained evidence, answer, evaluation and recorder match their published digests", () => {
  for (const [name, expected] of Object.entries(manifest.files)) {
    assert.equal(digest(bytes(name)), expected, name);
  }
  assert.equal(
    digest(readFileSync(manifest.recorder_path)),
    manifest.recorder_sha256,
  );
  for (const event of observations) {
    assert.equal(digest(event.stdout), event.stdout_sha256);
    assert.equal(digest(event.stderr), event.stderr_sha256);
    assert.equal(event.exit_code, 0);
    assert.equal(event.task_sha256, manifest.files["task.json"]);
    assert.equal(event.scenario_sha256, manifest.files["scenario.json"]);
    assert.equal(event.recorder_sha256, manifest.recorder_sha256);
    assert.notEqual(
      digest(`${event.stdout}\nThis line was not observed.\n`),
      event.stdout_sha256,
    );
  }
});

test("the retained adapted candidate identifies the actual three observed reads", () => {
  const candidate = load("observed.candidate.json");
  assert.deepEqual(
    candidate.metadata.trace_event_ids,
    observations.map((event) => event.event_id),
  );
  assert.deepEqual(
    candidate.trajectory.map((step) => [step.seq, step.tool, step.action]),
    observations.map((event) => [event.seq, event.tool.name, event.action]),
  );
  assert.deepEqual(candidate.metrics, {});
  assert.deepEqual(load("answer.json").trajectory, []);
});

test("the original event-chain bytes verify without requiring Acceptance Lab or a network", () => {
  // Acceptance Lab hashes canonical JSON with sorted keys and compact separators.
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, canonical(value[key])]),
      );
    }
    return value;
  };
  let previous = "0".repeat(64);
  const events = load("observed.events.json");
  // Retain the exact canonical strings: Python distinguishes 1.0 and 1 while
  // JSON.parse represents both as one JavaScript number.
  const payloads = load("observed.payloads.json");
  for (const event of events) {
    assert.equal(event.previous_hash, previous);
    const payload = payloads[event.event_id];
    assert.deepEqual(JSON.parse(payload), event.payload);
    const material = {
      previous_hash: previous,
      event_id: event.event_id,
      stream_id: event.stream_id,
      event_type: event.event_type,
      occurred_at: event.occurred_at,
      payload_json: payload,
    };
    assert.equal(digest(JSON.stringify(canonical(material))), event.event_hash);
    previous = event.event_hash;
  }
  assert.equal(events[0].event_type, "run.started");
  assert.equal(events.at(-1).event_type, "run.completed");
  assert.equal(events.at(-1).payload.status, "CONDITIONAL");
});

test("the report preserves the adapter's raw-output blind spot and unknown economics", () => {
  const { results } = load("results.json");
  const observed = results.observed;
  assert.equal(observed.constructed, false);
  assert.equal(observed.status_after_evidence_gate, "CONDITIONAL");
  assert.deepEqual(observed.evidence_errors, []);
  assert.equal(
    observed.evaluation.scores.find(
      (score) => score.check_id === "billing-observed-within-ceiling",
    ).passed,
    false,
  );
  for (const name of [
    "constructed-missing-read",
    "constructed-tampered-output",
    "constructed-empty-trace",
  ]) {
    assert.equal(results[name].constructed, true);
    assert.equal(results[name].status_after_evidence_gate, "FAIL");
    assert.ok(results[name].evidence_errors.length > 0);
  }
  assert.equal(
    results["constructed-tampered-output"].lab_status_before_evidence_gate,
    "CONDITIONAL",
  );
  assert.ok(
    results["constructed-tampered-output"].evidence_errors.some((error) =>
      error.includes("stdout digest mismatch"),
    ),
  );
});
