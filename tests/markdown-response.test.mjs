import assert from "node:assert/strict";
import test from "node:test";

import {
  htmlToMarkdown,
  prefersMarkdown,
  stripExplorePrompt,
  stripReferenceActions,
} from "../src/lib/markdown-response.js";

test("Markdown must be preferred with a positive quality", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
  assert.equal(
    prefersMarkdown("text/html;q=0.5, text/markdown; charset=utf-8; q=0.8"),
    true,
  );
  assert.equal(prefersMarkdown("TEXT/MARKDOWN;Q=1"), true);
});

test("HTML remains the default and explicit Markdown exclusions win", () => {
  assert.equal(prefersMarkdown(null), false);
  assert.equal(prefersMarkdown("*/*"), false);
  assert.equal(prefersMarkdown("text/html, text/markdown"), false);
  assert.equal(prefersMarkdown("text/markdown;q=0"), false);
  assert.equal(prefersMarkdown("text/markdown;q=0, */*;q=1"), false);
  assert.equal(prefersMarkdown("text/markdownish"), false);
  assert.equal(prefersMarkdown("text/markdown;q=2"), false);
});

test("Markdown projection uses main content and preserves tables and code", () => {
  const html = `
    <html>
      <body>
        <header>Site chrome</header>
        <main>
          <h1>Example &amp; evidence</h1>
          <p>Read <a href="/notes/">the <strong>notes</strong></a> and use <code>a | b</code>.</p>
          <table>
            <thead><tr><th>Layer</th><th>Contract</th></tr></thead>
            <tbody><tr><td>Bronze</td><td>Keep | source</td></tr></tbody>
          </table>
          <pre data-language="toml"><code><span>[tool]</span>\n<span>enabled = true</span></code></pre>
        </main>
        <footer>More chrome</footer>
      </body>
    </html>
  `;

  assert.equal(
    htmlToMarkdown(html),
    [
      "# Example & evidence",
      "",
      "Read [the **notes**](/notes/) and use `a | b`.",
      "",
      "| Layer | Contract |",
      "| --- | --- |",
      "| Bronze | Keep \\| source |",
      "",
      "```toml",
      "[tool]",
      "enabled = true",
      "```",
      "",
    ].join("\n"),
  );
});

test("Markdown projection exposes a collapsed explore-prompt block and drops the copy button", () => {
  const html = `
    <main>
      <h1>Example note</h1>
      <details class="explore-prompt">
        <summary>
          <h2>Explore this note with AI</h2>
          <span>Apply and challenge it in your own context.</span>
        </summary>
        <blockquote>
          <p>A post-hoc prompt for applying and extending this note.</p>
        </blockquote>
        <pre data-language="text"><code>Use this note as a worked instantiation.</code></pre>
        <div>
          <button type="button" data-source-url="/notes/example/">Copy prompt</button>
          <p></p>
        </div>
      </details>
    </main>
  `;

  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /## Explore this note with AI/);
  assert.match(markdown, /Apply and challenge it in your own context\./);
  assert.match(
    markdown,
    /> A post-hoc prompt for applying and extending this note\./,
  );
  assert.match(
    markdown,
    /```text\nUse this note as a worked instantiation\.\n```/,
  );
  assert.doesNotMatch(markdown, /Copy prompt/);
});

test("Markdown projection preserves ordered and unordered list semantics", () => {
  const html = `
    <main>
      <ol start="3">
        <li>Plan the change.</li>
        <li value="7">Verify the result.</li>
        <li>Record the handoff.</li>
      </ol>
      <ul>
        <li>Keep the evidence.</li>
        <li>
          Keep wrapped text and
          <a href="/sources/">inline links</a> separated.
        </li>
      </ul>
    </main>
  `;

  assert.equal(
    htmlToMarkdown(html),
    [
      "3. Plan the change.",
      "",
      "7. Verify the result.",
      "",
      "8. Record the handoff.",
      "",
      "- Keep the evidence.",
      "",
      "- Keep wrapped text and [inline links](/sources/) separated.",
      "",
    ].join("\n"),
  );
});

test("drops the inline term tooltip the page also publishes as a list", () => {
  const html =
    '<main><p><span class="term-hint"><dfn>Outctl</dfn><span class="term-note" role="tooltip">A tool that captures output.</span></span> cut visible output.</p></main>';

  assert.equal(htmlToMarkdown(html), "Outctl cut visible output.\n");
});

test("keeps a definition list paired", () => {
  const html =
    "<main><dl><dt>Outctl</dt><dd>A tool that captures output.</dd><dt>Vuoro</dt><dd>A family of tools.</dd></dl></main>";

  assert.equal(
    htmlToMarkdown(html),
    "- **Outctl** -- A tool that captures output.\n- **Vuoro** -- A family of tools.\n",
  );
});

test("removes the exploration template as a whole element", () => {
  const html =
    '<details class="explore-prompt"><summary><h2>Explore this note with AI</h2></summary><pre><code>prompt</code></pre></details><p>Body.</p>';

  assert.equal(stripExplorePrompt(html), "<p>Body.</p>");
});

test("removes the compact reference row as a whole element", () => {
  const html =
    '<p class="reference-actions" data-reference-actions><span class="reference-actions-label">Reference:</span><a href="/notes/x.md">Markdown</a><button type="button">Copy</button><a href="/notes/x.md" download="x.md">Download</a></p><p>Body.</p>';

  assert.equal(stripReferenceActions(html), "<p>Body.</p>");
});

test("a definition list degrades rather than losing content", () => {
  const html =
    "<main><dl><dt>Term</dt><dd>First sense.</dd><dd>Second sense.</dd><dt>Orphan</dt></dl></main>";

  assert.equal(
    htmlToMarkdown(html),
    "- **Term** -- First sense.\n  - Second sense.\n- **Orphan**\n",
  );
});

test("a definition without a preceding term is still published", () => {
  const html = "<main><dl><dd>Stray definition.</dd></dl></main>";

  assert.equal(htmlToMarkdown(html), "- Stray definition.\n");
});
