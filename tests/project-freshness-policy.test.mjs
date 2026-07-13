import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

import {
  checkProjectSource,
  parseDateOnly,
  siteToday,
} from "../scripts/check-project-freshness.mjs";

const scriptPath = fileURLToPath(
  new URL("../scripts/check-project-freshness.mjs", import.meta.url),
);

function projectFrontmatter({
  published = "2026-04-01",
  lastRevised = "2026-04-14",
  lastVerified = "2026-04-14",
} = {}) {
  return `---
title: Fixture project
published: ${published}
lastRevised: ${lastRevised}
lastVerified: ${lastVerified}
draft: false
---

Fixture body.
`;
}

test("accepts valid chronology at the inclusive 90-day boundary", () => {
  const result = checkProjectSource(projectFrontmatter(), {
    filePath: "fixture.md",
    asOf: parseDateOnly("2026-07-13", "--as-of"),
  });

  assert.equal(result.ageDays, 90);
  assert.deepEqual(result.issues, []);
});

test("defaults to the site date in Europe/Helsinki", () => {
  assert.equal(siteToday(new Date("2026-07-12T21:30:00Z")), "2026-07-13");
});

test("rejects stale and future verification dates", () => {
  const stale = checkProjectSource(projectFrontmatter(), {
    filePath: "stale.md",
    asOf: parseDateOnly("2026-07-14", "--as-of"),
  });
  assert.match(stale.issues.join("\n"), /91 days old/);

  const future = checkProjectSource(
    projectFrontmatter({
      published: "2026-07-01",
      lastRevised: "2026-07-15",
      lastVerified: "2026-07-15",
    }),
    {
      filePath: "future.md",
      asOf: parseDateOnly("2026-07-13", "--as-of"),
    },
  );
  assert.match(future.issues.join("\n"), /is after as-of date/);
});

test("requires real dates in published, lastRevised, and lastVerified order", () => {
  const missing = projectFrontmatter().replace("lastRevised: 2026-04-14\n", "");
  const missingResult = checkProjectSource(missing, {
    filePath: "missing.md",
    asOf: parseDateOnly("2026-07-13", "--as-of"),
  });
  assert.match(
    missingResult.issues.join("\n"),
    /missing required.*lastRevised/,
  );

  const invalidResult = checkProjectSource(
    projectFrontmatter({ lastRevised: "2026-02-30" }),
    {
      filePath: "invalid.md",
      asOf: parseDateOnly("2026-07-13", "--as-of"),
    },
  );
  assert.match(invalidResult.issues.join("\n"), /not a calendar date/);

  const chronologyResult = checkProjectSource(
    projectFrontmatter({
      published: "2026-04-15",
      lastRevised: "2026-04-14",
      lastVerified: "2026-04-13",
    }),
    {
      filePath: "chronology.md",
      asOf: parseDateOnly("2026-07-13", "--as-of"),
    },
  );
  assert.match(
    chronologyResult.issues.join("\n"),
    /published .* after lastRevised/,
  );
  assert.match(
    chronologyResult.issues.join("\n"),
    /lastRevised .* after lastVerified/,
  );
});

test("CLI --as-of deterministically controls the freshness decision", async (t) => {
  const directory = await mkdtemp(
    path.join(tmpdir(), "kotona-project-freshness-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(
    path.join(directory, "fixture.md"),
    projectFrontmatter(),
    "utf8",
  );
  await mkdir(path.join(directory, "nested"));
  await writeFile(
    path.join(directory, "nested", "fixture.mdx"),
    projectFrontmatter(),
    "utf8",
  );

  const fresh = spawnSync(
    process.execPath,
    [scriptPath, "--projects-dir", directory, "--as-of", "2026-07-13"],
    { encoding: "utf8" },
  );
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.match(fresh.stdout, /passed: 2 files as of 2026-07-13/);

  const stale = spawnSync(
    process.execPath,
    [scriptPath, "--projects-dir", directory, "--as-of", "2026-07-14"],
    { encoding: "utf8" },
  );
  assert.equal(stale.status, 1, stale.stderr);
  assert.match(stale.stderr, /91 days old/);
});
