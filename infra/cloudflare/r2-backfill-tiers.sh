#!/usr/bin/env bash
# One-time backfill of daily/ and weekly/ tiers from existing hourly/ backups,
# so enabling the hourly/ 1-day lifecycle rule thins history instead of
# deleting it. Run this before infra/cloudflare/r2-lifecycle.sh.
#
# For each of the last 30 days, copies that day's 5 AM backup (or the latest
# one that day, if 5 AM is missing) to daily/. For each Sunday in the last
# 91 days, does the same into weekly/. persistent/ already exists. Copies are
# server-side and skipped if the destination already exists.
#
# Usage:
#   AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... \
#     ./infra/cloudflare/r2-backfill-tiers.sh [--dry-run]
#
# Credentials are the R2 API token in the cloudflare-prod-mongo-secret secret.

set -euo pipefail

ENDPOINT_URL=https://ff660bd2dac18c00551ed509d24ef4d7.r2.cloudflarestorage.com
BUCKET_NAME=prod-mongo-backups
DRY_RUN=${1:-}

s3() {
  aws s3 "$@" --endpoint-url="$ENDPOINT_URL"
}

existing() {
  s3 ls "s3://$BUCKET_NAME/$1/" | awk '{print $4}' || true
}

hourly_keys=$(existing hourly)
daily_keys=$(existing daily)
weekly_keys=$(existing weekly)

# Emits "<tier> <source key> <destination key>" lines
plan=$(
  HOURLY="$hourly_keys" python3 -I - <<'EOF'
import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

by_day = {}
for key in os.environ["HOURLY"].split():
    stamp = key.removeprefix("prod_backup-").removesuffix(".gz")
    if len(stamp) == 10 and stamp.isdigit():
        by_day.setdefault(stamp[:8], []).append(stamp)

today = datetime.now(ZoneInfo("America/Los_Angeles")).date()

def pick(day):
    stamps = sorted(by_day.get(day, []))
    if not stamps:
        return None
    five_am = day + "05"
    return five_am if five_am in stamps else stamps[-1]

for offset in range(91):
    date = today - timedelta(days=offset)
    day = date.strftime("%Y%m%d")
    stamp = pick(day)
    if stamp is None:
        continue
    src = f"hourly/prod_backup-{stamp}.gz"
    if offset < 30:
        print("daily", src, f"daily/prod_backup-{day}.gz")
    if date.isoweekday() == 7:
        print("weekly", src, f"weekly/prod_backup-{day}.gz")
EOF
)

copied=0
while read -r tier src dst; do
  [ -z "$tier" ] && continue
  case $tier in
    daily) existing_keys=$daily_keys ;;
    weekly) existing_keys=$weekly_keys ;;
  esac
  if printf '%s\n' "$existing_keys" | grep -qx "${dst#*/}"; then
    echo "skip   $dst (exists)"
    continue
  fi
  echo "copy   $src -> $dst"
  if [ "$DRY_RUN" != "--dry-run" ]; then
    s3 cp "s3://$BUCKET_NAME/$src" "s3://$BUCKET_NAME/$dst" > /dev/null
  fi
  copied=$((copied + 1))
done <<< "$plan"

echo "Done: $copied object(s) ${DRY_RUN:+would be }copied."
