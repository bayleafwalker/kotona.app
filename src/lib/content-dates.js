const siteTimeZone = "Europe/Helsinki";

/**
 * Display content dates in the site's calendar, independent of the build host.
 * @param {Date} date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    timeZone: siteTimeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * An ISO calendar date for date-only public projections, not a sorting key.
 * @param {Date} date
 */
export function siteDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: siteTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}
