import { type Page, expect, test } from "@playwright/test";

import { persistedOperations } from "../../apps/backend/src/bootstrap/graphql/generated/persistedOperations";

interface TrackingEvent {
  eventType: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

// Exercise touch alongside mouse and keyboard in every browser project.
test.use({ hasTouch: true });

async function openGrades(page: Page) {
  const events: TrackingEvent[] = [];
  await page.route("**/api/tracking/beacon", async (route) => {
    events.push(...route.request().postDataJSON().events);
    await route.fulfill({ status: 204 });
  });
  await page.route("**/api/graphql", async (route) => {
    const body = route.request().postDataJSON();
    const operation = persistedOperations[body.id]?.operationName;
    let data;
    if (operation === "GetGradeDistribution") {
      data = {
        grade: {
          average: 3,
          pnpPercentage: 0,
          distribution: [
            { letter: "A", count: 50, percentage: 50 },
            { letter: "B", count: 50, percentage: 50 },
          ],
        },
      };
    } else if (operation === "GetCourseNumberById") {
      data = { courseById: { number: "61A" } };
    } else if (operation === "TrackEvents") {
      events.push(...body.variables.events);
      data = { trackEvents: true };
    } else {
      await route.fallback();
      return;
    }
    await route.fulfill({ json: { data } });
  });

  await page.goto("/grades?input=COMPSCI%3Bslider-tracking-test");
  await expect(
    page.getByRole("button", { name: "Delete course" })
  ).toBeVisible();
  return events;
}

async function endAndFlush(page: Page, events: TrackingEvent[]) {
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect
    .poll(
      () =>
        events.filter(
          (event) =>
            event.targetType === "grades" && event.eventType === "session_end"
        ).length
    )
    .toBe(1);
  const start = events.find(
    (event) =>
      event.targetType === "grades" && event.eventType === "session_start"
  )!;
  const end = events.find(
    (event) =>
      event.targetType === "grades" && event.eventType === "session_end"
  )!;
  expect(end.targetId).toBe(start.targetId);
  expect(start.metadata?.percentileSliderUsed).toBe(false);
  expect(start.metadata?.percentileSliderAdjusted).toBe(false);
  expect(end.metadata?.durationMs).toBeGreaterThanOrEqual(0);
  return end;
}

test("untouched slider is unused, including when merely focused", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.getByRole("slider").first().focus();
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(false);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("touching a thumb without changing its value only counts as touched", async ({
  page,
}) => {
  const events = await openGrades(page);
  const thumb = page.getByRole("slider").first();
  await thumb.tap();
  await expect(thumb).toHaveAttribute("aria-valuenow", "0");
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("small mouse and keyboard changes only count as touched", async ({
  page,
}) => {
  const events = await openGrades(page);
  const thumb = page.getByRole("slider").first();
  await thumb.click();
  await thumb.press("ArrowRight");
  await thumb.press("ArrowRight");
  await thumb.press("Home");
  await expect(thumb).toHaveAttribute("aria-valuenow", "0");
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("keyboard use at an unchanged boundary only counts as touched", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.getByRole("slider").first().press("Home");
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("clearing the chart ends the session and ignores later slider touches", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  await page.getByRole("slider").first().press("PageUp");
  await page.getByRole("button", { name: "Delete course" }).click();
  await expect(page.getByRole("button", { name: "Delete course" })).toHaveCount(
    0
  );
  await page.getByRole("slider").first().tap();
  await page.clock.fastForward(2_000);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("leaving Grades records usage and the next session starts unused", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  await page.getByRole("slider").first().press("PageUp");
  await page.clock.fastForward(1_000);
  await page.getByRole("link", { name: "Berkeleytime", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Grades", exact: true }).last().click();
  await expect(
    page.getByRole("button", { name: "Delete course" })
  ).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect
    .poll(
      () =>
        events.filter(
          (event) =>
            event.targetType === "grades" && event.eventType === "session_end"
        ).length
    )
    .toBe(2);
  const ends = events.filter(
    (event) =>
      event.targetType === "grades" && event.eventType === "session_end"
  );
  expect(ends[0].metadata?.percentileSliderUsed).toBe(true);
  expect(ends[0].metadata?.percentileSliderAdjusted).toBe(true);
  expect(ends[1].metadata?.percentileSliderUsed).toBe(false);
  expect(ends[1].metadata?.percentileSliderAdjusted).toBe(false);
  expect(ends[0].targetId).not.toBe(ends[1].targetId);
});

test("a four-point adjustment never qualifies", async ({ page }) => {
  const events = await openGrades(page);
  await page.clock.install();
  const thumb = page.getByRole("slider").first();
  for (let step = 0; step < 4; step++) await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "4");
  await page.clock.fastForward(2_000);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("an exact five-point committed change qualifies after one second and stays used after reset", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  const thumb = page.getByRole("slider").first();
  for (let step = 0; step < 5; step++) await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "5");
  await page.clock.fastForward(1_000);
  await thumb.press("Home");
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderAdjusted).toBe(true);
});

test("a qualifying change held for less than one second does not count", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  await page.clock.pauseAt(
    new Date(await page.evaluate(() => Date.now() + 100))
  );
  await page.getByRole("slider").first().press("PageUp");
  await page.clock.fastForward(999);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("a quick reset cancels a pending meaningful adjustment", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  const thumb = page.getByRole("slider").first();
  await thumb.press("PageUp");
  await page.clock.fastForward(500);
  await thumb.press("Home");
  await page.clock.fastForward(2_000);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
});

test("adjusting the upper endpoint also qualifies", async ({ page }) => {
  const events = await openGrades(page);
  await page.clock.install();
  const thumb = page.getByRole("slider").last();
  for (let step = 0; step < 5; step++) await thumb.press("ArrowLeft");
  await expect(thumb).toHaveAttribute("aria-valuenow", "95");
  await page.clock.fastForward(1_000);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderAdjusted).toBe(true);
});

test("dragging for a second without releasing does not qualify", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  await page.getByRole("slider").first().scrollIntoViewIfNeeded();
  const lower = await page.getByRole("slider").first().boundingBox();
  const upper = await page.getByRole("slider").last().boundingBox();
  const x = lower!.x + lower!.width / 2;
  const y = lower!.y + lower!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + (upper!.x - lower!.x) * 0.2, y);
  await expect
    .poll(async () =>
      Number(
        await page.getByRole("slider").first().getAttribute("aria-valuenow")
      )
    )
    .toBeGreaterThanOrEqual(5);
  await page.clock.fastForward(2_000);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(false);
  await page.mouse.up();
});

test("a committed touch adjustment qualifies after one second", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  await page.getByRole("slider").first().scrollIntoViewIfNeeded();
  const lower = await page.getByRole("slider").first().boundingBox();
  const upper = await page.getByRole("slider").last().boundingBox();
  await page.touchscreen.tap(
    lower!.x + lower!.width / 2 + (upper!.x - lower!.x) * 0.2,
    lower!.y + lower!.height / 2
  );
  await expect
    .poll(async () =>
      Number(
        await page.getByRole("slider").first().getAttribute("aria-valuenow")
      )
    )
    .toBeGreaterThanOrEqual(5);
  await page.clock.fastForward(1_000);
  const end = await endAndFlush(page, events);
  expect(end.metadata?.percentileSliderUsed).toBe(true);
  expect(end.metadata?.percentileSliderAdjusted).toBe(true);
});

test("leaving before the persistence timeout cannot mark the next session used", async ({
  page,
}) => {
  const events = await openGrades(page);
  await page.clock.install();
  await page.getByRole("slider").first().press("PageUp");
  await page.getByRole("link", { name: "Berkeleytime", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Grades", exact: true }).last().click();
  await expect(
    page.getByRole("button", { name: "Delete course" })
  ).toBeVisible();
  await page.clock.fastForward(2_000);
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect
    .poll(
      () =>
        events.filter(
          (event) =>
            event.targetType === "grades" && event.eventType === "session_end"
        ).length
    )
    .toBe(2);
  const ends = events.filter(
    (event) =>
      event.targetType === "grades" && event.eventType === "session_end"
  );
  expect(ends.map((event) => event.metadata?.percentileSliderAdjusted)).toEqual(
    [false, false]
  );
});
