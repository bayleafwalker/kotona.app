import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

import { parse as parseYaml } from "yaml";

import { noteLifecycleIssues } from "../src/lib/note-lifecycle.js";

function note(overrides = {}) {
  return {
    lifecycle: "current",
    lifecycleChanged: undefined,
    lifecycleReason: undefined,
    supersededBy: [],
    invalidatedByProjects: [],
    published: new Date("2026-07-01"),
    lastRevised: new Date("2026-07-19"),
    ...overrides,
  };
}

test("accepts a current note without invalidation metadata", () => {
  assert.deepEqual(noteLifecycleIssues(note()), []);
});

test("requires a dated reason when a note stops being current", () => {
  const issues = noteLifecycleIssues(note({ lifecycle: "archived" }));
  assert.deepEqual(
    issues.map((issue) => issue.path),
    ["lifecycleChanged", "lifecycleReason"],
  );
});

test("requires a successor for superseded notes", () => {
  const issues = noteLifecycleIssues(
    note({
      lifecycle: "superseded",
      lifecycleChanged: new Date("2026-07-19"),
      lifecycleReason: "A newer note owns the claim.",
    }),
  );
  assert.match(issues.map((issue) => issue.message).join("\n"), /successor/);
});

test("rejects invalidation metadata on current notes", () => {
  const issues = noteLifecycleIssues(
    note({ lifecycleReason: "This should not be present." }),
  );
  assert.match(issues.map((issue) => issue.message).join("\n"), /current/);
});

test("enforces publication, revision, and lifecycle chronology", () => {
  const issues = noteLifecycleIssues(
    note({
      lifecycle: "archived",
      published: new Date("2026-07-20"),
      lastRevised: new Date("2026-07-19"),
      lifecycleChanged: new Date("2026-07-21"),
      lifecycleReason: "Historical only.",
    }),
  );
  assert.deepEqual(
    issues.map((issue) => issue.path),
    ["lastRevised", "lifecycleChanged"],
  );
});

test("every lifecycle state the schema allows is exercised by a published note", async () => {
  const config = await readFile(
    fileURLToPath(new URL("../src/content.config.ts", import.meta.url)),
    "utf8",
  );
  const declared = config
    .match(/lifecycle: z\.enum\(\[([^\]]+)\]\)/)[1]
    .match(/"([^"]+)"/g)
    .map((value) => value.slice(1, -1));

  const notesDir = fileURLToPath(
    new URL("../src/content/notes/", import.meta.url),
  );
  const published = [];
  for (const file of await readdir(notesDir)) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
    const source = await readFile(notesDir + file, "utf8");
    const frontmatter = parseYaml(source.slice(4, source.indexOf("\n---", 3)));
    if (frontmatter.draft) continue;
    published.push([file, frontmatter]);
  }

  const seen = new Set(published.map(([, data]) => data.lifecycle));
  assert.deepEqual(
    declared.filter((state) => !seen.has(state)),
    [],
    "a lifecycle state with no published note cannot be checked by the renderers",
  );

  // The note page renders the lifecycle notice for anything that is not
  // current, so each such note must carry what that notice prints.
  for (const [file, data] of published) {
    if (data.lifecycle === "current") continue;
    const issues = noteLifecycleIssues({
      lifecycle: data.lifecycle,
      lifecycleChanged:
        data.lifecycleChanged && new Date(data.lifecycleChanged),
      lifecycleReason: data.lifecycleReason,
      supersededBy: data.supersededBy ?? [],
      invalidatedByProjects: data.invalidatedByProjects ?? [],
      published: new Date(data.published),
      lastRevised: new Date(data.lastRevised),
    });
    assert.deepEqual(issues, [], `${file} violates a lifecycle invariant`);
  }
});
