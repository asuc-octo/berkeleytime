# backups-worker

Cloudflare Worker that serves Mongo backups from R2 at `https://backups.berkeleytime.com`:

- **`/public/*`** — reads from `prod-mongo-public-backups` (no auth).
- **`/private/*`** — reads from `prod-mongo-backups` (requires `Authorization: Bearer <AUTH_SECRET>`).

## Prerequisites

1. **Remove R2 Public Bucket mapping**  
   In Cloudflare: R2 → Public Buckets / Custom domains → remove the mapping that exposes `prod-mongo-public-backups` as `backups.berkeleytime.com`.

2. **DNS**  
   Ensure `backups.berkeleytime.com` is a proxied (orange cloud) record in the `berkeleytime.com` zone.

3. **Auth secret**  
   Generate a long random token (e.g. `openssl rand -hex 32`) and store it in your secret manager (e.g. 1Password). You will add it to the Worker in the deploy step below.

## Deploy

From this directory:

```bash
npm install
npx wrangler secret put AUTH_SECRET   # paste the token when prompted
npm run deploy
```

Or with global wrangler:

```bash
cd infra/cloudflare/backups-worker
wrangler secret put AUTH_SECRET
wrangler deploy
```

## Usage

- Public: `curl "https://backups.berkeleytime.com/public/daily/prod_public_backup-YYYYMMDD.gz" -o file.gz`
- Private: `curl -H "Authorization: Bearer $BT_BACKUPS_AUTH" "https://backups.berkeleytime.com/private/hourly/prod_backup-YYYYMMDDHH.gz" -o file.gz`

See the docs (e.g. `apps/docs`) for full examples and how to set `BT_BACKUPS_AUTH`.
