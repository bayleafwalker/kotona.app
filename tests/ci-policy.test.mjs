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
