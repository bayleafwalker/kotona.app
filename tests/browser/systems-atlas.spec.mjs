import { URL } from "node:url";

import { expect, test } from "@playwright/test";

const atlasRoot = "[data-systems-atlas]";
const inspector = "[data-atlas-inspector]";

async function atlasData(page) {
  const response = await page.request.get("/atlas.json");
  expect(response.ok()).toBe(true);
  return response.json();
}

async function openAtlas(page, query = "") {
  await page.goto(`/map/${query}`);
  await expect(page.locator(atlasRoot)).toHaveAttribute(
    "data-enhanced",
    "true",
  );
}

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
}

async function selectNode(page, id) {
  const mapNode = page.locator(`[data-atlas-node="${id}"]`);
  if (await mapNode.isVisible()) {
    await mapNode.click();
  } else {
    const button = page.locator(
      `[data-atlas-item="${id}"] [data-node-select="${id}"]`,
    );
    if (!(await button.isVisible())) {
      await page.locator(`[data-atlas-item="${id}"] summary`).click();
    }
    await button.click();
  }
}

async function positionInMap(node) {
  return node.evaluate((element) => {
    const nodeBox = element.getBoundingClientRect();
    const canvasBox = element
      .closest("[data-atlas-canvas]")
      .getBoundingClientRect();
    return { x: nodeBox.x - canvasBox.x, y: nodeBox.y - canvasBox.y };
  });
}

async function expectReadableMapLabels(page) {
  const labels = await page
    .locator("[data-atlas-node]:visible")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const label = node.querySelector(".atlas-node-title");
        const text = label.getBoundingClientRect();
        const shape = node
          .querySelector(".atlas-node-shape")
          .getBoundingClientRect();
        return {
          id: node.getAttribute("data-atlas-node"),
          inside:
            text.left >= shape.left + 3 &&
            text.right <= shape.right - 3 &&
            text.top >= shape.top + 3 &&
            text.bottom <= shape.bottom - 3,
          screenFontSize:
            Number.parseFloat(window.getComputedStyle(label).fontSize) *
            label.getScreenCTM().a,
        };
      }),
    );
  expect(labels.length).toBeGreaterThan(0);
  expect(labels.filter(({ inside }) => !inside)).toEqual([]);
  expect(labels.filter(({ screenFontSize }) => screenFontSize < 11)).toEqual(
    [],
  );
}

test("the selected system exposes its published basis and preserves the URL on reload", async ({
  page,
}) => {
  const atlas = await atlasData(page);
  const node = atlas.nodes.find(({ id }) => id === "vuoro");
  expect(node).toBeDefined();

  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.atlasSecurityViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      // An optional third-party analytics request is unrelated to the atlas.
      if (
        [
          "script-src-elem",
          "script-src-attr",
          "style-src-elem",
          "style-src-attr",
        ].includes(event.effectiveDirective)
      ) {
        window.atlasSecurityViolations.push({
          directive: event.effectiveDirective,
          blocked: event.blockedURI,
        });
      }
    });
  });
  await openAtlas(page);
  await selectNode(page, node.id);
  await expect(page.locator("[data-inspector-title]")).toHaveText(node.title);
  await expect(page.locator(inspector)).toContainText(node.summary);
  for (const source of node.sources) {
    await expect(
      page.locator(`${inspector} a[href="${source.href}"]`).first(),
    ).toBeVisible();
  }
  await expect(page).toHaveURL((url) => url.hash === `#node-${node.id}`);

  await page.reload();
  await expect(page.locator(atlasRoot)).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await expect(page.locator("[data-inspector-title]")).toHaveText(node.title);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => window.atlasSecurityViolations)).toEqual([]);
});

test("short diagram connections can be selected and explain their interface contracts", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const atlas = await atlasData(page);
  for (const id of ["vuoro-sprintctl", "household-device-actions"]) {
    const edge = atlas.edges.find((candidate) => candidate.id === id);
    expect(edge?.interface).toBeDefined();
    await openAtlas(page);
    // These short paths used to sit entirely underneath a later connector's
    // wide hit stroke. A URL or inspector-button test cannot catch that defect.
    await page.locator("[data-atlas-canvas]").scrollIntoViewIfNeeded();
    const point = await page
      .locator(`[data-atlas-edge="${id}"] .atlas-edge-line`)
      .evaluate((path) => {
        const midpoint = path.getPointAtLength(path.getTotalLength() / 2);
        const matrix = path.getScreenCTM();
        return {
          x: matrix.a * midpoint.x + matrix.c * midpoint.y + matrix.e,
          y: matrix.b * midpoint.x + matrix.d * midpoint.y + matrix.f,
        };
      });
    // Pointer input uses the rendered line, including for a horizontal SVG
    // path whose geometric bounding box has zero height. No forced event.
    await page.mouse.click(point.x, point.y);
    await expect(page).toHaveURL((url) => url.hash === `#edge-${id}`);
    await expect(page.locator(inspector)).toContainText(edge.summary);
    for (const value of Object.values(edge.interface)) {
      await expect(page.locator(inspector)).toContainText(value);
    }
    for (const source of edge.sources) {
      await expect(
        page.locator(`${inspector} a[href="${source.href}"]`).first(),
      ).toBeVisible();
    }
    await page.screenshot({
      path: testInfo.outputPath(`atlas-interface-${id}-1440.png`),
      fullPage: true,
      animations: "disabled",
    });

    await page.reload();
    await expect(page.locator(atlasRoot)).toHaveAttribute(
      "data-enhanced",
      "true",
    );
    await expect(page.locator(inspector)).toContainText(
      edge.interface.authority,
    );
  }
});

test("an authored route highlights its declared systems without relocating them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const atlas = await atlasData(page);
  const route = atlas.routes.find(({ id }) => id === "accepted-work");
  expect(route).toBeDefined();
  await openAtlas(page);

  const before = new Map();
  for (const id of route.nodeIds) {
    before.set(
      id,
      await positionInMap(page.locator(`[data-atlas-node="${id}"]`)),
    );
  }
  await page.locator(`[data-route="${route.id}"]`).click();
  await expect(page.locator(`[data-route="${route.id}"]`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page).toHaveURL((url) => url.hash === `#route-${route.id}`);
  await expect(page.locator("[data-inspector-title]")).toHaveText(
    route.question,
  );
  await expect(page.locator(inspector)).toContainText(route.summary);

  for (const id of route.nodeIds) {
    const node = page.locator(`[data-atlas-node="${id}"]`);
    await expect(node).toHaveAttribute("data-in-route", "true");
    const after = await positionInMap(node);
    const original = before.get(id);
    expect(original).not.toBeNull();
    expect(after).not.toBeNull();
    expect(after.x).toBeCloseTo(original.x, 1);
    expect(after.y).toBeCloseTo(original.y, 1);
  }
  for (const id of route.edgeIds) {
    await expect(page.locator(`[data-atlas-edge="${id}"]`)).toHaveAttribute(
      "data-in-route",
      "true",
    );
  }
});

test("history is explicit, and a direct retired-system link reveals its context", async ({
  page,
}) => {
  const atlas = await atlasData(page);
  const retired = atlas.nodes.find(({ id }) => id === "outctl");
  expect(retired.lifecycle).toBe("retired");

  await openAtlas(page);
  const history = page.getByRole("checkbox", { name: "Show history" });
  await expect(history).not.toBeChecked();
  await expect(page.locator('[data-atlas-node="outctl"]')).not.toBeVisible();
  await expect(page.locator('[data-atlas-item="outctl"]')).not.toBeVisible();

  await history.check();
  await selectNode(page, retired.id);
  await expect(page.locator("[data-inspector-title]")).toHaveText(
    retired.title,
  );
  await expect(page.locator(inspector)).toContainText(/retired/i);
  await history.uncheck();
  await expect(page.locator('[data-atlas-item="outctl"]')).not.toBeVisible();
  await expect(page.locator("[data-inspector-title]")).not.toHaveText(
    retired.title,
  );

  await openAtlas(page, "#node-outctl");
  await expect(history).toBeChecked();
  await expect(page.locator("[data-inspector-title]")).toHaveText(
    retired.title,
  );
  await expect(page.locator(inspector)).toContainText(/retired/i);
});

test("search can find a system, explain an empty result and restore the map", async ({
  page,
}) => {
  await openAtlas(page);
  const search = page.getByRole("searchbox", { name: "Find a system" });
  await search.fill("VUORO");
  await expect(page.locator('[data-atlas-item="vuoro"]')).toBeVisible();
  await expect(page.locator("[data-atlas-result]")).not.toContainText(
    "No systems match",
  );

  await search.fill("there-is-no-system-with-this-name-91c47");
  await expect(page.locator("[data-atlas-result]")).toContainText(
    "No systems match",
  );
  await expect(page.locator("[data-atlas-item]:visible")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator('[data-atlas-item="vuoro"]')).toBeVisible();
  await expect(page.locator("[data-atlas-result]")).not.toContainText(
    "No systems match",
  );
});

test("region focus changes the view and Whole map clears the navigation state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openAtlas(page);
  const canvas = page.locator("[data-atlas-canvas]");
  const overview = await canvas.getAttribute("viewBox");
  await page.locator("[data-region-select]").selectOption("work");
  await expect(page).toHaveURL((url) => url.hash === "#region-work");
  await expect(canvas).not.toHaveAttribute("viewBox", overview);

  await page.reload();
  await expect(page.locator(atlasRoot)).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await expect(page.locator("[data-region-select]")).toHaveValue("work");
  await expect(canvas).not.toHaveAttribute("viewBox", overview);
  await page.getByRole("button", { name: "Whole map", exact: true }).click();
  await expect(canvas).toHaveAttribute("viewBox", overview);
  await expect(page).toHaveURL((url) => url.search === "" && url.hash === "");
});

test("homepage, Explore and source records lead into the same atlas", async ({
  page,
}) => {
  const atlas = await atlasData(page);
  for (const path of ["/", "/explore/"]) {
    await page.goto(path);
    const link = page.locator('main a[href="/map/"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.locator(atlasRoot)).toBeVisible();
  }

  await page.goto("/projects/vuoro/");
  await page.locator("[data-atlas-context] summary").click();
  const backlink = page.locator('a[href="/map/#node-vuoro"]').first();
  await expect(backlink).toBeVisible();
  await backlink.click();
  await expect(page.locator("[data-inspector-title]")).toHaveText("Vuoro");

  const nodeWithNote = atlas.nodes.find(
    (node) =>
      node.lifecycle !== "retired" &&
      node.sources.some((source) => source.collection === "notes"),
  );
  expect(nodeWithNote).toBeDefined();
  const note = nodeWithNote.sources.find(
    (source) => source.collection === "notes",
  );
  await page.goto(note.href);
  await page.locator("[data-atlas-context] summary").click();
  const noteBacklink = page.locator(`a[href="/map/#node-${nodeWithNote.id}"]`);
  await expect(noteBacklink).toBeVisible();
  await noteBacklink.click();
  await expect(page.locator("[data-inspector-title]")).toHaveText(
    nodeWithNote.title,
  );
});

for (const width of [320, 375, 768]) {
  test(`the ${width}px explorer remains readable and can inspect a system`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await openAtlas(page);
    await expect(page.locator("[data-atlas-canvas]")).not.toBeVisible();
    await page.getByRole("searchbox", { name: "Find a system" }).fill("vuoro");
    await selectNode(page, "vuoro");
    await expect(page.locator("[data-inspector-title]")).toHaveText("Vuoro");
    await expectNoHorizontalOverflow(page);

    const labels = await page
      .locator("[data-atlas-item]:visible button")
      .evaluateAll((buttons) =>
        buttons.map((button) => ({
          size: Number.parseFloat(window.getComputedStyle(button).fontSize),
          width: button.getBoundingClientRect().width,
          height: button.getBoundingClientRect().height,
        })),
      );
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every(({ size }) => size >= 12)).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`atlas-explorer-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("the public graph remains navigable with JavaScript disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/map/", baseURL).href);
    await expect(page.locator(atlasRoot)).toBeVisible();
    const entry = page.locator('[data-atlas-item="vuoro"]');
    await expect(entry).toBeVisible();
    await entry.locator("summary").click();
    await expect(
      entry.locator('a[href="/projects/vuoro/"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Find a system" }),
    ).not.toBeVisible();
    await expectNoHorizontalOverflow(page);
  } finally {
    await context.close();
  }
});

for (const colorScheme of ["light", "dark"]) {
  test(`the ${colorScheme} overview keeps its regions and labels on screen`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await openAtlas(page);
    await expect(page.locator("[data-atlas-canvas]")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectReadableMapLabels(page);
    const regionLabels = page.locator("[data-region-focus]");
    expect(await regionLabels.count()).toBeGreaterThan(1);
    await page.screenshot({
      path: testInfo.outputPath(`atlas-overview-${colorScheme}-1440.png`),
      fullPage: true,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 1024, height: 1100 });
    await expect(page.locator("[data-atlas-canvas]")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectReadableMapLabels(page);
  });
}
