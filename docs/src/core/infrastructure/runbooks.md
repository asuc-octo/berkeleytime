# Runbooks

<!-- toc -->

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
    kubeseal --controller-name bt-sealed-secrets --controller-namespace bt --secret-file my_secret.yaml --sealed-secret-file my_sealed_secret.yaml
    ```

    If the name of the secret might change across installations, add `--scope=namespace-wide` to the `kubeseal` command. For example, `bt-dev-secret` and `bt-prod-secret` are different names. Deployment without `--scope=namespace-wide` will cause a `no key could decrypt secret` error. More details on [the kubeseal documentation](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#scopes).

4. The newly create sealed secret encrypts the key-value pairs, allowing it to be safely pushed to GitHub.

Steps 2 and 3 are derived from [the sealed-secrets docs](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#usage).
