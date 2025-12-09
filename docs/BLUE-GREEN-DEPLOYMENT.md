# AKS Blue-Green Deployment Strategy

## Overview

Blue-Green deployment is a release strategy that achieves **zero downtime** by maintaining two identical production environments:
- **Blue**: Current production environment (active)
- **Green**: New production environment (standby)

Traffic is switched between environments after validating the new deployment, allowing instant rollback if issues arise.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer / Ingress                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
            ┌───────▼─────┐    ┌──────▼────────┐
            │  Blue (v1)  │    │ Green (v2)    │
            │  (Active)   │    │ (Standby)     │
            │             │    │               │
            │ Deployment  │    │  Deployment   │
            │ ├─ Pod 1    │    │  ├─ Pod 1     │
            │ ├─ Pod 2    │    │  ├─ Pod 2     │
            │ └─ Pod 3    │    │  └─ Pod 3     │
            └─────────────┘    └────────────────┘
                    ▲                    ▲
                    │                    │
            Service Label:        Service Label:
            version: blue         version: green
```

## How It Works

### Phase 1: Deployment
1. New version deployed to **Green** environment (non-active)
2. All pods must reach **Ready** state
3. Deployment verified with health checks

### Phase 2: Validation
1. Health checks on Green pods
2. Warm-up requests to initialize caches
3. Monitor for errors and resource usage

### Phase 3: Traffic Switch
1. Service selector updated from `version: blue` → `version: green`
2. All new traffic routes to Green deployment
3. Existing connections remain active until completion (graceful shutdown)

### Phase 4: Rollback (if needed)
1. If any failures detected, revert service selector to Blue
2. Blue remains available as instant rollback target
3. Investigate Green deployment issues

### Phase 5: Cleanup
1. Keep old deployment for quick rollback (configurable)
2. Manual cleanup when confidence in new version is high

## Benefits

| Benefit | Description |
|---------|-------------|
| **Zero Downtime** | Traffic switches instantly; no service interruption |
| **Instant Rollback** | Previous version remains running; revert in seconds |
| **Risk Mitigation** | Full validation before traffic switch |
| **Resource Efficient** | Only 2x resources during deployment window |
| **Testing Opportunity** | Stage environment with production traffic pattern |

## Limitations

| Limitation | Mitigation |
|-----------|-----------|
| 2x Resource Usage | Both versions run simultaneously; requires capacity |
| Data Migration | Must handle schema changes carefully |
| Sticky Sessions | Requires stateless design or session persistence |
| Long Deployments | Higher resource cost during extended deployments |

## Prerequisites

### 1. AKS Cluster Configuration
```bash
# Ensure cluster has sufficient resources
az aks show --resource-group $RG --name $CLUSTER_NAME \
  --query "agentPoolProfiles[0].{vm_size:vmSize, count:count}"
```

### 2. Service Setup
Create services with version selectors (see `blue-green-service.yaml`):
```yaml
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # This toggles between blue/green
```

### 3. Deployment Labels
Pods must include version labels:
```yaml
labels:
  app: myapp
  version: blue  # or green
```

### 4. Health Checks
Configure liveness and readiness probes:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
```

### 5. Azure Credentials
Set GitHub Secrets:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_AKS_CLUSTER_NAME`
- `AZURE_REGISTRY_LOGIN_SERVER`

## Workflow Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `deployment_name` | Deployment name (e.g., myapp) | myapp |
| `image_tag` | Docker image tag to deploy | required |
| `namespace` | Kubernetes namespace | default |
| `traffic_switch_delay` | Seconds before switching traffic | 60 |

## Usage Examples

### Example 1: Deploy New Version
```bash
# Via GitHub Actions UI
Workflow: AKS Blue-Green Deployment
deployment_name: myapp
image_tag: v2.1.0
namespace: production
traffic_switch_delay: 120
```

### Example 2: Manual kubectl Commands
```bash
# Check current active version
kubectl get service myapp -o jsonpath='{.spec.selector.version}'

# Switch to green
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

# Switch back to blue
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

## Monitoring & Observability

### Check Deployment Status
```bash
# Watch deployment progress
kubectl rollout status deployment/myapp-green -n production --timeout=5m

# Monitor pods
kubectl get pods -l app=myapp,version=green -w

# Check service endpoints
kubectl get endpoints myapp
```

### View Logs
```bash
# View logs from new deployment
kubectl logs -l app=myapp,version=green -f --timestamps

# Compare old vs new
kubectl logs -l app=myapp,version=blue -f --timestamps
```

### Metrics
```bash
# Pod resource usage
kubectl top pods -l app=myapp

# Node capacity
kubectl top nodes
```

## Troubleshooting

### Deployment Stuck in Pending
```bash
# Check pod events
kubectl describe pod POD_NAME -n NAMESPACE

# Check node capacity
kubectl describe nodes
```

### Traffic Not Switching
```bash
# Verify service selector
kubectl get service myapp -o jsonpath='{.spec.selector}'

# Check endpoints
kubectl get endpoints myapp -o yaml
```

### Health Checks Failing
```bash
# Test health endpoint manually
kubectl port-forward svc/myapp 8080:8080
curl http://localhost:8080/health

# Check pod logs
kubectl logs POD_NAME --previous
```

### Rollback to Previous Version
```bash
# Switch traffic back to blue
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'

# Delete failed green deployment
kubectl delete deployment myapp-green
```

## Advanced Scenarios

### Canary Deployment with Blue-Green
Combine blue-green with canary for gradual rollout:
```bash
# Phase 1: Deploy to green (0% traffic)
# Phase 2: Route 10% traffic to green via weighted service
# Phase 3: Route 50% traffic to green
# Phase 4: Route 100% traffic to green (blue-green complete)
```

### Multi-Region Blue-Green
For multi-region AKS clusters:
```bash
# Deploy green in each region independently
# Switch traffic in sequence: Region 1 → Region 2 → Region 3
# Enables regional rollback if needed
```

### Database Schema Changes
For applications requiring DB updates:
```bash
# 1. Expand phase: New code supports old & new schema
# 2. Deploy green with expanded code
# 3. Run migration scripts during validation phase
# 4. Switch traffic to green
# 5. Contract phase: Remove old schema support in next version
```

## Performance Considerations

### Deployment Timeline
| Phase | Duration | Notes |
|-------|----------|-------|
| Build/Push Image | 2-5 min | Depends on image size |
| Deploy Green | 1-3 min | Pull image, start pods |
| Health Checks | 1-2 min | Depends on probe settings |
| Warm-up | 1-2 min | Load caches, establish connections |
| Traffic Switch | Instant | Service selector update |
| **Total** | **6-12 min** | Zero downtime achieved |

### Resource Requirements
- Blue running: 3 pods × 512Mi = 1.5 Gi
- Green running: 3 pods × 512Mi = 1.5 Gi
- **Peak usage**: 3 Gi (during deployment)
- **Normal usage**: 1.5 Gi (after cleanup)

## Cost Optimization

1. **Auto-scale during deployment**: Scale down blue after green is active
2. **Scheduled deployments**: Deploy during low-traffic windows
3. **Faster cleanup**: Delete old deployment immediately (trade-off: slower rollback)
4. **Spot VMs**: Use for non-critical applications to reduce cost

## Security Considerations

1. **Network Policies**: Restrict traffic between blue/green if needed
2. **Image Security**: Scan images before deployment
3. **RBAC**: Limit who can trigger deployments
4. **Audit Logging**: Log all traffic switches for compliance

## References

- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Service Selector](https://kubernetes.io/docs/concepts/services-networking/service/#selector)
- [AKS Best Practices](https://learn.microsoft.com/en-us/azure/aks/best-practices)
- [Blue-Green Deployment Pattern](https://martinfowler.com/bliki/BlueGreenDeployment.html)
