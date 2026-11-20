import type { CollectionEntry } from "astro:content";

type RevisionData = {
  published: Date;
  lastRevised: Date;
  revisionSummary?: string;
};

/** A dated change in substance; first publication is not a revision. */
export function getMaterialRevision(data: RevisionData) {
  const summary = data.revisionSummary?.trim();
  if (!summary || data.lastRevised.getTime() <= data.published.getTime()) {
    return undefined;
  }
  return { date: data.lastRevised, summary };
}
export type PublicationEvent = {
  date: string;
  entry: string;
  href: string;
  summary?: string;
};

/** Publication, revision and evidence review remain different dated events. */
export function getPublicationEvents(
  notes: readonly CollectionEntry<"notes">[],
  projects: readonly CollectionEntry<"projects">[],
): PublicationEvent[] {
  const events: PublicationEvent[] = [];
  for (const note of notes) {
    if (note.data.draft) continue;
    const href = `/notes/${note.id}/`;
    events.push({
      date: note.data.published.toISOString(),
      entry: `Published note: ${note.data.title}`,
      href,
    });
    const revision = getMaterialRevision(note.data);
    if (revision) {
      events.push({
        date: revision.date.toISOString(),
        entry: `Revised note: ${note.data.title}`,
        href,
        summary: revision.summary,
      });
    }
  }
  for (const project of projects) {
    if (project.data.draft) continue;
    const href = `/projects/${project.id}/`;
    const revision = getMaterialRevision(project.data);
    const sameEvent =
      revision?.date.getTime() === project.data.lastVerified.getTime();
    events.push({
      date: project.data.lastVerified.toISOString(),
      entry: `${sameEvent ? "Revised and checked" : "Checked"} project: ${project.data.title}`,
      href,
      ...(sameEvent && { summary: revision?.summary }),
    });
    if (revision && !sameEvent) {
      events.push({
        date: revision.date.toISOString(),
        entry: `Revised project: ${project.data.title}`,
        href,
        summary: revision.summary,
      });
    }
  }
  return events;
}
