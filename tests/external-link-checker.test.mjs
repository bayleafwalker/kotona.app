/* global Response */

import assert from "node:assert/strict";
import test from "node:test";

import {
  checkUrl,
  classifyStatus,
  extractHttpUrls,
  skipReason,
} from "../scripts/check-external-links.mjs";

test("extracts and normalizes HTTP links from Markdown and Astro source", () => {
  const source = `
    [One](https://docs.example.test/a_(b)?x=1#section).
    <a href="https://docs.example.test/two?x=1&amp;y=2">Two</a>
    duplicate: https://docs.example.test/two?x=1&y=2
    ignored: mailto:test@example.test
  `;

  assert.deepEqual(extractHttpUrls(source), [
    "https://docs.example.test/a_(b)?x=1",
    "https://docs.example.test/two?x=1&y=2",
  ]);
});

test("status policy is strict except for an exact bot-blocked URL", () => {
  assert.equal(classifyStatus("https://example.test/", 204).ok, true);
  assert.equal(classifyStatus("https://example.test/", 301).ok, true);
  assert.equal(classifyStatus("https://example.test/", 403).ok, false);
  assert.deepEqual(
    classifyStatus("https://www.linkedin.com/in/juhahuotari/", 999),
    {
      ok: true,
      kind: "automation-blocked",
      reason: "LinkedIn profile blocks automated link checks",
    },
  );
  assert.equal(
    classifyStatus("https://www.linkedin.com/in/someone-else/", 999).ok,
    false,
  );
});

test("source examples are skipped without suppressing ordinary GitHub links", () => {
  assert.equal(
    skipReason("https://github.com/owner/repo"),
    "project-template placeholder",
  );
  assert.equal(skipReason("https://github.com/bayleafwalker/box"), null);
});

test("falls back from a rejected HEAD request to GET", async () => {
  const methods = [];
  const fetchImpl = async (_url, options) => {
    methods.push(options.method);
    return new Response(null, {
      status: options.method === "HEAD" ? 405 : 200,
    });
  };

  const result = await checkUrl("https://example.test/resource", {
    fetchImpl,
    timeoutMs: 100,
  });

  assert.deepEqual(methods, ["HEAD", "GET"]);
  assert.equal(result.ok, true);
  assert.equal(result.method, "GET");
});

test("reports a failed GET with both request attempts", async () => {
  const fetchImpl = async () => new Response(null, { status: 404 });
  const result = await checkUrl("https://example.test/missing", {
    fetchImpl,
    timeoutMs: 100,
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "HTTP 404");
  assert.equal(result.attempts.head.status, 404);
  assert.equal(result.attempts.get.status, 404);
});
