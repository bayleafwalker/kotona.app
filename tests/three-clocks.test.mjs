import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

import {
  createAssertionStore,
  evaluateThreeClocks,
  formatEuro,
  parseAmountMinor,
} from "../src/lib/exhibits/three-clocks.js";

const fixture = JSON.parse(
  readFileSync(
    new URL("../src/data/exhibits/three-clocks.json", import.meta.url),
    "utf8",
  ),
);

function assertCase(
  entry,
  evaluate = evaluateThreeClocks,
  input = fixture.input,
) {
  const result = evaluate(input, entry.query);
  assert.equal(result.status, entry.expected.status, `${entry.id}: status`);
  assert.equal(
    result.totalMinor,
    entry.expected.totalMinor,
    `${entry.id}: total`,
  );
  assert.deepEqual(
    result.rows.map((row) => row.eurMinor),
    entry.expected.rows,
    `${entry.id}: individual cents`,
  );
  if (entry.expected.p101Assertion) {
    assert.equal(result.rows[0].assertionId, entry.expected.p101Assertion);
  }
  if (entry.expected.unavailableIds) {
    assert.deepEqual(result.unavailableIds, entry.expected.unavailableIds);
    assert.equal(result.rows[0].reason, "history-not-retained");
  }
}

for (const entry of fixture.cases) {
  test(`three clocks fixture: ${entry.id}`, () => assertCase(entry));
}

test("the published decimal parser example is checked against the source note", () => {
  const note = readFileSync(
    new URL("../src/content/notes/schema-on-split.md", import.meta.url),
    "utf8",
  );
  const publishedRows = [
    ["p-101", "€108.88", "€1.09", "€1.14"],
    ["p-102", "€9.90", "€9.90", "€9.90"],
    ["p-103", "€11,314.29", "€113.14", "€118.47"],
  ];
  for (const expected of publishedRows) {
    const line = note
      .split("\n")
      .find((row) => row.startsWith(`| ${expected[0]}`));
    assert.ok(line, `Published source row exists: ${expected[0]}`);
    const actual = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    assert.deepEqual(actual, expected);
  }
  for (const [column, entry] of fixture.cases.slice(0, 3).entries()) {
    const result = evaluateThreeClocks(fixture.input, entry.query);
    result.rows.forEach((row, index) => {
      assert.equal(formatEuro(row.eurMinor), publishedRows[index][column + 1]);
    });
  }
});

test("a wrong record-time cutoff fails the independently specified old answer", () => {
  const wrongCutoff = (input, query) =>
    evaluateThreeClocks(input, {
      ...query,
      recordedAsOf: "2026-05-08T09:00:00Z",
    });
  assert.throws(() => assertCase(fixture.cases[1], wrongCutoff), {
    name: "AssertionError",
  });
});

test("substituting the defective parser fails the corrected-computation check", () => {
  const wrongParser = (input, query) =>
    evaluateThreeClocks(input, { ...query, interpretationId: "original" });
  assert.throws(() => assertCase(fixture.cases[1], wrongParser), {
    name: "AssertionError",
  });
});

test("substituting a reference snapshot fails the historical-rate check", () => {
  const wrongSnapshot = globalThis.structuredClone(fixture.input);
  wrongSnapshot.interpretations.find(
    (entry) => entry.id === "corrected",
  ).referenceSnapshotId = "fx@2026-09-07";
  assert.throws(
    () => assertCase(fixture.cases[1], evaluateThreeClocks, wrongSnapshot),
    { name: "AssertionError" },
  );
});

test("substituting valid time fails the late-correction interval check", () => {
  const wrongValidTime = (input, query) =>
    evaluateThreeClocks(input, {
      ...query,
      validAt: "2026-05-04T12:00:00Z",
    });
  assert.throws(() => assertCase(fixture.cases[6], wrongValidTime), {
    name: "AssertionError",
  });
});

test("the overwritten store contains no discarded payloads or fallback answer", () => {
  const store = createAssertionStore(fixture.input, "overwrite");
  assert.deepEqual(store.assertions.map((entry) => entry.id).sort(), [
    "p-101-correction",
    "p-102-original",
    "p-103-original",
  ]);
  assert.deepEqual(store.historyLoss, ["p-101"]);
  assert.equal(JSON.stringify(store).includes('"12,50"'), false);
  assert.equal(JSON.stringify(store).includes('"15,00"'), false);
  const result = evaluateThreeClocks(fixture.input, {
    ...fixture.defaultQuery,
    historyMode: "overwrite",
  });
  assert.equal(result.totalMinor, null);
  assert.equal(result.rows[0].eurMinor, null);
  assert.equal("rawAmount" in result.rows[0], false);
});

test("restoring retained history restores the answer without mutating the input", () => {
  const before = JSON.stringify(fixture.input);
  evaluateThreeClocks(fixture.input, {
    ...fixture.defaultQuery,
    historyMode: "overwrite",
  });
  assert.equal(JSON.stringify(fixture.input), before);
  assertCase(fixture.cases[0]);
});

test("the EUR control remains unchanged across every exposed time/version choice", () => {
  for (const validAt of fixture.validTimeOptions) {
    for (const recordedAsOf of fixture.recordTimeOptions) {
      for (const interpretation of fixture.input.interpretations) {
        const result = evaluateThreeClocks(fixture.input, {
          validAt,
          recordedAsOf,
          interpretationId: interpretation.id,
        });
        assert.equal(result.rows[1].eurMinor, "990");
        assert.equal(result.rows[1].assertionId, "p-102-original");
      }
    }
  }
});

test("expected answers do not influence the implementation", () => {
  const altered = globalThis.structuredClone(fixture);
  altered.cases[0].expected.rows = ["1", "2", "3"];
  altered.cases[0].expected.totalMinor = "6";
  assert.deepEqual(
    evaluateThreeClocks(altered.input, altered.defaultQuery),
    evaluateThreeClocks(fixture.input, fixture.defaultQuery),
  );
});

test("integer arithmetic preserves a half-cent tie and large exact source amounts", () => {
  assert.equal(parseAmountMinor("12,50", "decimal-comma-corrected/v2"), 1250n);
  assert.equal(parseAmountMinor("12,50", "decimal-comma-dropped/v1"), 125000n);
  assert.equal(
    parseAmountMinor("90071992547409,93", "decimal-comma-corrected/v2"),
    9007199254740993n,
  );
  // 1250 SEK * 0.0871 = 108.875 EUR: the declared half-up rule gives 108.88.
  assert.equal(
    evaluateThreeClocks(fixture.input, fixture.defaultQuery).rows[0].eurMinor,
    "10888",
  );
});

test("unsupported representations and ambiguous histories are refused", () => {
  for (const raw of ["1e3", "-1.00", "1 2,50", "1,2.3", "12,500"]) {
    assert.throws(() => parseAmountMinor(raw, "decimal-comma-corrected/v2"));
  }
  for (const timestamp of ["2026-05-01", "2026-02-31T12:00:00Z"]) {
    assert.throws(() =>
      evaluateThreeClocks(fixture.input, {
        ...fixture.defaultQuery,
        validAt: timestamp,
      }),
    );
  }
  const ambiguous = globalThis.structuredClone(fixture.input);
  ambiguous.assertions.push({ ...ambiguous.assertions[0], id: "ambiguous" });
  assert.throws(() => evaluateThreeClocks(ambiguous, fixture.defaultQuery));
  const absent = globalThis.structuredClone(fixture.input);
  absent.referenceSnapshots = [];
  assert.throws(
    () => evaluateThreeClocks(absent, fixture.defaultQuery),
    /snapshot is unavailable/,
  );
});
