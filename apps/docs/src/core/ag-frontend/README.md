# AG Dashboard (Curated Classes editor)

`apps/ag-frontend` is a small internal React app at
[ag.berkeleytime.com](https://ag.berkeleytime.com) for writing and publishing
**curated classes**: editorial picks (a class, an image, and a write-up for a
term) that the main site shows on its Curated Classes page.

- Routes: `/curated-classes` (list), `/curated-classes/new`, `/curated-classes/:id`.
- Data: the `curated-classes` backend module (`CuratedClassModel` in `packages/common`), with the same persisted-operation GraphQL gateway as the main site. In development it talks to `window.location.origin/api/graphql`; in production directly to `https://berkeleytime.com/api/graphql` with credentials.
- Auth: the user must be signed in to berkeleytime.com and be a staff member; the backend's staff check guards the mutations.
- UI: Radix Themes directly (not `@repo/theme`), Iconoir icons.

Local development:

```sh
docker compose --profile ag up -d     # http://localhost:3001 via nginx
```

Deployment: its own Helm chart in `infra/ag`, deployed by the production
workflow together with the main app (`deploy_ag: true` in `cd-prod.yaml`).
Because it uses the persisted-operation gateway, it must be redeployed whenever
its operations change; the production workflow does this automatically.
