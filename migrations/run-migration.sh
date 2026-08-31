#!/bin/bash
#
# Run a MongoDB migration in Kubernetes.
#
# This script:
# 1. Syncs migration .js files into the Helm chart directory
# 2. Upgrades the mongo Helm chart to update the ConfigMap
# 3. Executes the specified migration in the MongoDB pod
#
# Usage: ./migrations/run-migration.sh <migration-file.js> [environment]
#
# Examples:
#   ./migrations/run-migration.sh add-selected-plan-requirements.js prod
#   ./migrations/run-migration.sh seed-requirements.js stage
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHART_DIR="$REPO_ROOT/infra/mongo"
CHART_MIGRATIONS_DIR="$CHART_DIR/migrations"

# Arguments
MIGRATION_FILE="${1:-}"
ENVIRONMENT="${2:-prod}"

# Determine release name and values file based on environment
if [ "$ENVIRONMENT" = "prod" ]; then
    RELEASE_NAME="bt-prod-mongo"
    VALUES_FILE="$CHART_DIR/values.yaml"
elif [ "$ENVIRONMENT" = "stage" ]; then
    RELEASE_NAME="bt-stage-mongo"
    VALUES_FILE="$CHART_DIR/values-staging.yaml"
else
    echo "Error: Unknown environment '$ENVIRONMENT'. Use 'prod' or 'stage'."
    exit 1
fi

NAMESPACE="bt"

# Validate arguments
if [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: $0 <migration-file.js> [environment]"
    echo ""
    echo "Available migrations:"
    ls -1 "$SCRIPT_DIR"/*.js 2>/dev/null | xargs -n1 basename || echo "  (none found)"
    echo ""
    echo "Environment: prod (default) or stage"
    exit 1
fi

# Check migration file exists
if [ ! -f "$SCRIPT_DIR/$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found: $SCRIPT_DIR/$MIGRATION_FILE"
    exit 1
fi

echo "=== Migration: $MIGRATION_FILE ==="
echo "Environment: $ENVIRONMENT"
echo "Release: $RELEASE_NAME"
echo ""

# Step 1: Sync migration files to chart directory
echo "Step 1: Syncing migration files to Helm chart..."
mkdir -p "$CHART_MIGRATIONS_DIR"
cp "$SCRIPT_DIR"/*.js "$CHART_MIGRATIONS_DIR/"
echo "  Copied $(ls -1 "$CHART_MIGRATIONS_DIR"/*.js | wc -l | tr -d ' ') migration file(s)"

# Step 2: Helm upgrade to update ConfigMap
echo ""
echo "Step 2: Upgrading Helm chart to update ConfigMap..."
helm upgrade "$RELEASE_NAME" "$CHART_DIR" \
    --namespace="$NAMESPACE" \
    --values="$VALUES_FILE" \
    --reuse-values

echo "  Helm upgrade complete"

# Step 3: Wait for ConfigMap to propagate (pods may need a moment)
echo ""
echo "Step 3: Waiting for ConfigMap update to propagate..."
sleep 3

# Step 4: Find the MongoDB pod
echo ""
echo "Step 4: Finding MongoDB pod..."
MONGO_POD=$(kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/instance=$RELEASE_NAME" -o jsonpath='{.items[0].metadata.name}')

if [ -z "$MONGO_POD" ]; then
    echo "Error: Could not find MongoDB pod for release $RELEASE_NAME"
    exit 1
fi
echo "  Found pod: $MONGO_POD"

# Step 5: Run the migration
echo ""
echo "Step 5: Running migration..."
echo "  Executing: load(\"/migrations/$MIGRATION_FILE\")"
echo ""
echo "--- Migration Output ---"

kubectl exec -it -n "$NAMESPACE" "$MONGO_POD" -- mongosh --quiet --eval "load('/migrations/$MIGRATION_FILE')"

echo "--- End Migration Output ---"
echo ""
echo "Migration complete!"
