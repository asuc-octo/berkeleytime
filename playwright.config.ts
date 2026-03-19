import { defineConfig, devices } from "@playwright/test";

/**
 * Test environment modes:
 * - 'local': Developer testing against their local docker-compose setup (default)
 * - 'ci': GitHub Actions testing the PR code (spins up docker-compose in CI)
 * - 'production': Production monitoring tests against live berkeleytime.com
 *
 * Set via: TEST_ENV=production npx playwright test
 */
const TEST_ENV = process.env.TEST_ENV || "local";

/**
 * Determine the base URL based on test environment
 */
const getBaseURL = () => {
  switch (TEST_ENV) {
    case "production":
      // Test the live production site
      return "https://berkeleytime.com";
    case "ci":
      // In CI: test the PR code after building it with docker-compose
      // The code being tested is whatever was just pushed to the PR
      return "http://localhost:3000";
    case "local":
    default:
      // Local dev: test against your local running docker-compose
      return "http://localhost:3000";
  }
};

/**
 * Determine if we need to start the local dev server
 * Only needed for 'local' and 'ci' modes, not for 'production'
 */
const getWebServer = () => {
  if (TEST_ENV === "production") {
    return undefined;
  }

  return {
    // Start docker-compose to build and run the app
    command: "docker compose up --build",
    url: "http://localhost:3000",
    timeout: 120 * 1000, // 2 minutes for docker to build and start
    // In 'local' mode: reuse server if developer already has docker-compose running
    // In 'ci' mode: always start fresh (process.env.CI will be true)
    reuseExistingServer: TEST_ENV === "local" && !process.env.CI,
  };
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: getBaseURL(),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    screenshot: "only-on-failure",
  },

  /* Configure test projects for different test suites */
  projects: [
    // Sanity tests - fast, critical path only, single browser
    {
      name: "sanity",
      testDir: "./tests/sanity",
      use: { ...devices["Desktop Chrome"] },
    },

    // API tests - GraphQL API unit tests (no browser needed)
    {
      name: "api",
      testDir: "./tests/api",
      use: { ...devices["Desktop Chrome"] },
    },

    // E2E tests - comprehensive flows, multiple browsers and mobile
    {
      name: "e2e-chromium",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e-firefox",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "e2e-webkit",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "e2e-mobile",
      testDir: "./tests/e2e",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: getWebServer(),
});
