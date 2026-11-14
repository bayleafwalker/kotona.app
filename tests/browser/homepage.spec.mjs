import { fileURLToPath, URL } from "node:url";

import { expect, test } from "@playwright/test";

import { readContentMetadata } from "../../scripts/lib/content-metadata.mjs";
import { noteContextLabel } from "../../src/lib/content-labels.js";
import { getRecentChanges } from "../../src/lib/homepage.ts";

const rootDirectory = fileURLToPath(new URL("../../", import.meta.url));

function collectionEntries(collection, draftByDefault) {
  return readContentMetadata(rootDirectory, collection, { draftByDefault }).map(
    ({ id, data, draft }) => ({
      id,
      collection,
      data: {
        ...data,
        draft,
        published: new Date(data.published),
        lastRevised: new Date(data.lastRevised),
        ...(data.lastVerified && {
          lastVerified: new Date(data.lastVerified),
        }),
      },
    }),
  );
}

const notes = collectionEntries("notes", false);
const projects = collectionEntries("projects", true);
const expectedChanges = getRecentChanges(notes, projects);
const leadSelector = ".home-latest .home-entry--lead";
const destinations = [
  {
    href: "https://about.kotona.app/",
    name: /Professional profile.*about\.kotona\.app/,
  },
  {
    href: "https://demo.vuoro.cloud/",
    name: /Interactive showcase.*demo\.vuoro\.cloud/,
  },
  {
    href: "https://vuoro.cloud/",
    name: /Vuoro Cloud.*vuoro\.cloud/,
  },
];

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
}

test("latest changes present the content selection and preserve date meanings", async ({
  page,
}) => {
  await page.goto("/");
  const entries = page.locator(".home-latest [data-home-entry]");
  await expect(entries).toHaveCount(expectedChanges.length);

  for (const [index, expected] of expectedChanges.entries()) {
    const entry = entries.nth(index);
    await expect(entry).toHaveAttribute("data-home-entry", expected.href);
    await expect(entry.locator("h3 a")).toHaveText(expected.entry.data.title);
    await expect(entry.locator("h3 a")).toHaveAttribute("href", expected.href);
    await expect(entry.locator("time")).toHaveAttribute(
      "datetime",
      expected.date.toISOString(),
    );
    // A visible prefix distinguishes a revision from its original publication,
    // or a project review from a note. It also catches concatenated date text.
    await expect(entry.locator("time")).toHaveText(
      new RegExp(`^${expected.dateLabel} \\S`),
    );
    if (expected.kind === "project") {
      await expect(entry.locator(".home-entry-context")).toHaveText(
        expected.entry.data.status,
      );
    } else {
      await expect(entry.locator(".home-entry-context")).toHaveText(
        noteContextLabel(expected.entry.data),
      );
    }
  }

  const lead = page.locator(leadSelector);
  await expect(lead.locator("h3 a")).toHaveAttribute(
    "href",
    expectedChanges[0].href,
  );
  await lead.locator("h3 a").click();
  await expect(page).toHaveURL(
    (url) => url.pathname === expectedChanges[0].href,
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    expectedChanges[0].entry.data.title,
  );
});

test("homepage article headings are unique and keep draft or historical records out", async ({
  page,
}) => {
  await page.goto("/");
  const articlePaths = await page
    .locator("main article h3 a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  expect(articlePaths.length).toBeGreaterThan(expectedChanges.length);
  expect(new Set(articlePaths).size).toBe(articlePaths.length);
  const excluded = [
    ...notes.filter(({ data }) => data.draft || data.lifecycle !== "current"),
    ...projects.filter(({ data }) => data.draft),
  ];
  for (const entry of excluded) {
    expect(articlePaths).not.toContain(`/${entry.collection}/${entry.id}/`);
  }

  for (const reference of await page.locator(".home-reference").all()) {
    const href = await reference.locator("h3 a").getAttribute("href");
    const note = notes.find((entry) => `/notes/${entry.id}/` === href);
    expect(note).toBeDefined();
    await expect(reference.locator(".home-entry-context")).toHaveText(
      noteContextLabel(note.data),
    );
  }
});

for (const viewport of [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  test(`the latest title and date fit the first screen at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const lead = page.locator(leadSelector);
    for (const selector of ["h3", "time"]) {
      const bounds = await lead.locator(selector).boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
    }
    await expectNoHorizontalOverflow(page);
    if (viewport.width === 1280) {
      const primary = page.getByRole("navigation", {
        name: "Primary",
        exact: true,
      });
      const navigation = await primary.evaluate((element) => ({
        width: element.clientWidth,
        scroll: element.scrollWidth,
      }));
      expect(navigation.scroll).toBeLessThanOrEqual(navigation.width);
      const primaryBounds = await primary.boundingBox();
      const siteTitle = await page.locator(".site-title").boundingBox();
      const elsewhere = await page.locator(".site-elsewhere").boundingBox();
      expect(primaryBounds.x).toBeGreaterThan(siteTitle.x + siteTitle.width);
      expect(primaryBounds.x + primaryBounds.width).toBeLessThan(elsewhere.x);
    }
    await page.screenshot({
      path: testInfo.outputPath(`homepage-${viewport.width}.png`),
      fullPage: viewport.width !== 320,
      animations: "disabled",
    });
    if (viewport.width === 1280) {
      await page.screenshot({
        path: testInfo.outputPath("homepage-1280-top.png"),
        fullPage: false,
        animations: "disabled",
      });
    }

    await page.locator(".site-elsewhere summary").click();
    const menu = page.getByRole("navigation", {
      name: "Related sites",
      exact: true,
    });
    await expect(menu).toBeVisible();
    const bounds = await menu.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
    await expectNoHorizontalOverflow(page);
    if (viewport.width === 390) {
      await page.screenshot({
        path: testInfo.outputPath("homepage-390-elsewhere-open.png"),
        fullPage: false,
        animations: "disabled",
      });
    }
  });
}

test("Elsewhere is reachable by keyboard and its native disclosure stays operable", async ({
  page,
}) => {
  await page.goto("/");
  const disclosure = page.locator(".site-elsewhere");
  const summary = disclosure.locator("summary");
  await expect(disclosure).not.toHaveAttribute("open", "");
  const skip = page.getByRole("link", { name: "Skip to content" });
  const hiddenSkip = await skip.boundingBox();
  expect(hiddenSkip.y + hiddenSkip.height).toBeLessThan(-1);
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  const focusedSkip = await skip.boundingBox();
  expect(focusedSkip.y).toBeGreaterThanOrEqual(0);

  // Traverse the actual tab order from the page's first control, rather than
  // giving the summary synthetic focus that could conceal a keyboard trap.
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("Tab");
    if (
      await summary.evaluate((element) => element === document.activeElement)
    ) {
      break;
    }
  }
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  for (const destination of destinations) {
    await page.keyboard.press("Tab");
    await expect(
      disclosure.getByRole("link", { name: destination.name }),
    ).toBeFocused();
  }
  for (let step = 0; step < destinations.length; step += 1) {
    await page.keyboard.press("Shift+Tab");
  }
  await expect(summary).toBeFocused();
  await page.keyboard.press("Space");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Find a topic" })).toBeFocused();
});

test("related destinations retain clear names and the same routes across the site", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".site-elsewhere summary").click();
  const surfaces = [
    page.getByRole("navigation", { name: "Related sites", exact: true }),
    page.getByRole("navigation", { name: "Related sites in footer" }),
  ];
  for (const surface of surfaces) {
    for (const destination of destinations) {
      const link = surface.getByRole("link", { name: destination.name });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", destination.href);
    }
  }

  // Keep global navigation reachable without adding another set to the page.
  for (const destination of destinations) {
    await expect(
      page.getByRole("link", { name: destination.name }),
    ).toHaveCount(2);
  }
  await expect(page.locator('a[href="/explore/"]')).toHaveCount(2);
  await expect(page.locator('a[href="/notes/"]')).toHaveCount(2);
  await expect(
    page
      .getByRole("navigation", { name: "Primary", exact: true })
      .getByRole("link", { name: "About this site" }),
  ).toHaveAttribute("href", "/about/");

  // The global destinations must also survive leaving the redesigned home.
  await page.goto(expectedChanges[0].href);
  await page.locator(".site-elsewhere summary").click();
  for (const destination of destinations) {
    await expect(
      page
        .getByRole("navigation", { name: "Related sites", exact: true })
        .getByRole("link", { name: destination.name }),
    ).toHaveAttribute("href", destination.href);
  }
});

test("the latest content and destination navigation work without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const lead = page.locator(leadSelector);
    await expect(lead.locator("h3 a")).toHaveText(
      expectedChanges[0].entry.data.title,
    );
    await expect(lead.locator("time")).toBeVisible();
    await page.locator(".site-elsewhere summary").click();
    const menu = page.getByRole("navigation", {
      name: "Related sites",
      exact: true,
    });
    for (const destination of destinations) {
      await expect(
        menu.getByRole("link", { name: destination.name }),
      ).toBeVisible();
    }
    await page.locator(".site-elsewhere summary").click();
    await lead.locator("h3 a").click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      expectedChanges[0].entry.data.title,
    );
  } finally {
    await context.close();
  }
});
