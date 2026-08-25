import assert from "node:assert/strict";
import test from "node:test";

import { buildSearchTerms } from "../src/lib/search-terms.ts";

const entry = (id, body, data = {}) => ({
  collection: "notes",
  id,
  body,
  data: { title: `Note ${id}`, ...data },
});

test("keeps a body term no metadata field carries", () => {
  const terms = buildSearchTerms([
    entry("one", "The TOGAF standard is a reference architecture."),
    entry("two", "Something else entirely."),
  ]);

  assert.match(terms.get("/notes/one/"), /\btogaf\b/);
  assert.doesNotMatch(terms.get("/notes/two/"), /\btogaf\b/);
});

test("drops terms the document's own metadata already ranks", () => {
  const [terms] = [
    buildSearchTerms([
      entry("one", "Capability mapping is the practice here.", {
        title: "Capability mapping",
        summary: "A practice.",
        area: "architecture",
        tags: ["mapping"],
        reference: {
          discoverFor: ["how to map"],
          establishes: ["the practice"],
        },
      }),
      entry("two", "Unrelated prose about kettles."),
    ]),
  ];

  assert.doesNotMatch(terms.get("/notes/one/"), /capability|mapping|practice/);
});

test("drops vocabulary common across the corpus", () => {
  const documents = Array.from({ length: 20 }, (_, index) =>
    entry(`n${index}`, `shared vocabulary and rare${index} wording`),
  );
  const terms = buildSearchTerms(documents);

  assert.doesNotMatch(terms.get("/notes/n0/"), /vocabulary/);
  assert.match(terms.get("/notes/n0/"), /\brare0\b/);
});

test("frontmatter is not indexed as body text", () => {
  const terms = buildSearchTerms([
    entry("one", "---\nhiddenkey: hiddenvalue\n---\nVisible prose.\n"),
    entry("two", "Other prose."),
  ]);

  assert.doesNotMatch(terms.get("/notes/one/"), /hiddenvalue/);
  assert.match(terms.get("/notes/one/"), /\bvisible\b/);
});

test("drafts get no terms and do not colour term frequency", () => {
  const terms = buildSearchTerms([
    entry("published", "Rare term appears once."),
    entry("hidden", "Rare term appears again.", { draft: true }),
  ]);

  assert.equal(terms.has("/notes/hidden/"), false);
  assert.match(terms.get("/notes/published/"), /\brare\b/);
});

test("terms are sorted so identical sources produce identical bytes", () => {
  const terms = buildSearchTerms([entry("one", "zeta alpha mikko")]);
  const list = terms.get("/notes/one/").split(" ");

  assert.deepEqual(
    list,
    [...list].sort((a, b) => a.localeCompare(b, "en")),
  );
});

test("notes and projects with the same id keep separate entries", () => {
  const terms = buildSearchTerms([
    entry("shared", "Note prose about kanteles."),
    {
      collection: "projects",
      id: "shared",
      body: "Project prose about sisu.",
      data: { title: "Project shared" },
    },
  ]);

  assert.match(terms.get("/notes/shared/"), /kanteles/);
  assert.match(terms.get("/projects/shared/"), /sisu/);
});
