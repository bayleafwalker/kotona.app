/**
 * Distinctive body terms for the Explore page's in-page ranker.
 *
 * The embedded search corpus is metadata only, so a term that a document
 * discusses at length but never names in its title, summary, area, tags, or
 * curated scope was unrankable: searching it emptied the map and the ranked
 * list while the document sat in the grouped index below. Shipping whole
 * bodies would fix that at the cost of the entire corpus on every page view.
 *
 * This ships the part of a body that actually distinguishes it instead: the
 * tokens the document uses that few other documents use, minus the ones its
 * own metadata already carries. A word common across the corpus separates
 * nothing, and a word already in a scored metadata field is already ranked at
 * a higher weight, so neither earns its bytes.
 */

import { tokenize } from "./reference-ranking.js";

type BodyEntry = {
  collection: "notes" | "projects";
  id: string;
  body?: string;
  data: {
    draft?: boolean;
    title: string;
    summary?: string;
    area?: string;
    tags?: string[];
    reference?: { discoverFor: string[]; establishes: string[] };
  };
};

/**
 * Share of the corpus above which a term is treated as common vocabulary
 * rather than a distinguishing one. Held as a ratio so the index does not
 * quietly widen as the corpus grows.
 */
const commonTermShare = 0.15;

/** Frontmatter is metadata, and the fields worth ranking are scored already. */
function bodyOf(entry: BodyEntry) {
  return (entry.body ?? "").replace(/^---\n[\s\S]*?\n---\n/, "");
}

function metadataTokens(entry: BodyEntry): Set<string> {
  const fields = [
    entry.data.title,
    entry.data.summary ?? "",
    entry.data.area ?? "",
    (entry.data.tags ?? []).join(" "),
    (entry.data.reference?.discoverFor ?? []).join(" "),
    (entry.data.reference?.establishes ?? []).join(" "),
  ];
  return new Set(fields.flatMap((field): string[] => tokenize(field)));
}

/**
 * Distinctive terms per document, keyed by the document's site path so notes
 * and projects cannot collide on a shared id.
 *
 * Terms are sorted, so identical sources produce identical bytes.
 */
export function buildSearchTerms(entries: BodyEntry[]): Map<string, string> {
  // Drafts are not published, so they neither get terms nor colour the
  // frequencies that decide which terms are common.
  const documents = entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      path: `/${entry.collection}/${entry.id}/`,
      metadata: metadataTokens(entry),
      tokens: new Set<string>(tokenize(bodyOf(entry))),
    }));

  const frequency = new Map<string, number>();
  for (const document of documents) {
    for (const token of document.tokens) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }

  const commonAbove = Math.max(
    2,
    Math.round(documents.length * commonTermShare),
  );

  return new Map(
    documents.map((document) => [
      document.path,
      [...document.tokens]
        .filter(
          (token) =>
            (frequency.get(token) ?? 0) <= commonAbove &&
            !document.metadata.has(token),
        )
        .sort((left, right) => left.localeCompare(right, "en"))
        .join(" "),
    ]),
  );
}
