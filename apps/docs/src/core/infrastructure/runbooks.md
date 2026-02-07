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

## Deploying a New Environment Variable with sealed-secrets

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

4. The newly created sealed secret encrypts the key-value pairs, allowing it to be safely pushed to GitHub.

Steps 2 and 3 are derived from [the sealed-secrets docs](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#usage).

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
