import type { APIRoute } from "astro";

import { buildRevision } from "../build";
import { siteConfig } from "../site";

export const GET: APIRoute = () => {
  const source = /^[0-9a-f]{40}$/i.test(buildRevision)
    ? `https://github.com/bayleafwalker/kotona.app/commit/${buildRevision}`
    : null;

  return new Response(
    JSON.stringify({
      revision: buildRevision,
      source,
      site: siteConfig.siteUrl,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
};
