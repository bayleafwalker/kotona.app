import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { buildReferenceIndex } from "../lib/reference-index";
import { buildRevision } from "../build";
import { siteConfig } from "../site";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(siteConfig.siteUrl);
  const entries = [
    ...(await getCollection("notes")),
    ...(await getCollection("projects")),
  ];
  const index = buildReferenceIndex(entries, {
    baseUrl,
    revision: buildRevision,
  });

  return new Response(JSON.stringify(index, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
