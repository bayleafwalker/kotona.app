/**
 * Reader-facing spellings for controlled frontmatter values. Kept in plain
 * JavaScript because the social-card generator runs outside Astro's TypeScript
 * pipeline and must project exactly the same labels as the rendered pages.
 */

/**
 * Slugs are lowercased and hyphenated, which destroys the casing of any term
 * that is not an ordinary word. Sentence-casing them back produces "Gitops"
 * and "Rag", so the display spelling is declared rather than derived. Slugs,
 * URLs, and frontmatter values are unaffected.
 */
const displayLabels = new Map([
  ["ai", "AI"],
  ["cli-tooling", "CLI tooling"],
  ["gitops", "GitOps"],
  ["home-assistant", "Home Assistant"],
  ["rag", "RAG"],
]);

/**
 * A note's `role` and its claim posture draw on overlapping words -- a
 * synthesis note can carry an exploratory claim -- so rendering both as bare
 * nouns reads as a contradiction ("Synthesis · Exploration"). Each label
 * carries the kind of thing it describes.
 */
const roleLabels = new Map([
  ["exploration", "Exploration note"],
  ["operating", "Operating note"],
  ["project-history", "Project history"],
  ["synthesis", "Synthesis note"],
]);

const claimPostureLabels = new Map([
  ["archival", "Archival claim"],
  ["exploration", "Exploratory claim"],
  ["guiding", "Guiding claim"],
  ["prospective", "Prospective claim"],
]);

/**
 * @param {string} value
 * @returns {string}
 */
export function humanizeLabel(value) {
  const declared = displayLabels.get(value);
  if (declared) return declared;
  const label = value.replaceAll("-", " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * @param {string} value
 * @returns {string}
 */
export function roleLabel(value) {
  return roleLabels.get(value) ?? humanizeLabel(value);
}

/**
 * @param {string} value
 * @returns {string}
 */
export function claimPostureLabel(value) {
  return claimPostureLabels.get(value) ?? humanizeLabel(value);
}
