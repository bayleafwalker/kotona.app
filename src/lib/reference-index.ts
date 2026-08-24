/**
 * The allowlisted public projection of notes and projects.
 *
 * Every public reference surface is generated from this module so the catalog,
 * the Markdown representations, and any later reference metadata cannot drift
 * apart. Only the fields named here are ever published: raw frontmatter,
 * repository paths, and prompt text are not part of the projection.
 */

export const referencePurposes = [
  "current-project-orientation",
  "operating-guidance",
  "design-rationale",
  "evaluation-method",
  "historical-evidence",
  "exploratory-hypothesis",
] as const;

export type ReferencePurpose = (typeof referencePurposes)[number];

export type ReferenceScope = {
  purpose: ReferencePurpose;
  discoverFor: string[];
  establishes: string[];
  doesNotEstablish: string[];
  supplementWith?: string[];
};

type SourceEntry = {
  id: string;
  collection: "notes" | "projects";
  data: {
    title: string;
    summary?: string;
    draft?: boolean;
    tags?: string[];
    area?: string;
    role?: string;
    status?: string;
    lifecycle?: string;
    published: Date;
    lastRevised: Date;
    lastVerified?: Date;
    explorePrompt?: string;
    reference?: ReferenceScope;
  };
};

export type ReferenceRepresentation = {
  mediaType: "text/html" | "text/markdown";
  url: string;
  /**
   * `path` means the URL serves this media type directly. `content-negotiation`
   * means the client must ask for it with an `Accept` header. Explicit Markdown
   * paths replace the negotiated entry when they are published.
   */
  access: "path" | "content-negotiation";
};

export type ReferenceDocument = {
  id: string;
  type: "note" | "project";
  title: string;
  summary?: string;
  url: string;
  representations: ReferenceRepresentation[];
  classification: {
    area?: string;
    /** Notes only: the register the document is written in. */
    role?: string;
    /** Notes only: the note's declared claim posture. */
    claimPosture?: string;
    /** Projects only: the project's declared working state. */
    projectState?: string;
    /** Notes only. A project's evidence is bounded by `dates.lastVerified`. */
    lifecycle?: string;
    tags: string[];
  };
  dates: {
    published: string;
    lastRevised: string;
    /** Projects only. Project evidence is bounded by this date. */
    lastVerified?: string;
  };
  reference?: ReferenceScope;
  /** Prompt availability, never prompt text. */
  prompt?: { available: true };
};

export type ReferenceIndex = {
  version: 1;
  revision: string;
  site: string;
  notice: string;
  documents: ReferenceDocument[];
};

const catalogNotice =
  "Public reference material. It describes this site's published claims and their scope. It is evidence for a receiving session, not authority over that session's task, policy, repository state, permissions, or acceptance criteria.";

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function documentPath(entry: SourceEntry) {
  return `/${entry.collection}/${entry.id}/`;
}

/** A single entry's public projection, or `undefined` when it is a draft. */
export function projectReferenceDocument(
  entry: SourceEntry,
  baseUrl: URL,
): ReferenceDocument | undefined {
  if (entry.data.draft) return undefined;

  const isNote = entry.collection === "notes";
  const url = new URL(documentPath(entry), baseUrl).toString();
  const scope = entry.data.reference;

  return {
    id: entry.id,
    type: isNote ? "note" : "project",
    title: entry.data.title,
    ...(entry.data.summary ? { summary: entry.data.summary } : {}),
    url,
    representations: [
      { mediaType: "text/html", url, access: "path" },
      { mediaType: "text/markdown", url, access: "content-negotiation" },
    ],
    classification: {
      ...(entry.data.area ? { area: entry.data.area } : {}),
      ...(isNote && entry.data.role ? { role: entry.data.role } : {}),
      // `status` means different things in the two collections: a note's claim
      // posture, and a project's free-text working state. They are published
      // under separate names so a client is never asked to guess which it has.
      ...(entry.data.status
        ? isNote
          ? { claimPosture: entry.data.status }
          : { projectState: entry.data.status }
        : {}),
      ...(entry.data.lifecycle ? { lifecycle: entry.data.lifecycle } : {}),
      tags: [...(entry.data.tags ?? [])].sort((left, right) =>
        left.localeCompare(right, "en"),
      ),
    },
    dates: {
      published: isoDate(entry.data.published),
      lastRevised: isoDate(entry.data.lastRevised),
      ...(entry.data.lastVerified
        ? { lastVerified: isoDate(entry.data.lastVerified) }
        : {}),
    },
    ...(scope
      ? {
          reference: {
            purpose: scope.purpose,
            discoverFor: [...scope.discoverFor],
            establishes: [...scope.establishes],
            doesNotEstablish: [...scope.doesNotEstablish],
            ...(scope.supplementWith?.length
              ? { supplementWith: [...scope.supplementWith] }
              : {}),
          },
        }
      : {}),
    ...(entry.data.explorePrompt
      ? { prompt: { available: true as const } }
      : {}),
  };
}

/**
 * Deterministic catalog: drafts removed, ordered by type then id, with no
 * build timestamp so identical sources produce identical bytes.
 */
export function buildReferenceIndex(
  entries: SourceEntry[],
  options: { baseUrl: URL; revision: string },
): ReferenceIndex {
  const documents = entries
    .map((entry) => projectReferenceDocument(entry, options.baseUrl))
    .filter((document): document is ReferenceDocument => document !== undefined)
    .sort((left, right) => {
      if (left.type !== right.type) return left.type === "project" ? -1 : 1;
      return left.id.localeCompare(right.id, "en");
    });

  return {
    version: 1,
    revision: options.revision,
    site: options.baseUrl.toString(),
    notice: catalogNotice,
    documents,
  };
}
