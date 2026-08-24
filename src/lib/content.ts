export function sortByDateAndTitle<
  T extends { data: { date: Date; title: string } },
>(entries: T[]) {
  return [...entries].sort((left, right) => {
    const leftTime = left.data.date.getTime();
    const rightTime = right.data.date.getTime();

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.data.title.localeCompare(right.data.title);
  });
}

export function sortByLastVerifiedAndTitle<
  T extends { data: { lastVerified: Date; title: string } },
>(entries: T[]) {
  return [...entries].sort((left, right) => {
    const leftTime = left.data.lastVerified.getTime();
    const rightTime = right.data.lastVerified.getTime();

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.data.title.localeCompare(right.data.title);
  });
}

export function getVisibleEntries<T extends { data: { draft?: boolean } }>(
  entries: T[],
) {
  return import.meta.env.PROD
    ? entries.filter((entry) => !entry.data.draft)
    : entries;
}

export function getPublishedEntries<T extends { data: { draft?: boolean } }>(
  entries: T[],
) {
  return entries.filter((entry) => !entry.data.draft);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

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

export function humanizeLabel(value: string) {
  const declared = displayLabels.get(value);
  if (declared) return declared;
  const label = value.replaceAll("-", " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function roleLabel(value: string) {
  return roleLabels.get(value) ?? humanizeLabel(value);
}

export function claimPostureLabel(value: string) {
  return claimPostureLabels.get(value) ?? humanizeLabel(value);
}
