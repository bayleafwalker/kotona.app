/**
 * Deterministic lexical ranking over the public reference corpus.
 *
 * Pure and browser-safe: no imports, no platform APIs, no clock, no randomness.
 * The Explore page and the retrieval evaluation both rank with this module, so
 * the harness measures the ranking the site actually ships.
 *
 * @typedef {{
 *   id: string,
 *   type: "note" | "project",
 *   path: string,
 *   title: string,
 *   summary?: string,
 *   area?: string,
 *   role?: string,
 *   claimPosture?: string,
 *   lifecycle?: string,
 *   tags?: string[],
 *   supersededBy?: string[],
 *   discoverFor?: string[],
 *   establishes?: string[],
 *   text?: string,
 * }} ReferenceSearchDocument
 *
 * @typedef {{ field: string, value: string }} MatchReason
 * @typedef {{
 *   document: ReferenceSearchDocument,
 *   score: number,
 *   reasons: MatchReason[],
 * }} RankedReference
 */

const stopWords = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "but",
  "by",
  "can",
  "did",
  "do",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "me",
  "my",
  "not",
  "of",
  "on",
  "one",
  "or",
  "should",
  "so",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "up",
  "use",
  "used",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

/**
 * Words that say the reader is asking about the past. They reverse the default
 * preference for current material rather than switching corpora: history stays
 * retrievable either way, and this only decides what leads.
 */
const historicalIntentWords = new Set([
  "archived",
  "before",
  "disproven",
  "earlier",
  "formerly",
  "historical",
  "historically",
  "history",
  "incident",
  "old",
  "originally",
  "past",
  "previous",
  "previously",
  "retired",
  "superseded",
  "was",
  "were",
]);

/**
 * Field weights. `discoverFor` is curated for exactly this purpose and leads.
 * `doesNotEstablish` is deliberately unscored: it is a claim boundary, and
 * matching it would rank a document for the very thing it disclaims.
 */
const fieldWeights = {
  discoverFor: 12,
  title: 8,
  summary: 4,
  area: 3,
  establishes: 3,
  tags: 2,
  text: 1,
};

/** @param {string} value */
export function tokenize(value) {
  return (value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (token) => token.length > 1 && !stopWords.has(token),
  );
}

/** @param {string} query */
export function hasHistoricalIntent(query) {
  return tokenize(query).some((token) => historicalIntentWords.has(token));
}

/** @param {ReferenceSearchDocument} document */
function fieldsOf(document) {
  return {
    discoverFor: (document.discoverFor ?? []).join(" "),
    title: document.title,
    summary: document.summary ?? "",
    area: document.area ?? "",
    establishes: (document.establishes ?? []).join(" "),
    tags: (document.tags ?? []).join(" "),
    text: document.text ?? "",
  };
}

/**
 * Ordering for documents of equal lexical relevance. Current project evidence
 * and current operating or synthesis notes precede current explorations, and
 * historical material comes last. This is a discovery safety policy, not a
 * claim that a project is truer than a note.
 *
 * @param {ReferenceSearchDocument} document
 */
function priorityTier(document) {
  const historical = document.lifecycle && document.lifecycle !== "current";
  if (historical) return 3;
  if (document.type === "project") return 0;
  if (document.role === "operating" || document.role === "synthesis") return 1;
  return 2;
}

/**
 * @param {ReferenceSearchDocument} document
 * @param {boolean} historicalIntent
 */
function lifecycleFactor(document, historicalIntent) {
  const lifecycle = document.lifecycle ?? "current";
  if (lifecycle === "current") return historicalIntent ? 0.8 : 1;
  return historicalIntent ? 1.05 : 0.6;
}

/** @param {ReferenceSearchDocument[]} documents */
function inverseDocumentFrequency(documents) {
  const frequency = new Map();

  for (const document of documents) {
    const seen = new Set();
    for (const text of Object.values(fieldsOf(document))) {
      for (const token of tokenize(text)) seen.add(token);
    }
    for (const token of seen) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }

  return (/** @type {string} */ token) =>
    Math.log(1 + documents.length / (1 + (frequency.get(token) ?? 0)));
}

/**
 * Relevance ratio at which a successor is treated as an equally good answer to
 * the same question. Above it, succession decides the order; below it, the
 * successor is answering something else and demoting the predecessor would
 * bury the best match behind documents that merely share a common word.
 */
const successionRelevanceBand = 0.6;

/**
 * A superseded document does not lead its own successor when both are
 * comparably relevant. Lifecycle weighting alone is not enough: a predecessor
 * whose title matches the query can still outscore the current reasoning that
 * replaced it. This reorders rather than rescores, so the relevance signal
 * stays honest and history stays retrievable directly beneath its successor.
 *
 * A predecessor that is overwhelmingly the better match still leads. Its
 * lifecycle travels with it in the result and in the document, which is the
 * authority boundary; ranking is not the place to hide a document that
 * answers the question asked.
 *
 * @param {RankedReference[]} ranked
 */
function applySuccession(ranked) {
  const positions = new Map(
    ranked.map((result, index) => [result.document.id, index]),
  );
  const ordered = [...ranked];
  let moved = true;
  let guard = 0;

  while (moved && guard < ordered.length) {
    moved = false;
    guard += 1;

    for (let index = 0; index < ordered.length; index += 1) {
      const predecessorScore = ordered[index].score;
      const successors = ordered[index].document.supersededBy ?? [];
      const successorIndex = successors
        .map((id) => ordered.findIndex((result) => result.document.id === id))
        .filter(
          (position) =>
            position > -1 &&
            ordered[position].score >=
              predecessorScore * successionRelevanceBand,
        )
        .sort((left, right) => left - right)
        .at(-1);

      if (successorIndex === undefined || successorIndex <= index) continue;

      const [predecessor] = ordered.splice(index, 1);
      ordered.splice(successorIndex, 0, predecessor);
      predecessor.reasons = [
        ...predecessor.reasons,
        {
          field: "lifecycle",
          value: `superseded by ${predecessor.document.supersededBy?.join(", ")}`,
        },
      ];
      moved = true;
      break;
    }
  }

  return positions.size === ordered.length ? ordered : ranked;
}

/**
 * Move excess same-area entries out of the leading window so one cluster of
 * closely related documents cannot occupy every visible result. Displaced
 * entries keep their relative order immediately after the window.
 *
 * @param {RankedReference[]} ranked
 * @param {{ window: number, maxPerArea: number }} options
 */
function diversify(ranked, options) {
  const leading = [];
  const displaced = [];
  const counts = new Map();
  let index = 0;

  while (index < ranked.length && leading.length < options.window) {
    const result = ranked[index];
    const area = result.document.area ?? result.document.type;
    const count = counts.get(area) ?? 0;

    if (count >= options.maxPerArea) {
      displaced.push(result);
    } else {
      counts.set(area, count + 1);
      leading.push(result);
    }
    index += 1;
  }

  return [...leading, ...displaced, ...ranked.slice(index)];
}

/**
 * Rank the corpus against a natural-language query.
 *
 * @param {ReferenceSearchDocument[]} documents
 * @param {string} query
 * @param {{ diversityWindow?: number, maxPerArea?: number }} [options]
 * @returns {RankedReference[]}
 */
export function rankReferences(documents, query, options = {}) {
  const queryTokens = [...new Set(tokenize(query))];
  if (queryTokens.length === 0) return [];

  const idf = inverseDocumentFrequency(documents);
  const historicalIntent = hasHistoricalIntent(query);
  const queryTokenSet = new Set(queryTokens);

  const scored = documents.map((document) => {
    const fields = fieldsOf(document);
    const fieldTokens = Object.fromEntries(
      Object.entries(fields).map(([field, text]) => [
        field,
        new Set(tokenize(text)),
      ]),
    );

    /** @type {MatchReason[]} */
    const reasons = [];
    let score = 0;

    for (const token of queryTokens) {
      for (const [field, weight] of Object.entries(fieldWeights)) {
        if (fieldTokens[field].has(token)) {
          score += weight * idf(token);
        }
      }
    }

    // A curated phrase the query fully covers is the strongest signal the
    // corpus can offer: the author declared this document discoverable for
    // exactly that intent.
    for (const phrase of document.discoverFor ?? []) {
      const phraseTokens = tokenize(phrase);
      if (
        phraseTokens.length > 0 &&
        phraseTokens.every((token) => queryTokenSet.has(token))
      ) {
        score +=
          6 * phraseTokens.reduce((total, token) => total + idf(token), 0);
        reasons.push({ field: "discoverFor", value: phrase });
      }
    }

    for (const [field, weight] of Object.entries(fieldWeights)) {
      if (field === "text") continue;
      const matched = queryTokens.filter((token) =>
        fieldTokens[field].has(token),
      );
      if (matched.length > 0 && weight >= fieldWeights.tags) {
        reasons.push({ field, value: matched.join(", ") });
      }
    }

    return {
      document,
      score: score * lifecycleFactor(document, historicalIntent),
      reasons,
    };
  });

  const ranked = scored
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      // Scores this close are the same relevance as far as a reader is
      // concerned; policy, then id, decides so the order never wobbles.
      if (Math.abs(left.score - right.score) > 1e-9) {
        return right.score - left.score;
      }
      const tiers = priorityTier(left.document) - priorityTier(right.document);
      if (tiers !== 0) return tiers;
      return left.document.id.localeCompare(right.document.id, "en");
    });

  // Explicit historical intent may reverse the default preference, so
  // succession is not enforced when the reader asked about the past.
  const ordered = historicalIntent ? ranked : applySuccession(ranked);

  return diversify(ordered, {
    window: options.diversityWindow ?? 5,
    maxPerArea: options.maxPerArea ?? 2,
  });
}
