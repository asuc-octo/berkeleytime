#!/usr/bin/env bash

# install ingress-nginx with helm
helm upgrade --install ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --namespace ingress-nginx --create-namespace

# install app with helm. run in /new-infra
helm install app \
    --name-template=bt \
    --namespace=bt --create-namespace \

# uninstall app with helm on config changes. run in /new-infra
helm uninstall app \
    --namespace=bt

