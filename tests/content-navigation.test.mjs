import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

import { generatedOgImagePath } from "../src/lib/og-images.js";
import { projectTags, tagSlug } from "../src/lib/tag-slug.js";

test("tag slugs are stable URL segments", () => {
  assert.equal(tagSlug("Home Assistant"), "home-assistant");
  assert.equal(tagSlug("  GitOps operations  "), "gitops-operations");
  assert.equal(tagSlug("Evidence / audit"), "evidence-audit");
});

test("project navigation includes its public project label", () => {
  assert.deepEqual(
    projectTags({ project: "appservice", tags: ["gitops", "operations"] }),
    ["appservice", "gitops", "operations"],
  );
});

test("generated social-card paths cannot escape their asset directory", () => {
  assert.equal(
    generatedOgImagePath("notes", "nested/example"),
    "/og/generated/notes-nested-example.png",
  );
});

test("the note page always renders lifecycle before the explore prompt before the table of contents", async () => {
  const source = await readFile(
    fileURLToPath(new URL("../src/pages/notes/[slug].astro", import.meta.url)),
    "utf8",
  );
  const lifecycleIndex = source.indexOf(
    'class="publication-note lifecycle-note"',
  );
  const explorePromptIndex = source.indexOf("<ExplorePrompt");
  const tocIndex = source.indexOf("<ContentToc");

  assert.ok(lifecycleIndex > -1, "lifecycle notice markup is missing");
  assert.ok(explorePromptIndex > -1, "ExplorePrompt usage is missing");
  assert.ok(tocIndex > -1, "ContentToc usage is missing");
  assert.ok(
    lifecycleIndex < explorePromptIndex,
    "lifecycle notice must be placed before the explore prompt in the template",
  );
  assert.ok(
    explorePromptIndex < tocIndex,
    "explore prompt must be placed before the table of contents in the template",
  );
});
