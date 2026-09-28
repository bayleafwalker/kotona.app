import assert from "node:assert/strict";
import test from "node:test";

import {
  cellAlignment,
  isWorkingModelParagraph,
  markdownPresentationIntegration,
  markdownPresentationPlugins,
  tableAlignmentHastPlugin,
  workingModelHastPlugin,
} from "../src/lib/markdown-presentation.js";

const text = (value) => ({ type: "text", value });
const element = (tagName, children, properties = {}) => ({
  type: "element",
  tagName,
  properties,
  children,
});

function textContent(node) {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textContent).join("");
}

/** Run a visitor the way Sätteri does: one matched element plus a context. */
function visit(plugin, node) {
  const writes = [];
  plugin.element.visit(node, {
    textContent,
    setProperty: (target, key, value) => writes.push({ target, key, value }),
  });
  return writes;
}

test("marks a paragraph led by a bold Working model", () => {
  assert.deepEqual(workingModelHastPlugin.element.filter, ["p"]);

  for (const lead of ["Working model:", "Working model.", "Working model"]) {
    const paragraph = element("p", [
      element("strong", [text(lead)]),
      text(" a router is the whole decision system."),
    ]);
    assert.deepEqual(visit(workingModelHastPlugin, paragraph), [
      { target: paragraph, key: "className", value: ["working-model"] },
    ]);
  }
});

test("ignores leading whitespace and keeps existing classes", () => {
  const paragraph = element(
    "p",
    [text("\n"), element("strong", [text("Working model:")]), text(" x")],
    { className: ["lede"] },
  );
  assert.deepEqual(visit(workingModelHastPlugin, paragraph)[0].value, [
    "lede",
    "working-model",
  ]);
});

test("leaves other bold lead-ins and mid-paragraph mentions alone", () => {
  const cases = [
    element("p", [element("strong", [text("Assessment:")]), text(" x")]),
    element("p", [
      text("The "),
      element("strong", [text("Working model:")]),
      text(" appears later."),
    ]),
    element("p", [
      element("strong", [text("Working model of the queue")]),
      text(" is different."),
    ]),
    element("li", [element("strong", [text("Working model:")]), text(" x")]),
  ];

  for (const node of cases) {
    assert.equal(isWorkingModelParagraph(node), false);
    assert.deepEqual(visit(workingModelHastPlugin, node), []);
  }
});

test("moves Markdown column alignment from an inline style to a class", () => {
  assert.deepEqual(tableAlignmentHastPlugin.element.filter, ["th", "td"]);

  for (const [style, alignment] of [
    ["text-align: right", "right"],
    ["text-align:center;", "center"],
    ["TEXT-ALIGN: Left", "left"],
  ]) {
    const cell = element("td", [text("64%")], { style });
    assert.equal(cellAlignment(cell), alignment);
    assert.deepEqual(visit(tableAlignmentHastPlugin, cell), [
      { target: cell, key: "style", value: null },
      { target: cell, key: "className", value: [`align-${alignment}`] },
    ]);
  }
});

test("leaves unaligned cells and unrelated inline styles alone", () => {
  for (const cell of [
    element("td", [text("x")]),
    element("td", [text("x")], { style: "color: red" }),
    element("td", [text("x")], { style: "text-align: right; color: red" }),
  ]) {
    assert.equal(cellAlignment(cell), null);
    assert.deepEqual(visit(tableAlignmentHastPlugin, cell), []);
  }
});

test("registers on the Sätteri processor and warns on any other", () => {
  const options = { hastPlugins: [] };
  const warnings = [];
  const logger = { warn: (message) => warnings.push(message) };
  const setup = markdownPresentationIntegration().hooks["astro:config:setup"];

  setup({
    config: { markdown: { processor: { name: "satteri", options } } },
    logger,
  });
  assert.deepEqual(options.hastPlugins, markdownPresentationPlugins);
  assert.deepEqual(warnings, []);

  setup({
    config: { markdown: { processor: { name: "unified", options: {} } } },
    logger,
  });
  assert.equal(warnings.length, 1);
});
