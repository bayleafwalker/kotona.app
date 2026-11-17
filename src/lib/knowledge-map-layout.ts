export const clusterHeadingLineHeight = 15;

type NodeLabel = { y: number; lines: string[] };
type OccupiedNode = { y: number; label?: NodeLabel };

/** The first baseline used by the SVG's centred, possibly multiline label. */
export function nodeLabelBaseline(label: NodeLabel) {
  return label.y - (label.lines.length - 1) * 6;
}

/** Reserve the entire heading above actual markers and persistent labels. */
export function reserveClusterHeading(
  preferredY: number,
  lineCount: number,
  nodes: OccupiedNode[],
) {
  // Twelve units cover an 8-unit marker plus stroke, or the ascent and
  // painted outline of a 10px node label. Reserve the heading's last line,
  // descender and an 8-unit gap, rather than just its first baseline.
  const occupiedTop = Math.min(
    ...nodes.flatMap((node) => [
      node.y - 12,
      ...(node.label ? [nodeLabelBaseline(node.label) - 12] : []),
    ]),
  );
  return Math.min(
    preferredY,
    occupiedTop - 8 - 4 - (lineCount - 1) * clusterHeadingLineHeight,
  );
}

/** Approximate advance of the map's 12px heading face, in SVG units. */
const clusterHeadingAdvance = 6.8;

export type MapObstacle = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/** The painted box of a marker, including its stroke. */
export function markerObstacle({ x, y }: { x: number; y: number }) {
  return { left: x - 10, right: x + 10, top: y - 10, bottom: y + 10 };
}

/** The box of a node label that is always drawn. */
export function labelObstacle(label: PlacedLabel & { y: number }) {
  const width =
    Math.max(...label.lines.map((line) => line.length)) * nodeLabelAdvance;
  const left =
    label.anchor === "end"
      ? label.x - width
      : label.anchor === "middle"
        ? label.x - width / 2
        : label.x;
  const baseline = nodeLabelBaseline(label);
  return {
    left,
    right: left + width,
    top: baseline - 10,
    bottom: baseline + (label.lines.length - 1) * 12 + 4,
  };
}

function headingBox(x: number, y: number, lines: string[]) {
  const half =
    (Math.max(...lines.map((line) => line.length)) * clusterHeadingAdvance) / 2;
  return {
    left: x - half,
    right: x + half,
    top: y - 12,
    bottom: y + (lines.length - 1) * clusterHeadingLineHeight + 5,
  };
}

/**
 * Move a territory heading the shortest distance that clears every marker and
 * always-drawn label on the map, not only its own cluster's. A neighbouring
 * ring that grows into a heading otherwise draws its nodes through the text.
 * A heading that is already clear does not move.
 */
export function clearClusterHeading(
  heading: { x: number; y: number; lines: string[] },
  obstacles: MapObstacle[],
  clearance = 6,
) {
  const collides = (x: number, y: number) => {
    const box = headingBox(x, y, heading.lines);
    return obstacles.some(
      (obstacle) =>
        obstacle.left < box.right + clearance &&
        box.left - clearance < obstacle.right &&
        obstacle.top < box.bottom + clearance &&
        box.top - clearance < obstacle.bottom,
    );
  };
  if (!collides(heading.x, heading.y)) return { x: heading.x, y: heading.y };

  const candidates: { dx: number; dy: number; cost: number }[] = [];
  for (let dx = -120; dx <= 120; dx += 6) {
    for (let dy = -90; dy <= 90; dy += 6) {
      // Vertical movement costs more: it takes the heading away from the
      // ring it names, while a sideways shift keeps it on the same row.
      candidates.push({ dx, dy, cost: Math.abs(dx) + Math.abs(dy) * 1.5 });
    }
  }
  candidates.sort(
    (left, right) =>
      left.cost - right.cost || left.dy - right.dy || left.dx - right.dx,
  );
  const clear = candidates.find(
    ({ dx, dy }) => !collides(heading.x + dx, heading.y + dy),
  );
  // No clear position within reach: keep the reserved one rather than
  // sending the heading somewhere it no longer reads as this ring's.
  return clear
    ? { x: heading.x + clear.dx, y: heading.y + clear.dy }
    : { x: heading.x, y: heading.y };
}

/** Approximate advance of the map's 10px label face, in SVG units. */
const nodeLabelAdvance = 5.6;

type PlacedLabel = { x: number; anchor: string; lines: string[] };

/**
 * Horizontal extent of every marker and node label. A ring that grows past
 * the nominal 0..1000 canvas has to widen the viewport, or its outermost
 * markers and the labels revealed on hover are cropped at the frame.
 */
export function knowledgeMapExtent(nodes: { x: number; label: PlacedLabel }[]) {
  let left = 0;
  let right = 1000;
  for (const { x, label } of nodes) {
    const width =
      Math.max(...label.lines.map((line) => line.length)) * nodeLabelAdvance;
    const labelLeft =
      label.anchor === "end"
        ? label.x - width
        : label.anchor === "middle"
          ? label.x - width / 2
          : label.x;
    left = Math.min(left, x - 10, labelLeft);
    right = Math.max(right, x + 10, labelLeft + width);
  }
  return { left: Math.floor(left - 12), right: Math.ceil(right + 12) };
}

/** Growing the top reservation must not crop the existing bottom edge. */
export function knowledgeMapViewBox(
  headingBaselines: number[],
  { left, right }: { left: number; right: number } = { left: 0, right: 1000 },
) {
  const top = Math.min(-84, ...headingBaselines.map((y) => Math.floor(y - 20)));
  return `${left} ${top} ${right - left} ${620 - top}`;
}
