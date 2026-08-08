import assert from "node:assert/strict";
import test from "node:test";

import { buildKnowledgeGraph } from "../src/lib/knowledge-map.ts";

const clusters = [
  {
    id: "systems",
    label: "Systems",
    summary: "System notes.",
    areas: ["systems"],
    strongTags: [],
    anchors: ["current-note"],
    overrides: ["project"],
    region: { x: 100, y: 100 },
  },
];

function note(id, overrides = {}) {
  return {
    id,
    collection: "notes",
    data: {
      title: id,
      area: "systems",
      lifecycle: "current",
      tags: [],
      relates: [],
      projects: [],
      supersededBy: [],
      invalidatedByProjects: [],
      ...overrides,
    },
  };
}

test("builds deterministic graph data and excludes drafts", () => {
  const entries = [
    note("current-note", { relates: [{ id: "related-note" }] }),
    note("related-note"),
    note("draft-note", { draft: true }),
  ];
  const first = buildKnowledgeGraph(entries, clusters);
  const second = buildKnowledgeGraph(entries, clusters);

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.nodes.map((node) => node.id),
    ["current-note", "related-note"],
  );
  assert.deepEqual(first.edges, [
    {
      source: "current-note",
      target: "related-note",
      type: "relates",
      directed: false,
    },
  ]);
});

test("rejects unclustered published entries", () => {
  assert.throws(
    () => buildKnowledgeGraph([note("orphan", { area: "unknown" })], clusters),
    /no knowledge cluster: orphan/,
  );
});

test("rejects references to missing or draft public nodes", () => {
  assert.throws(
    () =>
      buildKnowledgeGraph(
        [
          note("source", { relates: [{ id: "draft-target" }] }),
          note("draft-target", { draft: true }),
        ],
        clusters,
      ),
    /missing or draft node: source -> draft-target/,
  );
});

test("emits lifecycle and project edges with their declared direction", () => {
  const graph = buildKnowledgeGraph(
    [
      note("old", {
        lifecycle: "superseded",
        supersededBy: [{ id: "current-note" }],
      }),
      note("current-note", { projects: [{ id: "project" }] }),
      {
        id: "project",
        collection: "projects",
        data: { title: "Project", tags: [], draft: false },
      },
    ],
    clusters,
  );

  assert.deepEqual(
    graph.edges.map((edge) => [
      edge.source,
      edge.target,
      edge.type,
      edge.directed,
    ]),
    [
      ["current-note", "project", "project-membership", true],
      ["old", "current-note", "superseded-by", true],
    ],
  );
});
