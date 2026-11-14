import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  symlinkSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { bindExhibit, bindExhibits } from "../scripts/lib/exhibit-bindings.mjs";

function workspace(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), "kotona-exhibit-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ["src/data", "src/lib", "tests/browser"])
    mkdirSync(path.join(root, directory), { recursive: true });
  for (const [file, content] of Object.entries({
    "src/data/case.json": '{"expected":42}',
    "src/lib/case.js": "export const answer = 42;",
    "tests/case.test.mjs": "// Unit check entry point",
    "tests/browser/case.spec.mjs": "// Presentation check entry point",
  }))
    writeFileSync(path.join(root, file), content);
  return root;
}

function note(overrides = {}) {
  return {
    id: "checked-case",
    draft: false,
    data: {
      role: "exhibit",
      exhibit: {
        id: "checked-case",
        implementation: "src/lib/case.js",
        fixtures: "src/data/case.json",
        tests: ["tests/case.test.mjs", "tests/browser/case.spec.mjs"],
        ...overrides,
      },
    },
  };
}

test("bindings digest actual bytes and make no test-pass claim", (t) => {
  const root = workspace(t);
  const first = bindExhibit(root, note(), "revision");
  assert.equal(first.checks.length, 2);
  assert.match(first.claim, /Source bindings only/);
  assert.equal(first.sourceRevision, "revision");
  writeFileSync(
    path.join(root, "src/lib/case.js"),
    "export const answer = 41;",
  );
  const changed = bindExhibit(root, note(), "revision");
  assert.notEqual(first.implementation.sha256, changed.implementation.sha256);
  assert.equal(first.fixtures.sha256, changed.fixtures.sha256);
});

test("an exhibit cannot omit fixtures or either discovered check", (t) => {
  const root = workspace(t);
  assert.throws(
    () => bindExhibit(root, { id: "empty", data: { role: "exhibit" } }, "rev"),
    /missing/,
  );
  assert.throws(
    () => bindExhibit(root, note({ fixtures: "src/data/missing.json" }), "rev"),
    /ENOENT/,
  );
  for (const tests of [
    ["tests/case.test.mjs"],
    ["tests/browser/case.spec.mjs"],
    ["tests/nested/case.test.mjs", "tests/browser/case.spec.mjs"],
  ])
    assert.throws(
      () => bindExhibit(root, note({ tests }), "rev"),
      /discovered unit test/,
    );
  writeFileSync(path.join(root, "src/data/case.json"), "invalid JSON");
  assert.throws(() => bindExhibit(root, note(), "rev"), SyntaxError);
});

test("public bindings cannot traverse or link outside the repository", (t) => {
  const root = workspace(t);
  assert.throws(
    () =>
      bindExhibit(
        root,
        note({ implementation: "src/../../private.js" }),
        "rev",
      ),
    /invalid public source/,
  );
  symlinkSync(os.tmpdir(), path.join(root, "src/outside"));
  assert.throws(
    () => bindExhibit(root, note({ implementation: "src/outside" }), "rev"),
    /escapes/,
  );
});

test("upstream references must use an immutable commit and safe path", (t) => {
  const root = workspace(t);
  const upstream = {
    repository: "owner/machine",
    revision: "a".repeat(40),
    source: "fixtures/case.json",
  };
  const trace = {
    implementation: {
      repository: "https://github.com/owner/machine",
      revision: upstream.revision,
      clean: true,
    },
    fixture: { path: upstream.source },
    verification: { status: "passed" },
  };
  writeFileSync(path.join(root, "src/data/case.json"), JSON.stringify(trace));
  assert.deepEqual(
    bindExhibit(root, note({ upstream }), "rev").upstream,
    upstream,
  );
  assert.throws(
    () =>
      bindExhibit(
        root,
        note({ upstream: { ...upstream, revision: "main" } }),
        "rev",
      ),
    /immutable/,
  );
  assert.throws(
    () =>
      bindExhibit(
        root,
        note({ upstream: { ...upstream, source: "../secret" } }),
        "rev",
      ),
    /safe source/,
  );
  for (const changed of [
    { ...trace, implementation: { ...trace.implementation, clean: false } },
    {
      ...trace,
      implementation: { ...trace.implementation, revision: "b".repeat(40) },
    },
    { ...trace, fixture: { path: "other-fixtures.json" } },
    { ...trace, verification: { status: "draft" } },
  ]) {
    writeFileSync(
      path.join(root, "src/data/case.json"),
      JSON.stringify(changed),
    );
    assert.throws(
      () => bindExhibit(root, note({ upstream }), "rev"),
      /upstream binding disagrees/,
    );
  }
});

test("drafts are checked but excluded, and identifiers cannot collide", (t) => {
  const root = workspace(t);
  assert.deepEqual(bindExhibits(root, [{ ...note(), draft: true }], "rev"), []);
  assert.throws(() => bindExhibits(root, [note(), note()], "rev"), /Duplicate/);
  assert.throws(
    () =>
      bindExhibits(
        root,
        [{ ...note({ fixtures: "src/missing.json" }), draft: true }],
        "rev",
      ),
    /ENOENT/,
  );
  assert.equal(
    bindExhibit(root, { id: "prose", data: { role: "operating" } }, "rev"),
    null,
  );
});
