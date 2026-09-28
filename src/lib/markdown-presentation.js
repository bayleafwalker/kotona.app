/**
 * Presentation marks that rendered Markdown needs and cannot express itself.
 * Each visitor adds or moves a class and changes no text, so the Markdown
 * projection in src/lib/markdown-response.js is unaffected.
 *
 * Astro 7 renders Markdown with Sätteri, which runs its own hast visitors
 * rather than unified rehype plugins. The integration below registers these
 * visitors on the default processor's options, which Astro leaves mutable for
 * integrations, so no processor swap or new dependency is needed.
 */

/**
 * @typedef {{
 *   type: string,
 *   tagName?: string,
 *   value?: string,
 *   properties?: Record<string, unknown>,
 *   children?: HastNode[],
 * }} HastNode
 *
 * @typedef {{
 *   textContent: (node: HastNode) => string,
 *   setProperty: (node: HastNode, key: string, value: unknown) => void,
 * }} VisitorContext
 */

/** @param {HastNode} node @returns {string} */
function plainTextOf(node) {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(plainTextOf).join("");
}

/**
 * @param {HastNode} node
 * @param {string} className
 * @returns {string[]}
 */
export function withClass(node, className) {
  const existing = node.properties?.className;
  const classes = Array.isArray(existing)
    ? existing.map(String)
    : typeof existing === "string"
      ? existing.split(/\s+/).filter(Boolean)
      : [];

  return classes.includes(className) ? classes : [...classes, className];
}

const WORKING_MODEL_LEAD_IN = /^working model\s*[.:]?$/i;

/**
 * docs/writing-style.md asks an exploration to mark its opening **Working
 * model**, and notes write it as a paragraph that begins with a bold "Working
 * model." or "Working model:". Only that paragraph is marked, so the
 * stylesheet can set it apart as the note's provisional claim.
 *
 * @param {HastNode} paragraph
 * @param {(node: HastNode) => string} [textOf]
 */
export function isWorkingModelParagraph(paragraph, textOf = plainTextOf) {
  if (paragraph.type !== "element" || paragraph.tagName !== "p") return false;

  const first = (paragraph.children ?? []).find(
    (child) => !(child.type === "text" && (child.value ?? "").trim() === ""),
  );

  return (
    first?.type === "element" &&
    first.tagName === "strong" &&
    WORKING_MODEL_LEAD_IN.test(textOf(first).trim())
  );
}

export const workingModelHastPlugin = {
  name: "working-model",
  element: {
    filter: ["p"],
    /** @param {HastNode} node @param {VisitorContext} ctx */
    visit(node, ctx) {
      if (!isWorkingModelParagraph(node, (child) => ctx.textContent(child))) {
        return;
      }
      ctx.setProperty(node, "className", withClass(node, "working-model"));
    },
  },
};

const ALIGNMENT = /^\s*text-align\s*:\s*(left|right|center)\s*;?\s*$/i;

/**
 * Markdown writes a `---:` table column as an inline `text-align` style. The
 * production CSP (`style-src 'self'`, src/lib/security-headers.js) refuses to
 * apply inline styles, so the alignment is moved to a class the stylesheet
 * owns. Any other inline style is left alone rather than guessed at.
 *
 * @param {HastNode} cell
 * @returns {"left" | "right" | "center" | null}
 */
export function cellAlignment(cell) {
  const style = cell.properties?.style;
  if (typeof style !== "string") return null;
  const match = style.match(ALIGNMENT);
  return match
    ? /** @type {"left" | "right" | "center"} */ (match[1].toLowerCase())
    : null;
}

export const tableAlignmentHastPlugin = {
  name: "table-alignment",
  element: {
    filter: ["th", "td"],
    /** @param {HastNode} node @param {VisitorContext} ctx */
    visit(node, ctx) {
      const alignment = cellAlignment(node);
      if (!alignment) return;
      ctx.setProperty(node, "style", null);
      ctx.setProperty(node, "className", withClass(node, `align-${alignment}`));
    },
  },
};

export const markdownPresentationPlugins = [
  workingModelHastPlugin,
  tableAlignmentHastPlugin,
];

/** @returns {import("astro").AstroIntegration} */
export function markdownPresentationIntegration() {
  return {
    name: "kotona:markdown-presentation",
    hooks: {
      "astro:config:setup": ({ config, logger }) => {
        const processor = config.markdown.processor;
        /** @type {{ hastPlugins?: unknown[] } | undefined} */
        const options = /** @type {any} */ (processor)?.options;

        if (
          processor?.name !== "satteri" ||
          !Array.isArray(options?.hastPlugins)
        ) {
          logger.warn(
            "Markdown processor is not Sätteri; Working model paragraphs and table alignment will render unmarked.",
          );
          return;
        }

        options.hastPlugins.push(...markdownPresentationPlugins);
      },
    },
  };
}
