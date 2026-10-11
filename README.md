# 🛡️ Enterprise Progressive Delivery & Service Mesh Platform

> **Zero-Downtime Canary Deployments & SLO-Based Automated Rollbacks with Istio, Argo Rollouts, and Prometheus.**

---

## 🌟 Overview
In enterprise architectures (fintech, e-commerce, banking), standard Kubernetes `RollingUpdate` deployments are dangerous: a subtle bug can pass basic readiness checks and replace 100% of healthy pods, causing a full production outage.

This repository demonstrates a **Senior/Lead-level SRE & Platform Engineering solution**:
* **Layer 7 Traffic Splitting:** Dynamic percentage-based routing (10% ➔ 30% ➔ 60% ➔ 100%) via **Istio Envoy proxies**.
* **Automated SLO Analysis:** Real-time **Prometheus PromQL queries** evaluating HTTP 5xx error rates and latency before advancing traffic.
* **Instant Automated Rollback:** Automated rollbacks in `<15 seconds` without human intervention if error thresholds breach SLO limits.
* **Zero-Trust Security:** Automatic **mTLS encryption** between microservice pods using Istio `DestinationRules`.

---

## 🏗️ Repository Architecture

```text
Progressive Delivery devops2/
├── .github/workflows/             # GitHub Actions CI/CD (Test, Lint & Canary Release)
├── apps/
│   └── fileshare/                 # CloudDrop File Sharing Microservice
│       ├── backend/               # Node.js Express API with /metrics & shared volume
│       ├── frontend/              # React 18 Telemetry Dashboard & Upload UI
│       ├── Dockerfile             # Multi-stage container build
│       └── manifests/             # Kubernetes Rollout, VirtualService, Services & mTLS
├── infrastructure/                # Local & Cloud Cluster Configurations (Kind / EKS)
├── platform/                      # Core Mesh & Observability (Istio, Prometheus, Argo Rollouts)
├── scripts/                       # Chaos Engineering & Traffic Simulation Scripts
└── docs/                          # Architecture Diagrams & Documentation
```

---

## 🚀 Quickstart (Run Locally in 5 Minutes)

### Prerequisites
* Docker Desktop (running)
* `kind`, `kubectl`, and `helm` installed

### 1. One-Click Automated Setup
```powershell
.\scripts\setup.ps1
```

### 2. Access the Application
* **Web Portal:** Open `http://localhost` in your browser.
* **Health Check:** `http://localhost/health`
* **Metrics:** `http://localhost/metrics`

---

## 🧪 Demonstrations

### 1. Progressive Canary Rollout
```powershell
kubectl patch rollout clouddrop-service -n prod --type=merge -p '{"spec":{"template":{"spec":{"containers":[{"name":"clouddrop-service","image":"clouddrop-service:v2.0.0","env":[{"name":"APP_VERSION","value":"v2.0.0-canary"},{"name":"RELEASE_COLOR","value":"#10b981"}]}]}}}}'
```

### 2. Generate Live Customer Traffic
```powershell
.\scripts\generate-traffic.ps1 -Requests 50
```

### 3. Inject Chaos & Watch Auto-Rollback
```powershell
.\scripts\trigger-chaos.ps1 -Percentage 100
```

---

## 📚 Documentation
* [Detailed Architecture & Flow Diagram](docs/architecture.md)
