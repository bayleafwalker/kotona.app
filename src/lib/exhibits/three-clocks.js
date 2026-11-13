/**
 * A bounded, synthetic assertion log. Both the exhibit and its checks call this
 * module; expected answers remain in the fixture and are never read here.
 * Intervals include validFrom and exclude validTo. A record-time cutoff includes
 * assertions recorded at that instant. Later applicable assertions take priority.
 */

export const ROUNDING_POLICY = "nonnegative-half-up-per-record/v1";

/**
 * @typedef {{recordId: string, assertionId: string, status: "available",
 * rawAmount: string, currency: string, validFrom: string, validTo: string | null,
 * recordedAt: string, sourceMinor: string, eurMinor: string}} AvailableAssertion
 * @typedef {{recordId: string, status: "unavailable", reason: string,
 * eurMinor: null}} UnavailableAssertion
 * @typedef {{status: "available" | "unavailable", totalMinor: string | null,
 * rows: Array<AvailableAssertion | UnavailableAssertion>, unavailableIds: string[],
 * basis: {validAt: string, recordedAsOf: string, interpretationId: string,
 * parserId: string, referenceSnapshotId: string, roundingPolicy: string,
 * historyMode: string}} ThreeClocksResult
 */

function instant(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  ) {
    throw new Error("Every time must be an explicit UTC instant");
  }
  const timestamp = Date.parse(value);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().replace(".000Z", "Z") !==
      value.replace(".000Z", "Z")
  ) {
    throw new Error("Invalid UTC instant");
  }
  return timestamp;
}

/** Parse one nonnegative purchase amount into hundredths without floats. */
export function parseAmountMinor(raw, parserId) {
  if (
    typeof raw !== "string" ||
    raw.length > 40 ||
    !/^(?:\d+|\d{1,3}(?: \d{3})+)(?:[,.]\d{1,2})?$/.test(raw)
  ) {
    throw new Error("Unsupported purchase amount representation");
  }
  let normalized = raw.replaceAll(" ", "");
  if (parserId === "decimal-comma-dropped/v1") {
    // Retained defect: reproduces the original published example, not a fix.
    normalized = normalized.replaceAll(",", "");
  } else if (parserId === "decimal-comma-corrected/v2") {
    normalized = normalized.replace(",", ".");
  } else {
    throw new Error("Unknown parser identity");
  }
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function convertMinor(sourceMinor, rate, roundingPolicy) {
  if (roundingPolicy !== ROUNDING_POLICY) {
    throw new Error("Unknown rounding policy");
  }
  const numerator = BigInt(rate.numerator);
  const denominator = BigInt(rate.denominator);
  if (sourceMinor < 0n || numerator < 0n || denominator <= 0n) {
    throw new Error("This fixture supports nonnegative amounts and rates");
  }
  const scaled = sourceMinor * numerator;
  return (2n * scaled + denominator) / (2n * denominator);
}

export function formatEuro(minor) {
  if (minor === null) return "Unavailable";
  const amount = BigInt(minor);
  const whole = (amount / 100n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `€${whole}.${(amount % 100n).toString().padStart(2, "0")}`;
}

/**
 * The overwrite scene discards payload history. It retains only a loss marker
 * per affected business identity, sufficient to refuse an unsupported answer.
 */
export function createAssertionStore(input, historyMode = "retained") {
  if (!["retained", "overwrite"].includes(historyMode)) {
    throw new Error("Unknown history mode");
  }
  const seen = new Set();
  const assertions = input.assertions.map((assertion) => {
    const recorded = instant(assertion.recordedAt);
    const start = instant(assertion.validFrom);
    const end =
      assertion.validTo === null ? Infinity : instant(assertion.validTo);
    const key = `${assertion.recordId}:${recorded}`;
    if (seen.has(key) || start >= end) {
      throw new Error(
        "Ambiguous assertion order or invalid valid-time interval",
      );
    }
    seen.add(key);
    return { ...assertion, recorded, start, end };
  });
  if (historyMode === "retained") {
    return { assertions, historyLoss: [] };
  }
  const latest = new Map();
  const counts = new Map();
  for (const assertion of assertions) {
    counts.set(assertion.recordId, (counts.get(assertion.recordId) ?? 0) + 1);
    const previous = latest.get(assertion.recordId);
    if (!previous || assertion.recorded > previous.recorded) {
      latest.set(assertion.recordId, assertion);
    }
  }
  return {
    assertions: [...latest.values()],
    historyLoss: [...counts].filter(([, count]) => count > 1).map(([id]) => id),
  };
}

/** @returns {ThreeClocksResult} */
export function evaluateThreeClocks(input, query) {
  const validAt = instant(query.validAt);
  const recordedAsOf = instant(query.recordedAsOf);
  const interpretation = input.interpretations.find(
    (entry) => entry.id === query.interpretationId,
  );
  if (!interpretation) throw new Error("Unknown interpretation identity");
  const snapshot = input.referenceSnapshots.find(
    (entry) => entry.id === interpretation.referenceSnapshotId,
  );
  if (!snapshot) throw new Error("Reference snapshot is unavailable");
  const historyMode = query.historyMode ?? "retained";
  const store = createAssertionStore(input, historyMode);
  const rows = input.recordIds.map((recordId) => {
    const candidates = store.assertions
      .filter(
        (assertion) =>
          assertion.recordId === recordId &&
          assertion.start <= validAt &&
          validAt < assertion.end &&
          assertion.recorded <= recordedAsOf,
      )
      .sort((left, right) => right.recorded - left.recorded);
    const assertion = candidates[0];
    if (!assertion) {
      return {
        recordId,
        status: "unavailable",
        reason: store.historyLoss.includes(recordId)
          ? "history-not-retained"
          : "no-recorded-applicable-assertion",
        eurMinor: null,
      };
    }
    const rate = snapshot.rates[assertion.payload.currency];
    if (!rate)
      throw new Error("Currency is absent from the reference snapshot");
    const sourceMinor = parseAmountMinor(
      assertion.payload.amount,
      interpretation.parserId,
    );
    const eurMinor = convertMinor(
      sourceMinor,
      rate,
      interpretation.roundingPolicy,
    );
    return {
      recordId,
      assertionId: assertion.id,
      status: "available",
      rawAmount: assertion.payload.amount,
      currency: assertion.payload.currency,
      validFrom: assertion.validFrom,
      validTo: assertion.validTo,
      recordedAt: assertion.recordedAt,
      sourceMinor: sourceMinor.toString(),
      eurMinor: eurMinor.toString(),
    };
  });
  const unavailableIds = rows
    .filter((row) => row.status === "unavailable")
    .map((row) => row.recordId);
  return {
    status: unavailableIds.length ? "unavailable" : "available",
    totalMinor: unavailableIds.length
      ? null
      : rows
          .reduce((total, row) => total + BigInt(row.eurMinor), 0n)
          .toString(),
    rows,
    unavailableIds,
    basis: {
      validAt: query.validAt,
      recordedAsOf: query.recordedAsOf,
      interpretationId: interpretation.id,
      parserId: interpretation.parserId,
      referenceSnapshotId: snapshot.id,
      roundingPolicy: interpretation.roundingPolicy,
      historyMode,
    },
  };
}

export function questionLabel(query) {
  if (query.historyMode === "overwrite") {
    return "Query against the store after earlier payloads were overwritten";
  }
  if (query.interpretationId === "original") {
    return query.recordedAsOf === "2026-05-02T09:00:00Z"
      ? "Original interpretation, including its retained parser defect"
      : "Later recorded assertions interpreted by the retained defective parser";
  }
  return query.interpretationId === "corrected"
    ? "Corrected parser with the historical reference snapshot"
    : "Corrected parser with the revised reference snapshot";
}
