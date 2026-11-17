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
