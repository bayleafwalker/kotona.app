import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";
import { parse } from "yaml";

async function readWorkflow(name) {
  const source = await readFile(
    new URL(`../.github/workflows/${name}`, import.meta.url),
    "utf8",
  );
  return parse(source);
}

test("external reachability is scheduled maintenance, not a deployment gate", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const ci = await readWorkflow("ci.yml");
  const externalLinks = await readWorkflow("external-links.yml");

  assert.doesNotMatch(packageJson.scripts.validate, /check:links/);
  assert.equal(
    ci.jobs.build.steps.some((step) => step.run === "npm run check:links"),
    false,
  );
  assert.deepEqual(externalLinks.on.schedule, [{ cron: "17 4 * * 1" }]);
  assert.ok(Object.hasOwn(externalLinks.on, "workflow_dispatch"));
  assert.equal(
    externalLinks.jobs.check.steps.some(
      (step) => step.run === "npm run check:links",
    ),
    true,
  );
});

test("the browser gate and the digest drift check run in CI", async () => {
  const ci = await readWorkflow("ci.yml");
  const runs = ci.jobs.build.steps.map((step) => step.run);

  // The browser suite has already caught correctness defects the unit, worker,
  // and retrieval suites cannot reach, so it is a gate rather than a local
  // convenience -- which means CI has to provision Chromium for it.
  assert.ok(runs.includes("npm run test:browser"));
  assert.ok(
    runs.includes("npx playwright install --with-deps chromium"),
    "CI must provision Chromium before running the browser suite",
  );
  assert.ok(
    runs.indexOf("npx playwright install --with-deps chromium") <
      runs.indexOf("npm run test:browser"),
  );

  // A stale digest makes the skills index unusable by a conformant client, and
  // the drift check only proves the committed index is correct if it runs
  // before the build regenerates it.
  assert.ok(runs.includes("npm run check:agent-skills"));
  assert.ok(
    runs.indexOf("npm run check:agent-skills") < runs.indexOf("npm run build"),
  );
});
