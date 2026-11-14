import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";
import { balanceWeek } from "../src/lib/exhibits/spa-week.js";

const fixture = JSON.parse(
  readFileSync(
    new URL("../src/data/exhibits/spa-week.json", import.meta.url),
    "utf8",
  ),
);

test("the same 168 hours produce the independent energy balances", () => {
  for (const mode of ["average", "hourly"])
    assert.deepEqual(balanceWeek(fixture, mode), fixture.expected[mode]);
  const hourly = balanceWeek(fixture, "hourly");
  assert.equal(
    hourly.hydroKwh + hourly.gridImportKwh,
    hourly.demandKwh + hourly.gridExportKwh,
  );
});

test("negative control catches generation and demand occurring at different hours", () => {
  const control = fixture.negativeControl;
  assert.equal(
    balanceWeek(control, "hourly").gridImportKwh,
    control.expectedHourlyImportKwh,
  );
  assert.equal(
    balanceWeek(control, "average").gridImportKwh,
    control.incorrectAggregateImportKwh,
  );
  assert.notEqual(
    control.expectedHourlyImportKwh,
    control.incorrectAggregateImportKwh,
  );
});

test("a missing hour or invalid power cannot silently become a complete week", () => {
  assert.throws(
    () => balanceWeek({ ...fixture, periods: fixture.periods.slice(1) }),
    /24 hours/,
  );
  assert.throws(() => balanceWeek({ ...fixture, days: 0 }), /positive/);
  assert.throws(
    () =>
      balanceWeek({
        ...fixture,
        periods: [{ hours: 24, hydroKw: -1, loadKw: 0 }],
      }),
    /nonnegative/,
  );
  assert.throws(() => balanceWeek(fixture, "annual"), /resolution/);
});
