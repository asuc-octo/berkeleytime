# Berkeleytime migrations

MongoDB shell (mongosh) scripts to migrate data.

**Docker:** The `migrations` folder is mounted at `/migrations` in the MongoDB container (see `docker-compose.yml`).

**Kubernetes:** The `infra/mongo` Helm chart bundles these files in a ConfigMap named `<release-name>-migrations` and mounts it at `/migrations` in the `mongod` pod (see `templates/mongod.yaml`). Auth is enabled, so run `mongosh` with the root credentials exposed in the pod, e.g. `kubectl exec -it bt-prod-mongo-mongodb-0 -- sh -c 'mongosh $MONGO_AUTH'` (`migrations/run-migration.sh` does this for you).

For staging and dev, use `helm upgrade ... ./infra/mongo -f ./infra/mongo/values-staging.yaml` (or `values-dev.yaml`), which set `hostPath`, `hostPathSearch`, smaller `resources`, and `env`. If you install from default `values.yaml` only, override `hostPath`/`hostPathSearch` every upgrade so the PVs are not patched.

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
