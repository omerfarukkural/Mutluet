#!/bin/bash
# Argo CD Bootstrap Scripti
# Cluster'a Argo CD kurulumu ve ilk uygulama manifestlerinin uygulanması.
# Kullanım: ./bootstrap-argocd.sh <kubeconfig-path>

set -euo pipefail

ARGOCD_VERSION="${ARGOCD_VERSION:-v2.13.0}"
NAMESPACE="argocd"

echo "🚀 Argo CD Bootstrap başlatılıyor..."
echo "   Sürüm: ${ARGOCD_VERSION}"

# 1. Namespace oluştur
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

# 2. Argo CD kur
kubectl apply -n "${NAMESPACE}" \
  -f "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"

echo "⏳ Argo CD pod'larının hazır olması bekleniyor..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/argocd-server -n "${NAMESPACE}"

# 3. Argo CD admin şifresi al
ARGOCD_PASSWORD=$(kubectl -n "${NAMESPACE}" get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d)
echo "🔑 Argo CD Admin Şifresi: ${ARGOCD_PASSWORD}"
echo "   (Bu şifreyi değiştirmeyi unutmayın!)"

# 4. Uygulama manifestlerini uygula
echo "📋 Uygulama manifestleri uygulanıyor..."
kubectl apply -f infra/gitops/apps/applications.yaml

echo "✅ Argo CD bootstrap tamamlandı!"
echo ""
echo "Argo CD UI'ya erişmek için:"
echo "  kubectl port-forward svc/argocd-server -n ${NAMESPACE} 8080:443"
echo "  Tarayıcıda: https://localhost:8080"
echo "  Kullanıcı: admin"
echo "  Şifre: ${ARGOCD_PASSWORD}"
