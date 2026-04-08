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
