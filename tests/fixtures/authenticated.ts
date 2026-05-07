import { expect, test as base } from "@playwright/test";

import {
  loginAsDevUser,
  shouldSkipDevAuthE2E,
} from "../utils/dev-auth";

/**
 * Playwright entrypoint for specs that need a **logged-in browser session**
 * (dev-only `/api/dev/login`, same mechanism as the in-app dev auth banner).
 *
 * Import `test` / `expect` from this file instead of `@playwright/test`.
 * An **auto** fixture establishes the session before each test; you still use
 * `{ page }` and navigate anywhere (scheduler, profile, etc.).
 *
 * Skips when `TEST_ENV=production` or neither `E2E_DEV_EMAIL` / `E2E_DEV_USER_ID` is set.
 *
 * @example
 * import { test, expect } from "../fixtures/authenticated";
 *
 * test.describe("feature needing auth", () => {
 *   test("opens catalog while signed in", async ({ page }) => {
 *     await page.goto("/catalog");
 *     await expect(page.getByRole("navigation")).toBeVisible();
 *   });
 * });
 */
export const test = base.extend<{ devAuthenticatedUserId: string }>({
  devAuthenticatedUserId: [
    async ({ page }, use) => {
      if (shouldSkipDevAuthE2E()) {
        test.skip(
          true,
          "Authenticated E2E: set E2E_DEV_EMAIL (preferred) or E2E_DEV_USER_ID, and use TEST_ENV=local/ci."
        );
      }
      const userId = await loginAsDevUser(page, { redirectPath: "/" });
      await use(userId);
    },
    { auto: true },
  ],
});

export { expect };
