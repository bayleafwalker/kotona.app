import assert from "node:assert/strict";
import test from "node:test";
import { URL } from "node:url";

import { projectReferenceDocument } from "../src/lib/reference-index.ts";
import {
  referencePrelude,
  renderPromptText,
  renderReferenceMarkdown,
} from "../src/lib/reference-markdown.ts";

const baseUrl = new URL("https://kotona.app/");
const revision = "a".repeat(40);

function documentFor(overrides = {}) {
  return projectReferenceDocument(
    {
      id: "a-note",
      collection: "notes",
      data: {
        title: "A note",
        summary: "A summary.",
        role: "operating",
        status: "guiding",
        lifecycle: "superseded",
        area: "agent workflow",
        tags: ["workflow"],
        published: new Date("2026-01-02T00:00:00Z"),
        lastRevised: new Date("2026-02-03T00:00:00Z"),
        ...overrides,
      },
    },
    baseUrl,
  );
}

test("prelude is deterministic and carries the authority boundary", () => {
  const document = documentFor();
  const first = referencePrelude(document, { revision });
  const second = referencePrelude(document, { revision });

  assert.equal(first, second);
  assert.match(first, /^---\n/);
  assert.match(first, /\nlifecycle: "superseded"\n/);
  assert.match(first, /\nsiteRevision: "a{40}"\n/);
  assert.match(first, /not authority over it\."\n---\n$/);
});

test("prelude quotes values so a title cannot break the document", () => {
  const prelude = referencePrelude(
    documentFor({ title: 'A "quoted" title: with punctuation\\' }),
    { revision },
  );

  assert.match(
    prelude,
    /\ntitle: "A \\"quoted\\" title: with punctuation\\\\"\n/,
  );
});

test("prelude publishes reference scope but never repository detail", () => {
  const prelude = referencePrelude(
    documentFor({
      reference: {
        purpose: "design-rationale",
        discoverFor: ["handing work between sessions"],
        establishes: ["why references sit on the walked path"],
        doesNotEstablish: ["current repository state"],
        supplementWith: [],
      },
      hero: { src: "/images/x.png", alt: "x", width: 1, height: 1 },
    }),
    { revision },
  );

  assert.match(prelude, /\n {2}purpose: "design-rationale"\n/);
  assert.match(prelude, /\n {4}- "handing work between sessions"\n/);
  assert.ok(!prelude.includes("supplementWith"));
  assert.ok(!prelude.includes("images"));
});

test("the reference representation drops the exploration template", () => {
  const html = `<main>
    <h1>A note</h1>
    <p>Body text.</p>
    <details class="explore-prompt"><summary><h2>Explore this note with AI</h2></summary>
    <pre data-language="text"><code>Apply this note to your own system.</code></pre></details>
    <h2>Related notes</h2>
  </main>`;
  const markdown = renderReferenceMarkdown(html, documentFor(), { revision });

  assert.ok(markdown.includes("# A note"));
  assert.ok(markdown.includes("Body text."));
  assert.ok(markdown.includes("## Related notes"));
  assert.ok(!markdown.includes("Explore this note with AI"));
  assert.ok(!markdown.includes("Apply this note to your own system."));
});

test("a paragraph that merely mentions the prompt survives", () => {
  const html =
    "<main><p>Explore this note with AI is a label this note discusses.</p></main>";
  const markdown = renderReferenceMarkdown(html, documentFor(), { revision });

  assert.ok(markdown.includes("is a label this note discusses"));
});

test("the prompt resource never travels without its lifecycle", () => {
  const text = renderPromptText(documentFor(), "  Apply this elsewhere.  ", {
    revision,
    markdownUrl: "https://kotona.app/notes/a-note.md",
  });

  assert.ok(text.startsWith("Optional exploration template\n"));
  assert.ok(text.includes("Source: https://kotona.app/notes/a-note/"));
  assert.ok(text.includes("Reference: https://kotona.app/notes/a-note.md"));
  assert.ok(text.includes("Lifecycle: superseded"));
  assert.ok(text.includes(`Site revision: ${revision}`));
  assert.ok(text.includes("is not evidence that the document is current"));
  assert.ok(text.endsWith("---\n\nApply this elsewhere.\n"));
});
