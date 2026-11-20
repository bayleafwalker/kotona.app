import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const run = (...args) =>
  spawnSync(process.execPath, ["scripts/reproduce-exhibit.mjs", ...args], {
    cwd: root,
    encoding: "utf8",
  });

for (const [id, mutation, result, failure] of [
  [
    "three-clocks",
    "wrong-parser",
    "€124.13",
    "published-corrected-recomputation",
  ],
  [
    "decimal-iron-replay",
    "hide-beacon",
    "1 cent (EUR); beacon ON",
    "state.beacon_on",
  ],
  [
    "spa-week",
    "net-the-week",
    "imports 6440 kWh; exports 2800 kWh",
    "hourly: energy balance in kWh",
  ],
]) {
  test(`${id}: reader command reproduces the result and rejects its mutation without changing the fixture`, () => {
    const fixture = new URL(`../src/data/exhibits/${id}.json`, import.meta.url);
    const before = readFileSync(fixture, "utf8");
    const baseline = run(id);
    assert.equal(baseline.status, 0, baseline.stderr);
    assert.ok(baseline.stdout.includes(result), baseline.stdout);
    assert.ok(baseline.stdout.includes(`PASS ${id}:`));
    const broken = run(id, "--mutation", mutation);
    assert.equal(broken.status, 1, broken.stderr);
    assert.ok(broken.stderr.includes(failure), broken.stderr);
    assert.ok(broken.stderr.startsWith(`REJECTED ${id}:`), broken.stderr);
    assert.equal(broken.stdout.includes(`PASS ${id}:`), false);
    assert.equal(readFileSync(fixture, "utf8"), before);
    assert.equal(run(id).status, 0);
  });
}

test("unknown exhibits and mutation names cannot select an unintended fixture or pass silently", () => {
  for (const args of [
    [],
    ["../private"],
    ["three-clocks", "--mutation", "typo"],
    ["spa-week", "--mutation"],
    ["spa-week", "--other"],
  ]) {
    assert.equal(run(...args).status, 2);
  }
});

test("an escaped control and an execution error cannot masquerade as the intended rejection", () => {
  const isolated = mkdtempSync(path.join(tmpdir(), "kotona-reproduction-"));
  try {
    mkdirSync(path.join(isolated, "scripts"));
    mkdirSync(path.join(isolated, "src/lib"), { recursive: true });
    mkdirSync(path.join(isolated, "src/data"), { recursive: true });
    writeFileSync(path.join(isolated, "package.json"), '{"type":"module"}\n');
    cpSync(
      path.join(root, "src/lib/exhibits"),
      path.join(isolated, "src/lib/exhibits"),
      { recursive: true },
    );
    cpSync(
      path.join(root, "src/data/exhibits"),
      path.join(isolated, "src/data/exhibits"),
      { recursive: true },
    );
    const source = readFileSync(
      path.join(root, "scripts/reproduce-exhibit.mjs"),
      "utf8",
    );
    const operation = 'query.interpretationId = "original";';
    assert.equal(
      source.split(operation).length,
      2,
      "mutation seam exists exactly once",
    );
    for (const [replacement, expected] of [
      [
        "query.interpretationId = entry.query.interpretationId;",
        "escaped its check",
      ],
      ['throw new Error("simulated runner fault");', "simulated runner fault"],
    ]) {
      writeFileSync(
        path.join(isolated, "scripts/reproduce-exhibit.mjs"),
        source.replace(operation, replacement),
      );
      const result = spawnSync(
        process.execPath,
        [
          "scripts/reproduce-exhibit.mjs",
          "three-clocks",
          "--mutation",
          "wrong-parser",
        ],
        { cwd: isolated, encoding: "utf8" },
      );
      assert.equal(result.status, 3, result.stderr);
      assert.ok(result.stderr.startsWith("ERROR three-clocks:"), result.stderr);
      assert.ok(result.stderr.includes(expected), result.stderr);
      assert.equal(result.stdout.includes("PASS"), false, result.stdout);
      assert.equal(result.stderr.includes("REJECTED"), false, result.stderr);
    }
  } finally {
    rmSync(isolated, { recursive: true, force: true });
  }
});
