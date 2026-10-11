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
│   └── payment-service/           # E-Commerce Payment Microservice
│       ├── src/                   # Node.js Express API with /metrics & health probes
│       ├── Dockerfile             # Multi-stage container build
│       └── manifests/             # Kubernetes Rollout, VirtualService, Services & mTLS
├── infrastructure/                # Local & Cloud Cluster Configurations (Kind / EKS)
├── platform/                      # Core Mesh & Observability (Istio, Prometheus, Argo Rollouts)
├── scripts/                       # Chaos Engineering & Traffic Simulation Scripts
└── docs/                          # Architecture Diagrams & Senior Interview Q&A
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
* **Checkout API:** `http://localhost/checkout`
* **Health Check:** `http://localhost/health`
* **Web UI:** Open `http://localhost` in your browser.

---

## 🧪 Demonstrations

### 1. Progressive Canary Rollout
```powershell
kubectl patch rollout payment-service -n prod --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "payment-service:v2.0.0"}]'
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
