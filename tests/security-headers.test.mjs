import assert from "node:assert/strict";
import test from "node:test";

import {
  applySecurityHeaders,
  contentSecurityPolicy,
} from "../src/lib/security-headers.js";

test("production CSP uses a nonce and permits only the analytics origins", () => {
  const policy = contentSecurityPolicy("fixture-nonce");

  assert.match(policy, /script-src 'self' 'nonce-fixture-nonce'/);
  assert.match(policy, /https:\/\/static\.cloudflareinsights\.com/);
  assert.match(policy, /connect-src 'self' https:\/\/cloudflareinsights\.com/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.match(policy, /object-src 'none'/);
  assert.doesNotMatch(policy, /'unsafe-inline'/);
  assert.doesNotMatch(policy, /'unsafe-eval'/);
});

test("security headers are reproducibly applied in code", () => {
  const headers = new globalThis.Headers();
  applySecurityHeaders(headers, "fixture-nonce");

  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("x-frame-options"), "DENY");
  assert.equal(
    headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.match(headers.get("strict-transport-security"), /includeSubDomains/);
  assert.match(headers.get("permissions-policy"), /camera=\(\)/);
});
