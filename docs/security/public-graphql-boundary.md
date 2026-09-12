# Public GraphQL trust boundary

## Decision and security model

Berkeleytime uses a persisted-operation gateway at `/api/graphql`. The URL is
retained to avoid changing product routing, but it is no longer a general
GraphQL-over-HTTP endpoint.

```text
Browser
  |
  | PUBLIC: POST { id, variables? }
  v
Persisted-operation gateway
  |
  | INTERNAL: server-controlled GraphQL document
  v
Apollo (in-process; no raw HTTP mount)
  |
  v
Berkeleytime data
```

The browser transport hashes the developer-authored GraphQL document and sends
only that ID and variables. The backend maintains the authoritative ID-to-
document mapping. Unknown IDs, source text, extra request keys, batches, GET,
subscriptions, Automatic Persisted Query extensions, and non-JSON content types
are rejected before Apollo runs. Aliases, fragments, multiple operations, and
introspection therefore cannot be supplied by a caller; they can exist only if
they were committed as part of a reviewed frontend operation.

CORS remains useful browser policy but is not access control: `Origin`,
`Referer`, and `User-Agent` are forgeable by non-browser clients. None of those
headers grants access at this boundary.

Authorization remains in the GraphQL schema and resolvers, principally through
the `@auth` directive. The gateway constructs the same request context from the
server-side session that the former Apollo Express middleware used. Public
catalog, class, enrollment, grade, term, and rating reads remain unauthenticated;
account, collection, schedule, GradTrak, staff, and protected mutation behavior
remains enforced. Apollo response caching is fail-closed (`defaultMaxAge: 0`)
and only explicitly cacheable public data is shared. Cache-control directives, GraphQL Armor,
operation metrics, tracing, and error metrics still run because the fixed
document executes through `ApolloServer.executeHTTPGraphQLRequest`. Cache
partitioning uses a hash of the presented session cookie; callers cannot select
a private cache session with a request header, and personalized responses are
not cached by default.

Apollo introspection is enabled only when `NODE_ENV=development`, and the Apollo
landing page is disabled in every environment. Neither setting grants public
execution because no raw Apollo HTTP middleware is mounted.

## Surface inventory (August 2026)

The allowlist generator found 140 distinct documents:

- Main frontend: 77 documents/operation names covering catalog, classes,
  sections, enrollment, grades, ratings, schedules, collections, GradTrak,
  terms, banners, targeted messages, tracking, and account operations.
- Staff frontend: 42 documents covering staff management, analytics, banners,
  navigation, redirects, pods, targeted messages, tracking, and course lookup.
- AG frontend: 29 documents with 25 operation names; several names have
  different exact selections. They cover curated classes plus supporting class,
  course, enrollment, grade, rating, schedule, term, and user reads/mutations.
- Semantic search: 2 named internal-consumer documents for term discovery and
  catalog indexing. The Python service sends their generated IDs and variables;
  it never sends GraphQL source text.

There are no GraphQL subscriptions or WebSocket GraphQL server. The former
Apollo HTTP middleware accepted Apollo-supported GET/POST behavior and had no
batching link configured in the repository, but arbitrary POST documents were
enough to expose the schema. Introspection was explicitly enabled and the local
Apollo landing page was explicitly installed.

Production traffic is deployed by Helm as:

```text
Internet -> Kubernetes nginx Ingress (berkeleytime.com, /api Prefix)
         -> backend ClusterIP service :80 -> backend pod :5001
```

The backend service is `ClusterIP`, not `NodePort` or `LoadBalancer`. AG and
staff ingresses route only to their frontend services; those clients use the
main `berkeleytime.com/api/graphql` gateway. Local Docker Compose publishes
nginx frontend ports plus explicitly configured development data-service ports;
the backend has no host port mapping. The nginx config
adds POST-only and 100 KiB limits for the exact gateway path, while the backend
enforces the authoritative request shape even when nginx is bypassed.

`apps/api-sandbox` does not use Berkeleytime GraphQL. It is a separate local
Compose profile that calls campus SIS APIs directly and is absent from the
production image matrix and Helm ingresses. Its credential-distribution model
must be assessed separately if it is ever deployed.

Production deployment intentionally upgrades the main, AG, and staff frontend
images in the same workflow as the backend. An older auxiliary frontend sends
raw GraphQL documents and is incompatible with the persisted-operation-only
gateway, so skipping either auxiliary deployment is not a safe cutover.

## Adding or changing an operation

1. Add or edit one named `gql` query or mutation in a frontend source file (or
   a named `.graphql` document in the semantic-search operation directory).
   Keep exactly one operation per document; subscriptions and interpolated
   documents are rejected by generation.
2. Run `npm run generate:operations`. Commit the regenerated
   `persistedOperations.ts` with the frontend change.
3. Run `npm run check:operations`, backend tests, frontend
   type checks/builds, and the GraphQL boundary Playwright tests.
4. Review the response fields and existing `@auth`/staff authorization. Adding
   an ID to the allowlist is a public application-surface decision, even though
   it does not recreate arbitrary GraphQL execution.

## Internal consumers

Semantic search is the only non-browser GraphQL consumer. Its documents live in
`apps/semantic-search/app/graphql`, and allowlist generation also writes the
matching IDs to `generated_operations.py`. Both generated files must be
committed together. Semantic-search health returns 503 after a terminal index
build error so deployment probes cannot report a false green.

## Rollback warning

Rolling backend code back past the persisted-operation gateway cutover restores
the former raw public GraphQL endpoint. Treat such a rollback as a security-
boundary change requiring explicit approval; do not use it as a routine
availability rollback.

Never restore `expressMiddleware(server)` on a publicly routed path, accept a
client `query` field, add APQ query fallback, or use CORS/header checks or a
frontend secret as the security boundary.

## Scope limitation

This engineering boundary prevents arbitrary third parties from using
Berkeleytime as a general-purpose GraphQL API. It does not determine whether all
Berkeleytime product responses satisfy UC Berkeley's broader contractual
language about redistribution "via back-end APIs or any other mechanism."
Contractual compliance must be confirmed with UC Berkeley.
