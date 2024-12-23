# CI/CD Workflow

We use GitHub actions to build our CI/CD workflows.[^1] All three[^2] CI/CD workflows are fairly similar to each other and can all be broken into two phases: the build and the deploy phase. The differences are managed by each individual workflow file: `cd-dev.yaml`, `cd-stage.yaml`, and `cd-prod.yaml`.

## Build Phase

An application container and Helm chart are **built** and **pushed** to a registry. We use [Docker Hub](https://hub.docker.com/). This process is what `.github/workflows/cd-build.yaml` is responsible for.

## Deploy Phase

After the container and Helm chart are built and pushed to a registry, they are **pulled** and **deployed** onto `hozer-51`. This process is what `.github/workflows/cd-deploy.yaml` is responsible for.

[^1]: In the past, we have used a self-hosted GitLab instance. However, the CI/CD pipeline was obscured behind a admin login page. Hopefully, with GitHub actions, the deployment process will be more transparent and accessible to all engineers. Please don't break anything though!

[^2]: Development, Staging, and Production
