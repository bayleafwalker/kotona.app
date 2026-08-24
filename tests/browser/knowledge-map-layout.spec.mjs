import { expect, test } from "@playwright/test";

/**
 * The map is laid out in fixed SVG coordinates, so a collision between a
 * cluster heading and a node label is a real defect at every viewport rather
 * than a responsive edge case. Nothing outside a browser measures rendered
 * text, so this is the only suite that can catch it.
 *
 * The map is hidden on narrow viewports, where the grouped index takes over,
 * so these widths stay in the range where the map is actually drawn.
 */
const widths = [1440, 1363, 1024];

for (const width of widths) {
  test(`no cluster heading collides with a node label at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/explore/");
    await expect(page.locator(".knowledge-map-frame svg")).toBeVisible();

    const { clusters, nodes } = await page.evaluate(() => {
      const measure = (element) => {
        const box = element.getBoundingClientRect();
        return {
          text: element.textContent.trim().replace(/\s+/g, " "),
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        clusters: [
          ...document.querySelectorAll(".knowledge-cluster-label"),
        ].map(measure),
        nodes: [...document.querySelectorAll(".knowledge-node-label")].map(
          measure,
        ),
      };
    });

    expect(clusters.length).toBeGreaterThan(0);
    expect(nodes.length).toBeGreaterThan(0);

    const intersects = (left, right) =>
      left.x < right.x + right.width &&
      right.x < left.x + left.width &&
      left.y < right.y + right.height &&
      right.y < left.y + left.height;

    const collisions = clusters.flatMap((cluster) =>
      nodes
        .filter((node) => intersects(cluster, node))
        .map((node) => `"${cluster.text}" overlaps "${node.text}"`),
    );

    expect(collisions).toEqual([]);
  });
}
