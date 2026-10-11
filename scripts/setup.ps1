<#
.SYNOPSIS
    One-click setup script for Progressive Delivery platform with Istio & Argo Rollouts.
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting Progressive Delivery & Service Mesh Bootstrap  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Cluster Provisioning
Write-Host "`n[1/6] Creating Kind Kubernetes Cluster..." -ForegroundColor Yellow
kind create cluster --config infrastructure/kind-config.yaml

# 2. Istio Service Mesh
Write-Host "`n[2/6] Installing Istio Service Mesh..." -ForegroundColor Yellow
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update
helm install istio-base istio/base -n istio-system --create-namespace
helm install istiod istio/istiod -n istio-system --wait
helm install istio-ingress istio/gateway -n istio-system -f platform/istio/ingress-values.yaml --wait

# 3. Argo Rollouts Controller
Write-Host "`n[3/6] Installing Argo Rollouts Controller..." -ForegroundColor Yellow
kubectl create namespace argo-rollouts
kubectl apply --server-side=true -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# 4. Prometheus Observability
Write-Host "`n[4/6] Installing Prometheus Monitoring Stack..." -ForegroundColor Yellow
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus -n istio-system -f platform/prometheus/prometheus-values.yaml --wait

# 5. Build and Load Application Containers
Write-Host "`n[5/6] Building & Loading CloudDrop Microservice Images..." -ForegroundColor Yellow
docker build -t clouddrop-service:v1.0.0 apps/fileshare
docker build -t clouddrop-service:v2.0.0 apps/fileshare
kind load docker-image clouddrop-service:v1.0.0 --name progressive-delivery
kind load docker-image clouddrop-service:v2.0.0 --name progressive-delivery

# 6. Deploy Workloads to Prod Namespace
Write-Host "`n[6/6] Deploying CloudDrop Workloads to prod namespace..." -ForegroundColor Yellow
kubectl create namespace prod
kubectl label namespace prod istio-injection=enabled --overwrite
kubectl apply -f apps/fileshare/manifests/

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Platform Ready! Visit: http://localhost                 " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
