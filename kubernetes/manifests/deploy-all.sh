#!/bin/bash

# Secrets
kubectl apply -f configs/aws-secrets.yaml
kubectl apply -f configs/sis-secrets.yaml
kubectl apply -f configs/google-secrets.yaml
kubectl apply -f configs/google-secrets-2.yaml
kubectl apply -f configs/sendgrid-secrets.yaml
kubectl apply -f configs/sentry-dsn-secrets.yaml

# Configs
kubectl apply -f configs/berkeleytime-configs.yaml

# Deploy the Production Server
kubectl apply -f berkeleytime/berkeleytime-deploy-prod.yaml
kubectl apply -f berkeleytime/berkeleytime-svc-prod.yaml

# Deploy the Staging Server
kubectl apply -f berkeleytime/berkeleytime-deploy-stage.yaml
kubectl apply -f berkeleytime/berkeleytime-svc-stage.yaml
