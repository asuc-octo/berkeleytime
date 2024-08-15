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

helm install bt-base ./base --namespace=bt

# ==========
# DEPENDENCIES
# ==========

helm dependencies build ./mongo
helm dependencies build ./redis

# ==========
# PRODUCTION
# ==========

helm install bt-prod-mongo ./mongo --namespace=bt

helm install bt-prod-redis ./redis --namespace=bt

helm install bt-prod-app ./app --namespace=bt \
    --set host=stanfurdtime.com

# ==========
# STAGING
# ==========


helm install bt-stage-mongo ./mongo --namespace=bt \
    --set mongodb.commonLabels.env=stage \
    --set hostPath=/data/stage/db \
    --set mongodb.persistence.existingClaim=bt-stage-mongo-pvc

helm install bt-stage-redis ./redis --namespace=bt \
    --set redis.commonLabels.env=stage

helm install bt-stage-app ./app --namespace=bt \
    --set commonLabels.env=stage \
    --set host=staging.stanfurdtime.com \
    --set mongoUri=mongodb://bt-stage-mongo-mongodb.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-stage-redis-master.bt.svc.cluster.local:6379 \

# ==========
# DEVELOPMENT
# ==========

helm install bt-dev-mongo ./mongo --namespace=bt \
    --set mongodb.commonLabels.env=dev \
    --set hostPath=/data/dev/db \
    --set mongodb.persistence.existingClaim=bt-dev-mongo-pvc

helm install bt-dev-redis ./redis --namespace=bt \
    --set redis.commonLabels.env=dev

helm install bt-dev-app ./app --namespace=bt \
    --set commonLabels.env=dev \
    --set host=dev1.stanfurdtime.com \
    --set mongoUri=mongodb://bt-dev-mongo-mongodb.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-dev-redis-master.bt.svc.cluster.local:6379 \
    --set nodeEnv=development
