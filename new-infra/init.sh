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

# creates the PV and PVC
kubectl apply -f mongo-PV-PVC.yaml -n bt

# delete PVC
kubectl delete pvc bt-mongodb-pv-claim -n bt

# delete PV
kubectl delete pv bt-mongodb-pv

# install mongodb with helm, replace CHARTNAME with the name of the chart
helm install mongo \
    --set nameOverride="db",persistence.existingClaim=bt-mongodb-pv-claim,persistence.mountPath="./db" \
    --namespace=bt --create-namespace \
    oci://registry-1.docker.io/bitnamicharts/mongodb

# install redis with helm
helm install redis \
    --set replica.replicaCount=0,master.persistence.enabled=false,replica.persistence.enabled=false \
    --namespace=bt --create-namespace \
    oci://registry-1.docker.io/bitnamicharts/redis