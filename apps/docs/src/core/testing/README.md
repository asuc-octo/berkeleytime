# Berkeleytime Test Suite

This directory contains end-to-end and API tests for Berkeleytime using Playwright.

## Test Structure

```
tests/
├── sanity/       # Fast smoke tests (run on every PR)
├── api/          # GraphQL API unit tests
├── e2e/          # Comprehensive end-to-end user flows
├── fixtures/     # Shared test data and fixtures
└── utils/        # Test utilities and helpers
```

## Running Tests Locally

### Prerequisites

1. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   ```

Note: after the initial installation, you may have to run `docker compose down` and restart your docker containers.

2. Ensure you have docker-compose running with all services:
   ```bash
   docker compose up --build -d
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

### Playwright cannot be found 'MODULE_NOT_FOUND'
- Follow the steps after (and including) npm install at https://docs.berkeleytime.com/getting-started/local-development.html
- Manually install at https://playwright.dev/docs/intro

### Tests fail with "net::ERR_CONNECTION_REFUSED"
- Ensure `docker compose up` is running
- Check that frontend is accessible at http://localhost:3000

### API tests fail with 401/403
- Check if the endpoint requires authentication
- Add test auth tokens or mock authentication in `tests/fixtures/`

### Tests timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Or in config: Update `timeout` in `playwright.config.ts`

### Docker won't start in CI
- Check GitHub Actions logs
- Ensure `.env.template` has all required variables
- May need to add test secrets to GitHub repo settings
