import type { CollectionEntry } from "astro:content";

export type HomepageChange =
  | {
      kind: "note";
      entry: CollectionEntry<"notes">;
      href: string;
      date: Date;
      dateLabel: "Published" | "Revised";
    }
  | {
      kind: "project";
      entry: CollectionEntry<"projects">;
      href: string;
      date: Date;
      dateLabel: "Verified";
    };

/**
 * The homepage follows dated changes to published content, not build dates or
 * permanent feature flags. A verification date retains the project's stated
 * evidence scope; it does not establish live service health.
 */
export function getRecentChanges(
  notes: readonly CollectionEntry<"notes">[],
  projects: readonly CollectionEntry<"projects">[],
  limit = 4,
): HomepageChange[] {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError(
      "Homepage change limit must be a non-negative integer",
    );
  }

  const changes: HomepageChange[] = [];

  for (const entry of notes) {
    // Keep this public projection identical in development and production.
    // Historical notes remain reachable through their archive surfaces.
    if (entry.data.draft || entry.data.lifecycle !== "current") continue;
    changes.push({
      kind: "note",
      entry,
      href: `/notes/${entry.id}/`,
      date: entry.data.lastRevised,
      dateLabel:
        entry.data.lastRevised.getTime() === entry.data.published.getTime()
          ? "Published"
          : "Revised",
    });
  }

  for (const entry of projects) {
    if (entry.data.draft) continue;
    changes.push({
      kind: "project",
      entry,
      href: `/projects/${entry.id}/`,
      date: entry.data.lastVerified,
      dateLabel: "Verified",
    });
  }

  changes.sort(
    (left, right) =>
      right.date.getTime() - left.date.getTime() ||
      right.entry.data.published.getTime() -
        left.entry.data.published.getTime() ||
      left.entry.data.title.localeCompare(right.entry.data.title, "en") ||
      left.kind.localeCompare(right.kind, "en") ||
      left.entry.id.localeCompare(right.entry.id, "en"),
  );

  return changes.slice(0, limit);
}
