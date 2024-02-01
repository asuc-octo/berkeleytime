#!/usr/bin/env bash

# install ingress-nginx with helm
helm upgrade --install ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --namespace bt-base --create-namespace        # using namespace=bt-base requires changing chart values (through --set or --values)

# install app with helm. run in /new-infra
helm install bt \
    --name-template=bt \
    --namespace=bt --create-namespace

# uninstall app with helm on config changes. run in /new-infra
helm uninstall bt \
    --namespace=bt

# install mongodb with helm
helm upgrade --install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb \
    --namespace=bt --create-namespace \
    --values=./mongodb/values.yaml

# install redis with helm
helm upgrade --install redis oci://registry-1.docker.io/bitnamicharts/redis \
    --namespace=bt --create-namespace \
    --values=./redis/values.yaml
