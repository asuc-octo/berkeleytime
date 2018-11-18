#!/bin/bash

# Secrets
kubectl apply -f aws-secrets.yaml
kubectl apply -f sis-secrets.yaml
kubectl apply -f google-secrets.yaml
kubectl apply -f sendgrid-secrets.yaml
kubectl apply -f sentry-dsn-secrets.yaml

# Config 
kubectl apply -f berkeleytime-configs.yaml

# Pods Deployement 
kubectl apply -f berkeleytime-deploy.yaml

# Deploy a service
kubectl apply -f berkeleytime-svc.yaml
