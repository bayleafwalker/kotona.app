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

test("the former sprintctl-and-kctl project URL redirects to canonical Vuoro", async () => {
  const redirects = await readFile(
    fileURLToPath(new URL("../public/_redirects", import.meta.url)),
    "utf8",
  );

  assert.match(
    redirects,
    /^\/projects\/sprintctl-and-kctl\/?\s+\/projects\/vuoro\/\s+301$/m,
  );
});

test("generated social-card paths cannot escape their asset directory", () => {
  assert.equal(
    generatedOgImagePath("notes", "nested/example"),
    "/og/generated/notes-nested-example.png",
  );
});

test("the note page keeps the document primary and its machine affordances after it", async () => {
  const source = await readFile(
    fileURLToPath(new URL("../src/pages/notes/[slug].astro", import.meta.url)),
    "utf8",
  );
  const lifecycleIndex = source.indexOf(
    'class="publication-note lifecycle-note"',
  );
  const tocIndex = source.indexOf("<ContentToc");
  const proseIndex = source.indexOf('<div class="prose">');
  const referenceIndex = source.indexOf("<ReferenceActions");
  const explorePromptIndex = source.indexOf("<ExplorePrompt");
  const relatedIndex = source.indexOf('class="related-content"');

  for (const [index, name] of [
    [lifecycleIndex, "lifecycle notice markup"],
    [tocIndex, "ContentToc usage"],
    [proseIndex, "prose region"],
    [referenceIndex, "ReferenceActions usage"],
    [explorePromptIndex, "ExplorePrompt usage"],
    [relatedIndex, "related notes markup"],
  ]) {
    assert.ok(index > -1, `${name} is missing`);
  }

  // The reader's path from the header runs into the note itself. The prompt is
  // an optional template for elsewhere, so it follows the document rather than
  // interrupting the way into it.
  assert.ok(
    lifecycleIndex < tocIndex,
    "lifecycle notice must precede the table of contents",
  );
  assert.ok(tocIndex < proseIndex, "table of contents must precede the prose");
  assert.ok(
    proseIndex < referenceIndex,
    "reference actions must follow the prose",
  );
  assert.ok(
    referenceIndex < explorePromptIndex,
    "the exploration template must follow the reference actions",
  );
  assert.ok(
    explorePromptIndex < relatedIndex,
    "the exploration template must precede related notes",
  );
});

test("the note template labels format and claim posture explicitly", async () => {
  const source = await readFile(
    fileURLToPath(new URL("../src/pages/notes/[slug].astro", import.meta.url)),
    "utf8",
  );

  assert.match(
    source,
    /Claim posture: \{humanizeLabel\(entry\.data\.status\)\}/,
  );
  assert.match(source, /Format: \{humanizeLabel\(entry\.data\.role\)\}/);
});
