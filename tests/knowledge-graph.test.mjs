import assert from "node:assert/strict";
import test from "node:test";

import { rankEntryPoints } from "../src/lib/knowledge-graph.js";

function entry(id, overrides = {}) {
  return {
    id,
    data: {
      title: id,
      status: "exploration",
      lifecycle: "current",
      relates: [],
      ...overrides,
    },
  };
}

test("excludes non-current notes entirely", () => {
  const ranked = rankEntryPoints([
    entry("archived-note", { lifecycle: "archived" }),
    entry("current-note"),
  ]);
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["current-note"],
  );
});

test("ranks guiding status above link weight", () => {
  const ranked = rankEntryPoints([
    entry("well-linked", {
      relates: [{ id: "a" }, { id: "b" }, { id: "c" }],
    }),
    entry("guiding-but-sparse", { status: "guiding" }),
    entry("a"),
    entry("b"),
    entry("c"),
  ]);
  assert.equal(ranked[0].id, "guiding-but-sparse");
});

test("breaks ties within a status by combined in- and out-reference weight", () => {
  const ranked = rankEntryPoints([
    entry("hub", { relates: [{ id: "leaf-a" }, { id: "leaf-b" }] }),
    entry("leaf-a"),
    entry("leaf-b"),
    entry("isolated"),
  ]);
  assert.equal(ranked[0].id, "hub");
});

test("counts a reference pointing at a note toward that note's weight", () => {
  const ranked = rankEntryPoints([
    entry("pointed-to"),
    entry("pointed-to-by-two", {}),
    entry("referrer-a", { relates: [{ id: "pointed-to-by-two" }] }),
    entry("referrer-b", { relates: [{ id: "pointed-to-by-two" }] }),
  ]);
  const weightOf = (id) => ranked.find((item) => item.id === id);
  assert.ok(
    ranked.indexOf(weightOf("pointed-to-by-two")) <
      ranked.indexOf(weightOf("pointed-to")),
    "a note referenced by two others should outrank one referenced by none",
  );
});

test("falls back to title order when status and weight tie", () => {
  const ranked = rankEntryPoints([entry("zebra"), entry("apple")]);
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["apple", "zebra"],
  );
});
