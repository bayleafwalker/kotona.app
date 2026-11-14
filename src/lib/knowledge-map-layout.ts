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

/** Growing the top reservation must not crop the existing bottom edge. */
export function knowledgeMapViewBox(headingBaselines: number[]) {
  const top = Math.min(-84, ...headingBaselines.map((y) => Math.floor(y - 20)));
  return `0 ${top} 1000 ${620 - top}`;
}
