import assert from "node:assert/strict";
import test from "node:test";

import {
  htmlToMarkdown,
  prefersMarkdown,
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
    ].join("\n"),
  );
});
