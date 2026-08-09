import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

import { buildKnowledgeGraph } from "../src/lib/knowledge-map.ts";

const knowledgeMapSource = readFileSync(
  new URL("../src/components/KnowledgeMap.astro", import.meta.url),
  "utf8",
);
const knowledgeMapStyles = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

function cssBlockAt(source, ruleIndex) {
  const start = source.indexOf("{", ruleIndex);
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start + 1, index);
  }
  assert.fail(`unclosed CSS rule starting at ${ruleIndex}`);
}

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

test("rejects a draft project used as a published note invalidator", () => {
  assert.throws(
    () =>
      buildKnowledgeGraph(
        [
          note("invalidated-note", {
            invalidatedByProjects: [{ id: "draft-project" }],
          }),
          {
            id: "draft-project",
            collection: "projects",
            data: { title: "Draft project", tags: [], draft: true },
          },
        ],
        clusters,
      ),
    /missing or draft node: draft-project -> invalidated-note/,
  );
});

test("rejects configured clusters without published nodes", () => {
  assert.throws(
    () =>
      buildKnowledgeGraph(
        [note("current-note")],
        [
          ...clusters,
          {
            id: "empty",
            label: "Empty",
            summary: "This cluster has no published entries.",
            areas: ["empty"],
            strongTags: [],
            anchors: [],
            overrides: [],
            region: { x: 200, y: 200 },
          },
        ],
      ),
    /cluster contains no published nodes: empty/,
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

test("keeps resting labels deliberately sparse and never expands neighbours into labels", () => {
  assert.doesNotMatch(
    knowledgeMapSource,
    /"is-persistent":\s*node\.anchor\s*\|\|\s*node\.type\s*===\s*"project"/,
    "every anchor and project must not receive a persistent full-title label",
  );
  assert.doesNotMatch(
    knowledgeMapStyles,
    /\.knowledge-node\.is-active\s+\.knowledge-node-label/,
    "neighbour emphasis must not reveal neighbour labels",
  );
  assert.match(
    knowledgeMapStyles,
    /\.knowledge-node-label\s*\{[\s\S]*?display:\s*none/,
    "node titles should be opt-in rather than permanently rendered",
  );
  assert.match(
    knowledgeMapSource,
    /projectMapLabels[\s\S]*?vuoro:\s*"Vuoro"[\s\S]*?"contract-first-box":\s*"Box"[\s\S]*?"gitops-cluster":\s*"Appservice"/,
    "the small set of resting project labels should use compact map names",
  );
  assert.match(
    knowledgeMapStyles,
    /\.knowledge-explorer\.is-identifying[\s\S]*?\.knowledge-node:not\(\.is-label-visible\)[\s\S]*?\.knowledge-node-label\.is-persistent/,
    "identification should hide other project labels without hiding the hovered project itself",
  );
});

test("renders arrows only for historical succession and invalidation", () => {
  assert.doesNotMatch(
    knowledgeMapSource,
    /marker-end=\{edge\.directed\s*\?\s*"url\(#knowledge-arrow\)"/,
    "structural direction alone must not put an arrow on project membership",
  );
  assert.match(
    knowledgeMapSource,
    /edge\.type\s*===\s*"superseded-by"[\s\S]{0,220}edge\.type\s*===\s*"invalidated-by-project"/,
    "the arrow condition must explicitly be limited to the two historical edge types",
  );
});

test("supplies a dimming hook for non-incident edges during node inspection", () => {
  assert.match(
    knowledgeMapSource,
    /edge\.classList\.toggle\(\s*"is-unrelated",\s*!related\s*\)/,
    "inspection should mark every non-incident edge unrelated",
  );
  assert.match(
    knowledgeMapStyles,
    /\.knowledge-edge\.is-unrelated\s*\{[\s\S]*?opacity:\s*0\.(?:0\d|1[0-5])\b/,
    "unrelated edges should be near-invisible, not merely left at resting opacity",
  );
});

test("removes the visual map before it can scale its typography below the usable width", () => {
  const narrowMapStyles = [
    ...knowledgeMapStyles.matchAll(
      /@media\s*\(max-width:\s*(?:9[5-9]\d|1000)px\)\s*\{/g,
    ),
  ].map((match) => cssBlockAt(knowledgeMapStyles, match.index));
  assert.ok(
    narrowMapStyles.some((styles) =>
      /\.knowledge-map-(?:stage|frame)\s*\{[\s\S]*?display:\s*none/.test(
        styles,
      ),
    ),
    "the map should be hidden at roughly 960px, while the grouped index remains available",
  );
});

test("places a non-modal, opaque inspector over the map stage", () => {
  assert.match(
    knowledgeMapSource,
    /class="knowledge-map-stage"[\s\S]*?class="knowledge-map-frame"[\s\S]*?<aside[\s\S]*?data-knowledge-detail/,
    "the inspector must be inside the positioned stage rather than below the map",
  );
  assert.match(
    knowledgeMapSource,
    /<aside[\s\S]*?id="knowledge-detail"[\s\S]*?role="region"[\s\S]*?aria-labelledby="knowledge-detail-title"/,
  );
  assert.match(
    knowledgeMapSource,
    /<h2(?=[^>]*\bid="knowledge-detail-title")(?=[^>]*\bdata-detail-title)[^>]*>/,
  );
  assert.match(
    knowledgeMapStyles,
    /\.knowledge-map-stage\s*\{[\s\S]*?position:\s*relative/,
  );
  assert.match(
    knowledgeMapStyles,
    /\.knowledge-detail\s*\{[\s\S]*?position:\s*absolute[\s\S]*?z-index:\s*\d+/,
    "the inspector needs to overlay the still-interactive graph",
  );
  assert.match(
    knowledgeMapStyles,
    /\.knowledge-detail\s*\{[\s\S]*?background:\s*var\(--bg-strong\)/,
    "the overlay background must be opaque enough to keep graph lines out of its text",
  );
});

test("provides every intuitive inspector closing path", () => {
  assert.match(
    knowledgeMapSource,
    /selectedNodeId\s*===\s*id[\s\S]{0,300}(?:hideDetail|closeDetail)/,
    "activating an already-selected node should close its inspector",
  );
  assert.match(
    knowledgeMapSource,
    /map\.addEventListener\("click",[\s\S]{0,500}(?:event\.target\s*===\s*map|target\.closest\("\.knowledge-node, \.knowledge-cluster-control"\))[^]*?closeDetail\(\)/,
    "an empty SVG background click should close the inspector while node and territory events are ignored",
  );
  assert.match(
    knowledgeMapSource,
    /"Escape"[\s\S]{0,300}(?:hideDetail|closeDetail)/,
    "Escape should close the inspector",
  );
  assert.match(
    knowledgeMapSource,
    /detailClose\.addEventListener\("click",[\s\S]{0,300}(?:hideDetail|closeDetail)/,
    "the Close button should share the inspector close path",
  );
  assert.match(
    knowledgeMapSource,
    /(?:hideDetail|closeDetail)\([\s\S]{0,220}selectedClusterId\s*=\s*clusterId/,
    "activating a territory should first clear any node inspector",
  );
});

test("keeps pointer and keyboard selection focus semantics distinct and exposes selection to assistive technology", () => {
  assert.match(
    knowledgeMapSource,
    /<a(?=[^>]*\baria-expanded(?:="false"|=\{false\}))(?=[^>]*\baria-controls="knowledge-detail")[^>]*>/,
  );
  assert.match(
    knowledgeMapSource,
    /(?:node|candidate)\.setAttribute\(\s*"aria-expanded",\s*(?:"true"|String\(pinned\s*&&\s*candidateId\s*===\s*id\))\s*\)/,
    "the selected node should report its expanded inspector",
  );
  assert.match(
    knowledgeMapSource,
    /node\.setAttribute\(\s*"aria-expanded",\s*"false"\s*\)/,
    "closing must reset the selected node's expanded state",
  );
  assert.doesNotMatch(
    knowledgeMapSource,
    /detailLink\.focus\(\)/,
    "pointer selection must not scroll the old detail link into view",
  );
  assert.match(
    knowledgeMapSource,
    /event\.key\s*===\s*" "\s*\|\|\s*event\.key\s*===\s*"Enter"[\s\S]{0,180}showDetail\(node,\s*true\)/,
    "keyboard activation must request inspector focus, unlike pointer activation",
  );
  assert.match(
    knowledgeMapSource,
    /showDetail\s*=\s*\([^)]*(?:[Kk]eyboard|focus)[^)]*\)[\s\S]{0,1200}(?:detailTitle|detailClose)\.focus\(\)/,
    "keyboard selection should move focus to the inspector heading or Close control",
  );
  assert.match(
    knowledgeMapSource,
    /const\s+restore\s*=\s*restoreFocus\s*&&\s*selectionWasKeyboard[\s\S]{0,240}if\s*\(restore\)\s*origin\?\.focus\(\)/,
    "only keyboard-originated Close/Escape should return focus to the originating node",
  );
});

test("progressively expands pointer hover from a title into a transient preview", () => {
  assert.match(knowledgeMapSource, /const hoverTitleDelay = 200/);
  assert.match(knowledgeMapSource, /const hoverPreviewDelay = 2000/);
  assert.match(knowledgeMapSource, /const hoverExitGrace = 300/);
  assert.match(
    knowledgeMapSource,
    /beginNodeHover[\s\S]*?hoverTitleTimer = window\.setTimeout[\s\S]*?emphasizeNode[\s\S]*?hoverPreviewTimer = window\.setTimeout[\s\S]*?showHoverDetail/,
    "the title must appear before the full hover preview",
  );
  assert.match(
    knowledgeMapSource,
    /endNodeHover[\s\S]*?clearTimeout\(hoverPreviewTimer\)[\s\S]*?hoverCloseTimer = window\.setTimeout\(clearHoverState, hoverExitGrace\)/,
    "leaving early must cancel expansion while an open preview gets a short exit grace",
  );
  assert.match(
    knowledgeMapSource,
    /detail\.addEventListener\("mouseenter"[\s\S]*?clearTimeout\(hoverCloseTimer\)[\s\S]*?detail\.addEventListener\("mouseleave"/,
    "the expanded preview must remain available while the pointer is over it",
  );
  assert.match(
    knowledgeMapSource,
    /showDetail[\s\S]*?clearHoverState\(\)[\s\S]*?selectedNodeId = id/,
    "click selection must replace transient hover state immediately",
  );
  assert.doesNotMatch(
    knowledgeMapSource,
    /<title>\s*\{node\.title\}/,
    "nodes use the custom delayed title and must not also trigger a native SVG tooltip",
  );
});

test("keeps an expanded preview reachable while the pointer travels from its node", () => {
  const corridorUsesStoredOrLiveBounds =
    /showHoverDetail[\s\S]{0,900}?hoverCorridor\s*=\s*\{[\s\S]{0,300}?from:\s*node\.getBoundingClientRect\(\)[\s\S]{0,300}?to:\s*detail\.getBoundingClientRect\(\)/.test(
      knowledgeMapSource,
    ) ||
    /const\s+isPointerInHoverCorridor\s*=\s*\([^)]*PointerEvent[^)]*\)\s*=>\s*\{[\s\S]{0,800}?hoveredNode\.getBoundingClientRect\(\)[\s\S]{0,800}?detail\.getBoundingClientRect\(\)/.test(
      knowledgeMapSource,
    );
  assert.ok(
    corridorUsesStoredOrLiveBounds,
    "the hover transition must calculate a bridge from the hovered node to its preview",
  );
  assert.match(
    knowledgeMapSource,
    /const\s+isPointerInHoverCorridor\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]{0,1600}?Math\.hypot\([\s\S]{0,180}?<=\s*\d+/,
    "the bridge must have a forgiving width instead of relying on a zero-width line",
  );
  assert.match(
    knowledgeMapSource,
    /document\.addEventListener\("pointermove",[\s\S]{0,1400}?isPointerInHoverCorridor\([\s\S]{0,700}?clearTimeout\(hoverCloseTimer\)/,
    "travelling through that bridge must cancel the ordinary short close timer",
  );
  assert.match(
    knowledgeMapSource,
    /document\.addEventListener\("pointermove",[\s\S]{0,2200}?hoverCloseTimer\s*=\s*window\.setTimeout\(clearHoverState,\s*hoverExitGrace\)/,
    "the 300ms grace may start only after the pointer leaves the bridge",
  );
});

test("suppresses territory headings only while identifying a node without disabling territory controls", () => {
  assert.match(
    knowledgeMapSource,
    /explorer\.classList\.toggle\(\s*"is-identifying-node",\s*!pinned\s*\)/,
    "node identification needs a state separate from pinned and territory inspection",
  );
  const ruleIndex = knowledgeMapStyles.indexOf(
    ".knowledge-explorer.is-identifying-node .knowledge-cluster-label",
  );
  assert.ok(
    ruleIndex >= 0,
    "node identification should specifically suppress territory headings",
  );
  const identifyingRule = cssBlockAt(knowledgeMapStyles, ruleIndex);
  assert.match(
    identifyingRule,
    /opacity:\s*0\b/,
    "headings should be visually suppressed before a node title can overlap them",
  );
  assert.doesNotMatch(
    identifyingRule,
    /(?:display:\s*none|visibility:\s*hidden|pointer-events:\s*none)/,
    "territory controls must remain pointer-reachable while their heading is suppressed",
  );
});

test("keeps the Agent systems heading clear of the node it previously intercepted", () => {
  assert.match(
    knowledgeMapSource,
    /clusterLabelYOverrides[\s\S]{0,500}?"agents-assurance"\s*:\s*(?:\d+|\{[\s\S]{0,180}?(?:labelY|y)\s*:\s*\d+)/,
    "the Agent systems territory needs an explicit label placement adjustment",
  );
  assert.match(
    knowledgeMapSource,
    /const\s+labelY\s*=[\s\S]{0,240}?clusterLabelYOverrides\[cluster\.id\][\s\S]{0,240}?Math\.max\(20,\s*y\s*-\s*95\)/,
    "the override must be used when rendering territory labels",
  );
});
