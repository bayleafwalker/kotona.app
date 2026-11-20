import assert from "node:assert/strict";
import test from "node:test";
import { URL } from "node:url";

import {
  getMaterialRevision,
  getPublicationEvents,
} from "../src/lib/content-revisions.ts";
import { projectReferenceDocument } from "../src/lib/reference-index.ts";
import { referencePrelude } from "../src/lib/reference-markdown.ts";

function entry(collection, overrides = {}) {
  return {
    collection,
    id: "record",
    data: {
      title: "A recorded result",
      published: new Date("2026-11-13"),
      lastRevised: new Date("2026-11-20"),
      lastVerified: new Date("2026-11-17"),
      revisionSummary:
        "The result now separates the observed run from its constructed control.",
      ...overrides,
    },
  };
}

test("first publication and undated copy changes do not invent a material revision", () => {
  assert.equal(
    getMaterialRevision(
      entry("notes", {
        lastRevised: new Date("2026-11-13"),
      }).data,
    ),
    undefined,
  );
  assert.equal(
    getMaterialRevision(
      entry("notes", {
        revisionSummary: undefined,
      }).data,
    ),
    undefined,
  );
  assert.equal(
    getMaterialRevision(
      entry("notes", {
        lastRevised: new Date("2026-11-12"),
      }).data,
    ),
    undefined,
  );
});

test("a note keeps its publication while the log dates the material change separately", () => {
  const note = entry("notes");
  const events = getPublicationEvents([note], []);
  assert.equal(events.length, 2);
  assert.equal(events[0].date, "2026-11-13T00:00:00.000Z");
  assert.equal(events[0].summary, undefined);
  assert.equal(events[1].date, "2026-11-20T00:00:00.000Z");
  assert.equal(events[1].summary, note.data.revisionSummary);
});

test("project revision and evidence review retain their own dates and scope", () => {
  const project = entry("projects");
  const events = getPublicationEvents([], [project]);
  assert.deepEqual(
    events.map(({ date, entry: label }) => [date, label]),
    [
      ["2026-11-17T00:00:00.000Z", "Checked project: A recorded result"],
      ["2026-11-20T00:00:00.000Z", "Revised project: A recorded result"],
    ],
  );
  assert.equal(events[0].summary, undefined);
  assert.equal(events[1].summary, project.data.revisionSummary);

  const together = getPublicationEvents(
    [],
    [
      entry("projects", {
        lastVerified: new Date("2026-11-20"),
      }),
    ],
  );
  assert.equal(together.length, 1);
  assert.equal(
    together[0].entry,
    "Revised and checked project: A recorded result",
  );
});

test("the public log never emits draft publications or revisions", () => {
  assert.deepEqual(
    getPublicationEvents(
      [entry("notes", { draft: true })],
      [entry("projects", { draft: true })],
    ),
    [],
  );
});

test("portable reference metadata carries the same change without renewing evidence", () => {
  const project = entry("projects");
  const document = projectReferenceDocument(
    project,
    new URL("https://kotona.app/"),
  );
  assert.equal(document.revisionSummary, project.data.revisionSummary);
  assert.equal(document.dates.lastVerified, "2026-11-17");
  const markdown = referencePrelude(document, { revision: "a".repeat(40) });
  assert.ok(
    markdown.includes(`revisionSummary: "${project.data.revisionSummary}"`),
  );
  assert.ok(markdown.includes('lastVerified: "2026-11-17"'));
});
