// Prose assertions ignore formatting wraps, not word order or punctuation.
// Keep paragraph boundaries so unrelated passages cannot form a passing phrase.
export function normalizeProse(text) {
  return text
    .split(/\r?\n[\t ]*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .join("\n\n")
    .toLowerCase();
}
