import { getCollection, type CollectionEntry } from "astro:content";

import { getPublishedEntries } from "./content";
import { projectTags, tagSlug } from "./tag-slug.js";

export type TagRecord = {
  label: string;
  slug: string;
  notes: CollectionEntry<"notes">[];
  projects: CollectionEntry<"projects">[];
};

export async function getTagRecords() {
  const notes = getPublishedEntries(await getCollection("notes"));
  const projects = getPublishedEntries(await getCollection("projects"));
  const records = new Map<string, TagRecord>();

  const recordFor = (label: string) => {
    const slug = tagSlug(label);
    const existing = records.get(slug);

    if (existing) return existing;

    const record: TagRecord = { label, slug, notes: [], projects: [] };
    records.set(slug, record);
    return record;
  };

  for (const note of notes) {
    for (const tag of note.data.tags) {
      recordFor(tag).notes.push(note);
    }
  }

  for (const project of projects) {
    for (const tag of projectTags(project.data)) {
      recordFor(tag).projects.push(project);
    }
  }

  for (const record of records.values()) {
    record.notes.sort(
      (left, right) =>
        right.data.published.getTime() - left.data.published.getTime() ||
        left.data.title.localeCompare(right.data.title),
    );
    record.projects.sort(
      (left, right) =>
        right.data.lastVerified.getTime() - left.data.lastVerified.getTime() ||
        left.data.title.localeCompare(right.data.title),
    );
  }

  return [...records.values()].sort((left, right) =>
    left.label.localeCompare(right.label),
  );
}
