import { expect, test } from "@playwright/test";

async function openReplay(page) {
  await page.goto("/notes/decimal-iron-replay/");
  const replay = page.locator("[data-decimal-replay]");
  await expect(replay).toHaveAttribute("data-initialized", "true");
  return replay;
}

test("interrupting at commit leaves the client uncertain until the recorded inquiry", async ({
  page,
}) => {
  const replay = await openReplay(page);
  await expect(replay).toHaveAttribute(
    "data-step",
    "payment.committed-unacknowledged",
  );
  await expect(replay.locator("[data-replay-count]")).toHaveText("1");
  await expect(replay.locator("[data-replay-ack]")).toHaveText(
    "Unknown to client",
  );
  await expect(replay.locator("[data-replay-terminal]")).toHaveText(
    "No terminal reply was received.",
  );
  await replay.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(replay).toHaveAttribute("data-step", "payment.reply-lost");
  await expect(replay.locator("[data-replay-ack]")).toHaveText(
    "Unknown to client",
  );
  await replay.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(replay.locator("[data-replay-terminal]")).toHaveText(
    "RESULT INQUIRY POSTED T001 SEQ 000003",
  );
  await replay.getByLabel("Recorded step").selectOption("duplicate");
  await expect(replay.locator("[data-replay-count]")).toHaveText("1");
  await expect(replay.locator("[data-replay-ack]")).toHaveText(
    "IDEMPOTENT_DUPLICATE",
  );
  await replay.getByRole("button", { name: "Pause at key checkpoint" }).click();
  await expect(replay).toHaveAttribute(
    "data-step",
    "payment.committed-unacknowledged",
  );
  await expect(replay.locator("[data-replay-ack]")).toHaveText(
    "Unknown to client",
  );
});

test("the era switch selects the EUR reconciliation break and exposes the preceding conversion", async ({
  page,
}) => {
  const replay = await openReplay(page);
  await replay
    .getByLabel("Era and scenario")
    .selectOption("euro-rounding-residue");
  await expect(replay).toHaveAttribute("data-step", "detect-residue");
  await expect(replay.locator("[data-replay-beacon]")).toHaveAttribute(
    "data-on",
    "true",
  );
  await expect(replay.locator("[data-replay-beacon-label]")).toHaveText(
    "Beacon ON",
  );
  await expect(
    replay.locator('[data-replay-currency="EUR"] [data-scope-difference]'),
  ).toHaveText("1 cent (EUR)");
  await expect(
    replay.locator('[data-replay-currency="FIM"] [data-scope-difference]'),
  ).toHaveText("0 penni (FIM)");
  await expect(replay.locator("[data-conversion-total]")).toHaveText(
    "51 cents (EUR)",
  );
  await expect(replay.locator("[data-conversion-aggregate]")).toHaveText(
    "50 cents (EUR)",
  );
  await replay.getByRole("button", { name: "Previous step" }).click();
  await expect(replay).toHaveAttribute("data-step", "switch-era");
  await expect(replay.locator("[data-replay-action]")).toHaveText(
    "CONVERT EUR OMIT",
  );
  await expect(replay.locator("[data-replay-beacon]")).toHaveAttribute(
    "data-on",
    "false",
  );
  await replay.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(replay.locator("[data-replay-beacon]")).toHaveAttribute(
    "data-on",
    "true",
  );
});

test("an adjustment does not clear the beacon until fresh reconciliation", async ({
  page,
}) => {
  const replay = await openReplay(page);
  await replay
    .getByLabel("Era and scenario")
    .selectOption("euro-rounding-residue");
  await replay.getByLabel("Recorded step").selectOption("refuse-close");
  await expect(replay.locator("[data-replay-terminal]")).toHaveText(
    "RESULT ERROR EUR_RECONCILIATION_BREAK",
  );
  await replay.getByLabel("Recorded step").selectOption("account-residue");
  await expect(replay.locator("[data-conversion-adjustment]")).toHaveText(
    "-1 cent (EUR)",
  );
  await expect(replay.locator("[data-replay-beacon]")).toHaveAttribute(
    "data-on",
    "true",
  );
  await expect(
    replay.locator('[data-replay-currency="EUR"] [data-scope-status]'),
  ).toHaveText("Not current");
  await replay.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(replay.locator("[data-replay-beacon]")).toHaveAttribute(
    "data-on",
    "false",
  );
  await expect(
    replay.locator('[data-replay-currency="EUR"] [data-scope-status]'),
  ).toHaveText("Current");
  await expect(
    replay.locator('[data-replay-currency="EUR"] [data-scope-difference]'),
  ).toHaveText("0 cents (EUR)");
});

test("the recorded replay remains bounded and usable on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 820 });
  const replay = await openReplay(page);
  await replay
    .getByLabel("Era and scenario")
    .selectOption("euro-rounding-residue");
  await replay.getByLabel("Recorded step").selectOption("key-open");
  await expect(
    replay.getByRole("button", { name: "Previous step" }),
  ).toBeDisabled();
  await replay.getByLabel("Recorded step").selectOption("close");
  await expect(
    replay.getByRole("button", { name: "Next step", exact: true }),
  ).toBeDisabled();
  const layout = await replay.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    scroll: element.scrollWidth,
    viewport: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scroll).toBeLessThanOrEqual(Math.ceil(layout.width));
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport);
});
