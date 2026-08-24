import assert from "node:assert/strict";
import test from "node:test";

import {
  hasHistoricalIntent,
  rankReferences,
  tokenize,
} from "../src/lib/reference-ranking.js";

function document(id, overrides = {}) {
  return {
    id,
    type: "note",
    path: `/notes/${id}/`,
    title: id,
    lifecycle: "current",
    role: "exploration",
    ...overrides,
  };
}

const corpus = [
  document("handover", {
    title: "Authority must travel with the action",
    summary: "What replaces the deployment boundary.",
    area: "agent workflow",
    role: "synthesis",
    discoverFor: ["handing work from one agent session to another"],
  }),
  document("folders", {
    title: "Treat project folders as views",
    summary: "A folder is a generated view over existing authorities.",
    area: "agent workflow",
    role: "operating",
  }),
  document("noise", {
    title: "Something else entirely",
    summary: "Unrelated prose about gardening.",
    area: "other",
  }),
];

test("tokenizes and drops stop words", () => {
  assert.deepEqual(tokenize("How do I hand off the work?"), [
    "hand",
    "off",
    "work",
  ]);
});

test("a long query does not need a contiguous match", () => {
  const ranked = rankReferences(
    corpus,
    "I am trying to work out how to hand a task from one agent session to another one",
  );

  assert.equal(ranked[0].document.id, "handover");
});

test("a fully covered curated phrase is the strongest signal", () => {
  const ranked = rankReferences(
    corpus,
    "handing work from one agent session to another",
  );

  assert.equal(ranked[0].document.id, "handover");
  assert.deepEqual(ranked[0].reasons[0], {
    field: "discoverFor",
    value: "handing work from one agent session to another",
  });
});

test("documents that match nothing are absent, not ranked last", () => {
  const ranked = rankReferences(corpus, "gardening");

  assert.deepEqual(
    ranked.map((result) => result.document.id),
    ["noise"],
  );
});

test("an empty or stop-word-only query ranks nothing", () => {
  assert.deepEqual(rankReferences(corpus, "   "), []);
  assert.deepEqual(rankReferences(corpus, "how do I"), []);
});

test("ranking is stable and repeatable", () => {
  const first = rankReferences(corpus, "agent work authority");
  const second = rankReferences(corpus, "agent work authority");

  assert.deepEqual(
    first.map((result) => [result.document.id, result.score]),
    second.map((result) => [result.document.id, result.score]),
  );
});

test("current material leads for equal relevance, historical leads on intent", () => {
  const pair = [
    document("current-note", { title: "binding layer", lifecycle: "current" }),
    document("old-note", { title: "binding layer", lifecycle: "superseded" }),
  ];

  assert.equal(
    rankReferences(pair, "binding layer")[0].document.id,
    "current-note",
  );
  assert.equal(
    rankReferences(pair, "what did the previous binding layer do")[0].document
      .id,
    "old-note",
  );
  assert.equal(hasHistoricalIntent("what was previously true"), true);
  assert.equal(hasHistoricalIntent("what is true"), false);
});

test("a superseded document does not lead a comparably relevant successor", () => {
  // The predecessor matches in more fields, so it outscores its successor even
  // after the lifecycle penalty. Succession, not score, decides the order.
  const pair = [
    document("predecessor", {
      title: "binding layer",
      summary: "binding layer reasoning",
      area: "binding layer",
      tags: ["binding", "layer"],
      lifecycle: "superseded",
      supersededBy: ["successor"],
    }),
    document("successor", { title: "binding layer", lifecycle: "current" }),
  ];
  const ranked = rankReferences(pair, "binding layer");

  assert.deepEqual(
    ranked.map((result) => result.document.id),
    ["successor", "predecessor"],
  );
  assert.ok(
    ranked[1].reasons.some(
      (reason) =>
        reason.field === "lifecycle" && reason.value.includes("successor"),
    ),
    "the demoted predecessor must say why",
  );
});

test("a far better predecessor still leads a barely relevant successor", () => {
  const pair = [
    document("predecessor", {
      title: "Measuring output reduction",
      summary: "Evaluating a tool that reduces visible output.",
      lifecycle: "disproven",
      supersededBy: ["successor"],
      discoverFor: ["evaluating an output reduction tool"],
    }),
    document("successor", {
      title: "A platform capability",
      summary: "Unrelated platform reasoning.",
      lifecycle: "current",
    }),
  ];

  assert.equal(
    rankReferences(pair, "evaluating an output reduction tool")[0].document.id,
    "predecessor",
  );
});

test("a leading superseded document carries its successor into view", () => {
  // The predecessor is named almost verbatim, so no relevance signal will lift
  // the successor anywhere near it -- on its own tokens it ranks last. A
  // lifecycle notice pointing at a document the ranking never offers is not a
  // usable authority boundary, so succession carries it into view instead.
  const succession = [
    document("predecessor", {
      title: "Measuring output reduction",
      summary: "Evaluating a tool that reduces visible output.",
      lifecycle: "superseded",
      supersededBy: ["successor"],
      discoverFor: ["evaluating an output reduction tool"],
    }),
    document("successor", {
      title: "A platform capability",
      summary: "Platform reasoning about output.",
      lifecycle: "current",
    }),
    ...["a", "b", "c", "d", "e"].map((id) =>
      document(`filler-${id}`, {
        title: `output reduction tool notes ${id}`,
        summary: `evaluating output reduction ${id}`,
        area: `area ${id}`,
      }),
    ),
  ];

  const unaided = rankReferences(
    succession.filter((entry) => entry.id !== "predecessor"),
    "evaluating an output reduction tool",
  ).map((result) => result.document.id);
  assert.equal(
    unaided.at(-1),
    "successor",
    "the successor must be genuinely uncompetitive for this to prove anything",
  );

  const ranked = rankReferences(
    succession,
    "evaluating an output reduction tool",
  );
  const ids = ranked.map((result) => result.document.id);

  assert.equal(ids[0], "predecessor");
  assert.equal(ids[1], "successor");
  assert.ok(
    ranked[1].reasons.some(
      (reason) => reason.value === "supersedes predecessor",
    ),
    "the lifted successor should say why it is there",
  );
});

test("a successor is not lifted for a predecessor nobody asked about", () => {
  const buried = [
    ...["a", "b", "c", "d", "e"].map((id) =>
      document(`filler-${id}`, {
        title: `output reduction notes ${id}`,
        summary: `output reduction reasoning ${id}`,
        area: `area ${id}`,
      }),
    ),
    document("predecessor", {
      title: "Measuring reduction elsewhere",
      lifecycle: "superseded",
      supersededBy: ["successor"],
    }),
    document("successor", {
      title: "Platform reasoning about output",
      lifecycle: "current",
    }),
  ];

  const ids = rankReferences(buried, "output reduction notes").map(
    (result) => result.document.id,
  );

  // The predecessor never reaches the leading window, so nothing is lifted and
  // the successor keeps whatever rank its own relevance earned.
  assert.ok(ids.indexOf("predecessor") > 2);
  assert.ok(ids.indexOf("successor") !== ids.indexOf("predecessor") + 1);
});

test("one area cannot occupy the whole leading window", () => {
  const crowded = [
    ...["a", "b", "c", "d"].map((id) =>
      document(`workflow-${id}`, {
        title: `workflow authority ${id}`,
        area: "agent workflow",
      }),
    ),
    document("other-area", {
      title: "workflow authority elsewhere",
      area: "gitops",
    }),
  ];
  const leading = rankReferences(crowded, "workflow authority")
    .slice(0, 3)
    .map((result) => result.document.area);

  assert.equal(leading.filter((area) => area === "agent workflow").length, 2);
  assert.ok(leading.includes("gitops"));
});

test("diversity cannot lift a predecessor back above its successor", () => {
  // Two stronger documents fill the area quota, so the successor is the third
  // of its area in the leading window and gets displaced -- past its own
  // predecessor, which sits in a different area.
  const corpus = [
    document("crowd-one", {
      title: "binding layer",
      summary: "binding layer",
      area: "X",
      tags: ["binding", "layer"],
    }),
    document("crowd-two", {
      title: "binding layer",
      summary: "binding layer",
      area: "X",
      tags: ["binding", "layer"],
    }),
    document("successor", { title: "binding layer", area: "X" }),
    document("predecessor", {
      title: "binding layer",
      area: "Y",
      lifecycle: "superseded",
      supersededBy: ["successor"],
    }),
  ];
  const order = rankReferences(corpus, "binding layer").map(
    (result) => result.document.id,
  );

  assert.ok(
    order.indexOf("successor") < order.indexOf("predecessor"),
    `successor must precede its predecessor, got ${order.join(", ")}`,
  );
});

test("past-tense stop words still signal historical intent", () => {
  assert.equal(hasHistoricalIntent("what was the design"), true);
  assert.equal(hasHistoricalIntent("were these used"), true);
  assert.equal(hasHistoricalIntent("what is the design"), false);
});

test("a curated phrase reason is not echoed back as its own tokens", () => {
  const ranked = rankReferences(
    corpus,
    "handing work from one agent session to another",
  );
  const fields = ranked[0].reasons.map((reason) => reason.field);

  assert.equal(fields.filter((field) => field === "discoverFor").length, 1);
  assert.ok(fields.includes("title") || fields.includes("area"));
});
