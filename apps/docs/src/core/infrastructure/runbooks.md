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

Backups expire automatically via R2 lifecycle rules (`infra/cloudflare/r2-lifecycle.sh`):

| Bucket path | Contents | Kept for |
| --- | --- | --- |
| `private/hourly/prod_backup-YYYYMMDDHH.gz` | Every hour | 1 day |
| `private/daily/prod_backup-YYYYMMDD.gz` | 5 AM backup | 30 days |
| `private/weekly/prod_backup-YYYYMMDD.gz` | Sunday 5 AM backup | 13 weeks |
| `private/persistent/prod_backup-YYYYMMDD.gz` | 5 AM backup on the 1st | 2 years |
| `public/daily/prod_public_backup-YYYYMMDD.gz` | Redacted daily backup | 7 days |

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

> [!NOTE]
> Changes to `infra/base`, `infra/mongo` and `infra/redis` are also diffed automatically on every pull request by the **CD: Infra Releases** workflow. See [Deploying Infra Releases](#deploying-infra-releases).

## Deploying Infra Releases

The app, AG, staff and observability charts are deployed by the `CD: Deploy to ...` workflows. The other Helm releases are deployed by the **CD: Infra Releases** workflow (`.github/workflows/cd-infra.yaml`). For how it works and why it diffs before it applies, see [Infra Releases](./cicd-workflow.md#infra-releases).

| Release | Chart | Environment |
| --- | --- | --- |
| `bt-base` | `infra/base` | production |
| `bt-prod-mongo` | `infra/mongo` | production |
| `bt-prod-redis` | `infra/redis` | production |
| `bt-stage-mongo` | `infra/mongo` (`values-staging.yaml`) | staging |
| `bt-stage-redis` | `infra/redis` (`values-staging.yaml`) | staging |

The list lives in `infra/releases.json`.

### Reading a diff

The workflow compares what a release has deployed (`helm get manifest`) with what the repository would deploy (`helm template`). Kubernetes Secrets are left out of the output.

- **Pull requests** that touch `infra/base`, `infra/mongo`, `infra/redis`, `infra/releases.json` or `infra/scripts`: open the run from the pull request's Checks tab and read the diff in the job summary.
- **Every Monday**: the diff runs for every release from `main`. The run **fails if the cluster no longer matches the repository**.
- **Run workflow**: diffs one release, and applies it if you ask.

The summary shows either `No changes: the cluster matches the repository.` or the changes the repository would make. It also lists every image and whether it is pinned. Applying is refused while any image has no fixed tag or digest (no tag, or the `latest` tag).

### Applying a release

1. Go to **Actions → CD: Infra Releases → Run workflow**. Run it from `main`: the Monday check compares the cluster with `main`, so applying from another branch makes it fail.
2. Pick the release in **Release to diff or apply** and check **Apply after the diff**.
3. When the diff finishes, read it in the job summary. Approve the `production` or `staging` deployment only if the changes are the ones you expect.
4. After approval, the workflow packages the chart with a version that identifies the commit and pushes it to the registry. Then, over SSH on `hozer-51`, it checks that every image is on the node (pulling it if not) and runs `helm upgrade --wait --timeout 10m`.
5. Check that the pods are running: `k get pods -l app.kubernetes.io/instance=<release>`.

> [!IMPORTANT]
> Mongo and Redis restart when their pod spec changes, and a Redis restart logs every user out. Apply production Mongo and Redis at a quiet hour, and apply the matching staging release first.

If the upgrade fails, the job prints the pods and the rollback command. To roll back, run this on `hozer-51`:

```sh
helm rollback <release> --namespace bt
```

> [!NOTE]
> Don't change these releases by hand (`kubectl edit`, `redis-cli CONFIG SET`, ...). The next apply overwrites the change, and the Monday check fails until the repository matches the cluster. Change the chart or values in the repository instead.

## Regenerating the `HELM_DIFF_KUBECONFIG` Secret

The diff jobs (and the `/helm-diff` pull request command) read the cluster from GitHub Actions with the `HELM_DIFF_KUBECONFIG` repository secret. It holds a kubeconfig for the read-only `helm-diff-sa` service account (`infra/base/templates/helm-diff-role.yaml`). The token inside expires after a year (or the API server's maximum). When it does, the jobs fail at **Check Cluster Access** with:

> The HELM_DIFF_KUBECONFIG secret cannot read Helm releases in namespace bt (expired or revoked token?)

To regenerate it, SSH into `hozer-51` and run:

```sh
token=$(kubectl -n bt create token helm-diff-sa --duration=8760h)
kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' > /tmp/ca
server=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
KUBECONFIG=/tmp/helm-diff.kubeconfig kubectl config set-cluster bt --server="$server"
KUBECONFIG=/tmp/helm-diff.kubeconfig kubectl config set clusters.bt.certificate-authority-data "$(cat /tmp/ca)"
KUBECONFIG=/tmp/helm-diff.kubeconfig kubectl config set-credentials helm-diff-sa --token="$token"
KUBECONFIG=/tmp/helm-diff.kubeconfig kubectl config set-context bt --cluster=bt --user=helm-diff-sa --namespace=bt
KUBECONFIG=/tmp/helm-diff.kubeconfig kubectl config use-context bt
```

Then:

1. Copy the contents of `/tmp/helm-diff.kubeconfig` into the `HELM_DIFF_KUBECONFIG` secret (**Settings → Secrets and variables → Actions**).
2. Delete the local files: `rm /tmp/ca /tmp/helm-diff.kubeconfig`.
3. Run **CD: Infra Releases** for any release with **Apply after the diff** unchecked, and check that **Check Cluster Access** passes.

> [!WARNING]
> `helm-diff-sa` cannot change anything, but it can read the Secrets in the `bt` namespace (Helm stores release records in Secrets). Treat the kubeconfig as a credential: don't paste it into chats, issues or logs, and delete the local copies.

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
