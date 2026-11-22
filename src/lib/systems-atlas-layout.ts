import type { SystemsAtlas } from "./systems-atlas";

export const atlasNodeWidth = 166;
export const atlasNodeHeight = 62;
export const atlasViewBox = "0 0 1240 780";

export type AtlasPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function buildAtlasLayout(atlas: SystemsAtlas) {
  const order = [
    "clients",
    "work",
    "execution",
    "experiments",
    "household",
    "infrastructure",
  ];
  const regions = new Map<string, AtlasPosition>();
  const nodes = new Map<string, AtlasPosition>();
  for (const region of atlas.regions) {
    const index = order.indexOf(region.id);
    if (index === -1) {
      throw new Error(
        `Systems atlas region needs an authored position: ${region.id}`,
      );
    }
    const regionNodes = atlas.nodes.filter((node) => node.region === region.id);
    if (regionNodes.length > 6) {
      throw new Error(
        `Systems atlas region ${region.id} exceeds its six-node layout; revise the authored layout before adding another system`,
      );
    }
    const position = {
      x: 18 + (index % 3) * 408,
      y: 14 + Math.floor(index / 3) * 384,
      width: 388,
      height: 350,
    };
    regions.set(region.id, position);
    regionNodes.forEach((node, nodeIndex) => {
      nodes.set(node.id, {
        x: position.x + 20 + (nodeIndex % 2) * 182,
        y: position.y + 94 + Math.floor(nodeIndex / 2) * 80,
        width: atlasNodeWidth,
        height: atlasNodeHeight,
      });
    });
  }
  return { regions, nodes };
}

/** Keep labels in the node, without relying on font-dependent SVG wrapping. */
export function atlasLabelLines(label: string, maxCharacters = 18) {
  const lines: string[] = [];
  for (const word of label.split(/\s+/)) {
    const last = lines.at(-1);
    if (last && `${last} ${word}`.length <= maxCharacters) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

/**
 * Route in the space between rows and territories. The positions never depend
 * on selection, search, or the history toggle, so the map keeps its geography.
 */
export function atlasEdgePath(
  atlas: SystemsAtlas,
  edge: SystemsAtlas["edges"][number],
  layout: ReturnType<typeof buildAtlasLayout>,
) {
  const source = atlas.nodes.find((node) => node.id === edge.from)!;
  const target = atlas.nodes.find((node) => node.id === edge.to)!;
  const a = layout.nodes.get(edge.from)!;
  const b = layout.nodes.get(edge.to)!;
  const ra = layout.regions.get(source.region)!;
  const rb = layout.regions.get(target.region)!;
  const ax = a.x + a.width / 2;
  const bx = b.x + b.width / 2;
  const ay = a.y + a.height;
  const by = b.y;

  if (source.region === target.region) {
    if (a.x === b.x && Math.abs(a.y - b.y) <= 80) {
      return a.y < b.y
        ? `M ${ax} ${ay} V ${by}`
        : `M ${ax} ${a.y} V ${b.y + b.height}`;
    }
    if (a.x !== b.x) {
      const direction = a.x < b.x ? 1 : -1;
      const sx = direction > 0 ? a.x + a.width : a.x;
      const ex = direction > 0 ? b.x : b.x + b.width;
      const middle = (sx + ex) / 2;
      return `M ${sx} ${a.y + a.height / 2} H ${middle} V ${b.y + b.height / 2} H ${ex}`;
    }
    const gutter = a.x < ra.x + ra.width / 2 ? ra.x + 9 : ra.x + ra.width - 9;
    return `M ${ax} ${ay} V ${ay + 8} H ${gutter} V ${by - 8} H ${bx} V ${by}`;
  }

  const rightward = rb.x > ra.x;
  const sourceGutter = rightward ? ra.x + ra.width + 9 : ra.x - 9;
  const targetGutter = rightward ? rb.x - 9 : rb.x + rb.width + 9;
  if (ra.y === rb.y) {
    const middle = (sourceGutter + targetGutter) / 2;
    return `M ${ax} ${ay} V ${ay + 8} H ${middle} V ${by - 8} H ${bx} V ${by}`;
  }
  const corridor = 382;
  return `M ${ax} ${ay} V ${ay + 8} H ${sourceGutter} V ${corridor} H ${targetGutter} V ${by - 8} H ${bx} V ${by}`;
}
