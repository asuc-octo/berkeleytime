# Berkeleytime migrations

MongoDB shell (mongosh) scripts to migrate data.

**Docker:** The `migrations` folder is mounted at `/migrations` in the MongoDB container (see `docker-compose.yml`).

**Kubernetes:** The `infra/mongo` Helm chart bundles these files in a ConfigMap and mounts them at `/migrations` in the MongoDB pod. When installing the mongo chart, set the ConfigMap name: `--set mongodb.extraVolumes[0].configMap.name=<release-name>-migrations` (e.g. `bt-prod-mongo-migrations`).

## add-selected-plan-requirements.js

Backfills `selectedPlanRequirements` for existing plans based on their majors, minors, and colleges (UC requirements + college requirements + major/minor requirements). New plans get this automatically from the backend on create; this migration is for plans created before that change.

**Run with mongosh** (from repo root or pass full path to the script):

```bash
mongosh "<connection-string>" migrations/add-selected-plan-requirements.js
```

Or connect first, then load:

```bash
mongosh "<connection-string>"
load("migrations/add-selected-plan-requirements.js")
```
