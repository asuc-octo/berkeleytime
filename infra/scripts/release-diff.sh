#!/usr/bin/env bash
# Compares what a Helm release has deployed with what the repository would
# deploy, without the helm-diff plugin (its GitHub release download kept
# returning 504 in CI). Needs read access to the release's Helm secrets only.
#
#   infra/scripts/release-diff.sh <release> <chart dir> [values file]
#
# Prints a unified diff. Exit status: 0 no changes, 2 changes, 1 error.
# Kubernetes Secrets are left out of the output so their data is not logged.
set -euo pipefail

release=$1
chart=$2
values=${3:-}
namespace=${NAMESPACE:-bt}
kube_version=${KUBE_VERSION:-1.32.1} # the cluster's version, for charts that check it

args=(--namespace "$namespace" --kube-version "$kube_version" --is-upgrade --no-hooks)
if [ -n "$values" ]; then args+=(--values "$values"); fi

deployed=$(mktemp)
proposed=$(mktemp)
trap 'rm -f "$deployed" "$proposed" "$deployed.clean" "$proposed.clean"' EXIT

helm get manifest "$release" --namespace "$namespace" > "$deployed"
helm template "$release" "$chart" "${args[@]}" > "$proposed"

# Drop Secret documents and empty documents; keep everything else as rendered
strip() {
  python3 - "$1" <<'PY'
import re, sys
text = open(sys.argv[1]).read()
docs = re.split(r"(?m)^---[ \t]*$", text)
keep = [d.strip("\n") for d in docs
        if d.strip() and not re.search(r"(?m)^kind:[ \t]*Secret[ \t]*$", d)]
print("\n---\n".join(keep))
PY
}
strip "$deployed" > "$deployed.clean"
strip "$proposed" > "$proposed.clean"

if diff -u --label "deployed: $release" --label "repository: $chart" \
    "$deployed.clean" "$proposed.clean"; then
  exit 0
else
  status=$?
  [ "$status" -eq 1 ] && exit 2
  exit 1
fi
