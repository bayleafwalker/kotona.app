/**
 * Presentation of a trace exported by the Python reference implementation.
 * This module checks the trace contract and selects recorded states. It does
 * not post, settle, convert, or reconcile money in the browser.
 */

const SCENARIOS = [
  {
    id: "lost-acknowledgement",
    title: "1982 · FIM · lost acknowledgement",
    entryStepId: "payment.committed-unacknowledged",
  },
  {
    id: "euro-rounding-residue",
    title: "2002 · EUR statement · rounding residue",
    entryStepId: "detect-residue",
  },
];

function requireTrace(condition, message) {
  if (!condition) throw new Error(`Invalid Decimal Iron replay: ${message}`);
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function recordedValue(step, path, scenario) {
  if (path === "terminal_prefix") return step.terminal_result;
  if (path === "checkpoints_executed") {
    return scenario.steps
      .filter(
        (entry) =>
          entry.checkpoint &&
          entry.fixture_step === step.id &&
          entry.id.startsWith(`${step.id}.`),
      )
      .map((entry) => entry.id.slice(step.id.length + 1))
      .sort();
  }
  return path.split(".").reduce((value, key) => value?.[key], step);
}

/**
 * Check exported assertions against the recorded values, not only their badges.
 * Source provenance is a binding to a reproducible export, not a signature.
 * Draft allowance exists only for explicit development inspection.
 */
export function assertReplayTrace(trace, { allowDraft = false } = {}) {
  requireTrace(trace.schema === "decimal-iron-replay/v1", "unsupported schema");
  requireTrace(
    /^[a-f0-9]{40}$/.test(trace.implementation?.revision),
    "missing revision",
  );
  requireTrace(
    trace.implementation?.repository ===
      "https://github.com/bayleafwalker/decimal-iron",
    "wrong implementation repository",
  );
  requireTrace(
    allowDraft || trace.implementation.clean === true,
    "implementation is not clean",
  );
  requireTrace(
    allowDraft || !trace.implementation.uncommitted_files?.length,
    "uncommitted implementation files",
  );
  requireTrace(
    trace.verification?.status === "passed" ||
      (allowDraft && trace.verification?.status === "draft"),
    "verification did not pass",
  );
  requireTrace(
    trace.fixture?.schema === "decimal-iron-scenarios/v1",
    "missing scenario fixture",
  );
  requireTrace(
    /^[a-f0-9]{64}$/.test(trace.fixture.sha256),
    "missing fixture digest",
  );
  requireTrace(
    trace.implementation.source_files?.[trace.fixture.path] ===
      trace.fixture.sha256,
    "fixture/source digest mismatch",
  );
  const targets = trace.verification.targets ?? [];
  requireTrace(
    targets.find((target) => target.id === "python-reference")?.status ===
      "passed",
    "reference target did not pass",
  );
  for (const id of [
    "rtl-scenario-adapter",
    "physical-installation",
    "keskus-game",
  ]) {
    requireTrace(
      targets.find((target) => target.id === id)?.status === "skipped",
      `undeclared proof scope for ${id}`,
    );
  }
  const scenarioIds = new Set();
  for (const scenario of trace.scenarios ?? []) {
    requireTrace(!scenarioIds.has(scenario.id), "duplicate scenario");
    scenarioIds.add(scenario.id);
    requireTrace(
      scenario.status === "passed",
      `scenario ${scenario.id} did not pass`,
    );
    requireTrace(
      scenario.steps?.length > 0,
      `scenario ${scenario.id} has no recorded steps`,
    );
    const stepIds = new Set();
    for (const step of scenario.steps) {
      requireTrace(!stepIds.has(step.id), `duplicate step ${step.id}`);
      stepIds.add(step.id);
      requireTrace(
        step.status === "passed" && step.assertions?.length > 0,
        `step ${step.id} was not checked`,
      );
      for (const assertion of step.assertions) {
        const actual = recordedValue(step, assertion.path, scenario);
        requireTrace(
          sameValue(actual, assertion.observed),
          `recorded value differs at ${step.id}:${assertion.path}`,
        );
        const agrees =
          assertion.path === "terminal_prefix"
            ? typeof actual === "string" &&
              actual.startsWith(assertion.expected)
            : sameValue(actual, assertion.expected);
        requireTrace(
          assertion.status === "passed" && agrees,
          `expectation failed at ${step.id}:${assertion.path}`,
        );
      }
    }
    requireTrace(
      scenario.replay?.status === "passed" &&
        scenario.replay.state_matches === true &&
        scenario.replay.report_matches === true,
      `journal replay failed for ${scenario.id}`,
    );
    const last = scenario.steps.at(-1).state;
    requireTrace(
      scenario.replay.journal_head === last.journal_head &&
        scenario.replay.journal_events === last.journal_events,
      `journal replay boundary differs for ${scenario.id}`,
    );
  }
  for (const scenario of SCENARIOS) {
    const actual = trace.scenarios.find((entry) => entry.id === scenario.id);
    requireTrace(
      actual?.steps.some((step) => step.id === scenario.entryStepId),
      `missing presentation checkpoint ${scenario.entryStepId}`,
    );
  }
  for (const id of [
    "new-identity-after-lost-ack",
    "silently-omit-rounding-adjustment",
    "suppress-eur-reconciliation-break",
  ]) {
    const control = trace.verification.negative_controls?.find(
      (entry) => entry.id === id,
    );
    requireTrace(
      control?.status === "passed" && control.mutation_rejected === true,
      `negative control did not reject ${id}`,
    );
    requireTrace(
      control.failed_assertions?.some(
        (assertion) =>
          assertion.status === "failed" &&
          !sameValue(assertion.expected, assertion.observed),
      ),
      `negative control has no observed discrimination: ${id}`,
    );
  }
  return true;
}

/** @returns {Array<{id: string, title: string, entryStepId: string}>} */
export function replayScenarios() {
  return SCENARIOS.map((scenario) => ({ ...scenario }));
}

function minorLabel(amount, unit, currency) {
  requireTrace(
    Number.isSafeInteger(amount),
    "minor-unit value is not a safe integer",
  );
  const label = unit === "cent" && Math.abs(amount) !== 1 ? "cents" : unit;
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${label} (${currency})`;
}

/**
 * @typedef {{scenarioId: string, scenarioTitle: string, scenarioSummary: string,
 * entryStepId: string, stepId: string, stepLabel: string, stepIndex: number,
 * stepCount: number, steps: Array<{id: string, label: string, checkpoint: boolean}>,
 * checkpoint: boolean, beaconOn: boolean, businessDate: string, phase: string,
 * keyPosition: string, transactionCount: number, acknowledgement: string,
 * action: string, terminal: string, positions: string, journal: string,
 * checkCount: number, scopes: Array<{currency: string, unit: string,
 * status: string, difference: string}>, conversion: null | {
 * sourceItems: string, convertedItems: string, itemTotal: string,
 * aggregateTotal: string, adjustment: string, rate: string, policy: string
 * }}} ReplayView
 */

/** @returns {ReplayView} */
export function projectReplay(trace, scenarioId, stepId, options = {}) {
  assertReplayTrace(trace, options);
  const choice = SCENARIOS.find((scenario) => scenario.id === scenarioId);
  requireTrace(choice, "unknown presentation scenario");
  const scenario = trace.scenarios.find((entry) => entry.id === scenarioId);
  const selectedId = stepId ?? choice.entryStepId;
  const stepIndex = scenario.steps.findIndex((step) => step.id === selectedId);
  requireTrace(stepIndex >= 0, "unknown recorded step");
  const step = scenario.steps[stepIndex];
  const state = step.state;
  const conversion = state.conversion_statement;
  let acknowledgement = "Terminal reply received";
  if (step.action.kind === "payment" && step.terminal_result === null) {
    acknowledgement = "Unknown to client";
  } else if (step.receipt_resolution) {
    acknowledgement = step.receipt_resolution;
  } else if (step.terminal_result?.startsWith("RESULT INQUIRY")) {
    acknowledgement = step.terminal_result;
  } else if (step.terminal_result?.startsWith("RESULT ERROR")) {
    acknowledgement = "Terminal refused the command";
  }
  return {
    scenarioId,
    scenarioTitle: scenario.title,
    scenarioSummary: scenario.summary,
    entryStepId: choice.entryStepId,
    stepId: step.id,
    stepLabel: step.label,
    stepIndex,
    stepCount: scenario.steps.length,
    steps: scenario.steps.map((entry) => ({
      id: entry.id,
      label: entry.label,
      checkpoint: entry.checkpoint,
    })),
    checkpoint: step.checkpoint,
    beaconOn: state.beacon_on,
    businessDate: state.business_date,
    phase: state.phase,
    keyPosition: state.key_position,
    transactionCount: state.transaction_count,
    acknowledgement,
    action:
      step.action.kind === "command"
        ? step.action.command
        : `Payment ${step.action.payment_id}: ${step.action.source} → ${step.action.destination}; ${minorLabel(step.action.amount_minor, "penni", "FIM")}`,
    terminal: step.terminal_result ?? "No terminal reply was received.",
    positions:
      Object.entries(state.positions)
        .map(([id, amount]) => `${id}: ${minorLabel(amount, "penni", "FIM")}`)
        .join("\n") || "No participant positions recorded yet.",
    journal: `${state.journal_events} journal events · head ${state.journal_head}`,
    checkCount: step.assertions.length,
    scopes: ["FIM", "EUR"].map((currency) => {
      const scope = state.reconciliation_scopes[currency];
      return {
        currency: scope.currency,
        unit: scope.unit,
        status: !scope.active
          ? "Inactive"
          : scope.current
            ? "Current"
            : "Not current",
        difference: minorLabel(
          scope.difference_minor,
          scope.unit,
          scope.currency,
        ),
      };
    }),
    conversion:
      conversion === null
        ? null
        : {
            sourceItems: conversion.source_amounts_minor
              .map((amount) =>
                minorLabel(
                  amount,
                  conversion.source_unit,
                  conversion.source_currency,
                ),
              )
              .join(" + "),
            convertedItems: conversion.item_amounts_minor
              .map((amount) =>
                minorLabel(amount, conversion.unit, conversion.currency),
              )
              .join(" + "),
            itemTotal: minorLabel(
              conversion.item_total_minor,
              conversion.unit,
              conversion.currency,
            ),
            aggregateTotal: minorLabel(
              conversion.aggregate_total_minor,
              conversion.unit,
              conversion.currency,
            ),
            adjustment: minorLabel(
              conversion.rounding_adjustment_minor,
              conversion.unit,
              conversion.currency,
            ),
            rate: `${conversion.rate_fim_per_eur} FIM per EUR`,
            policy: conversion.rounding_policy,
          },
  };
}
