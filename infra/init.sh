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
# PRODUCTION
# ==========

helm install bt-prod-mongo ./mongo --namespace=bt \
    --set hostPath=/dev/prod/db \
    --set mongodb.persistence.existingClaim=bt-prod-mongo-pvc

helm dependencies build ./redis
helm install bt-prod-redis ./redis --namespace=bt

helm install bt-prod-app ./app --namespace=bt \
    --set host=stanfurdtime.com \
    --set mongoUri=mongodb://bt-prod-mongo-mongodb.bt.svc.cluster.local:27017/bt \
    --set redisUri=redis://bt-prod-redis-master.bt.svc.cluster.local:6379 \
    --set nodeEnv=development
