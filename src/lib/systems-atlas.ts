import { atlasDefinition } from "../data/systems-atlas.ts";

export type AtlasCollection = "notes" | "projects";
export type AtlasReference = { collection: AtlasCollection; id: string };
export type AtlasLink = { label: string; href: string };
export type AtlasSource = AtlasReference & {
  title: string;
  href: string;
  summary?: string;
  lifecycle: string;
  status?: string;
  lastRevised?: string;
  lastVerified?: string;
};
export type AtlasRegion = { id: string; title: string; summary: string };
export type AtlasBasis = {
  kind: "source" | "proposal" | "historical";
  summary: string;
};
export type AtlasNodeDefinition = {
  id: string;
  title: string;
  summary: string;
  kind:
    | "project"
    | "component"
    | "service"
    | "interface"
    | "environment"
    | "concept"
    | "tool";
  region: string;
  stewardship: "built" | "operated" | "used" | "explored";
  lifecycle: "active" | "maintained" | "dormant" | "retired";
  maturity:
    | "concept"
    | "scaffold"
    | "prototype"
    | "implemented"
    | "documented"
    | "historical";
  basis: AtlasBasis;
  sources: AtlasReference[];
  links: AtlasLink[];
};
export type AtlasNode = Omit<AtlasNodeDefinition, "sources"> & {
  sources: AtlasSource[];
};
export type AtlasInterface = {
  purpose: string;
  caller: string;
  payload: string;
  outcome: string;
  authority: string;
};
export type AtlasEdgeDefinition = {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: "technical" | "conceptual" | "historical";
  state: "documented" | "proposed" | "historical";
  summary: string;
  interface?: AtlasInterface;
  sources: AtlasReference[];
};
export type AtlasEdge = Omit<AtlasEdgeDefinition, "sources"> & {
  sources: AtlasSource[];
};
export type AtlasRoute = {
  id: string;
  title: string;
  question: string;
  summary: string;
  nodeIds: string[];
  edgeIds: string[];
  steps: { nodeId: string; title: string; summary: string }[];
  includeHistory: boolean;
};
export type AtlasDefinition = {
  title: string;
  summary: string;
  regions: AtlasRegion[];
  nodes: AtlasNodeDefinition[];
  edges: AtlasEdgeDefinition[];
  routes: AtlasRoute[];
};
export type SystemsAtlas = Omit<AtlasDefinition, "nodes" | "edges"> & {
  version: 1;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
};
export type AtlasContentEntry = {
  id: string;
  collection: AtlasCollection;
  data: {
    title: string;
    summary?: string;
    draft?: boolean;
    lifecycle?: string;
    status?: string;
    lastRevised?: Date | string;
    lastVerified?: Date | string;
  };
};

export function isHistoricalAtlasEdge(edge: Pick<AtlasEdge, "kind" | "state">) {
  return edge.kind === "historical" || edge.state === "historical";
}

const publicId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function uniqueIds<T extends { id: string }>(items: T[], label: string) {
  const found = new Map<string, T>();
  for (const item of items) {
    if (!publicId.test(item.id))
      throw new Error(`Invalid ${label} id: ${item.id}`);
    if (found.has(item.id))
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    found.set(item.id, item);
  }
  return found;
}

function dateString(date: Date | string | undefined) {
  if (!date) return undefined;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf()))
    throw new Error(`Invalid atlas source date: ${date}`);
  return parsed.toISOString().slice(0, 10);
}

function checkLink(link: AtlasLink) {
  if (!link.label.trim()) throw new Error("Atlas link needs a label");
  if (/^\/(?!\/)[A-Za-z0-9_./#?=&%-]*$/.test(link.href)) return;
  try {
    const parsed = new URL(link.href);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password)
      return;
  } catch {
    // The same failure below covers malformed and unsupported links.
  }
  throw new Error(`Unsafe atlas link: ${link.href}`);
}

/**
 * The atlas is a public projection of reviewed architectural declarations.
 * Existing content supplies its titles, publication state and evidence dates;
 * a rebuild never renews those dates or discovers a runtime relationship.
 */
export function buildSystemsAtlas(
  entries: AtlasContentEntry[],
  definition: AtlasDefinition = atlasDefinition,
): SystemsAtlas {
  const content = new Map<string, AtlasContentEntry>();
  for (const entry of entries) {
    const key = `${entry.collection}/${entry.id}`;
    if (content.has(key)) throw new Error(`Duplicate atlas source: ${key}`);
    content.set(key, entry);
  }
  const regions = uniqueIds(definition.regions, "region");
  const nodes = uniqueIds(definition.nodes, "node");
  const edges = uniqueIds(definition.edges, "edge");
  uniqueIds(definition.routes, "route");

  const resolveSources = (refs: AtlasReference[], owner: string) => {
    const seen = new Set<string>();
    return refs.map((ref): AtlasSource => {
      const key = `${ref.collection}/${ref.id}`;
      if (seen.has(key))
        throw new Error(`Duplicate source on ${owner}: ${key}`);
      seen.add(key);
      const entry = content.get(key);
      if (!entry || entry.data.draft)
        throw new Error(`Missing or draft source on ${owner}: ${key}`);
      return {
        ...ref,
        title: entry.data.title,
        href: `/${ref.collection}/${ref.id}/`,
        ...(entry.data.summary ? { summary: entry.data.summary } : {}),
        lifecycle: entry.data.lifecycle ?? "current",
        ...(entry.data.status ? { status: entry.data.status } : {}),
        ...(entry.data.lastRevised
          ? { lastRevised: dateString(entry.data.lastRevised) }
          : {}),
        ...(entry.data.lastVerified
          ? { lastVerified: dateString(entry.data.lastVerified) }
          : {}),
      };
    });
  };

  const resolvedNodes = definition.nodes.map((node): AtlasNode => {
    if (!regions.has(node.region))
      throw new Error(`Unknown region on ${node.id}: ${node.region}`);
    if (!node.basis.summary.trim())
      throw new Error(`Missing claim basis on node: ${node.id}`);
    if (node.basis.kind !== "proposal" && node.sources.length === 0)
      throw new Error(`Source-backed node needs a source: ${node.id}`);
    if (
      node.basis.kind === "proposal" &&
      !["concept", "scaffold"].includes(node.maturity)
    )
      throw new Error(`Proposed node cannot imply implementation: ${node.id}`);
    if (
      (node.lifecycle === "retired" ||
        node.basis.kind === "historical" ||
        node.maturity === "historical") &&
      !(
        node.lifecycle === "retired" &&
        node.basis.kind === "historical" &&
        node.maturity === "historical"
      )
    )
      throw new Error(`Retired node needs historical scope: ${node.id}`);
    node.links.forEach(checkLink);
    return {
      ...node,
      basis: { ...node.basis },
      sources: resolveSources(node.sources, node.id),
      links: node.links.map((link) => ({ ...link })),
    };
  });

  const resolvedEdges = definition.edges.map((edge): AtlasEdge => {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    if (!from || !to) throw new Error(`Unknown edge endpoint: ${edge.id}`);
    if (edge.from === edge.to)
      throw new Error(`Self edge is not an atlas relationship: ${edge.id}`);
    if (edge.state !== "proposed" && edge.sources.length === 0)
      throw new Error(`Documented edge needs a source: ${edge.id}`);
    if (
      edge.state === "documented" &&
      (from.basis.kind === "proposal" || to.basis.kind === "proposal")
    )
      throw new Error(`Documented edge reaches a proposed node: ${edge.id}`);
    if (
      (from.lifecycle === "retired" || to.lifecycle === "retired") &&
      (edge.kind !== "historical" || edge.state !== "historical")
    )
      throw new Error(
        `Retired endpoint needs historical relationship: ${edge.id}`,
      );
    if ((edge.kind === "historical") !== (edge.state === "historical"))
      throw new Error(`Inconsistent historical relationship: ${edge.id}`);
    if (edge.interface) {
      const fields = [
        "purpose",
        "caller",
        "payload",
        "outcome",
        "authority",
      ] as const;
      for (const name of fields) {
        if (!edge.interface[name]?.trim())
          throw new Error(`Empty interface ${name} on ${edge.id}`);
      }
    }
    return {
      ...edge,
      ...(edge.interface ? { interface: { ...edge.interface } } : {}),
      sources: resolveSources(edge.sources, edge.id),
    };
  });

  for (const route of definition.routes) {
    if (!route.steps.length || !route.nodeIds.length)
      throw new Error(`Route needs steps and nodes: ${route.id}`);
    if (new Set(route.nodeIds).size !== route.nodeIds.length)
      throw new Error(`Duplicate route node: ${route.id}`);
    if (new Set(route.edgeIds).size !== route.edgeIds.length)
      throw new Error(`Duplicate route edge: ${route.id}`);
    for (const id of route.nodeIds) {
      const node = nodes.get(id);
      if (!node) throw new Error(`Unknown route node on ${route.id}: ${id}`);
      if (node.lifecycle === "retired" && !route.includeHistory)
        throw new Error(`Route must opt into history: ${route.id}`);
    }
    for (const id of route.edgeIds) {
      const edge = edges.get(id);
      if (!edge) throw new Error(`Unknown route edge on ${route.id}: ${id}`);
      if (isHistoricalAtlasEdge(edge) && !route.includeHistory)
        throw new Error(`Route must opt into history: ${route.id}`);
      if (
        !route.nodeIds.includes(edge.from) ||
        !route.nodeIds.includes(edge.to)
      )
        throw new Error(`Route omits edge endpoint on ${route.id}: ${id}`);
    }
    for (const step of route.steps) {
      if (!route.nodeIds.includes(step.nodeId))
        throw new Error(
          `Step is outside its route: ${route.id}/${step.nodeId}`,
        );
    }
  }

  return {
    version: 1,
    title: definition.title,
    summary: definition.summary,
    regions: definition.regions.map((region) => ({ ...region })),
    nodes: resolvedNodes,
    edges: resolvedEdges,
    routes: definition.routes.map((route) => ({
      ...route,
      nodeIds: [...route.nodeIds],
      edgeIds: [...route.edgeIds],
      steps: route.steps.map((step) => ({ ...step })),
    })),
  };
}

/** Backlinks include relationships whose reasoning cites the document. */
export function getAtlasMentions(
  atlas: SystemsAtlas,
  collection: AtlasCollection,
  id: string,
) {
  const mentions = (entry: { sources: AtlasSource[] }) =>
    entry.sources.some(
      (source) => source.collection === collection && source.id === id,
    );
  return {
    nodes: atlas.nodes.filter(mentions),
    edges: atlas.edges.filter(mentions),
  };
}

/** A shared visibility rule for current and explicitly historical projections. */
export function getVisibleAtlas(atlas: SystemsAtlas, includeHistory = false) {
  const nodes = atlas.nodes.filter(
    (node) => includeHistory || node.lifecycle !== "retired",
  );
  const ids = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    edges: atlas.edges.filter(
      (edge) =>
        (includeHistory || !isHistoricalAtlasEdge(edge)) &&
        ids.has(edge.from) &&
        ids.has(edge.to),
    ),
  };
}
