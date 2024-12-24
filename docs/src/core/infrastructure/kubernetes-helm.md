# Kubernetes & Helm

[Kubernetes](https://kubernetes.io/) is a container orchestrator, a fundamental piece of our microservice architecture. It is a complex system with many different components. Fortunately, the documentation is decently well-written. The [concepts page](https://kubernetes.io/docs/concepts/) is a good place to start. The [glossary](https://kubernetes.io/docs/reference/glossary/?core-object=true&fundamental=true&networking=true) is also a good place to review common jargon.

[Helm](https://helm.sh/) is a package manager for Kubernetes. It allows us to build Kubernetes resources that are easily configurable and reusable. For simplicity, we try to keep all of our Kubernetes resources defined with helm, as opposed to some being defined with raw resource definitions and some with helm charts.

## Useful Commands

> [!TIP]
> On `hozer-51`, `k` is an alias for `kubectl` and `h` is an alias for `helm`.

> [!IMPORTANT]
> The default namespace has been set as `bt`.

- `k get pods`

    View all running pods.

    <details>
    <summary>Example Output</summary>

    ```bash
    root@hozer-51:~ k get pods
    NAME                                           READY   STATUS      RESTARTS       AGE
    bt-cert-manager-996dd87d8-2xlbs                1/1     Running     0              36d
    bt-cert-manager-cainjector-68d9974ddf-b7w84    1/1     Running     0              36d
    bt-cert-manager-webhook-599cc5679-v9v4n        1/1     Running     0              36d
    bt-dev-mongo-mongodb-56967b78d5-dwsk4          1/1     Running     0              14d
    bt-dev-redis-master-0                          1/1     Running     0              90d
    bt-ingress-nginx-controller-788dfdc68d-zw5cf   1/1     Running     0              36d
    bt-metallb-controller-6c6ccbb4bb-xjjm2         1/1     Running     0              36d
    bt-metallb-speaker-7lqvj                       4/4     Running     13 (91d ago)   264d
    bt-prod-app-backend-68f984687f-bbst2           1/1     Running     0              36d
    bt-prod-app-backend-68f984687f-mdbsj           1/1     Running     0              36d
    bt-prod-app-frontend-6985468b46-c89fq          1/1     Running     0              36d
    bt-prod-app-frontend-6985468b46-djxs6          1/1     Running     0              36d
    bt-prod-app-updater-28856160-dn99p             0/1     Completed   0              2d5h
    bt-prod-app-updater-28857600-4z8pw             0/1     Completed   0              29h
    bt-prod-app-updater-28859040-jmzkd             0/1     Completed   0              5h33m
    bt-prod-mongo-mongodb-b6b66fd69-h764l          1/1     Running     1 (14d ago)    36d
    bt-prod-redis-master-0                         1/1     Running     0              90d
    bt-sealed-secrets-7cb5587d77-576r5             1/1     Running     0              36d
    bt-stage-app-backend-77759c7b94-7rg5q          1/1     Running     0              6d7h
    bt-stage-app-backend-77759c7b94-kkpbf          1/1     Running     0              6d7h
    bt-stage-app-frontend-bc997f75b-9mrhn          1/1     Running     0              6d7h
    bt-stage-app-frontend-bc997f75b-gsnkx          1/1     Running     0              6d7h
    bt-stage-app-updater-28856160-94lgw            0/1     Completed   0              2d5h
    bt-stage-app-updater-28857600-grv9r            0/1     Completed   0              29h
    bt-stage-app-updater-28859040-b2mjn            0/1     Completed   0              5h33m
    bt-stage-mongo-mongodb-996b5c9d8-ws5bm         1/1     Running     0              13d
    bt-stage-redis-master-0                        1/1     Running     0              90d
    ```

    </details>


- `k get pods -l env=[dev|stage|prod]`

    View all running pods in a specified environment.

- `k logs [pod name]`

    View logs of a pod. You can get a pod's name with `k get pods`. Include a `-f` flag to follow logs, which will stream logs into your terminal.

- `k describe pod [pod name]`

    View a description of a pod. Useful for when pod is failing to startup, thus not showing any logs.

- `k exec -it [pod name] -- [command]`

    Execute a command inside a pod. The command can be `bash`, which will start a shell inside the pod and allow for more commands.

- `k get deploy`

    View all running deployments.

    <details>

    <summary>Example Output</summary>

    ```bash
    root@hozer-51:~ k get deploy
    NAME                          READY   UP-TO-DATE   AVAILABLE   AGE
    bt-cert-manager               1/1     1            1           90d
    bt-cert-manager-cainjector    1/1     1            1           90d
    bt-cert-manager-webhook       1/1     1            1           90d
    bt-dev-mongo-mongodb          1/1     1            1           14d
    bt-ingress-nginx-controller   1/1     1            1           267d
    bt-metallb-controller         1/1     1            1           264d
    bt-prod-app-backend           2/2     2            2           40d
    bt-prod-app-frontend          2/2     2            2           40d
    bt-prod-mongo-mongodb         1/1     1            1           90d
    bt-sealed-secrets             1/1     1            1           267d
    bt-stage-app-backend          2/2     2            2           36d
    bt-stage-app-frontend         2/2     2            2           36d
    bt-stage-mongo-mongodb        1/1     1            1           14d
    ```

    </details>

- `k get deploy -l env=[dev|stage|prod]`

    View all running deployments in a specified environment.

- `k describe deploy [deploy name]`

    View a description of a deploy. Useful for when the deploy's pods are failing to startup, thus not showing any logs.

- `k rollout restart deploy/[deploy name]`

    Manually restart a deployment.

- `h list`

    List helm chart installations.

    <details>

    <summary>Example Output</summary>

    ```bash
    root@hozer-51:~ h list
    NAME             	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART                	APP VERSION
    bt-base          	bt       	1       	2024-08-16 02:39:08.530680512 +0000 UTC	deployed	bt-base-0.1.0        	2.0.0-alpha
    bt-cert-manager  	bt       	1       	2024-08-15 09:09:57.055544133 +0000 UTC	deployed	cert-manager-v1.14.1 	v1.14.1
    bt-dev-mongo     	bt       	1       	2024-10-30 19:39:12.342638847 +0000 UTC	deployed	bt-mongo-0.1.0       	2.0.0-alpha
    bt-dev-redis     	bt       	1       	2024-08-15 22:48:23.811538319 +0000 UTC	deployed	bt-redis-0.1.0       	2.0.0-alpha
    bt-ingress-nginx 	bt       	2       	2024-02-20 06:54:22.749755461 +0000 UTC	deployed	ingress-nginx-4.9.1  	1.9.6
    bt-metallb       	bt       	1       	2024-02-23 22:15:39.949979855 +0000 UTC	deployed	metallb-0.14.3       	v0.14.3
    bt-prod-app      	bt       	1       	2024-10-05 00:38:19.570732559 +0000 UTC	deployed	bt-app-0.1.0         	2.0.0-alpha
    bt-prod-mongo    	bt       	1       	2024-08-15 22:49:24.829163584 +0000 UTC	deployed	bt-mongo-0.1.0       	2.0.0-alpha
    bt-prod-redis    	bt       	1       	2024-08-15 22:49:30.646137811 +0000 UTC	deployed	bt-redis-0.1.0       	2.0.0-alpha
    bt-sealed-secrets	bt       	1       	2024-02-20 06:31:59.188302177 +0000 UTC	deployed	sealed-secrets-2.15.0	0.26.0
    bt-stage-app     	bt       	1       	2024-10-09 03:17:21.69782594 +0000 UTC 	deployed	bt-app-0.1.0         	2.0.0-alpha
    bt-stage-mongo   	bt       	1       	2024-10-31 05:20:36.995251245 +0000 UTC	deployed	bt-mongo-0.1.0       	2.0.0-alpha
    bt-stage-redis   	bt       	1       	2024-08-15 22:48:39.561033896 +0000 UTC	deployed	bt-redis-0.1.0       	2.0.0-alpha
    ```

    </details>

- `h list --short | grep "^bt-dev-app" | xargs -L1 h uninstall`

    Uninstalls all development environment deploys. Specifically, list then filters for helm charts with prefix `bt-dev-app`, then uninstalls them all. As of November 14, 2024, there is no limit on the number of dev deploys. There is a noticeable amount of lag when there exceeds about 8 dev deploys.

- `helm list --all-namespaces --all | grep 'uninstalling' | awk '{print $1}' | xargs -I {} helm delete --no-hooks {}`

    Force uninstalls all helm charts in "uninstalling" state.

- `k create job --from cronjob/[cronjob name] [job name] -n bt`

    Creates a job from a cronjob. This is useful if you want to manually run the datapuller cronjob.
    Uninstalls all development environment deploys. Specifically, list then filters for helm charts with prefix `bt-dev-app`, then uninstalls them all.

## Common Errors

When deploying a [sealed secret](https://github.com/bitnami-labs/sealed-secrets) and a `no key could decrypt secret` error is seen in `kubectl describe sealedsecret/*`, there are two possible solutions:
- Solution #1: During creating of sealed secret, make sure the (unsealed) secret is created in the correct namespace.
- Solution #2: Use the tag `--scope=namespace-wide` when running `kubeseal` to allow renaming of the sealed secret. More details on [the kubeseal documentation](https://github.com/bitnami-labs/sealed-secrets?tab=readme-ov-file#scopes).
