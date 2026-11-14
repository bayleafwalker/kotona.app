import assert from "node:assert/strict";
import test from "node:test";

import { noteContextLabel } from "../src/lib/content-labels.js";

test("an exploration note does not repeat its matching claim posture", () => {
  const note = {
    role: "exploration",
    status: "exploration",
    area: "energy-systems",
    lifecycle: "current",
  };

  assert.equal(noteContextLabel(note), "Exploration note · Energy systems");
  assert.equal(
    noteContextLabel(note, { includeLifecycle: true }),
    "Exploration note · Current · Energy systems",
  );
});

test("a distinct claim posture remains visible with optional context", () => {
  const note = {
    role: "synthesis",
    status: "exploration",
    lifecycle: "superseded",
  };

  assert.equal(noteContextLabel(note), "Synthesis note · Exploratory claim");
  assert.equal(
    noteContextLabel(note, { includeLifecycle: true }),
    "Synthesis note · Exploratory claim · Superseded",
  );
});
