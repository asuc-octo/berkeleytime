import { expect, test } from "@playwright/test";

/**
 * Smoke tests - verify the app loads and critical pages are accessible
 * These should be fast (< 30 seconds total) and run on every PR
 */

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");

  // Verify the page loads and has the expected title
  await expect(page).toHaveTitle(/Berkeleytime/i);
});

test("can navigate to catalog page", async ({ page }) => {
  await page.goto("/");

  // Navigate to catalog
  await page.goto("/catalog");

  // Verify catalog page loaded
  await expect(page).toHaveURL(/catalog/);
});

test("GraphQL API is accessible", async ({ request }) => {
  // Test that the GraphQL endpoint responds
  const response = await request.post("/api/graphql", {
    data: {
      query: "{ __typename }",
    },
  });

  expect(response.ok()).toBeTruthy();
});
