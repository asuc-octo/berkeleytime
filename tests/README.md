# Berkeleytime Test Suite

This directory contains end-to-end and API tests for Berkeleytime using Playwright.

## Test Structure

```
tests/
├── sanity/       # Fast smoke tests (run on every PR)
├── api/          # GraphQL API unit tests
├── e2e/          # Comprehensive end-to-end user flows
├── fixtures/     # Playwright fixtures (e.g. authenticated session)
└── utils/        # Test utilities and helpers
```

## Running Tests Locally

### Prerequisites

1. Ensure you have docker-compose running with all services:
   ```bash
   docker compose up
   ```

2. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   ```

### Run All Tests

```bash
# Run all test suites
npx playwright test

# Run only sanity tests (fast)
npx playwright test --project=sanity

# Run only API tests
npx playwright test --project=api

# Run only e2e tests (all browsers)
npx playwright test --grep e2e
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test tests/sanity/smoke.spec.ts

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Debug a specific test
npx playwright test --debug tests/sanity/smoke.spec.ts
```

## Writing Tests

### Sanity Tests (`tests/sanity/`)

- **Purpose**: Verify critical functionality works
- **Speed**: Must complete in < 2-3 minutes total
- **Coverage**: Homepage loads, API responds, core navigation works
- **Browser**: Chromium only (for speed)
- **When to run**: Every PR

Example:
```typescript
test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Berkeleytime/i);
});
```

### API Tests (`tests/api/`)

- **Purpose**: Test GraphQL API endpoints directly
- **Speed**: Very fast (no browser overhead)
- **Coverage**: Queries, mutations, input validation, error handling
- **When to run**: Every PR

Example:
```typescript
test('can query courses', async ({ request }) => {
  const response = await request.post('/api/graphql', {
    data: {
      query: `{ courses { id title } }`,
    },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.data.courses).toBeDefined();
});
```

### E2E Tests (`tests/e2e/`)

- **Purpose**: Test complete user flows from frontend to backend
- **Speed**: Slower (5-10 minutes)
- **Coverage**: Search courses, view ratings, create schedule, authentication, etc.
- **Browsers**: Chromium, Firefox, Safari, Mobile (iPhone 12)
- **When to run**: Can run on PR or separately

Example:
```typescript
test('can search and view course details', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder(/search/i).fill('CS 61A');
  await page.getByTestId('course-result').first().click();
  await expect(page).toHaveURL(/course/);
});
```

### Authenticated E2E (dev login, any feature)

Use the same pattern for **any** flow that needs a signed-in user (scheduler, profile, saved lists, etc.):

1. **Dev user in Mongo:** The app does not create `dev@berkeleytime.local` by itself on an empty DB. If you already ran the one-time upsert from [`apps/docs` local development](../apps/docs/src/getting-started/local-development.md) (or `bootstrap-local.sh`), that user already exists.
2. Set **`E2E_DEV_EMAIL`** (recommended) to the dev account email, e.g. `dev@berkeleytime.local`. Test auth resolves the current `_id` at runtime via `/api/dev/users`, so this works across different local databases.
3. Optional fallback: set **`E2E_DEV_USER_ID`** directly to bypass lookup (useful in locked-down CI).
4. Backend must run in **development** (`NODE_ENV=development`) so **`GET /api/dev/login`** exists (not available on production).

**Option A — shared fixture (starts at `/` after login):** import `test` / `expect` from `tests/fixtures/authenticated.ts`. Each test gets a session before it runs; use `page.goto('/your-route')` for the screen under test.

```typescript
import { test, expect } from "../fixtures/authenticated";

test("signed-in smoke", async ({ page, devAuthenticatedUserId }) => {
  await page.goto("/catalog");
  // devAuthenticatedUserId is the Mongo id (useful for teardown helpers)
  await expect(page).toHaveURL(/catalog/);
});
```

**Option B — manual login (pick landing path):** keep `import { test, expect } from "@playwright/test"` and call `loginAsDevUser` from `tests/utils/dev-auth.ts` in `beforeEach` (e.g. `redirectPath: "/scheduler"`).

Production / smoke jobs without secrets: those tests skip automatically when `TEST_ENV=production`.

If several tests **mutate the same user’s data**, use `test.describe.configure({ mode: "serial" })` for that file or describe block so workers do not clobber each other.

**Example (scheduler):** with `docker compose up`, `E2E_DEV_EMAIL` set (or defaulting to `dev@berkeleytime.local`), and `TEST_ENV=local` (default):

```bash
npx playwright test tests/e2e/schedule-create.spec.ts --project=e2e-chromium
```

That spec uses the authenticated fixture, creates a schedule in the UI, asserts navigation to the editor, then deletes all schedules for the session user in `afterEach` via `tests/utils/graphql-session.ts`. Copy that pattern for other logged-in flows.

## CI/CD Integration

### Pull Request Tests

When you open a PR, GitHub Actions automatically:
1. Checks out your code
2. Runs `docker compose up --build` to build your changes
3. Runs sanity tests against the built code
4. Reports results in the PR

See [`.github/workflows/playwright.yml`](../.github/workflows/playwright.yml)

### How It Works

- **Local Development**: Tests run against your running `docker compose` instance
- **CI (Pull Requests)**: Tests run against the code in the PR (built fresh via docker-compose)

The `TEST_ENV` environment variable controls this:
- `TEST_ENV=local` (default): Uses your existing docker-compose
- `TEST_ENV=ci`: Starts fresh docker-compose in CI

## Test Data & Fixtures

For tests that need specific data (courses, users, ratings), add fixtures in `tests/fixtures/`:

```typescript
// tests/fixtures/test-data.ts
export const sampleCourses = [
  { code: 'CS 61A', name: 'Structure and Interpretation of Computer Programs' },
  { code: 'CS 61B', name: 'Data Structures' },
];
```

## Best Practices

1. **Use data-testid attributes**: Add `data-testid` to important UI elements for stable selectors
2. **Avoid hardcoded waits**: Use `waitForSelector` instead of `waitForTimeout`
3. **Keep sanity tests fast**: Only test critical paths
4. **Test APIs directly**: Use API tests for backend logic, E2E for user workflows
5. **Use descriptive test names**: `test('can search for course by name')` not `test('test 1')`
6. **Independent tests**: Each test should work in isolation

## Debugging

```bash
# View last test run report
npx playwright show-report

# Run with verbose logging
DEBUG=pw:api npx playwright test

# Record a test (generates test code)
npx playwright codegen http://localhost:3000
```

## Troubleshooting

### Tests fail with "net::ERR_CONNECTION_REFUSED"
- Ensure `docker compose up` is running
- Check that frontend is accessible at http://localhost:3000

### API tests fail with 401/403
- Check if the endpoint requires authentication
- Add test auth tokens or mock authentication in `tests/fixtures/`

### Tests timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Or in config: Update `timeout` in `playwright.config.ts`