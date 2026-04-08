#!/bin/bash
# Script para generar secrets desde archivos .env

ENV=${1:-development}  # default: development

echo "Generando secrets para entorno: $ENV"

# Crear secrets
kubectl create secret generic db-secrets \
  --from-env-file=k8s/overlays/$ENV/secrets/db-secret.env \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic jwt-secrets \
  --from-env-file=k8s/overlays/$ENV/secrets/jwt-secret.env \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets aplicados correctamente"