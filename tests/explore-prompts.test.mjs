import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

import {
  explorePromptIssues,
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
} from "../scripts/check-explore-prompts.mjs";

const scriptPath = fileURLToPath(
  new URL("../scripts/check-explore-prompts.mjs", import.meta.url),
);

function note(id, overrides = {}) {
  return { id, filePath: `${id}.md`, draft: false, data: { ...overrides } };
}

test("notes without explorePrompt are not flagged", () => {
  assert.deepEqual(
    explorePromptIssues([note("a"), note("b", { explorePrompt: undefined })]),
    [],
  );
});

test("rejects a prompt shorter than the minimum length", () => {
  const issues = explorePromptIssues([
    note("short", { explorePrompt: "Too short to be useful." }),
  ]);
  assert.match(issues.join("\n"), /short:.*minimum is 80/);
});

test("rejects a prompt longer than the maximum length", () => {
  const issues = explorePromptIssues([
    note("long", { explorePrompt: "x".repeat(MAX_PROMPT_LENGTH + 1) }),
  ]);
  assert.match(issues.join("\n"), /long:.*maximum is 2400/);
});

test("accepts a prompt at the length boundaries", () => {
  assert.deepEqual(
    explorePromptIssues([
      note("min", { explorePrompt: "x".repeat(MIN_PROMPT_LENGTH) }),
      note("max", { explorePrompt: "y".repeat(MAX_PROMPT_LENGTH) }),
    ]),
    [],
  );
});

test("flags duplicate prompt text across different notes", () => {
  const prompt = "y".repeat(MIN_PROMPT_LENGTH);
  const issues = explorePromptIssues([
    note("first", { explorePrompt: prompt }),
    note("second", { explorePrompt: `  ${prompt}  ` }),
  ]);
  assert.match(issues.join("\n"), /second: explorePrompt duplicates.*first/);
});

test("rejects an empty or whitespace-only prompt", () => {
  const issues = explorePromptIssues([note("blank", { explorePrompt: "   " })]);
  assert.match(issues.join("\n"), /blank: explorePrompt is empty/);
});

function noteFrontmatter({ id, explorePrompt, draft = false } = {}) {
  const promptLine = explorePrompt
    ? `explorePrompt: >-\n  ${explorePrompt}\n`
    : "";
  return `---
title: Fixture note ${id}
status: exploration
lifecycle: current
area: fixtures
published: 2026-07-01
lastRevised: 2026-07-01
draft: ${draft}
${promptLine}---

Fixture body.
`;
}

test("CLI passes on a fixture corpus with no duplicates and reports coverage", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "kotona-explore-prompts-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const notesDir = path.join(root, "src/content/notes");
  await mkdir(notesDir, { recursive: true });
  await writeFile(
    path.join(notesDir, "with-prompt.md"),
    noteFrontmatter({
      id: "with-prompt",
      explorePrompt: "z".repeat(MIN_PROMPT_LENGTH),
    }),
    "utf8",
  );
  await writeFile(
    path.join(notesDir, "without-prompt.md"),
    noteFrontmatter({ id: "without-prompt" }),
    "utf8",
  );
  await writeFile(
    path.join(notesDir, "draft.md"),
    noteFrontmatter({ id: "draft", draft: true }),
    "utf8",
  );

  const result = spawnSync(process.execPath, [scriptPath, "--root", root], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /passed: 1\/2 published notes/);
});

test("CLI fails when two notes publish the same prompt text", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "kotona-explore-prompts-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const notesDir = path.join(root, "src/content/notes");
  await mkdir(notesDir, { recursive: true });
  const prompt = "z".repeat(MIN_PROMPT_LENGTH);
  await writeFile(
    path.join(notesDir, "first.md"),
    noteFrontmatter({ id: "first", explorePrompt: prompt }),
    "utf8",
  );
  await writeFile(
    path.join(notesDir, "second.md"),
    noteFrontmatter({ id: "second", explorePrompt: prompt }),
    "utf8",
  );

  const result = spawnSync(process.execPath, [scriptPath, "--root", root], {
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicates the prompt already used by/);
});
