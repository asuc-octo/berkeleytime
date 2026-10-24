# frontend

React 19 + Vite single-page app served at berkeleytime.com. Full documentation:
[docs.berkeleytime.com/core/frontend](https://docs.berkeleytime.com/core/frontend/) and
the repository `AGENTS.md`.

```
src/
  main.tsx            entrypoint (imports ./instrumentation for browser tracing)
  App.tsx             routes (React Router) and Apollo client using persistedOperationFetch
  app/                one folder per page; _legacy/ holds the previous Grades/Enrollment pages
  components/         reusable Berkeleytime-specific components
  hooks/api/          one hook per GraphQL operation
  lib/api/            gql`` operations, one file per domain
  lib/generated/      generated client types (git-ignored; npm run generate)
  providers/          UserProvider, TrackingProvider
  contexts/ lib/ utils/ types/
```

```sh
npm run generate -w apps/frontend   # regenerate query types (also run `npm run generate:operations` at the root)
npm run test -w apps/frontend       # vitest
npm run lint -w apps/frontend
```

Styling: SCSS modules + tokens and components from `@repo/theme`. Storybook for
the design system runs with `docker compose --profile docs up -d` on port 3005.
