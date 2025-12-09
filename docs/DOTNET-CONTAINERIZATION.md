# Containerizing .NET Applications for AKS

## Overview

This guide covers containerizing .NET Framework 4.8 and .NET 6/8 applications for deployment on Azure Kubernetes Service (AKS).

## Architecture Decision

### .NET Framework 4.8 (Windows-based)
```
┌─────────────────────────────────────┐
│   Windows Server Core Container     │
│   ├── .NET Framework 4.8 Runtime    │
│   ├── IIS                           │
│   └── Your ASP.NET Application      │
└─────────────────────────────────────┘
```

**Pros**:
- Runs existing .NET Framework 4.8 code without changes
- Full compatibility with Windows-specific features
- IIS integration

**Cons**:
- Large image size (> 5GB)
- Requires Windows nodes in AKS (costly)
- Higher resource consumption
- Slower deployments
- Limited scaling options

### .NET 6/8 (Linux-based - RECOMMENDED)
```
┌─────────────────────────────────────┐
│   Alpine Linux Container            │
│   ├── .NET 8 Runtime                │
│   ├── ASP.NET Core                  │
│   └── Your Application              │
└─────────────────────────────────────┘
```

**Pros**:
- Tiny image size (100-200MB)
- Works on Linux nodes (cheap standard AKS nodes)
- Cross-platform
- Excellent performance
- Built for containers
- Modern async/await patterns

**Cons**:
- Requires code migration from .NET Framework
- Cannot use Windows-specific APIs

## Migration Path: .NET Framework 4.8 → .NET 6/8

### Phase 1: Assessment
```bash
# Run .NET Portability Analyzer
dotnet tool install -g Microsoft.DotNet.PortabilityAnalyzer
portabilityanalyzer -f YourApp.csproj -t ".NET 6.0"
```

### Phase 2: Incremental Migration
1. Create new .NET 6 project
2. Share business logic via shared library
3. Gradually migrate features
4. Run both in parallel during transition

### Phase 3: Testing
```bash
# Local testing with Docker Compose
docker-compose up

# Test health endpoints
curl http://localhost:8080/health

# Performance testing
dotnet test -v detailed
```

## Dockerfile Best Practices

### 1. Multi-Stage Builds
Reduces image size by excluding build tools:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
# ... build steps ...
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY --from=builder /app/publish .
```

### 2. Non-Root User
Improves security:
```dockerfile
RUN useradd -m -u 1001 appuser
USER appuser
```

### 3. Health Checks
Enables AKS readiness probes:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8080/health || exit 1
```

### 4. Layer Optimization
Order layers from least to most changeable:
```dockerfile
# Stable: Restore dependencies (cached)
COPY ["*.csproj", "./"]
RUN dotnet restore

# Changes frequently: Copy source and build
COPY . .
RUN dotnet build
```

## Building & Pushing to Azure Container Registry

### 1. Create Container Registry
```bash
ACR_NAME="kloudsavvyacr"
RESOURCE_GROUP="aks-rg"

az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic
```

### 2. Build Image
```bash
# Build locally with ACR
az acr build \
  --registry $ACR_NAME \
  --image yourapp:v1.0.0 \
  --file Dockerfile.net8 .

# Or build with Docker and push
docker build -f Dockerfile.net8 -t yourapp:v1.0.0 .
docker tag yourapp:v1.0.0 $ACR_NAME.azurecr.io/yourapp:v1.0.0
docker push $ACR_NAME.azurecr.io/yourapp:v1.0.0
```

### 3. Grant AKS Access to ACR
```bash
# Attach ACR to AKS cluster
az aks update \
  --name $AKS_CLUSTER \
  --resource-group $RESOURCE_GROUP \
  --attach-acr $ACR_NAME
```

## Kubernetes Deployment Manifest

### Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yourapp
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yourapp
  template:
    metadata:
      labels:
        app: yourapp
        version: v1
    spec:
      containers:
      - name: yourapp
        image: kloudsavvyacr.azurecr.io/yourapp:v1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        
        # Environment Variables
        env:
        - name: ASPNETCORE_URLS
          value: "http://+:8080"
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: connection-string
        
        # Readiness Probe
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Liveness Probe
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 20
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Resource Limits
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        
        # Security Context
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
          capabilities:
            drop:
              - ALL

      # Affinity
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - yourapp
              topologyKey: kubernetes.io/hostname
      
      # Termination Grace Period
      terminationGracePeriodSeconds: 30
```

### Service YAML
```yaml
apiVersion: v1
kind: Service
metadata:
  name: yourapp
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  selector:
    app: yourapp
```

## Local Testing

### Using Docker
```bash
# Build
docker build -f Dockerfile.net8 -t yourapp:latest .

# Run
docker run -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  yourapp:latest

# Test
curl http://localhost:8080/health
```

### Using Docker Compose
```bash
docker-compose up

# View logs
docker-compose logs -f dotnet8-app

# Stop
docker-compose down
```

### Using Kind (Local Kubernetes)
```bash
# Create local cluster
kind create cluster --name local-test

# Load image
kind load docker-image yourapp:latest --name local-test

# Deploy
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Port forward
kubectl port-forward svc/yourapp 8080:80

# Test
curl http://localhost:8080
```

## Application Health Endpoints

### Health Check Endpoint
```csharp
// Program.cs (.NET 8)
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description
            })
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});

// Add custom health checks
services.AddHealthChecks()
    .AddCheck("database", () => 
    {
        // Check database connectivity
        return HealthCheckResult.Healthy();
    })
    .AddCheck("cache", () =>
    {
        // Check cache connectivity
        return HealthCheckResult.Healthy();
    });
```

## Troubleshooting

### Image Not Found
```bash
# Verify image in registry
az acr repository list --name $ACR_NAME

# Check ACR access from AKS
az aks check-acr \
  --name $AKS_CLUSTER \
  --resource-group $RESOURCE_GROUP \
  --acr-name $ACR_NAME
```

### Pod Not Starting
```bash
# Check pod events
kubectl describe pod POD_NAME

# Check logs
kubectl logs POD_NAME

# Check image pull
kubectl get events --sort-by='.lastTimestamp'
```

### Health Check Failures
```bash
# Port forward to test
kubectl port-forward pod/POD_NAME 8080:8080

# Test endpoint
curl http://localhost:8080/health

# Check probe settings
kubectl get deployment yourapp -o yaml | grep -A 10 readinessProbe
```

## Performance Optimization

### Image Size Comparison
```
.NET Framework 4.8:  ~5.5 GB (too large for AKS)
.NET 6.0:            ~200 MB
.NET 8.0:            ~190 MB
Alpine-based:        ~120 MB (minimal)
```

### Build Time Optimization
```dockerfile
# Cache NuGet packages
RUN dotnet restore

# Build only changed code
COPY . .
RUN dotnet build -c Release --no-restore
```

### Runtime Optimization
```bash
# Use ReadyToRun (AOT)
<PublishReadyToRun>true</PublishReadyToRun>

# Reduce startup time
<TieredCompilation>true</TieredCompilation>
<TieredCompilationQuickJit>true</TieredCompilationQuickJit>
```

## Security Checklist

- [ ] Non-root user (UID 1001)
- [ ] Read-only root filesystem
- [ ] No privileged escalation
- [ ] Resource limits set
- [ ] Security context defined
- [ ] Network policies applied
- [ ] Secrets not in image
- [ ] Image scanning enabled
- [ ] Base image kept updated
- [ ] Vulnerability scanning in CI/CD

## References

- [Microsoft: Containerize .NET Apps](https://learn.microsoft.com/en-us/dotnet/architecture/containerized-lifecycle/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [AKS Best Practices](https://learn.microsoft.com/en-us/azure/aks/best-practices)
- [.NET 8 Migration Guide](https://learn.microsoft.com/en-us/dotnet/core/migrating-from-net-framework)
