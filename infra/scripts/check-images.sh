#!/usr/bin/env bash
# Lists the images in rendered Helm manifests (read from stdin) and fails if
# any of them can change on the next pull: no tag, the `latest` tag, and no
# digest. Used by .github/workflows/cd-infra.yaml before applying a release.
#
#   helm template bt-prod-mongo infra/mongo -n bt | infra/scripts/check-images.sh
set -euo pipefail

images=$(grep -E '^[[:space:]]*-?[[:space:]]*image:[[:space:]]' \
  | sed -E 's/^[[:space:]]*-?[[:space:]]*image:[[:space:]]*//; s/["'\'']//g; s/[[:space:]]+$//' \
  | sort -u || true)

unpinned=0
while IFS= read -r image; do
  [ -z "$image" ] && continue
  name=${image##*/}
  if [[ $image == *@sha256:* ]]; then
    echo "pinned    $image"
  elif [[ $name != *:* || $name == *:latest ]]; then
    echo "UNPINNED  $image"
    unpinned=1
  else
    echo "tagged    $image"
  fi
done <<< "$images"

if [ "$unpinned" -ne 0 ]; then
  echo "Set image.digest (or a fixed tag) in the chart values for every UNPINNED image." >&2
fi
exit "$unpinned"
