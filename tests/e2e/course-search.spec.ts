import { expect, test } from "@playwright/test";

/**
 * E2E tests for course search functionality
 * These are more comprehensive and test complete user flows
 */

test.describe("Course Search", () => {
  test("catalog page loads successfully", async ({ page }) => {
    // Navigate to catalog
    await page.goto("/catalog");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Verify we're on the catalog page
    await expect(page).toHaveURL(/catalog/);

    // Take a screenshot if test fails (helps debug)
    await page.screenshot({ path: "test-results/catalog-page.png" });
  });

  //  TODO: Uncomment and update selectors after using `npx playwright codegen`
  test("can search for a course by name", async ({ page }) => {
    await page.goto("/catalog");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByRole("textbox");

    await searchInput.click();
    await searchInput.fill("CS 61A");

    // Wait for search results to appear
    await page.getByText("COMPSCI 61A #01The Structure").click();

    // Verify results (course details page loads)
    const results = page.getByRole("heading", { name: "COMPSCI 61A #" });
    await expect(results).toBeVisible();
  });

  test("get to grades page from course catalog", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("button", { name: "Open Filters" }).click();
    await page
      .locator("div")
      .filter({ hasText: /^Summer 2026$/ })
      .first()
      .click();
    await page.getByText("Fall 2021").click();
    await page
      .getByRole("textbox", { name: "Search Fall 2021 classes..." })
      .click();
    await page
      .getByRole("textbox", { name: "Search Fall 2021 classes..." })
      .click();
    await page
      .getByRole("textbox", { name: "Search Fall 2021 classes..." })
      .fill("data");
    await page.getByText("DATA C100 #01Principles &").click();
    await page.getByRole("button", { name: "Grades" }).nth(1).click();
    const page1Promise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Open in Grades" }).click();
    const page1 = await page1Promise;
    await expect(
      page1.getByText("A+AA-B+BB-C+CC-D+DD-FPNP0.0%7")
    ).toBeVisible();
    await expect(page1.locator("#root")).toContainText("B+(3.358)");
  });
});
