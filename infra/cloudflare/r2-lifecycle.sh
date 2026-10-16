#!/usr/bin/env bash
# Applies the retention policy for Mongo backups as R2 lifecycle rules.
#
#   prod-mongo-backups
#     hourly/      1 day    (every hour)
#     daily/       30 days  (5 AM backup, copied by backup-prod-mongo)
#     weekly/      91 days  (Sunday 5 AM backup)
#     persistent/  730 days (5 AM backup on the 1st of the month)
#   prod-mongo-public-backups
#     daily/       7 days
#
# Expiry is based on each object's upload time, not the date in its filename.
#
# Requires `wrangler login` with access to the Berkeleytime Cloudflare account.
# Run infra/cloudflare/r2-backfill-tiers.sh BEFORE the first run of this
# script, otherwise the hourly/ rule deletes all existing history.

set -euo pipefail

WRANGLER="npx --yes wrangler@3.114.17"
PRIVATE_BUCKET=prod-mongo-backups
PUBLIC_BUCKET=prod-mongo-public-backups

add_rule() {
  local bucket=$1 prefix=$2 days=$3
  $WRANGLER r2 bucket lifecycle add "$bucket" "expire-${prefix%/}" "$prefix" \
    --expire-days "$days" --abort-multipart-days 1 --force
}

add_rule "$PRIVATE_BUCKET" hourly/ 1 # 24 at a time
add_rule "$PRIVATE_BUCKET" daily/ 30 # 30 at a time
add_rule "$PRIVATE_BUCKET" weekly/ 91 # 13 at a time
add_rule "$PRIVATE_BUCKET" persistent/ # 24 at a time
add_rule "$PUBLIC_BUCKET" daily/ 7

$WRANGLER r2 bucket lifecycle list "$PRIVATE_BUCKET"
$WRANGLER r2 bucket lifecycle list "$PUBLIC_BUCKET"
