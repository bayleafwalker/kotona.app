/**
 * Redirect the legacy www hostname to the canonical apex while preserving the
 * request scheme, path, and query string.
 *
 * @param {Request} request
 * @returns {Response | null}
 */
export function canonicalHostRedirect(request) {
  const url = new globalThis.URL(request.url);

  if (url.hostname !== "www.kotona.app") {
    return null;
  }

  url.hostname = "kotona.app";
  return globalThis.Response.redirect(url.toString(), 308);
}
