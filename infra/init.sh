#!/bin/bash

# exit on error
set -e

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add bitnami-labs https://bitnami-labs.github.io/sealed-secrets/
helm repo add cert-manager https://charts.jetstack.io
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add metallb https://metallb.github.io/metallb

# ===================
# BASE INFRASTRUCTURE
# ===================

helm install bt-sealed-secrets bitnami-labs/sealed-secrets --version 2.17.0 --namespace=bt --create-namespace
helm install bt-metallb metallb/metallb --version 0.14.9 --namespace=bt
helm install bt-cert-manager cert-manager/cert-manager --set crds.enabled=true --version 1.16.2 --namespace=bt

# TODO: eventually remove redirect
helm upgrade bt-ingress-nginx ingress-nginx/ingress-nginx --version 4.12.0 --namespace=bt \
    --set controller.allowSnippetAnnotations=true \
    --set-string controller.config.server-snippet="if (\$host = \"beta.berkeleytime.com\") { return 308 https://berkeleytime.com\$request_uri; }"

helm package ./infra/base --version 1.0.0 --dependency-update
helm push ./bt-base-1.0.0.tgz oci://registry-1.docker.io/octoberkeleytime
helm install bt-base oci://registry-1.docker.io/octoberkeleytime/bt-base --namespace=bt \
    --version=1.0.0

# ==========
# BUILD CHARTS AND PUSH TO REGISTRY
# ==========

helm package ./infra/mongo --version 1.0.0 --dependency-update
helm push ./bt-mongo-1.0.0.tgz oci://registry-1.docker.io/octoberkeleytime
helm package ./infra/redis --version 1.0.0 --dependency-update
helm push ./bt-redis-1.0.0.tgz oci://registry-1.docker.io/octoberkeleytime

# ==========
# PRODUCTION
# ==========

helm install bt-prod-mongo oci://registry-1.docker.io/octoberkeleytime/bt-mongo --namespace=bt \
    --version=1.0.0 \
    --set mongodb.resourcesPreset=large

helm install bt-prod-redis oci://registry-1.docker.io/octoberkeleytime/bt-redis --namespace=bt \
    --version=1.0.0

helm install bt-prod-app oci://registry-1.docker.io/octoberkeleytime/bt-app --namespace=bt \
    --version=1.0.0 \
    --set host=berkeleytime.com

# ==========
# STAGING
# ==========

helm install bt-stage-mongo oci://registry-1.docker.io/octoberkeleytime/bt-mongo --namespace=bt \
    --version=1.0.0 \
    --set mongodb.commonLabels.env=stage \
    --set hostPath=/data/stage/db

helm install bt-stage-redis oci://registry-1.docker.io/octoberkeleytime/bt-redis --namespace=bt \
    --version=1.0.0 \
    --set redis.commonLabels.env=stage

helm install bt-stage-app oci://registry-1.docker.io/octoberkeleytime/bt-app --namespace=bt \
    --version=0.1.0-stage \
    --set env=stage \
    --set frontend.image.tag=latest \
    --set agFrontend.image.tag=latest \
    --set backend.image.tag=latest \
    --set host=staging.berkeleytime.com \
    --set mongoUri=mongodb://bt-stage-mongo-mongodb-0.bt-stage-mongo-mongodb-headless.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-stage-redis-master.bt.svc.cluster.local:6379

# ==========
# DEVELOPMENT
# ==========

helm install bt-dev-mongo oci://registry-1.docker.io/octoberkeleytime/bt-mongo --namespace=bt \
    --version=1.0.0 \
    --set mongodb.commonLabels.env=dev \
    --set hostPath=/data/dev/db

helm install bt-dev-redis oci://registry-1.docker.io/octoberkeleytime/bt-redis --namespace=bt \
    --version=1.0.0 \
    --set redis.commonLabels.env=dev

helm install bt-dev-app oci://registry-1.docker.io/octoberkeleytime/bt-app --namespace=bt \
    --version=0.1.0-dev \
    --set env=dev \
    --set ttl=24 \
    --set frontend.image.tag=dev1 \
    --set agFrontend.image.tag=dev1 \
    --set backend.image.tag=dev1 \
    --set host=dev1.berkeleytime.com \
    --set mongoUri=mongodb://bt-dev-mongo-mongodb-0.bt-dev-mongo-mongodb-headless.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-dev-redis-master.bt.svc.cluster.local:6379 \
    --set nodeEnv=development

# ==========
# DOCS
# ==========

helm install bt-prod-docs oci://registry-1.docker.io/octoberkeleytime/bt-docs --namespace=bt \
    --version=1.0.0 \
    --set host=docs.berkeleytime.com

# ==========
# AG
# ==========

helm install bt-ag oci://registry-1.docker.io/octoberkeleytime/bt-ag --namespace=bt \
    --version=1.0.0

# ==========
# STAFF
# ==========

helm install bt-staff oci://registry-1.docker.io/octoberkeleytime/bt-staff --namespace=bt \
    --version=1.0.0
