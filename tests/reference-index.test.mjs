import assert from "node:assert/strict";
import test from "node:test";
import { URL } from "node:url";

import {
  buildReferenceIndex,
  projectReferenceDocument,
} from "../src/lib/reference-index.ts";

const baseUrl = new URL("https://kotona.app/");

function note(id, overrides = {}) {
  return {
    id,
    collection: "notes",
    data: {
      title: id,
      summary: "Summary.",
      role: "operating",
      status: "guiding",
      lifecycle: "current",
      area: "agent workflow",
      tags: ["workflow", "agents"],
      published: new Date("2026-01-02T00:00:00Z"),
      lastRevised: new Date("2026-02-03T00:00:00Z"),
      ...overrides,
    },
  };
}

function project(id, overrides = {}) {
  return {
    id,
    collection: "projects",
    data: {
      title: id,
      published: new Date("2026-01-02T00:00:00Z"),
      lastRevised: new Date("2026-02-03T00:00:00Z"),
      lastVerified: new Date("2026-03-04T00:00:00Z"),
      ...overrides,
    },
  };
}

test("orders projects before notes and then by id", () => {
  const index = buildReferenceIndex(
    [note("beta"), project("zulu"), note("alpha"), project("alpha")],
    { baseUrl, revision: "abc" },
  );

  assert.deepEqual(
    index.documents.map((document) => `${document.type}:${document.id}`),
    ["project:alpha", "project:zulu", "note:alpha", "note:beta"],
  );
});

test("omits drafts", () => {
  const index = buildReferenceIndex(
    [note("kept"), note("hidden", { draft: true })],
    {
      baseUrl,
      revision: "abc",
    },
  );

  assert.deepEqual(
    index.documents.map((document) => document.id),
    ["kept"],
  );
  assert.equal(
    projectReferenceDocument(note("x", { draft: true }), baseUrl),
    undefined,
  );
});

test("publishes prompt availability without prompt text", () => {
  const prompt = "Explore this note with AI. ".repeat(4);
  const document = projectReferenceDocument(
    note("prompted", { explorePrompt: prompt }),
    baseUrl,
  );

  assert.deepEqual(document.prompt, { available: true });
  assert.ok(!JSON.stringify(document).includes("Explore this note"));
});

test("publishes only allowlisted fields", () => {
  const document = projectReferenceDocument(
    note("leaky", {
      draft: false,
      hero: { src: "/images/x.png", alt: "x", width: 1, height: 1 },
      terms: [{ term: "Vuoro", definition: "A label." }],
      supersededBy: [{ id: "successor" }],
    }),
    baseUrl,
  );

  assert.deepEqual(Object.keys(document), [
    "id",
    "type",
    "title",
    "summary",
    "url",
    "representations",
    "classification",
    "dates",
  ]);
  assert.deepEqual(document.classification, {
    area: "agent workflow",
    role: "operating",
    claimPosture: "guiding",
    lifecycle: "current",
    tags: ["agents", "workflow"],
  });
});

test("says how to exercise the negotiated markdown representation", () => {
  const document = projectReferenceDocument(note("shape"), baseUrl);

  assert.deepEqual(document.representations, [
    {
      mediaType: "text/html",
      url: "https://kotona.app/notes/shape/",
      access: "direct",
    },
    {
      mediaType: "text/markdown",
      url: "https://kotona.app/notes/shape/",
      access: "content-negotiation",
      accept: "text/markdown",
    },
  ]);
});

test("names a project's working state apart from a note's claim posture", () => {
  const noteDocument = projectReferenceDocument(note("n"), baseUrl);
  const projectDocument = projectReferenceDocument(
    project("p", { status: "Active operations repo" }),
    baseUrl,
  );

  assert.equal(noteDocument.classification.claimPosture, "guiding");
  assert.equal(noteDocument.classification.projectState, undefined);
  assert.equal(
    projectDocument.classification.projectState,
    "Active operations repo",
  );
  assert.equal(projectDocument.classification.claimPosture, undefined);
  assert.equal(projectDocument.classification.role, undefined);
});

test("bounds project evidence with lastVerified and dates as plain days", () => {
  const document = projectReferenceDocument(project("vuoro"), baseUrl);

  assert.deepEqual(document.dates, {
    published: "2026-01-02",
    lastRevised: "2026-02-03",
    lastVerified: "2026-03-04",
  });
  assert.equal(
    projectReferenceDocument(note("n"), baseUrl).dates.lastVerified,
    undefined,
  );
});

test("copies reference scope and drops an empty supplementWith", () => {
  const scope = {
    purpose: "design-rationale",
    discoverFor: ["handing work between sessions"],
    establishes: ["why references must sit on the walked path"],
    doesNotEstablish: ["current repository state"],
    supplementWith: [],
  };
  const document = projectReferenceDocument(
    note("scoped", { reference: scope }),
    baseUrl,
  );

  assert.deepEqual(document.reference, {
    purpose: "design-rationale",
    discoverFor: ["handing work between sessions"],
    establishes: ["why references must sit on the walked path"],
    doesNotEstablish: ["current repository state"],
  });
  document.reference.discoverFor.push("mutated");
  assert.deepEqual(scope.discoverFor, ["handing work between sessions"]);
});

test("is stable across builds for identical sources", () => {
  const entries = [note("a"), project("b", { reference: undefined })];
  const first = buildReferenceIndex(entries, { baseUrl, revision: "abc" });
  const second = buildReferenceIndex(entries, { baseUrl, revision: "abc" });

  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.ok(!JSON.stringify(first).includes("generated"));
});
