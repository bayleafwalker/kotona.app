import { getCollection } from "astro:content";

import { buildSystemsAtlas } from "./systems-atlas";

/** Read the same public records for the map and its contextual entry points. */
export async function readSystemsAtlas() {
  const [notes, projects] = await Promise.all([
    getCollection("notes"),
    getCollection("projects"),
  ]);
  return buildSystemsAtlas([...notes, ...projects]);
}
