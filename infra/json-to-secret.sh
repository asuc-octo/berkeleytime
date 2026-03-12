#!/usr/bin/env bash

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed. Please install jq." >&2
  exit 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required but not installed. Please install kubectl." >&2
  exit 1
fi

if [[ $# -lt 1 || $# -gt 4 ]]; then
  echo "Usage: $0 SECRET_NAME [NAMESPACE=bt] [OUTPUT_FILE=my_secret.yaml] [SEALED_OUTPUT_FILE=my_sealed_secret.yaml]" >&2
  echo "" >&2
  echo "Reads a JSON object from stdin, e.g.:" >&2
  echo '  {"key1": "value1", "key2": "value2"}' >&2
  echo "" >&2
  echo "and generates:" >&2
  echo '  kubectl create secret generic SECRET_NAME -n NAMESPACE --dry-run=client --output=yaml \' >&2
  echo '      --from-literal=key1=value1 \' >&2
  echo '      --from-literal=key2=value2 > OUTPUT_FILE' >&2
  echo "" >&2
  echo "If SEALED_OUTPUT_FILE is provided, also runs kubeseal to create a SealedSecret." >&2
  exit 1
fi

SECRET_NAME=$1
NAMESPACE=${2:-bt}
OUTPUT_FILE=${3:-"${SECRET_NAME}.yaml"}
SEALED_OUTPUT_FILE=${4:-}

JSON_INPUT=$(cat)

if [[ -z "${JSON_INPUT// }" ]]; then
  echo "Error: no JSON provided on stdin." >&2
  exit 1
fi

if ! echo "$JSON_INPUT" | jq type >/dev/null 2>&1; then
  echo "Error: invalid JSON provided." >&2
  exit 1
fi

if [[ "$(echo "$JSON_INPUT" | jq -r 'type')" != "object" ]]; then
  echo "Error: JSON must be an object of the form {\"key\": \"value\", ...}." >&2
  exit 1
fi

mapfile -t KEYS < <(echo "$JSON_INPUT" | jq -r 'keys[]')

if [[ ${#KEYS[@]} -eq 0 ]]; then
  echo "Error: JSON object has no keys." >&2
  exit 1
fi

CMD=(kubectl create secret generic "$SECRET_NAME" -n "$NAMESPACE" --dry-run=client --output=yaml)

for KEY in "${KEYS[@]}"; do
  VALUE=$(echo "$JSON_INPUT" | jq -r --arg k "$KEY" '.[$k]')
  CMD+=(--from-literal="${KEY}=${VALUE}")
done

printf 'Generating secret manifest: %s\n' "$OUTPUT_FILE" >&2
"${CMD[@]}" > "$OUTPUT_FILE"

printf 'Wrote %s\n' "$OUTPUT_FILE" >&2

if [[ -n "$SEALED_OUTPUT_FILE" ]]; then
  if ! command -v kubeseal >/dev/null 2>&1; then
    echo "kubeseal is required to create a SealedSecret but is not installed." >&2
    exit 1
  fi

  printf 'Sealing secret to: %s\n' "$SEALED_OUTPUT_FILE" >&2
  kubeseal \
    --controller-name bt-sealed-secrets \
    --controller-namespace bt \
    --secret-file "$OUTPUT_FILE" \
    --sealed-secret-file "$SEALED_OUTPUT_FILE" \
    --scope=namespace-wide

  printf 'Wrote sealed secret %s\n' "$SEALED_OUTPUT_FILE" >&2
fi

