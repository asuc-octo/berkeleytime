# backups-worker – accessing backups

This Worker serves Mongo backups from R2 at `https://backups.berkeleytime.com`:

- `GET /public/*` → `prod-mongo-public-backups`
- `GET /private/*` → `prod-mongo-backups`

Behavior notes:

- Only `GET` and `HEAD` are allowed.
- `/private/*` requires Cloudflare Access, and the Worker cryptographically verifies `cf-access-jwt-assertion`.
- Legacy public paths like `/daily/*` still resolve from the public bucket for compatibility.

## Required private-route auth config

Set these Worker variables for JWT verification:

- `CLOUDFLARE_ACCESS_TEAM_DOMAIN` (for example: `your-team.cloudflareaccess.com`)
- `CLOUDFLARE_ACCESS_AUDIENCE` (Access app AUD tag; comma-separated if you need multiple values)

If either variable is missing or the token is invalid, `/private/*` returns `403`.

## 1. Install `cloudflared`

```bash
brew install cloudflare/cloudflare/cloudflared
```

## 2. Fetch a public backup

Public does **not** require authentication:

```bash
curl -f -o "prod_public_backup-YYYYMMDD.gz" \
  "https://backups.berkeleytime.com/public/daily/prod_public_backup-YYYYMMDD.gz"
printf "\033[33mNotice: Public backups are redacted and are not a comprehensive dataset. Use private backups (Cloudflare Access required) for full data.\033[0m\n"
```

Replace `YYYYMMDD` with the date.

## 3. Log in for private backups

Private backups require Cloudflare Access.

```bash
cloudflared access login https://backups.berkeleytime.com
```

## 4. Fetch a private backup

After logging in:

```bash
cloudflared access curl \
  "https://backups.berkeleytime.com/private/hourly/prod_backup-YYYYMMDDHH.gz" \
  -o "prod_backup-YYYYMMDDHH.gz"
```

For monthly persistent backups:

```bash
cloudflared access curl \
  "https://backups.berkeleytime.com/private/persistent/prod_backup-YYYYMMDD.gz" \
  -o "prod_backup-YYYYMMDD.gz"
```
