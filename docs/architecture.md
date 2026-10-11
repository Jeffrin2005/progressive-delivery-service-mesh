# Progressive Delivery & Zero-Trust Service Mesh Architecture

## 1. Executive Architecture Summary

This project implements enterprise-grade **Progressive Canary Delivery** combined with **Zero-Trust Service Mesh Networking** on Kubernetes. It eliminates the blast radius of degraded software releases by replacing brittle standard `RollingUpdate` deployments with automated, telemetry-driven traffic gating and instantaneous rollbacks.

```
                    [ Incoming User Traffic (Internet) ]
                                    │
                                    ▼
                [ Istio Ingress Gateway (Envoy Proxy: Port 80) ]
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         │                                                     │
         ▼ (Dynamic Weight: 80%)                               ▼ (Dynamic Weight: 20%)
[ payment-service-stable (v1.0.0) ]                   [ payment-service-canary (v2.0.0) ]
  • Envoy Sidecar (mTLS)                                • Envoy Sidecar (mTLS)
  • 4 Pods Serving Prod Traffic                         • 1 Canary Pod under test
         │                                                     │
         └──────────────────────────┬──────────────────────────┘
                                    ▼
                      [ Prometheus Telemetry Engine ]
                       • Scrapes /metrics every 5s
                       • PromQL: HTTP 5xx error rate
                                    │
                                    ▼
                     [ Argo Rollouts Controller ]
                      • Evaluates AnalysisTemplate
                      • IF Error Rate <= 5% -> Promote to 50% -> 100%
                      • IF Error Rate > 5%  -> INSTANT ROLLBACK (<15s)
```

---

## 2. Core Architectural Pillars

### A. Dynamic Layer-7 Traffic Management (Istio Service Mesh)
* Standard Kubernetes `Service` operates at Layer 4 (TCP) using simple kube-proxy round-robin, meaning traffic distribution cannot be controlled at precise percentages.
* Istio utilizes **Envoy proxies** running as sidecars alongside every pod (`istio-injection=enabled`).
* The **Istio VirtualService** splits traffic at exact granular weights (`weight: 80` vs `weight: 20`).
* Argo Rollouts integrates directly with the VirtualService API, dynamically rewriting the routing weights without pod restarts or configuration downtime.

### B. Mutual TLS (mTLS) Zero-Trust Security
* Every microservice connection is secured with automatic **ISTIO_MUTUAL** TLS encryption via `DestinationRule`.
* Certificates are provisioned, rotated, and managed dynamically by `istiod` using SPIFFE cryptographic identities.

### C. Telemetry-Driven Automated Analysis (Prometheus & Argo Rollouts)
* Deployments are no longer subjective or time-dependent.
* An `AnalysisTemplate` queries Prometheus every 10 seconds during the release:
  $$\text{5xx Error Rate} = \frac{\sum(\text{rate}(\text{http\_requests\_total}\{\text{status\_code}=\sim\text{"5.*"}\}[1m]))}{\sum(\text{rate}(\text{http\_requests\_total}[1m]))}$$
* If the error threshold exceeds **5%**, the release is automatically aborted, resetting traffic to 100% stable in $<15$ seconds without human intervention.
