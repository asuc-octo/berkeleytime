import { expect, test } from "../fixtures/authenticated";

import { deleteAllSchedulesForSessionUser } from "../utils/graphql-session";

/**
 * Authenticated scheduler flow (dev login + E2E_DEV_USER_ID).
 * Run with stack up and env set, e.g.:
 *   export E2E_DEV_USER_ID=…
 *   npx playwright test tests/e2e/schedule-create.spec.ts --project=e2e-chromium
 */
test.describe("Create schedule (authenticated)", () => {
  test.describe.configure({ mode: "serial" });

  test.afterEach(async ({ page }) => {
    await deleteAllSchedulesForSessionUser(page);
  });

  test("opens scheduler and creates a schedule from the dialog", async ({
    page,
  }) => {
    await page.goto("/schedules");
    await expect(
      page.getByText("Welcome to Berkeleytime's Scheduler")
    ).toBeVisible();

    await page.getByRole("button", { name: "Create a schedule" }).click();
    const dialog = page.getByRole("dialog", { name: "Berkeleytime Dialog" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Create a schedule")).toBeVisible();

    const unique = `E2E ${Date.now()}`;
    await dialog.locator('input[type="text"]').fill(unique);

    // Summer terms require a session; the session Select shows this placeholder until chosen.
    const sessionTrigger = dialog.getByRole("button", {
      name: "Select a session",
    });
    if (await sessionTrigger.isVisible().catch(() => false)) {
      await sessionTrigger.click();
      await page.getByRole("menuitem").first().click();
    }

    const createBtn = dialog.getByRole("button", { name: "Create", exact: true });
    await expect(createBtn).toBeEnabled({ timeout: 30_000 });
    await createBtn.click();

    await expect(page).toHaveURL(/\/schedules\/[a-f0-9]{24}$/i);
    await expect(page.getByText(unique).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Add class" }).click();
    await expect(page.getByText("Add a course to this schedule")).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search .* classes\.\.\./i);
    await searchInput.fill("CS 61A");
    await page.getByText("COMPSCI 61A").first().click();

    await expect(page.getByRole("button", { name: "Add class" })).toBeVisible();
    await expect(page.getByText("1 class")).toBeVisible({ timeout: 20_000 });
  });
});
