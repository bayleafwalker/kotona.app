import type { KnowledgeCluster } from "../data/knowledge-clusters";

export const knowledgeEdgeTypes = [
  "relates",
  "project-membership",
  "superseded-by",
  "invalidated-by-project",
] as const;

export type KnowledgeEdgeType = (typeof knowledgeEdgeTypes)[number];

type Reference = { id: string };
type SourceEntry = {
  id: string;
  collection: "notes" | "projects";
  data: {
    title: string;
    summary?: string;
    draft?: boolean;
    tags?: string[];
    area?: string;
    role?: string;
    status?: string;
    lifecycle?: string;
    projects?: Reference[];
    relates?: Reference[];
    supersededBy?: Reference[];
    invalidatedByProjects?: Reference[];
  };
};

export type KnowledgeNode = {
  id: string;
  type: "note" | "project";
  title: string;
  summary: string;
  href: string;
  cluster: string;
  tags: string[];
  area?: string;
  role?: string;
  status?: string;
  lifecycle: string;
  anchor: boolean;
  x: number;
  y: number;
};

export type KnowledgeEdge = {
  source: string;
  target: string;
  type: KnowledgeEdgeType;
  directed: boolean;
};

export type KnowledgeGraph = {
  version: 1;
  clusters: Array<Pick<KnowledgeCluster, "id" | "label" | "summary">>;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

function clusterFor(entry: SourceEntry, clusters: KnowledgeCluster[]) {
  const override = clusters.find((cluster) =>
    cluster.overrides.includes(entry.id),
  );
  if (override) return override;

  const areaMatch = clusters.find((cluster) =>
    entry.data.area ? cluster.areas.includes(entry.data.area) : false,
  );
  if (areaMatch) return areaMatch;

  const tags = entry.data.tags ?? [];
  return clusters.find((cluster) =>
    cluster.strongTags.some((tag) => tags.includes(tag)),
  );
}

function coordinates(
  index: number,
  count: number,
  region: { x: number; y: number },
) {
  if (count === 1) return region;
  const ring = Math.floor(index / 8);
  const position = index % 8;
  const positionsInRing = Math.min(8, count - ring * 8);
  const angle = (position / positionsInRing) * Math.PI * 2 - Math.PI / 2;
  const radius = 54 + ring * 34;
  return {
    x: Math.round(region.x + Math.cos(angle) * radius),
    y: Math.round(region.y + Math.sin(angle) * radius),
  };
}

export function buildKnowledgeGraph(
  entries: SourceEntry[],
  clusters: KnowledgeCluster[],
): KnowledgeGraph {
  const published = entries.filter((entry) => !entry.data.draft);
  const byId = new Map(published.map((entry) => [entry.id, entry]));
  if (byId.size !== published.length)
    throw new Error("Knowledge graph contains duplicate node IDs");

  const grouped = new Map<string, SourceEntry[]>();
  for (const entry of published) {
    const cluster = clusterFor(entry, clusters);
    if (!cluster)
      throw new Error(`Published entry has no knowledge cluster: ${entry.id}`);
    const group = grouped.get(cluster.id) ?? [];
    group.push(entry);
    grouped.set(cluster.id, group);
  }

  const nodes: KnowledgeNode[] = [];
  for (const cluster of clusters) {
    const entriesInCluster = (grouped.get(cluster.id) ?? []).sort(
      (left, right) => {
        const leftAnchor = cluster.anchors.indexOf(left.id);
        const rightAnchor = cluster.anchors.indexOf(right.id);
        if (leftAnchor !== -1 || rightAnchor !== -1) {
          if (leftAnchor === -1) return 1;
          if (rightAnchor === -1) return -1;
          return leftAnchor - rightAnchor;
        }
        return left.data.title.localeCompare(right.data.title);
      },
    );
    if (entriesInCluster.length === 0)
      throw new Error(
        `Knowledge cluster contains no published nodes: ${cluster.id}`,
      );
    entriesInCluster.forEach((entry, index) => {
      const point = coordinates(index, entriesInCluster.length, cluster.region);
      nodes.push({
        id: entry.id,
        type: entry.collection === "notes" ? "note" : "project",
        title: entry.data.title,
        summary: entry.data.summary ?? "",
        href: `/${entry.collection}/${entry.id}/`,
        cluster: cluster.id,
        tags: [...(entry.data.tags ?? [])].sort(),
        area: entry.data.area,
        role: entry.data.role,
        status: entry.data.status,
        lifecycle: entry.data.lifecycle ?? "current",
        anchor: cluster.anchors.includes(entry.id),
        ...point,
      });
    });
  }

  const edges = new Map<string, KnowledgeEdge>();
  const addEdge = (
    source: string,
    target: string,
    type: KnowledgeEdgeType,
    directed: boolean,
  ) => {
    if (!byId.has(source) || !byId.has(target))
      throw new Error(
        `Published edge points to missing or draft node: ${source} -> ${target}`,
      );
    const ends =
      directed || source < target ? [source, target] : [target, source];
    const key = `${type}:${ends[0]}:${ends[1]}`;
    edges.set(key, { source: ends[0], target: ends[1], type, directed });
  };

  for (const entry of published.filter((item) => item.collection === "notes")) {
    for (const target of entry.data.relates ?? [])
      addEdge(entry.id, target.id, "relates", false);
    for (const target of entry.data.projects ?? [])
      addEdge(entry.id, target.id, "project-membership", true);
    for (const target of entry.data.supersededBy ?? [])
      addEdge(entry.id, target.id, "superseded-by", true);
    for (const target of entry.data.invalidatedByProjects ?? []) {
      addEdge(target.id, entry.id, "invalidated-by-project", true);
    }
  }

  return {
    version: 1,
    clusters: clusters.map(({ id, label, summary }) => ({
      id,
      label,
      summary,
    })),
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    edges: [...edges.values()].sort((left, right) =>
      `${left.type}:${left.source}:${left.target}`.localeCompare(
        `${right.type}:${right.source}:${right.target}`,
      ),
    ),
  };
}
