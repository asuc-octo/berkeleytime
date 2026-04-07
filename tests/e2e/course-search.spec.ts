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
    await page
      .getByRole("paragraph")
      .filter({ hasText: "COMPSCI 61A" })
      .click();

    // Verify results (course details page loads)
    const results = page.getByRole("heading", { name: "COMPSCI 61A" });
    await expect(results).toBeVisible();
  });
});
