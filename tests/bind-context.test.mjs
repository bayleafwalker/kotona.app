import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { bindSource, classify } from "../scripts/bind-context.mjs";

const standingOf = new Map([
  ["workstation/agent-baseline", "rule"],
  ["task/note-revision", "default"],
]);

test("local may narrow a rule but never broaden or replace it", () => {
  const target = "workstation/agent-baseline#deployment";
  assert.equal(classify({ target, effect: "narrow" }, standingOf), "narrowed");
  assert.match(classify({ target, effect: "broaden" }, standingOf), /^refused/);
  assert.match(classify({ target, effect: "replace" }, standingOf), /^refused/);
});

test("a default can be replaced by a declared exception", () => {
  const exception = { target: "task/note-revision", effect: "replace" };
  assert.equal(classify(exception, standingOf), "replaced");
});

test("an exception it cannot classify is refused, not settled", () => {
  const unknown = { target: "platform/cluster", effect: "narrow" };
  const vague = { target: "task/note-revision", effect: "prefer" };
  assert.match(classify(unknown, standingOf), /no known standing/);
  assert.match(classify(vague, standingOf), /^refused/);
});

test("a source outside version control is bound by hash and says so", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "bind-context-"));
  const file = path.join(dir, "AGENTS.md");
  await writeFile(file, "No sends.\n");
  const bound = await bindSource(file);
  assert.equal(bound.status, "bound");
  assert.equal(bound.custody, "unversioned");
  assert.equal(bound.sha256.length, 64);
  const missing = await bindSource(path.join(dir, "absent.md"));
  assert.equal(missing.status, "unavailable");
});
