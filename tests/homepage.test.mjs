import assert from "node:assert/strict";
import test from "node:test";

import { getRecentChanges } from "../src/lib/homepage.ts";

function note(id, overrides = {}) {
  return {
    id,
    collection: "notes",
    data: {
      title: id,
      published: new Date("2026-11-05"),
      lastRevised: new Date("2026-11-05"),
      lifecycle: "current",
      draft: false,
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
      published: new Date("2026-04-09"),
      lastRevised: new Date("2026-10-12"),
      lastVerified: new Date("2026-10-17"),
      draft: false,
      ...overrides,
    },
  };
}

test("a substantive revision can lead ahead of a newer original publication", () => {
  const olderRevised = note("older-revised", {
    published: new Date("2026-07-19"),
    lastRevised: new Date("2026-11-13"),
  });
  const newerPublished = note("newer-published", {
    published: new Date("2026-11-12"),
    lastRevised: new Date("2026-11-12"),
  });

  const changes = getRecentChanges([newerPublished, olderRevised], []);

  assert.deepEqual(
    changes.map(({ href, date, dateLabel }) => [href, date, dateLabel]),
    [
      ["/notes/older-revised/", new Date("2026-11-13"), "Revised"],
      ["/notes/newer-published/", new Date("2026-11-12"), "Published"],
    ],
  );
});

test("a project enters on its verification date without changing its evidence scope", () => {
  const verified = project("verified-project", {
    lastVerified: new Date("2026-11-14"),
    status: "Source reviewed; current runtime unverified",
    featured: false,
  });
  const changes = getRecentChanges([note("recent-note")], [verified]);

  assert.equal(changes[0].kind, "project");
  assert.equal(changes[0].href, "/projects/verified-project/");
  assert.equal(changes[0].dateLabel, "Verified");
  assert.deepEqual(changes[0].date, new Date("2026-11-14"));
  assert.equal(changes[0].entry, verified);
  assert.equal(
    changes[0].entry.data.status,
    "Source reviewed; current runtime unverified",
  );
});

test("drafts and every non-current note lifecycle stay out of the public projection", () => {
  const changes = getRecentChanges(
    [
      note("draft-note", { draft: true }),
      note("superseded", { lifecycle: "superseded" }),
      note("archived", { lifecycle: "archived" }),
      note("disproven", { lifecycle: "disproven" }),
      note("current"),
    ],
    [project("draft-project", { draft: true }), project("published-project")],
  );

  assert.deepEqual(
    changes.map(({ href }) => href),
    ["/notes/current/", "/projects/published-project/"],
  );
});

test("timestamped batches follow change instants before alphabetical order", () => {
  const early = note("alpha", {
    published: new Date("2026-11-13T18:00:00+02:00"),
    lastRevised: new Date("2026-11-13T18:00:00+02:00"),
  });
  const later = note("zulu", {
    published: new Date("2026-11-13T16:30:00Z"),
    lastRevised: new Date("2026-11-13T16:30:00Z"),
  });
  const latestRevision = note("older-revised", {
    lastRevised: new Date("2026-11-13T19:00:00+02:00"),
  });

  assert.deepEqual(
    getRecentChanges([early, latestRevision, later], []).map(
      ({ href, dateLabel }) => [href, dateLabel],
    ),
    [
      ["/notes/older-revised/", "Revised"],
      ["/notes/zulu/", "Published"],
      ["/notes/alpha/", "Published"],
    ],
  );
});

test("equal change instants prefer newer publications, then stable title and identity ties", () => {
  const changed = new Date("2026-11-13");
  const notes = [
    note("old-revision", {
      title: "A revision",
      published: new Date("2026-07-19"),
      lastRevised: changed,
    }),
    note("zulu", {
      title: "Same title",
      published: changed,
      lastRevised: changed,
    }),
    note("alpha", {
      title: "Same title",
      published: changed,
      lastRevised: changed,
    }),
    note("new-note", {
      title: "A new note",
      published: changed,
      lastRevised: changed,
    }),
  ];
  const projects = [
    project("alpha", {
      title: "Same title",
      published: changed,
      lastRevised: changed,
      lastVerified: changed,
    }),
  ];
  const expected = [
    "/notes/new-note/",
    "/notes/alpha/",
    "/notes/zulu/",
    "/projects/alpha/",
    "/notes/old-revision/",
  ];

  assert.deepEqual(
    getRecentChanges(notes, projects, 5).map(({ href }) => href),
    expected,
  );
  assert.deepEqual(
    getRecentChanges([...notes].reverse(), projects, 5).map(({ href }) => href),
    expected,
  );
});

test("selection does not mutate or decorate collection entries", () => {
  const notes = Object.freeze([note("z"), note("a")]);
  const projects = Object.freeze([project("p")]);
  const before = JSON.stringify({ notes, projects });

  getRecentChanges(notes, projects);

  assert.equal(JSON.stringify({ notes, projects }), before);
  assert.equal(notes[0].id, "z");
  assert.equal("href" in notes[0], false);
});

test("the bounded result handles small collections and requires an explicit valid limit", () => {
  const notes = [note("a"), note("b"), note("c"), note("d"), note("e")];

  assert.equal(getRecentChanges(notes, []).length, 4);
  assert.deepEqual(getRecentChanges(notes, [], 0), []);
  assert.equal(getRecentChanges([notes[0]], []).length, 1);
  assert.deepEqual(getRecentChanges([], []), []);
  for (const limit of [-1, 1.5, Infinity, NaN]) {
    assert.throws(() => getRecentChanges(notes, [], limit), RangeError);
  }
});
