$ErrorActionPreference = "Stop"

function Check-Exit {
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code $LASTEXITCODE"
    }
}

Write-Host "Starting CloudDrop setup..." -ForegroundColor Cyan

# STEP 1 - Create Kind cluster if needed

$clusters = @(kind get clusters)
Check-Exit

if ($clusters -notcontains "progressive-delivery") {
    kind create cluster `
        --name progressive-delivery `
        --config infrastructure/kind-config.yaml
    Check-Exit
}

kubectl config use-context kind-progressive-delivery
Check-Exit

# STEP 2 - Install Istio

helm repo add istio https://istio-release.storage.googleapis.com/charts
Check-Exit

helm repo update
Check-Exit

helm upgrade --install istio-base istio/base `
    -n istio-system `
    --create-namespace `
    --wait
Check-Exit

helm upgrade --install istiod istio/istiod `
    -n istio-system `
    --wait
Check-Exit

helm upgrade --install istio-ingress istio/gateway `
    -n istio-system `
    -f platform/istio/ingress-values.yaml `
    --wait
Check-Exit

# STEP 3 - Install Argo Rollouts

kubectl create namespace argo-rollouts `
    --dry-run=client -o yaml | kubectl apply -f -
Check-Exit

kubectl apply --server-side=true `
    -n argo-rollouts `
    -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
Check-Exit

kubectl wait `
    --for=condition=established `
    crd/rollouts.argoproj.io `
    --timeout=120s
Check-Exit

# STEP 4 - Install Prometheus

helm repo add prometheus-community `
    https://prometheus-community.github.io/helm-charts
Check-Exit

helm repo update
Check-Exit

helm upgrade --install prometheus prometheus-community/prometheus `
    -n istio-system `
    -f platform/prometheus/prometheus-values.yaml `
    --wait
Check-Exit

# STEP 5 - Create application namespace

kubectl create namespace prod `
    --dry-run=client -o yaml | kubectl apply -f -
Check-Exit

kubectl label namespace prod `
    istio-injection=enabled `
    --overwrite
Check-Exit

# STEP 6 - Build Docker images

docker build `
    -t clouddrop-service:v1.0.0 `
    apps/fileshare
Check-Exit

docker build `
    -t clouddrop-service:v2.0.0 `
    apps/fileshare
Check-Exit

# STEP 7 - Load images into Kind

kind load docker-image `
    clouddrop-service:v1.0.0 `
    --name progressive-delivery
Check-Exit

kind load docker-image `
    clouddrop-service:v2.0.0 `
    --name progressive-delivery
Check-Exit

# STEP 8 - Deploy storage

kubectl apply -f apps/fileshare/manifests/pvc.yaml
Check-Exit

# STEP 9 - Deploy application

kubectl apply -f apps/fileshare/manifests/
Check-Exit

# STEP 10 - Display status

Write-Host ""
Write-Host "CloudDrop manifests applied!" -ForegroundColor Green

kubectl get pods -n prod
kubectl get pvc -n prod
kubectl get rollout -n prod