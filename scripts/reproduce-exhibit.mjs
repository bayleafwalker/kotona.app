import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import process from "node:process";
import { URL } from "node:url";

import {
  evaluateThreeClocks,
  formatEuro,
} from "../src/lib/exhibits/three-clocks.js";
import {
  assertReplayTrace,
  projectReplay,
} from "../src/lib/exhibits/decimal-iron-replay.js";
import { balanceWeek } from "../src/lib/exhibits/spa-week.js";

const mutations = {
  "three-clocks": "wrong-parser",
  "decimal-iron-replay": "hide-beacon",
  "spa-week": "net-the-week",
};
const [id, flag, mutation, ...extra] = process.argv.slice(2);

// A negative control succeeds only by reaching its intended disagreement.
// A crash elsewhere must not look like a rejected mutation to a shell caller.
function expectedMutationRejection(error) {
  if (mutation === "hide-beacon") {
    return (
      error.message ===
      "Invalid Decimal Iron replay: recorded value differs at detect-residue:state.beacon_on"
    );
  }
  if (error.code !== "ERR_ASSERTION") return false;
  const expectedCase =
    mutation === "wrong-parser"
      ? "published-corrected-recomputation: total in EUR cents"
      : "hourly: energy balance in kWh";
  return error.message.startsWith(expectedCase);
}

if (
  !Object.hasOwn(mutations, id ?? "") ||
  extra.length ||
  (flag !== undefined && (flag !== "--mutation" || mutation !== mutations[id]))
) {
  process.stderr.write(
    "Usage: node scripts/reproduce-exhibit.mjs <three-clocks|decimal-iron-replay|spa-week> [--mutation <wrong-parser|hide-beacon|net-the-week>]\n" +
      "Use the mutation for that exhibit only. Normal checks exit 0; a detected disagreement exits 1; usage errors exit 2; an escaped mutation or execution error exits 3.\n",
  );
  process.exitCode = 2;
} else {
  const report = (message) => process.stdout.write(`${message}\n`);
  if (mutation) report(`Mutation: ${mutation} (in memory; files unchanged)`);
  try {
    const fixture = JSON.parse(
      readFileSync(
        new URL(`../src/data/exhibits/${id}.json`, import.meta.url),
        "utf8",
      ),
    );
    let passMessage;
    if (id === "three-clocks") {
      for (const entry of fixture.cases) {
        const query = { ...entry.query };
        if (
          mutation === "wrong-parser" &&
          entry.id === "published-corrected-recomputation"
        ) {
          query.interpretationId = "original";
        }
        const result = evaluateThreeClocks(fixture.input, query);
        assert.equal(
          result.status,
          entry.expected.status,
          `${entry.id}: status`,
        );
        assert.equal(
          result.totalMinor,
          entry.expected.totalMinor,
          `${entry.id}: total in EUR cents`,
        );
        assert.deepEqual(
          result.rows.map((row) => row.eurMinor),
          entry.expected.rows,
          `${entry.id}: individual EUR cents`,
        );
        if (entry.expected.p101Assertion) {
          assert.equal(
            result.rows[0].assertionId,
            entry.expected.p101Assertion,
          );
        }
        if (entry.expected.unavailableIds) {
          assert.deepEqual(
            result.unavailableIds,
            entry.expected.unavailableIds,
          );
        }
        report(`${entry.id}: ${formatEuro(result.totalMinor)}`);
      }
      passMessage = `PASS three-clocks: ${fixture.cases.length} independent fixture cases`;
    } else if (id === "decimal-iron-replay") {
      if (mutation === "hide-beacon") {
        const scenario = fixture.scenarios.find(
          (entry) => entry.id === "euro-rounding-residue",
        );
        scenario.steps.find(
          (entry) => entry.id === "detect-residue",
        ).state.beacon_on = false;
      }
      assertReplayTrace(fixture);
      const payment = projectReplay(fixture, "lost-acknowledgement");
      const duplicate = projectReplay(
        fixture,
        "lost-acknowledgement",
        "duplicate",
      );
      const residue = projectReplay(fixture, "euro-rounding-residue");
      const reconciled = projectReplay(
        fixture,
        "euro-rounding-residue",
        "reconcile-corrected",
      );
      report(`Upstream Python revision: ${fixture.implementation.revision}`);
      report(
        `After commit: ${payment.transactionCount} transaction; ${payment.acknowledgement}`,
      );
      report(
        `Same-identity retry: ${duplicate.transactionCount} transaction; ${duplicate.acknowledgement}`,
      );
      report(
        `EUR reconciliation: ${residue.scopes[1].difference}; beacon ${residue.beaconOn ? "ON" : "OFF"}`,
      );
      report(
        `Fresh reconciliation: ${reconciled.scopes[1].difference}; beacon ${reconciled.beaconOn ? "ON" : "OFF"}`,
      );
      passMessage = `PASS decimal-iron-replay: ${fixture.scenarios.length} recorded scenarios checked; Python was not executed`;
    } else {
      for (const mode of ["average", "hourly"]) {
        const result = balanceWeek(
          fixture,
          mutation === "net-the-week" ? "average" : mode,
        );
        assert.deepEqual(
          result,
          fixture.expected[mode],
          `${mode}: energy balance in kWh`,
        );
        report(
          `${mode}: imports ${result.gridImportKwh} kWh; exports ${result.gridExportKwh} kWh; peak import ${result.peakImportKw ?? "not resolved"}${result.peakImportKw === null ? "" : " kW"}`,
        );
      }
      passMessage =
        "PASS spa-week: both resolutions agree with independent expected energy balances";
    }
    if (mutation) {
      process.stderr.write(
        `ERROR ${id}: mutation ${mutation} escaped its check; no intended disagreement was detected\n`,
      );
      process.exitCode = 3;
    } else {
      report(passMessage);
    }
  } catch (error) {
    const disagreement = mutation
      ? expectedMutationRejection(error)
      : error.code === "ERR_ASSERTION" ||
        error.message.startsWith("Invalid Decimal Iron replay:");
    const label = disagreement ? (mutation ? "REJECTED" : "FAIL") : "ERROR";
    process.stderr.write(`${label} ${id}: ${error.message}\n`);
    process.exitCode = disagreement ? 1 : 3;
  }
}
