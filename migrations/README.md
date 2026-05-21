# Berkeleytime migrations

MongoDB shell (mongosh) scripts to migrate data.

## Running Migrations

### Kubernetes (Production/Staging)

Use the `run-migration.sh` script from your server (where kubectl/helm are configured):

```bash
# SSH into your server first, then from the repo root:
./migrations/run-migration.sh <migration-file.js> [environment]

# Examples:
./migrations/run-migration.sh add-selected-plan-requirements.js prod
./migrations/run-migration.sh add-selected-plan-requirements.js stage
```

The script will:
1. Sync migration `.js` files into the Helm chart's ConfigMap
2. Run `helm upgrade` to update the ConfigMap in the cluster
3. Execute the migration via `kubectl exec` into the MongoDB pod

### Docker (Local Development)

The `migrations` folder is mounted at `/migrations` in the MongoDB container (see `docker-compose.yml`).

```bash
# From repo root
docker exec -it <mongo-container> mongosh
load("/migrations/add-selected-plan-requirements.js")
```

### Direct Connection

```bash
mongosh "<connection-string>" migrations/add-selected-plan-requirements.js
```

Or connect first, then load:

```bash
mongosh "<connection-string>"
load("migrations/add-selected-plan-requirements.js")
```

## How It Works (Kubernetes)

The `infra/mongo` Helm chart bundles migration files in a ConfigMap (`templates/migrations-configmap.yaml`) and mounts them at `/migrations` in the MongoDB pod. The `run-migration.sh` script copies `.js` files from this folder into `infra/mongo/migrations/` before running `helm upgrade`, which updates the ConfigMap.

## Migration Files

### add-selected-plan-requirements.js

Backfills `selectedPlanRequirements` for existing plans based on their majors, minors, and colleges (UC requirements + college requirements + major/minor requirements). New plans get this automatically from the backend on create; this migration is for plans created before that change.

### seed-requirements.js

Seeds initial requirement data.
