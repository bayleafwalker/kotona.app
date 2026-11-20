import { expect, test } from "@playwright/test";
import { URL } from "node:url";

for (const [slug, id, mutation] of [
  ["three-clocks", "three-clocks", "wrong-parser"],
  ["decimal-iron-replay", "decimal-iron-replay", "hide-beacon"],
  ["size-the-spa-to-the-river", "spa-week", "net-the-week"],
]) {
  test(`${id}: the page and portable Markdown retain the pinned recipe and specific challenge`, async ({
    page,
    request,
  }) => {
    await page.goto(`/notes/${slug}/`);
    const recipe = page.locator(`[data-exhibit-reproduction="${id}"]`);
    await expect(recipe).toContainText(
      `node scripts/reproduce-exhibit.mjs ${id}`,
    );
    await expect(recipe).toContainText(`--mutation ${mutation}`);
    const version = await (await request.get("/version.json")).json();
    await expect(recipe).toContainText(
      `git checkout --detach ${version.revision}`,
    );
    const report = new URL(
      await recipe
        .getByRole("link", { name: "Report a different result" })
        .getAttribute("href"),
    );
    expect(report.protocol).toBe("mailto:");
    expect(report.searchParams.get("body")).toContain(version.revision);
    expect(report.searchParams.get("body")).toContain(`/notes/${slug}/`);
    const markdown = await (await request.get(`/notes/${slug}.md`)).text();
    expect(markdown).toContain(`git checkout --detach ${version.revision}`);
    expect(markdown).toContain(
      `node scripts/reproduce-exhibit.mjs ${id} --mutation ${mutation}`,
    );
    expect(markdown).toContain("Report a different result");
  });
}
