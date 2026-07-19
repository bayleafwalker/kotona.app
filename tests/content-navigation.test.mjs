import assert from "node:assert/strict";
import test from "node:test";

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
