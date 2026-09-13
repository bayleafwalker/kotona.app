import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { bindSource, classify } from "../scripts/bind-context.mjs";

const script = path.resolve(
  fileURLToPath(import.meta.url),
  "../../scripts/bind-context.mjs",
);
const scratch = () => mkdtemp(path.join(tmpdir(), "bind-context-"));

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
  const dir = await scratch();
  const file = path.join(dir, "AGENTS.md");
  await writeFile(file, "No sends.\n");
  const bound = await bindSource(file);
  assert.equal(bound.status, "bound");
  assert.equal(bound.custody, "unversioned");
  assert.equal(bound.sha256.length, 64);
  const missing = await bindSource(path.join(dir, "absent.md"));
  assert.equal(missing.status, "unavailable");
});

test("a committed source records a blob that restores it", async () => {
  const dir = await scratch();
  const identity = ["-c", "user.name=test", "-c", "user.email=test@invalid"];
  const git = (...args) =>
    execFileSync("git", ["-C", dir, ...identity, ...args]).toString();
  const file = path.join(dir, "SKILL.md");
  git("init", "-q");
  await writeFile(file, "Hand off before compaction.\n");
  git("add", "SKILL.md");
  git("commit", "-qm", "skill");

  const bound = await bindSource(file);
  assert.equal(bound.custody, "git");
  assert.ok(bound.repository);
  assert.equal(
    git("cat-file", "-p", bound.blob),
    "Hand off before compaction.\n",
  );

  await writeFile(file, "Changed.\n");
  assert.equal((await bindSource(file)).custody, "git-modified");
  const untracked = path.join(dir, "new.md");
  await writeFile(untracked, "Not added.\n");
  assert.equal((await bindSource(untracked)).custody, "unversioned");
});

test("the CLI runs from any directory and exits 2 when a name is unresolved", async () => {
  const dir = await scratch();
  const providers = path.join(dir, "providers.json");
  const out = path.join(dir, "record.json");
  await writeFile(providers, "{}\n");
  const result = spawnSync(process.execPath, [script, out], {
    cwd: dir,
    env: { ...process.env, CONTEXT_PROVIDERS: providers },
  });
  assert.equal(result.status, 2);
  const record = JSON.parse(await readFile(out, "utf8"));
  assert.ok(record.context.every((s) => s.status === "unresolved"));
  assert.ok(record.local.every((s) => s.status === "bound"));
  assert.equal(record.exceptions[0].outcome, "narrowed");
});

test("the CLI rejects a flag instead of writing to a file named after it", () => {
  const result = spawnSync(process.execPath, [script, "--out"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /usage/);
});
