# Berkeleytime migrations

MongoDB shell (mongosh) scripts to migrate data.

**Docker:** The `migrations` folder is mounted at `/migrations` in the MongoDB container (see `docker-compose.yml`).

**Kubernetes:** The `infra/mongo` Helm chart bundles these files in a ConfigMap named `<release-name>-migrations` and mounts it at `/migrations` in the MongoDB pod (see `values.yaml` → `mongodb.extraVolumes`). No extra `--set` is required for the ConfigMap name.

For staging, prefer `helm upgrade ... ./infra/mongo -f ./infra/mongo/values-staging.yaml` (sets `hostPath`, smaller `mongodb.resources`, and `env: stage`). If you install from default `values.yaml` only, override `hostPath` every upgrade so the PV is not patched (e.g. `--set hostPath=/data/stage/db`).

## add-selected-plan-requirements.js

Backfills `selectedPlanRequirements` for existing plans based on their majors, minors, and colleges (UC requirements + college requirements + major/minor requirements). New plans get this automatically from the backend on create; this migration is for plans created before that change.

**Run with mongosh** (from repo root or pass full path to the script):

```bash
mongosh "<connection-string>" infra/mongo/migrations/add-selected-plan-requirements.js
```

Or connect first, then load:

```bash
mongosh "<connection-string>"
load("infra/mongo/migrations/add-selected-plan-requirements.js")
```
