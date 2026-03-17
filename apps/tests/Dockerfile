# Playwright production test runner. Build context = repo root.
# Used by cd-build workflow; image is pushed as bt-tests.
# Full bookworm (not -slim) so WebKit has a proper CA store for TLS against production.
FROM node:22-bookworm AS tests-prod

WORKDIR /app

COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci --ignore-scripts \
  && npx playwright install --with-deps chromium firefox webkit

CMD ["npx", "playwright", "test", "--config=apps/tests/playwright.config.ts"]
