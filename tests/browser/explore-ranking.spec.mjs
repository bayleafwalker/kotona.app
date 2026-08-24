import { expect, test } from "@playwright/test";

/**
 * The seam these cover is ranking-to-presentation. Every assertion here failed
 * at least once against an implementation whose unit tests, worker checks, and
 * retrieval evaluation all passed.
 */

const rankedItems = "[data-knowledge-results-list] li";
const visibleIndexItems = ".knowledge-clusters [data-index-id]:not([hidden])";

async function ask(page, question) {
  await page.goto("/explore/");
  await page.getByRole("searchbox").fill(question);
  await expect(page.locator("[data-knowledge-results]")).toBeVisible();
}

test("a natural-language question ranks results and drives the other views", async ({
  page,
}) => {
  await ask(page, "binding planning documents to tracked work items");

  const results = page.locator(rankedItems);
  await expect(results.first().locator("a")).toHaveAttribute(
    "href",
    "/notes/the-ref-nobody-adds/",
  );
  expect(await results.count()).toBeGreaterThan(1);

  // Each result says why it ranked where it did.
  await expect(results.first().locator(".knowledge-result-why")).toContainText(
    "discoverFor",
  );

  // The regression: the map and index used to require a contiguous substring,
  // so a question emptied both while the ranked list showed matches.
  const count = page.locator(".knowledge-result-count");
  await expect(count).not.toHaveText("0 published entries shown");
  await expect(count).toContainText("ranked matches shown");

  const shownInIndex = await page.locator(visibleIndexItems).count();
  expect(shownInIndex).toBeGreaterThan(0);
  expect(await page.locator("[data-node-id]:not(.is-filtered)").count()).toBe(
    shownInIndex,
  );

  // The grouped index remains the complete text alternative.
  expect(
    await page.locator(".knowledge-clusters [data-index-id]").count(),
  ).toBe(59);
});

test("the history filter governs every representation together", async ({
  page,
}) => {
  await ask(page, "which layer is actually missing from agent tooling today");

  const superseded = page.locator(
    `${rankedItems} a[href="/notes/the-missing-layer-is-binding-not-intelligence/"]`,
  );
  const history = page.getByRole("checkbox", { name: "Historical notes" });

  await expect(history).not.toBeChecked();
  await expect(superseded).toHaveCount(0);
  await expect(
    page.locator(
      `${visibleIndexItems}[data-index-id="the-missing-layer-is-binding-not-intelligence"]`,
    ),
  ).toHaveCount(0);

  await history.check();
  await expect(superseded).toHaveCount(1);

  await history.uncheck();
  await expect(superseded).toHaveCount(0);
});

test("an overwhelmingly better predecessor still leads, with its lifecycle shown", async ({
  page,
}) => {
  // The query that exposed the unbanded succession rule: this disproven note
  // is the document that answers it, and burying it behind a weakly related
  // successor was worse retrieval, not safer retrieval.
  await ask(
    page,
    "evaluating a tool that reduces how much output an agent sees",
  );
  await page.getByRole("checkbox", { name: "Historical notes" }).check();

  const first = page.locator(rankedItems).first();
  await expect(first.locator("a")).toHaveAttribute(
    "href",
    "/notes/measure-the-diagnosis-not-only-the-transcript/",
  );

  // The reader must be able to see that the leading result is disproven.
  await expect(first.locator(".knowledge-result-meta")).toContainText(
    "disproven",
  );
});
