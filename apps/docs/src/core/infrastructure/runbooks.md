# Runbooks

<!-- toc -->

## Manually Run `datapuller` (and Other CronJobs)

1. First, list all cronjob instances:

   ```sh
   k get cronjob
   ```

2. Then, create a job from the specific cronjob:

   ```sh
   k create job --from cronjob/[cronjob name] [job name]
   ```

   For example:

   ```sh
   k create job --from cronjob/bt-prod-datapuller-courses bt-prod-datapuller-courses-manual-01
   ```

## Fetch Mongo Backups

Backups are served at `https://backups.berkeleytime.com`:

- Public: `GET /public/*` 
- Private: `GET /private/*`

### Public backup (no auth)

Public backups are meant for local development and include only a redacted subset of the `bt` database. The public backup includes these collections:

- `classes`
- `courses`
- `terms`
- `sections`
- `gradeDistributions`
- `enrollmentHistories`
- `enrollmenttimeframes`

```sh
curl -f -o "prod-backup.gz" "https://backups.berkeleytime.com/public/daily/prod_public_backup-$(TZ=America/Los_Angeles date -v -6H +%Y%m%d).gz"
```

### Private backup (Cloudflare Access)

First, install the Cloudflare command line tool:
```sh
brew install cloudflare/cloudflare/cloudflared
cloudflared access login https://backups.berkeleytime.com
```

You can then fetch the backup
```sh
cloudflared access curl \
  "https://backups.berkeleytime.com/private/hourly/prod_backup-$(TZ=America/Los_Angeles date -v -6H +%Y%m%d%H).gz" \
  -o "prod-backup.gz"
```

### Copy Data Into Container
Reproduced from local development:
```sh
docker cp ./prod-backup.gz berkeleytime-mongodb-1:/tmp/prod-backup.gz
docker exec berkeleytime-mongodb-1 mongorestore --drop --gzip --archive=/tmp/prod-backup.gz
docker exec berkeleytime-mongodb-1 mongosh bt --eval 'const r = db.users.findOneAndUpdate({ email: "dev@berkeleytime.local" }, { $setOnInsert: { googleId: "dev-fake-public-backup", email: "dev@berkeleytime.local", name: "Dev User", staff: false, lastSeenAt: new Date() } }, { upsert: true, returnDocument: "after" }); print("Dev user id: " + r._id); print("Login URL: http://localhost:3000/api/dev/login?userId=" + r._id + "&redirect_uri=/");'
```

## MongoDB and Search (`mongot`)

Each environment's `bt-<env>-mongo` release (`infra/mongo`) runs two StatefulSets:

- `bt-<env>-mongo-mongodb-0`: `mongod` 8.3 (single-member replica set `rs0`, auth enabled). The `mongod-init` sidecar initiates the replica set and creates/updates the `root`, `bt` (app) and `mongot` users from the `bt-<env>-mongo-auth` Secret on every start.
- `bt-<env>-mongo-search-0`: `mongot`, which powers `$search`, `$searchMeta` and `$vectorSearch`. `mongod` proxies these to it over gRPC (port 27028); clients only ever connect to `mongod`.

### Connecting with `mongosh`

The `mongod` container exposes `$MONGO_AUTH` (root credentials) for exec sessions:

```sh
k exec -it bt-prod-mongo-mongodb-0 -- sh -c 'mongosh $MONGO_AUTH bt'
```

### Creating the auth Secret for an environment

The Secret needs four keys. Passwords must be URL-safe because the app interpolates them into `MONGODB_URI`:

```sh
cat <<EOF | ./infra/json-to-secret.sh bt-prod-mongo-auth bt bt-prod-mongo-auth.yaml bt-prod-mongo-auth-sealed.yaml
{
  "keyfile": "$(openssl rand -base64 756 | tr -d '\n')",
  "root-password": "$(openssl rand -hex 32)",
  "app-password": "$(openssl rand -hex 32)",
  "mongot-password": "$(openssl rand -hex 32)"
}
EOF
```

Copy the `encryptedData` from the sealed output into `auth.encryptedData` in the environment's values file (`infra/mongo/values.yaml`, `values-staging.yaml`, `values-dev.yaml`), or apply it directly with `k apply -f`. Changing `app-password` or `mongot-password` later takes effect on the next `mongod` pod restart; `root-password` must be rotated manually with `db.changeUserPassword` first.

### Creating a vector search index

```js
const bt = db.getSiblingDB("bt");
bt.myCollection.createSearchIndex({
  name: "my_vector_index",
  type: "vectorSearch",
  definition: {
    fields: [{ type: "vector", path: "embedding", numDimensions: 1536, similarity: "cosine" }],
  },
});
bt.myCollection.getSearchIndexes(); // wait for status: "READY"
```

Check `mongot` health with `k exec bt-prod-mongo-search-0 -- curl -s localhost:8080/health` (expect `SERVING`). Index data lives on the `hostPathSearch` volume; if it is lost, `mongot` rebuilds indexes from `mongod`.

> **Note:** `mongodump` does not include search index definitions, and the restore/reset jobs drop the `bt` database. Search indexes must be recreated after any restore, so keep their definitions in code and create them idempotently (as `docker/mongodb/init/01-create-search-indexes.js` does locally).

### Upgrading an environment from the Bitnami chart (MongoDB 8.0)

8.0 data files cannot be opened by 8.3, so each environment is migrated with dump and restore into a new data directory (`/data/<env>/db83`). The old directory (`/data/<env>/db`) is left in place for rollback. Do dev, then stage, then prod (prod needs a short maintenance window).

1. Create and apply the `bt-<env>-mongo-auth` Secret (see above).
2. Suspend writers: `k patch cronjob <name> -p '{"spec":{"suspend":true}}'` for each `bt-<env>-app-datapuller-*` cronjob.
3. Dump: `k exec bt-<env>-mongo-mongodb-0 -- mongodump --db=bt --archive=/tmp/pre83.gz --gzip && k cp bt-<env>-mongo-mongodb-0:/tmp/pre83.gz ./pre83.gz`
4. `helm uninstall bt-<env>-mongo` (hostPath data stays on disk), then install chart `2.0.0` with the environment's values file.
5. Wait for both pods to be Ready, then restore:
   ```sh
   k cp ./pre83.gz bt-<env>-mongo-mongodb-0:/tmp/pre83.gz
   k exec bt-<env>-mongo-mongodb-0 -- sh -c "mongorestore \$MONGO_AUTH --nsInclude='bt.*' --archive=/tmp/pre83.gz --gzip --drop"
   ```
6. Point the app at the authenticated Mongo by setting `mongoAuthSecret: bt-<env>-mongo-auth` for that environment (`infra/app/values.yaml` for prod, the `values:` block in `.github/workflows/cd-stage.yaml` / `cd-dev.yaml` for stage and dev) and redeploy the app. Unsuspend the datapuller cronjobs.
7. Verify document counts against the dump, run a manual backup job (`k create job --from=cronjob/bt-base-backup-prod-mongo <job name>`), and smoke-test `$vectorSearch` on a scratch collection.

**Rollback:** `helm uninstall bt-<env>-mongo`, reinstall chart `1.0.0` with `hostPath=/data/<env>/db`, and unset `mongoAuthSecret`.

## Secrets

### Deploying a new environment variable with sealed-secrets

Useful when adding new environment variables to `.env`. To ensure our env variables can be deployed to GitHub without their true value being leaked, they should be encrypted before being pushed to GitHub.

1. SSH into `hozer-51`.
2. Create a new secret manifest with the key-value pairs and save into `my_secret.yaml`:

   ```sh
   k create secret generic my_secret -n bt --dry-run=client --output=yaml \
       --from-literal=key1=value1 \
       --from-literal=key2=value2 > my_secret.yaml
   ```

3. Create a sealed secret from the previously created manifest:

   ```sh
   kubeseal --controller-name bt-sealed-secrets --controller-namespace bt \
       --secret-file my_secret.yaml --sealed-secret-file my_sealed_secret.yaml
   ```

   If the name of the secret might change across installations, add `--scope=namespace-wide` to the `kubeseal` command. For example, `bt-dev-secret` and `bt-prod-secret` are different names. Deployment without `--scope=namespace-wide` will cause a `no key could decrypt secret` error. More details on [the kubeseal documentation](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#scopes).

4. The newly created sealed secret encrypts the key-value pairs, allowing it to be safely pushed to GitHub. You will need to paste the generated values into `infra/apps/templates/backend.yaml` or similar. Just edit the relevant variables, and keep the rest of the settings the same (ie. minimize the git diff).

Steps 2 and 3 are derived from [the sealed-secrets docs](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#usage).

### Using `json-to-secret.sh` to generate (Sealed) Secrets

We have a helper script at `infra/json-to-secret.sh` that turns a JSON object into a Kubernetes `Secret` manifest, and optionally a `SealedSecret`. This should be run from within hozer-51.

**Usage**

The script reads a JSON object from stdin and generates a `Secret` manifest (and, if requested, a `SealedSecret` manifest):

```sh
./infra/json-to-secret.sh SECRET_NAME [NAMESPACE=bt] [OUTPUT_FILE=SECRET_NAME.yaml] [SEALED_OUTPUT_FILE=my_sealed_secret.yaml]
```

Example (generate both a `Secret` and `SealedSecret` for production backend env vars in the `bt` namespace):

```sh
cat <<'EOF' | ./infra/json-to-secret.sh bt-prod-backend-env bt bt-prod-backend-env.yaml bt-prod-backend-env-sealed.yaml
{
  "MONGO_URI": "mongodb://...",
  "REDIS_URL": "redis://...",
  "JWT_SECRET": "super-secret"
}
EOF
```

This will:

1. Create a `kubectl create secret generic ... --dry-run=client --output=yaml` manifest and write it to `bt-prod-backend-env.yaml`.
2. If `SEALED_OUTPUT_FILE` is provided, run `kubeseal` with `--scope=namespace-wide` and write the `SealedSecret` manifest to `bt-prod-backend-env-sealed.yaml`.

You should then move/rename the generated `SealedSecret` manifest into the appropriate Helm chart (for example under `infra/app/templates/`) and commit it to the repo.

### Recommended flow for updating secrets/variables

When you need to **add, change, or remove** environment variables in an existing secret:

1. **Identify the secret and namespace**
   - Decide on `SECRET_NAME` and `NAMESPACE` (typically `bt`, or environment-specific like `bt-dev`).
2. **Prepare the JSON definition locally**
   - Create or update a local JSON file (not committed) that represents the full set of key-value pairs you want in the secret, e.g. `bt-prod-backend-env.json`.
3. **Regenerate the manifests with `json-to-secret.sh`**
   - Pipe the updated JSON into the script using the same `SECRET_NAME` and namespace as before:

   ```sh
   cat bt-prod-backend-env.json | ./infra/json-to-secret.sh bt-prod-backend-env bt bt-prod-backend-env.yaml bt-prod-backend-env-sealed.yaml
   ```

4. **Follow step 4 from above.**

## Previewing Infra Changes with `/helm-diff` Before Deployment

The `/helm-diff` command can be used in pull request comments to preview Helm changes before they are deployed. This is particularly useful when:

1. Making changes to Helm chart values in `infra/app` or `infra/base`
2. Upgrading Helm chart versions or dependencies
3. Modifying Kubernetes resource configurations

To use it:

1. Comment `/helm-diff` on any pull request
2. The workflow will generate a diff showing:
   - Changes to both app and base charts
   - Resource modifications (deployments, services, etc.)
   - Configuration updates

The diff output is formatted as collapsible sections for each resource, with a raw diff available at the bottom for debugging.

## Uninstall ALL development helm releases

```sh
h list --short | grep "^bt-dev-app" | xargs -L1 h uninstall
```

Development deployments are limited by CI/CD. However, if for some reason the limit is bypassed, this is a quick command to uninstall all helm releases starting with `bt-dev-app`.

## Force uninstall ALL helm charts in "uninstalling" state

```sh
helm list --all-namespaces --all | grep 'uninstalling' | awk '{print $1}' | xargs -I {} helm delete --no-hooks {}
```

Sometimes, releases will be stuck in an `uninstalling` state. This command quickly force uninstalls all such stuck helm releases.

## Kubernetes API Server Certificate Renewal

Kubernetes API server's certificates have a default expiration of 1 year. If they are expired and you try to use `kubectl`, this is what you may see:

```sh
root@hozer-51:~# k get pods
Unable to connect to the server: tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2026-01-16T00:12:21-08:00 is after 2026-01-16T04:29:31Z
```

You can check when these certificates expire with this command:

```sh
kubeadm certs check-expiration
```

To renew them, run the following commands on the control plane node:

```sh
sudo kubeadm certs renew all

# Restart the Kubernetes control plane pods to pick up the new certificates
sudo mv /etc/kubernetes/manifests/*.yaml /tmp/
# Wait 20-30 seconds.
sudo mv /tmp/*.yaml /etc/kubernetes/manifests/
```

Test that this worked by running `k get pods` again. If not, debug using `kubeadm certs check-expiration`.

## Kubernetes Cluster Initialization

On (extremely) rare occasions, the cluster will fail. To recreate the cluster, follow the instructions below (note that these may be incomplete, as the necessary repair varies):

1. [Install necessary dependencies](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/). Note that you may **not** need to install all dependencies. Our choice of Container Runtime Interface (CRI) is `containerd` with `runc`. You will probably **not** need to configure the cgroup driver (our choice is `systemd`), but if so, make sure to set it in both the `kubelet` and `containerd` configs.

2. [Initialize the cluster with `kubeadm`](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/).

3. [Install Cilium](https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/#install-the-cilium-cli), our choice of Container Network Interface (CNI). Note that you may **not** need to install the `cilium` CLI tool.

4. Follow the commands in `infra/init.sh` one-by-one, ensuring each deployment succeeds, up until the `bt-base` installation.

5. Because the `sealed-secrets` instance has been redeployed, every `SealedSecret` manifest must be recreated using `kubeseal` and the new `sealed-secrets` instance. Look at the [sealed secret deployment runbook](#new-sealed-secret-deployment).

6. Now, each remaining service can be deployed. Note that MongoDB and Redis must be deployed before the backend service, otherwise the backend service will crash. Feel free to use the CI/CD pipeline to deploy the application services.
