# Berkeleytime Test Suite

This directory contains end-to-end and API tests for Berkeleytime using Playwright.

## Test Structure

```
apps/tests/
├── sanity/       # Fast smoke tests (run on every PR)
├── api/          # GraphQL API unit tests
├── e2e/          # Comprehensive end-to-end user flows
├── fixtures/     # Shared test data and fixtures
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

From repo root (uses config in this app):

```bash
# Run all test suites
npx playwright test --config=apps/tests/playwright.config.ts

# Run only sanity tests (fast)
npx playwright test --config=apps/tests/playwright.config.ts --project=sanity

# Run only API tests
npx playwright test --config=apps/tests/playwright.config.ts --project=api

# Run only e2e tests (all browsers)
npx playwright test --config=apps/tests/playwright.config.ts --grep e2e
```

Or from this directory:

```bash
cd apps/tests && npx playwright test
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test --config=apps/tests/playwright.config.ts apps/tests/sanity/smoke.spec.ts

# Run tests in UI mode (interactive)
npx playwright test --config=apps/tests/playwright.config.ts --ui

# Run tests in headed mode (see the browser)
npx playwright test --config=apps/tests/playwright.config.ts --headed

# Debug a specific test
npx playwright test --config=apps/tests/playwright.config.ts --debug apps/tests/sanity/smoke.spec.ts
```

## Writing Tests

### Sanity Tests (`apps/tests/sanity/`)

- **Purpose**: Verify critical functionality works
- **Speed**: Must complete in < 2-3 minutes total
- **Coverage**: Homepage loads, API responds, core navigation works
- **Browser**: Chromium only (for speed)
- **When to run**: Every PR

### API Tests (`apps/tests/api/`)

- **Purpose**: Test GraphQL API endpoints directly
- **Speed**: Very fast (no browser overhead)
- **Coverage**: Queries, mutations, input validation, error handling
- **When to run**: Every PR

### E2E Tests (`apps/tests/e2e/`)

- **Purpose**: Test complete user flows from frontend to backend
- **Speed**: Slower (5-10 minutes)
- **Coverage**: Search courses, view ratings, create schedule, authentication, etc.
- **Browsers**: Chromium, Firefox, Safari, Mobile (iPhone 12)
- **When to run**: Can run on PR or separately

## CI/CD Integration

- **Local Development**: Tests run against your running `docker compose` instance
- **CI (Pull Requests)**: Tests run against the code in the PR (built fresh via docker-compose)
- **Production**: Use `TEST_ENV=production` to run against live berkeleytime.com

The `TEST_ENV` environment variable controls this:
- `TEST_ENV=local` (default): Uses your existing docker-compose
- `TEST_ENV=ci`: Starts fresh docker-compose in CI
- `TEST_ENV=production`: No local server; tests hit https://berkeleytime.com

## Test Data & Fixtures

For tests that need specific data (courses, users, ratings), add fixtures in `apps/tests/fixtures/`.

## Troubleshooting

### Tests fail with "net::ERR_CONNECTION_REFUSED"
- Ensure `docker compose up` is running
- Check that frontend is accessible at http://localhost:3000

### API tests fail with 401/403
- Check if the endpoint requires authentication
- Add test auth tokens or mock authentication in `apps/tests/fixtures/`

### Tests timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Or in config: Update `timeout` in `playwright.config.ts`

### Docker won't start in CI
- Check GitHub Actions logs
- Ensure `.env.template` has all required variables
- May need to add test secrets to GitHub repo settings
