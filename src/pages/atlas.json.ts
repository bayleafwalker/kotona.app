import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { buildSystemsAtlas } from "../lib/systems-atlas";

export const prerender = true;

export const GET: APIRoute = async () => {
  const entries = [
    ...(await getCollection("notes")),
    ...(await getCollection("projects")),
  ];
  return new Response(JSON.stringify(buildSystemsAtlas(entries), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
