import assert from "node:assert/strict";
import { fileURLToPath, URL } from "node:url";
import test from "node:test";

import { readContentMetadata } from "../scripts/lib/content-metadata.mjs";
import { atlasDefinition } from "../src/data/systems-atlas.ts";
import {
  buildSystemsAtlas,
  getAtlasMentions,
  getVisibleAtlas,
} from "../src/lib/systems-atlas.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const entries = ["notes", "projects"].flatMap((collection) =>
  readContentMetadata(root, collection, {
    draftByDefault: collection === "projects",
  }).map((entry) => ({
    id: entry.id,
    collection,
    data: { ...entry.data, draft: entry.draft },
  })),
);

function definitionWith(mutate) {
  const definition = globalThis.structuredClone(atlasDefinition);
  mutate(definition);
  return definition;
}

test("atlas resolves the public corpus deterministically without copying bodies", () => {
  const atlas = buildSystemsAtlas(entries);
  assert.deepEqual(atlas, buildSystemsAtlas([...entries].reverse()));
  assert.equal(atlas.version, 1);
  const vuoro = atlas.nodes.find((node) => node.id === "vuoro");
  const source = entries.find(
    (entry) => entry.collection === "projects" && entry.id === "vuoro",
  );
  assert.equal(vuoro.sources[0].title, source.data.title);
  assert.equal(vuoro.sources[0].href, "/projects/vuoro/");
  assert.equal(vuoro.sources[0].status, source.data.status);
  assert.ok(!("body" in vuoro.sources[0]));
  assert.ok(!("generatedAt" in atlas));
  assert.ok(!("lastVerified" in atlas));
});

test("an editorial revision cannot renew source verification", () => {
  const revised = globalThis.structuredClone(entries);
  const source = revised.find(
    (entry) => entry.collection === "projects" && entry.id === "vuoro",
  );
  source.data.lastRevised = new Date("2030-04-03T00:00:00Z");
  const expectedVerified = new Date(source.data.lastVerified)
    .toISOString()
    .slice(0, 10);
  const result = buildSystemsAtlas(revised)
    .nodes.find((node) => node.id === "vuoro")
    .sources.find((ref) => ref.collection === "projects");
  assert.equal(result.lastRevised, "2030-04-03");
  assert.equal(result.lastVerified, expectedVerified);
});

test("history is absent from the default projection and has no dangling edges", () => {
  const atlas = buildSystemsAtlas(entries);
  const current = getVisibleAtlas(atlas);
  assert.ok(!current.nodes.some((node) => node.lifecycle === "retired"));
  assert.ok(!current.nodes.some((node) => node.id === "outctl"));
  assert.ok(!current.edges.some((edge) => edge.id === "cockpit-history"));
  const ids = new Set(current.nodes.map((node) => node.id));
  assert.ok(
    current.edges.every((edge) => ids.has(edge.from) && ids.has(edge.to)),
  );
  const history = getVisibleAtlas(atlas, true);
  assert.ok(history.nodes.some((node) => node.id === "outctl"));
  assert.ok(history.edges.some((edge) => edge.id === "cockpit-history"));
});

test("historical edges between current nodes require history independently", () => {
  const definition = definitionWith((d) => {
    const edge = d.edges.find(
      (candidate) => candidate.id === "vuoro-sprintctl",
    );
    edge.kind = "historical";
    edge.state = "historical";
  });
  assert.throws(
    () => buildSystemsAtlas(entries, definition),
    /Route must opt into history: accepted-work/,
  );
  definition.routes.find(
    (route) => route.id === "accepted-work",
  ).includeHistory = true;
  const atlas = buildSystemsAtlas(entries, definition);
  const current = getVisibleAtlas(atlas);
  assert.ok(current.nodes.some((node) => node.id === "vuoro"));
  assert.ok(current.nodes.some((node) => node.id === "sprintctl"));
  assert.ok(!current.edges.some((edge) => edge.id === "vuoro-sprintctl"));
  assert.ok(
    getVisibleAtlas(atlas, true).edges.some(
      (edge) => edge.id === "vuoro-sprintctl",
    ),
  );

  // Consumers applying the visibility rule must honor either historical flag,
  // even before an inconsistent external graph reaches schema validation.
  for (const field of ["kind", "state"]) {
    const inconsistent = buildSystemsAtlas(entries);
    inconsistent.edges.find((edge) => edge.id === "vuoro-sprintctl")[field] =
      "historical";
    assert.ok(
      !getVisibleAtlas(inconsistent).edges.some(
        (edge) => edge.id === "vuoro-sprintctl",
      ),
    );
  }
});

test("backlinks include the note that explains an interface", () => {
  const atlas = buildSystemsAtlas(entries);
  const mentions = getAtlasMentions(
    atlas,
    "notes",
    "the-work-between-the-ticket-and-the-agent",
  );
  assert.deepEqual(mentions.nodes, []);
  assert.deepEqual(
    mentions.edges.map((edge) => edge.id),
    ["vuoro-sprintctl"],
  );
  const wrongCollection = getAtlasMentions(
    atlas,
    "projects",
    "the-work-between-the-ticket-and-the-agent",
  );
  assert.deepEqual(wrongCollection, { nodes: [], edges: [] });
});

test("missing and draft source records stop the public projection", () => {
  const withoutVuoro = entries.filter(
    (entry) => !(entry.collection === "projects" && entry.id === "vuoro"),
  );
  assert.throws(
    () => buildSystemsAtlas(withoutVuoro),
    /Missing or draft source/,
  );
  const withDraft = globalThis.structuredClone(entries);
  withDraft.find(
    (entry) => entry.collection === "projects" && entry.id === "vuoro",
  ).data.draft = true;
  assert.throws(() => buildSystemsAtlas(withDraft), /Missing or draft source/);
});

test("graph declarations reject duplicate identities and missing endpoints", () => {
  for (const [mutate, expected] of [
    [(d) => d.nodes.push(d.nodes[0]), /Duplicate node id/],
    [(d) => d.edges.push(d.edges[0]), /Duplicate edge id/],
    [(d) => d.regions.push(d.regions[0]), /Duplicate region id/],
    [(d) => d.routes.push(d.routes[0]), /Duplicate route id/],
    [
      (d) => {
        d.nodes[0].region = "missing";
      },
      /Unknown region/,
    ],
    [
      (d) => {
        d.edges[0].to = "missing";
      },
      /Unknown edge endpoint/,
    ],
    [
      (d) => {
        d.edges[0].to = d.edges[0].from;
      },
      /Self edge/,
    ],
  ]) {
    assert.throws(
      () => buildSystemsAtlas(entries, definitionWith(mutate)),
      expected,
    );
  }
});

test("source claims and proposed placements cannot silently exchange meanings", () => {
  for (const [mutate, expected] of [
    [
      (d) => {
        d.nodes.find((n) => n.id === "vuoro").sources = [];
      },
      /Source-backed node needs a source/,
    ],
    [
      (d) => {
        d.edges.find((e) => e.id === "vuoro-sprintctl").sources = [];
      },
      /Documented edge needs a source/,
    ],
    [
      (d) => {
        d.nodes.find((n) => n.id === "local-inference").maturity =
          "implemented";
      },
      /Proposed node cannot imply implementation/,
    ],
    [
      (d) => {
        d.edges.find((e) => e.id === "isolated-placement").state = "documented";
      },
      /Documented edge reaches a proposed node/,
    ],
    [
      (d) => {
        d.nodes.find((n) => n.id === "outctl").lifecycle = "active";
      },
      /Retired node needs historical scope/,
    ],
    [
      (d) => {
        d.edges.find((e) => e.id === "cockpit-history").kind = "technical";
      },
      /Retired endpoint needs historical relationship/,
    ],
  ]) {
    assert.throws(
      () => buildSystemsAtlas(entries, definitionWith(mutate)),
      expected,
    );
  }
});

test("routes include their endpoints and explicitly opt into history", () => {
  for (const [mutate, expected] of [
    [
      (d) => {
        d.routes[0].nodeIds.push("missing");
      },
      /Unknown route node/,
    ],
    [
      (d) => {
        d.routes[0].edgeIds.push("missing");
      },
      /Unknown route edge/,
    ],
    [
      (d) => {
        d.routes[0].nodeIds = d.routes[0].nodeIds.filter(
          (id) => id !== "sovite",
        );
      },
      /Route omits edge endpoint/,
    ],
    [
      (d) => {
        d.routes[0].steps[0].nodeId = "outctl";
      },
      /Step is outside its route/,
    ],
    [
      (d) => {
        d.routes.find(
          (route) => route.id === "surviving-ideas",
        ).includeHistory = false;
      },
      /Route must opt into history/,
    ],
  ]) {
    assert.throws(
      () => buildSystemsAtlas(entries, definitionWith(mutate)),
      expected,
    );
  }
});

test("interfaces retain the meaningful permission and result boundaries", () => {
  const atlas = buildSystemsAtlas(entries);
  const device = atlas.edges.find(
    (edge) => edge.id === "household-device-actions",
  );
  assert.match(device.interface.authority, /Approval/);
  const work = atlas.edges.find((edge) => edge.id === "vuoro-sprintctl");
  assert.match(work.interface.authority, /Sprintctl/);
  assert.throws(
    () =>
      buildSystemsAtlas(
        entries,
        definitionWith((d) => {
          delete d.edges.find((edge) => edge.id === "vuoro-sprintctl").interface
            .authority;
        }),
      ),
    /Empty interface authority/,
  );
});

test("public links reject executable or credential-bearing destinations", () => {
  for (const href of [
    "javascript:alert(1)",
    "//example.com/",
    "https://user:pass@example.com/",
  ]) {
    assert.throws(
      () =>
        buildSystemsAtlas(
          entries,
          definitionWith((d) => {
            d.nodes[0].links.push({ label: "Unsafe", href });
          }),
        ),
      /Unsafe atlas link/,
    );
  }
});

test("influence is not promoted to a runtime integration", () => {
  const atlas = buildSystemsAtlas(entries);
  assert.equal(
    atlas.edges.find((edge) => edge.id === "household-box").kind,
    "conceptual",
  );
  assert.equal(
    atlas.edges.find((edge) => edge.id === "game-evaluation").state,
    "proposed",
  );
  assert.ok(
    !atlas.edges.some(
      (edge) =>
        edge.kind === "technical" &&
        [edge.from, edge.to].includes("acceptance-lab") &&
        [edge.from, edge.to].includes("vuoro"),
    ),
  );
});
