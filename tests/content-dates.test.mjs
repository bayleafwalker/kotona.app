import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { URL } from "node:url";

import { parseFrontmatter } from "astro/markdown";
import { z } from "astro/zod";

import { readContentMetadata } from "../scripts/lib/content-metadata.mjs";

test("metadata and Astro's YAML parser preserve explicit-offset instants", () => {
  const root = mkdtempSync(path.join(tmpdir(), "kotona-timestamp-metadata-"));
  const directory = path.join(root, "src/content/notes");
  const cases = [
    ["winter.md", "2026-11-13T00:30:00+02:00", false],
    ["summer.mdx", "2026-07-13T00:30:00+03:00", false],
    ["quoted.md", "2026-11-13T18:00:00+02:00", true],
  ];
  const sources = new Map();
  const dates = z.object({
    published: z.coerce.date(),
    lastRevised: z.coerce.date(),
  });

  try {
    mkdirSync(directory, { recursive: true });
    for (const [file, timestamp, quoted] of cases) {
      const scalar = quoted ? JSON.stringify(timestamp) : timestamp;
      const source = [
        "---",
        `published: ${scalar}`,
        `lastRevised: ${scalar}`,
        "draft: false",
        "---",
        "Synthetic parser fixture.",
      ].join("\n");
      sources.set(file, { source, timestamp });
      writeFileSync(path.join(directory, file), source);
    }

    const entries = readContentMetadata(root, "notes", {
      draftByDefault: false,
    });
    assert.equal(entries.length, cases.length);
    for (const { data, filePath } of entries) {
      const { source, timestamp } = sources.get(path.basename(filePath));
      // The script parser retains the lexical offset. Astro may normalize the
      // scalar to Date; neither parser may change the represented instant.
      assert.equal(data.published, timestamp);
      assert.equal(data.lastRevised, timestamp);
      const astro = dates.parse(parseFrontmatter(source).frontmatter);
      const metadata = dates.parse(data);
      for (const field of ["published", "lastRevised"]) {
        assert.equal(astro[field].getTime(), Date.parse(timestamp));
        assert.equal(metadata[field].getTime(), astro[field].getTime());
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("calendar labels use Helsinki in UTC and non-UTC build environments", () => {
  const moduleUrl = new URL("../src/lib/content-dates.js", import.meta.url);
  const instants = [
    "2026-11-13T00:30:00+02:00",
    "2026-07-13T00:30:00+03:00",
    "2026-11-13",
    "2026-11-13T23:30:00-05:00",
  ];
  const expected = [
    ["Nov 13, 2026", "2026-11-13"],
    ["Jul 13, 2026", "2026-07-13"],
    ["Nov 13, 2026", "2026-11-13"],
    ["Nov 14, 2026", "2026-11-14"],
  ];
  const script = `
    import { formatDate, siteDate } from ${JSON.stringify(moduleUrl.href)};
    process.stdout.write(JSON.stringify(${JSON.stringify(instants)}.map(value => {
      const date = new Date(value);
      return [formatDate(date), siteDate(date)];
    })));
  `;

  for (const timeZone of ["UTC", "America/Los_Angeles", "Asia/Tokyo"]) {
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "--eval", script],
      { encoding: "utf8", env: { ...process.env, TZ: timeZone } },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), expected, timeZone);
  }
});
