import assert from "node:assert/strict";
import test from "node:test";

import { canonicalHostRedirect } from "../src/lib/canonical-host.js";

test("www requests redirect permanently to the same apex URL", async () => {
  const response = canonicalHostRedirect(
    new globalThis.Request("https://www.kotona.app/about/?ref=canonical"),
  );

  assert.ok(response);
  assert.equal(response.status, 308);
  assert.equal(
    response.headers.get("location"),
    "https://kotona.app/about/?ref=canonical",
  );
  assert.equal(await response.text(), "");
});

test("apex and unrelated hosts continue to Astro", () => {
  assert.equal(
    canonicalHostRedirect(new globalThis.Request("https://kotona.app/about/")),
    null,
  );
  assert.equal(
    canonicalHostRedirect(
      new globalThis.Request("https://preview.example/about/"),
    ),
    null,
  );
});
