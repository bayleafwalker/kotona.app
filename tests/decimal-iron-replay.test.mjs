import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

import {
  assertReplayTrace,
  projectReplay,
  replayScenarios,
} from "../src/lib/exhibits/decimal-iron-replay.js";

const trace = JSON.parse(
  readFileSync(
    new URL("../src/data/exhibits/decimal-iron-replay.json", import.meta.url),
    "utf8",
  ),
);
const scenario = (data, id) => data.scenarios.find((entry) => entry.id === id);
const step = (data, scenarioId, id) =>
  scenario(data, scenarioId).steps.find((entry) => entry.id === id);

test("the published trace is a clean pinned export with checked values and explicit proof targets", () => {
  assert.equal(assertReplayTrace(trace), true);
  assert.deepEqual(
    trace.verification.targets.map(({ id, status }) => ({ id, status })),
    [
      { id: "python-reference", status: "passed" },
      { id: "rtl-scenario-adapter", status: "skipped" },
      { id: "physical-installation", status: "skipped" },
      { id: "keskus-game", status: "skipped" },
    ],
  );
});

test("the FIM entry point has one processor transaction and an unknown client outcome", () => {
  const result = projectReplay(trace, "lost-acknowledgement");
  assert.equal(result.stepId, "payment.committed-unacknowledged");
  assert.equal(result.transactionCount, 1);
  assert.equal(result.acknowledgement, "Unknown to client");
  assert.equal(result.terminal, "No terminal reply was received.");
  assert.equal(
    result.positions,
    "FI01: -1,200 penni (FIM)\nFI02: 1,200 penni (FIM)",
  );
  assert.equal(result.beaconOn, false);
  assert.deepEqual(result.scopes, [
    {
      currency: "FIM",
      unit: "penni",
      status: "Not current",
      difference: "0 penni (FIM)",
    },
    {
      currency: "EUR",
      unit: "cent",
      status: "Inactive",
      difference: "0 cents (EUR)",
    },
  ]);
});

test("inquiry and duplicate handling keep the original posting identity and count", () => {
  const lost = projectReplay(
    trace,
    "lost-acknowledgement",
    "payment.reply-lost",
  );
  const inquiry = projectReplay(
    trace,
    "lost-acknowledgement",
    "payment.inquiry-result",
  );
  const receipt = projectReplay(trace, "lost-acknowledgement", "payment");
  const duplicate = projectReplay(trace, "lost-acknowledgement", "duplicate");
  assert.equal(lost.acknowledgement, "Unknown to client");
  assert.equal(inquiry.terminal, "RESULT INQUIRY POSTED T001 SEQ 000003");
  assert.equal(receipt.acknowledgement, "RECOVERED_BY_INQUIRY");
  assert.equal(duplicate.acknowledgement, "IDEMPOTENT_DUPLICATE");
  assert.equal(duplicate.terminal, "RESULT DUPLICATE T001 SEQ 000003");
  for (const result of [lost, inquiry, receipt, duplicate]) {
    assert.equal(result.transactionCount, 1);
    assert.equal(result.journal, lost.journal);
    assert.equal(result.positions, lost.positions);
  }
});

test("the before-delivery control distinguishes no commit from a lost acknowledgement", () => {
  const before = step(
    trace,
    "interrupted-before-delivery",
    "payment.request-interrupted",
  );
  const inquiry = step(
    trace,
    "interrupted-before-delivery",
    "payment.inquiry-result",
  );
  const after = step(trace, "interrupted-before-delivery", "payment");
  assert.equal(before.state.transaction_count, 0);
  assert.equal(before.terminal_result, null);
  assert.equal(inquiry.terminal_result, "RESULT INQUIRY NOT_FOUND T002");
  assert.equal(after.state.transaction_count, 1);
  assert.equal(after.receipt_resolution, "RETRIED_AFTER_NOT_FOUND");
  assert.equal(after.transport.inquiries, 1);
});

test("selecting the EUR era enters the actual reconciliation break, not a skin change", () => {
  const result = projectReplay(trace, "euro-rounding-residue");
  assert.equal(result.stepId, "detect-residue");
  assert.equal(result.action, "RECONCILE EUR");
  assert.equal(result.beaconOn, true);
  assert.equal(result.scopes[0].difference, "0 penni (FIM)");
  assert.equal(result.scopes[1].difference, "1 cent (EUR)");
  assert.equal(result.conversion.itemTotal, "51 cents (EUR)");
  assert.equal(result.conversion.aggregateTotal, "50 cents (EUR)");
  assert.equal(result.conversion.adjustment, "0 cents (EUR)");
  assert.equal(result.conversion.rate, "5.94573 FIM per EUR");
});

test("the prior conversion step precedes the beacon and an adjustment requires fresh reconciliation", () => {
  const before = projectReplay(trace, "euro-rounding-residue", "switch-era");
  const refused = projectReplay(trace, "euro-rounding-residue", "refuse-close");
  const adjustment = projectReplay(
    trace,
    "euro-rounding-residue",
    "account-residue",
  );
  const reconciled = projectReplay(
    trace,
    "euro-rounding-residue",
    "reconcile-corrected",
  );
  const closed = projectReplay(trace, "euro-rounding-residue", "close");
  assert.equal(before.action, "CONVERT EUR OMIT");
  assert.equal(before.beaconOn, false);
  assert.equal(before.scopes[1].status, "Not current");
  assert.equal(refused.terminal, "RESULT ERROR EUR_RECONCILIATION_BREAK");
  assert.equal(adjustment.conversion.adjustment, "-1 cent (EUR)");
  assert.equal(adjustment.beaconOn, true);
  assert.equal(adjustment.scopes[1].status, "Not current");
  assert.equal(reconciled.beaconOn, false);
  assert.deepEqual(
    reconciled.scopes.map((scope) => scope.status),
    ["Current", "Current"],
  );
  assert.equal(reconciled.scopes[1].difference, "0 cents (EUR)");
  assert.equal(closed.phase, "CLOSED");
});

test("a suppressed displayed beacon is rejected even when all pass labels are retained", () => {
  const changed = globalThis.structuredClone(trace);
  step(changed, "euro-rounding-residue", "detect-residue").state.beacon_on =
    false;
  assert.throws(
    () => projectReplay(changed, "euro-rounding-residue"),
    /recorded value differs.*state.beacon_on/,
  );
});

test("changing both recorded and observed amounts still fails independent expected cents", () => {
  const changed = globalThis.structuredClone(trace);
  const record = step(changed, "euro-rounding-residue", "switch-era");
  record.state.conversion_statement.item_total_minor = 50;
  record.assertions.find(
    (entry) => entry.path === "state.conversion_statement.item_total_minor",
  ).observed = 50;
  assert.throws(
    () => projectReplay(changed, "euro-rounding-residue"),
    /expectation failed.*item_total_minor/,
  );
});

test("a changed terminal reply cannot retain an earlier successful assertion", () => {
  const changed = globalThis.structuredClone(trace);
  step(
    changed,
    "lost-acknowledgement",
    "payment.inquiry-result",
  ).terminal_result = "RESULT INQUIRY NOT_FOUND T001";
  assert.throws(
    () => assertReplayTrace(changed),
    /recorded value differs.*terminal_prefix/,
  );
});

test("removing a transport interruption cannot retain a successful checkpoint assertion", () => {
  const changed = globalThis.structuredClone(trace);
  const record = scenario(changed, "lost-acknowledgement");
  record.steps = record.steps.filter(
    (entry) => entry.id !== "payment.reply-lost",
  );
  assert.throws(
    () => assertReplayTrace(changed),
    /recorded value differs.*checkpoints_executed/,
  );
});

test("dirty, draft, mismatched and unverified provenance fail the production gate", () => {
  const dirty = globalThis.structuredClone(trace);
  dirty.implementation.clean = false;
  assert.throws(() => assertReplayTrace(dirty), /not clean/);
  const draft = globalThis.structuredClone(trace);
  draft.verification.status = "draft";
  assert.throws(() => assertReplayTrace(draft), /verification did not pass/);
  const mismatch = globalThis.structuredClone(trace);
  mismatch.fixture.sha256 = "0".repeat(64);
  assert.throws(
    () => assertReplayTrace(mismatch),
    /fixture\/source digest mismatch/,
  );
  const unchecked = globalThis.structuredClone(trace);
  unchecked.verification.targets[0].status = "skipped";
  assert.throws(
    () => assertReplayTrace(unchecked),
    /reference target did not pass/,
  );
});

test("negative controls must contain an observed rejection, not only a pass label", () => {
  const changed = globalThis.structuredClone(trace);
  const control = changed.verification.negative_controls.find(
    (entry) => entry.id === "silently-omit-rounding-adjustment",
  );
  for (const assertion of control.failed_assertions)
    assertion.observed = assertion.expected;
  assert.throws(() => assertReplayTrace(changed), /no observed discrimination/);
});

test("recorded step selection is bounded and presentation options cannot mutate shared defaults", () => {
  assert.throws(
    () => projectReplay(trace, "unrecorded"),
    /unknown presentation scenario/,
  );
  assert.throws(
    () => projectReplay(trace, "lost-acknowledgement", "invented"),
    /unknown recorded step/,
  );
  const choices = replayScenarios();
  choices[0].entryStepId = "invented";
  assert.equal(
    projectReplay(trace, "lost-acknowledgement").stepId,
    "payment.committed-unacknowledged",
  );
});
