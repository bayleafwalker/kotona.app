import assert from "node:assert/strict";
import test from "node:test";

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
