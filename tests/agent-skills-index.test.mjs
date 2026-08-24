import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

// Path-absolute artifact URLs resolve against the index origin, which on disk
// is the `public/` directory the site is served from.
const publicRoot = new URL("../public/", import.meta.url);
const indexUrl = new URL(".well-known/agent-skills/index.json", publicRoot);

async function readIndex() {
  return JSON.parse(await readFile(indexUrl, "utf8"));
}

test("every published skill digest matches its artifact bytes", async () => {
  const index = await readIndex();

  assert.ok(index.skills.length > 0);

  for (const skill of index.skills) {
    assert.match(skill.digest, /^sha256:[0-9a-f]{64}$/);

    const artifact = await readFile(new URL(skill.url.slice(1), publicRoot));
    assert.equal(
      skill.digest,
      `sha256:${createHash("sha256").update(artifact).digest("hex")}`,
      `${skill.name}: index digest does not match the artifact a client would hash`,
    );
  }
});

test("artifact URLs resolve against the index, not a pinned host", async () => {
  const index = await readIndex();

  for (const skill of index.skills) {
    assert.match(skill.url, /^\/\.well-known\/agent-skills\//);
  }
});
