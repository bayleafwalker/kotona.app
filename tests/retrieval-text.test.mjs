import assert from "node:assert/strict";
import test from "node:test";

import { normalizeProse } from "../scripts/retrieval-text.mjs";

test("prose phrase assertions ignore case and formatting wraps", () => {
  const phrase = normalizeProse("Talos 1.13.6 and Kubernetes 1.36.2");
  for (const text of [
    "Talos 1.13.6 and Kubernetes\n1.36.2",
    "TALOS 1.13.6 and\r\nKubernetes\t1.36.2",
  ]) {
    assert.ok(normalizeProse(text).includes(phrase));
  }
});

test("prose phrase assertions retain words, punctuation, and paragraphs", () => {
  const phrase = normalizeProse("verified result");
  for (const text of [
    "verified different result",
    "verified, result",
    "verified\n\nresult",
    "verified\r\n \r\nresult",
  ]) {
    assert.ok(!normalizeProse(text).includes(phrase));
  }
});

test("soft wrapping cannot hide a forbidden phrase", () => {
  const text = normalizeProse("Explore this note\nwith AI");
  assert.ok(text.includes(normalizeProse("Explore this note with AI")));
});
