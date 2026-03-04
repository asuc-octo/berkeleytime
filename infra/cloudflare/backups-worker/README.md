# backups-worker – accessing backups

This Worker serves Mongo backups from R2 at `https://backups.berkeleytime.com`:

- `GET /public/*` → `prod-mongo-public-backups`
- `GET /private/*` → `prod-mongo-backups`

## 1. Install `cloudflared`

```bash
brew install cloudflare/cloudflare/cloudflared
```

## 2. Fetch a public backup

Public does **not** require authentication:

```bash
curl -f -o "prod_public_backup-YYYYMMDD.gz" \
  "https://backups.berkeleytime.com/public/daily/prod_public_backup-YYYYMMDD.gz"
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
