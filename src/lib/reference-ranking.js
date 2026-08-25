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
 *   terms?: string,
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
 *
 * `text` and `terms` are two ways to carry the same prose evidence, and a
 * corpus supplies whichever it can afford. `text` is a whole document body,
 * which the retrieval harness holds because it fetches every public Markdown
 * resource. `terms` is a distinctive-term extract, which is what a page can
 * ship to a browser. They score alike and differ only in how term rarity is
 * measured; see `inverseDocumentFrequency`.
 */
const fieldWeights = {
  discoverFor: 12,
  title: 8,
  summary: 4,
  area: 3,
  establishes: 3,
  tags: 2,
  text: 1,
  terms: 1,
};

/** Every word in the query, including the ones scoring ignores. */
function words(value) {
  return value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** @param {string} value */
export function tokenize(value) {
  return words(value).filter(
    (token) => token.length > 1 && !stopWords.has(token),
  );
}

/**
 * Read intent from the raw words. Several past-tense markers are also stop
 * words, so asking the scoring tokenizer would silently ignore them and the
 * intent list would claim to handle words it never sees.
 *
 * @param {string} query
 */
export function hasHistoricalIntent(query) {
  return words(query).some((word) => historicalIntentWords.has(word));
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
    terms: document.terms ?? "",
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

/**
 * Term rarity over a chosen set of fields.
 *
 * A whole body is part of the corpus, so it counts towards rarity for every
 * field: where bodies are present, a word common in them is common, and
 * discounting it is the point of the measure.
 *
 * A `terms` extract is not. It has already been filtered for rarity, so it is
 * a biased sample of the corpus -- it holds a document's rare words and drops
 * its common ones -- and counting it would let prose re-price curated fields
 * against a sample that cannot answer for them. Measured that way, indexing
 * extracts cost a note its lead: the word its author declared it discoverable
 * for appeared in a handful of other documents' extracts, its rarity fell, and
 * a note matching commoner words on weaker fields passed it. So curated fields
 * are priced among curated fields, while a `terms` match is priced against
 * everything, which is the honest measure of what a prose match distinguishes.
 *
 * @param {ReferenceSearchDocument[]} documents
 * @param {(field: string) => boolean} includes
 */
function inverseDocumentFrequency(documents, includes) {
  const frequency = new Map();

  for (const document of documents) {
    const seen = new Set();
    for (const [field, text] of Object.entries(fieldsOf(document))) {
      if (!includes(field)) continue;
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
 * Surface the declared successors of a superseded document that leads.
 *
 * `applySuccession` only reorders documents that are already comparably
 * relevant to each other, which is right when both answer the same question.
 * It cannot help the case where the query names a superseded document
 * directly: the predecessor is overwhelmingly the best match by every lexical
 * signal, and the successor -- written later, in different words -- scores far
 * below the visible window. The reader is then shown a lifecycle notice
 * pointing at a document the ranking never offers.
 *
 * So when a superseded document appears in the leading window, its declared
 * successors are lifted to sit directly beneath it. This is a discovery
 * obligation rather than a relevance claim: succession is asserted by the
 * corpus, not inferred from the query, and the predecessor keeps its own rank.
 *
 * The successor is taken from `pool`, the full scored set, not from `ranked`.
 * A successor can score exactly zero -- it shares no token with a query that
 * names its predecessor almost verbatim -- and zero-score documents are
 * filtered out before ranking. Reading only from `ranked` therefore worked on
 * corpora rich enough to give the successor some incidental overlap and failed
 * on leaner ones, which is precisely the seam between the retrieval harness
 * and the Explore index. Only a declared successor of a leading predecessor is
 * admitted this way; nothing else re-enters on a zero score.
 *
 * @param {RankedReference[]} ranked
 * @param {{ window: number, pool: Map<string, RankedReference> }} options
 */
function surfaceSuccessors(ranked, options) {
  const present = new Set(ranked.map((result) => result.document.id));
  const lifted = new Set();
  const ordered = [];

  for (const [index, result] of ranked.entries()) {
    if (lifted.has(result.document.id)) continue;
    ordered.push(result);
    if (index >= options.window) continue;

    for (const id of result.document.supersededBy ?? []) {
      if (lifted.has(id)) continue;
      const alreadyAbove = ranked.findIndex(
        (candidate) => candidate.document.id === id,
      );
      if (alreadyAbove > -1 && alreadyAbove <= index) continue;
      const successor = options.pool.get(id);
      if (!successor) continue;
      lifted.add(id);
      ordered.push({
        ...successor,
        reasons: [
          ...successor.reasons,
          { field: "lifecycle", value: `supersedes ${result.document.id}` },
        ],
      });
    }
  }

  // Every ranked entry is kept, plus any successor admitted from the pool.
  const admitted = [...lifted].filter((id) => !present.has(id)).length;
  return ordered.length === ranked.length + admitted ? ordered : ranked;
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

  // Curated fields are priced among themselves; a prose extract is priced
  // against the whole corpus. Both measures over everything let prose re-rank
  // editorial authority.
  const idf = inverseDocumentFrequency(documents, (field) => field !== "terms");
  const termsIdf = inverseDocumentFrequency(documents, () => true);
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
          score += weight * (field === "terms" ? termsIdf(token) : idf(token));
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

    // A curated phrase match already names the phrase. Echoing its own tokens
    // back as a second reason pushes the informative ones out of the two the
    // interface shows. Prose fields are last in the weight order and so are
    // reported last: a prose match is the weakest signal here, and it is the
    // only reason a document has when the query names something no metadata
    // field does.
    const phraseMatched = reasons.length > 0;
    for (const field of Object.keys(fieldWeights)) {
      if (field === "discoverFor" && phraseMatched) continue;
      const matched = queryTokens.filter((token) =>
        fieldTokens[field].has(token),
      );
      if (matched.length > 0) {
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

  // Diversity runs first. It displaces by area alone, so applying it after
  // succession could lift a predecessor back above its own successor and undo
  // the authority ordering. Succession is a claim about authority; diversity
  // is a presentation preference, and the weaker of the two goes first.
  const spread = diversify(ranked, {
    window: options.diversityWindow ?? 5,
    maxPerArea: options.maxPerArea ?? 2,
  });

  // Explicit historical intent may reverse the default preference, so
  // succession is not enforced when the reader asked about the past. The
  // successor is still surfaced either way: knowing where the reasoning went
  // is useful to a historical reading too, and it never displaces the
  // predecessor the reader asked for.
  const authoritative = historicalIntent ? spread : applySuccession(spread);
  return surfaceSuccessors(authoritative, {
    window: options.successorWindow ?? 3,
    pool: new Map(scored.map((result) => [result.document.id, result])),
  });
}
