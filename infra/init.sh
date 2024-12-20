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

helm install bt-sealed-secrets bitnami-labs/sealed-secrets --version 2.15.0 --namespace=bt --create-namespace
helm install bt-metallb metallb/metallb --version 0.14.3 --namespace=bt
helm install bt-cert-manager cert-manager/cert-manager --set installCRDs=true --version 1.14.1 --namespace=bt
helm install bt-ingress-nginx ingress-nginx/ingress-nginx --version 4.9.1 --namespace=bt

helm package ./infra/base --version 1.0.0 --dependency-update
helm push ./base-1.0.0.tgz oci://registry-1.docker.io/octoberkeleytime/bt-base
helm install bt-base oci://registry-1.docker.io/octoberkeleytime/bt-base --namespace=bt \
    --version=1.0.0

# ==========
# BUILD CHARTS AND PUSH TO REGISTRY
# ==========

helm package ./infra/mongo --version 1.0.0 --dependency-update
helm push ./mongo-1.0.0.tgz oci://registry-1.docker.io/octoberkeleytime/bt-mongo
helm package ./infra/redis --version 1.0.0 --dependency-update
helm push ./redis-1.0.0.tgz oci://registry-1.docker.io/octoberkeleytime/bt-redis

# ==========
# PRODUCTION
# ==========

helm install bt-prod-mongo oci://registry-1.docker.io/octoberkeleytime/bt-mongo --namespace=bt \
    --version=1.0.0

helm install bt-prod-redis oci://registry-1.docker.io/octoberkeleytime/bt-redis --namespace=bt \
    --version=1.0.0

helm install bt-prod-app oci://registry-1.docker.io/octoberkeleytime/bt-app --namespace=bt \
    --version=1.0.0 \
    --set host=stanfurdtime.com

# ==========
# STAGING
# ==========

helm install bt-stage-mongo oci://registry-1.docker.io/octoberkeleytime/bt-mongo --namespace=bt \
    --version=1.0.0 \
    --set mongodb.commonLabels.env=stage \
    --set hostPath=/data/stage/db \
    --set mongodb.persistence.existingClaim=bt-stage-mongo-pvc

helm install bt-stage-redis oci://registry-1.docker.io/octoberkeleytime/bt-redis --namespace=bt \
    --version=1.0.0 \
    --set redis.commonLabels.env=stage

helm install bt-stage-app oci://registry-1.docker.io/octoberkeleytime/bt-app --namespace=bt \
    --version=0.1.0-stage \
    --set env=stage \
    --set frontend.image.tag=latest \
    --set backend.image.tag=latest \
    --set host=staging.stanfurdtime.com \
    --set mongoUri=mongodb://bt-stage-mongo-mongodb.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-stage-redis-master.bt.svc.cluster.local:6379 \

# ==========
# DEVELOPMENT
# ==========

helm install bt-dev-mongo oci://registry-1.docker.io/octoberkeleytime/bt-mongo --namespace=bt \
    --version=1.0.0 \
    --set mongodb.commonLabels.env=dev \
    --set hostPath=/data/dev/db \
    --set mongodb.persistence.existingClaim=bt-dev-mongo-pvc

helm install bt-dev-redis oci://registry-1.docker.io/octoberkeleytime/bt-redis --namespace=bt \
    --version=1.0.0 \
    --set redis.commonLabels.env=dev

helm install bt-dev-app oci://registry-1.docker.io/octoberkeleytime/bt-app --namespace=bt \
    --version=0.1.0-dev \
    --set env=dev \
    --set ttl=24 \
    --set frontend.image.tag=dev1 \
    --set backend.image.tag=dev1 \
    --set host=dev1.stanfurdtime.com \
    --set mongoUri=mongodb://bt-dev-mongo-mongodb.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-dev-redis-master.bt.svc.cluster.local:6379 \
    --set nodeEnv=development
