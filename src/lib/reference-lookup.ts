import { getCollection } from "astro:content";

import {
  projectReferenceDocument,
  type ReferenceDocument,
} from "./reference-index";

export type ReferenceCollection = "notes" | "projects";

type Entry = {
  id: string;
  collection: ReferenceCollection;
  data: { draft?: boolean; explorePrompt?: string; [key: string]: unknown };
};

let entriesByKey: Map<string, Entry> | undefined;

/**
 * Drafts are absent here in every environment, not only in production builds.
 * A reference resource is a published contract; a locally visible draft page
 * must not acquire one.
 */
async function loadEntries() {
  if (entriesByKey) return entriesByKey;

  const entries = [
    ...(await getCollection("notes")),
    ...(await getCollection("projects")),
  ] as unknown as Entry[];

  entriesByKey = new Map(
    entries
      .filter((entry) => !entry.data.draft)
      .map((entry) => [`${entry.collection}/${entry.id}`, entry]),
  );

  return entriesByKey;
}

export async function findReference(
  collection: ReferenceCollection,
  slug: string,
  baseUrl: URL,
): Promise<{ document: ReferenceDocument; prompt?: string } | undefined> {
  const entry = (await loadEntries()).get(`${collection}/${slug}`);
  if (!entry) return undefined;

  const document = projectReferenceDocument(
    entry as Parameters<typeof projectReferenceDocument>[0],
    baseUrl,
  );
  if (!document) return undefined;

  return { document, prompt: entry.data.explorePrompt };
}
