# Database Backup

<!-- toc -->

<!-- also, would you be interested in adding documntation to docs.stanfudtime about the mongo backup? if not i can write it too. probably like a new page under infra talking about how often it runs/ttl of backups/which backups are persistent/how does the namespacing work in the r2/how to access backups/how to use the runbooks -->

## Manually run `datapuller`

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
## Previewing Infra Changes with `/helm-diff` before deployment

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

## New sealed secret deployment

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

4. The newly create sealed secret encrypts the key-value pairs, allowing it to be safely pushed to GitHub.

Steps 2 and 3 are derived from [the sealed-secrets docs](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#usage).

## Kubernetes Cluster Initialization

On (extremely) rare occasions, the cluster will fail. To recreate the cluster, follow the instructions below (note that these may be incomplete, as the necessary repair varies):

1. [Install necessary dependencies](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/). Note that you may **not** need to install all dependencies. Our choice of Container Runtime Interface (CRI) is `containerd` with `runc`. You will probably **not** need to configure the cgroup driver (our choice is `systemd`), but if so, make sure to set it in both the `kubelet` and `containerd` configs.

2. [Initialize the cluster with `kubeadm`](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/).

3. [Install Cilium](https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/#install-the-cilium-cli), our choice of Container Network Interface (CNI). Note that you may **not** need to install the `cilium` CLI tool.

4. Follow the commands in `infra/init.sh` one-by-one, ensuring each deployment succeeds, up until the `bt-base` installation.

5. Because the `sealed-secrets` instance has been redeployed, every `SealedSecret` manifest must be recreated using `kubeseal` and the new `sealed-secrets` instance. Look at the [sealed secret deployment runbook](#new-sealed-secret-deployment).

6. Now, each remaining service can be deployed. Note that MongoDB and Redis must be deployed before the backend service, otherwise the backend service will crash. Feel free to use the CI/CD pipeline to deploy the application services.
