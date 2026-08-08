import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { knowledgeClusters } from "../data/knowledge-clusters";
import { buildKnowledgeGraph } from "../lib/knowledge-map";

export const prerender = true;

export const GET: APIRoute = async () => {
  const entries = [
    ...(await getCollection("notes")),
    ...(await getCollection("projects")),
  ];
  const graph = buildKnowledgeGraph(entries, knowledgeClusters);
  return new Response(JSON.stringify(graph, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
