#!/bin/bash

# exit on error
set -e

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add bitnami-labs https://bitnami-labs.github.io/sealed-secrets/
helm repo add cert-manager https://charts.jetstack.io
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx


# ===================
# BASE INFRASTRUCTURE
# ===================

helm install bt-sealed-secrets bitnami-labs/sealed-secrets --version 2.15.0 --namespace=bt --create-namespace

# see https://cert-manager.io/docs/installation/helm/#3-install-customresourcedefinitions
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.1/cert-manager.crds.yaml
helm dependencies build ./certs
helm install bt-certs ./certs --namespace=bt

helm install bt-ingress-nginx ingress-nginx/ingress-nginx --version 4.9.1 --namespace=bt

# ==========
# PRODUCTION
# ==========

helm install bt-prod-mongo ./mongo --namespace=bt

helm dependencies build ./redis
helm install bt-prod-redis ./redis --namespace=bt

helm install bt-prod-app ./app --namespace=bt \
    --set host=stanfurdtime.com \
    --set mongoUri=mongodb://bt-prod-mongo-svc.bt.svc.cluster.local:27017 \
    --set redisUri=redis://bt-prod-redis-master.bt.svc.cluster.local:6379 \
    --set nodeEnv=development