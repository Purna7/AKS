# Sample .NET Framework 4.8 Web API Application

This is a sample ASP.NET Web API application built with .NET Framework 4.8, designed to be containerized and deployed on Azure Kubernetes Service (AKS).

## Project Structure

```
src/
├── SampleWebApp.csproj          # Project file
├── packages.config              # NuGet package dependencies
├── Web.config                   # Application configuration
├── Global.asax                  # Application entry point
├── Global.asax.cs               # Application startup code
├── App_Start/
│   └── WebApiConfig.cs         # Web API routing configuration
├── Controllers/
│   ├── HealthController.cs     # Health check endpoints
│   ├── ProductsController.cs   # Product CRUD operations
│   └── ValuesController.cs     # Sample values endpoint
├── Models/
│   └── Product.cs              # Product model
└── Properties/
    └── AssemblyInfo.cs         # Assembly metadata
```

## Features

### API Endpoints

#### Health Endpoints
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (for Kubernetes probes)

#### Products API
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update existing product
- `DELETE /api/products/{id}` - Delete product

#### Sample Endpoint
- `GET /api/values` - Sample values endpoint

## Local Development

### Prerequisites
- Visual Studio 2019 or later
- .NET Framework 4.8 SDK
- IIS Express or IIS

### Build and Run
```powershell
# Restore NuGet packages
nuget restore

# Build the project
msbuild SampleWebApp.csproj /p:Configuration=Release

# Run with IIS Express (from Visual Studio)
# Or deploy to local IIS
```

### Test Endpoints
```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:8080/health

# Get all products
Invoke-WebRequest -Uri http://localhost:8080/api/products

# Get product by ID
Invoke-WebRequest -Uri http://localhost:8080/api/products/1

# Get products by category
Invoke-WebRequest -Uri http://localhost:8080/api/products/category/Electronics
```

## Docker Build

### Build Docker Image
```powershell
# From the repository root
docker build -f Dockerfile.netframework48 -t samplewebapp:latest .
```

### Run Container Locally
```powershell
docker run -d -p 8080:8080 --name samplewebapp samplewebapp:latest

# Test the container
curl http://localhost:8080/health
```

## Deploy to Azure Container Registry

```powershell
# Build and push to ACR
az acr build `
  --registry kloudsavvyacr `
  --image samplewebapp:v1.0.0 `
  --file Dockerfile.netframework48 .
```

## Deploy to AKS

### Prerequisites
- Windows node pool in AKS cluster (for .NET Framework 4.8)
- ACR attached to AKS cluster

### Deployment
```powershell
# Apply Kubernetes manifests
kubectl apply -f k8s/dotnet-deployment.yaml

# Check deployment status
kubectl get pods -l app=samplewebapp

# Get service endpoint
kubectl get service samplewebapp-lb
```

## Migration to .NET 6/8 (Recommended)

This application can be migrated to .NET 6/8 for better container support:

### Benefits
- Much smaller image size (190MB vs 5.5GB)
- Runs on Linux nodes (cheaper)
- Better performance
- Modern async/await patterns

### Migration Steps
1. Create new .NET 6/8 Web API project
2. Copy Controllers and Models
3. Update namespaces and dependencies
4. Replace Web.config with appsettings.json
5. Update Program.cs with routing
6. Test and deploy

### Example .NET 6+ Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetAll()
    {
        return Ok(products);
    }
}
```

## Configuration

### Web.config Settings
- Target Framework: .NET Framework 4.8
- IIS Handler: ExtensionlessUrlHandler-Integrated-4.0
- Compilation: Debug mode for development, Release for production

### NuGet Packages
- Microsoft.AspNet.WebApi (5.2.9)
- Microsoft.AspNet.WebApi.Client (5.2.9)
- Microsoft.AspNet.WebApi.Core (5.2.9)
- Microsoft.AspNet.WebApi.WebHost (5.2.9)
- Newtonsoft.Json (13.0.3)

## Troubleshooting

### Build Issues
```powershell
# Clean and rebuild
msbuild SampleWebApp.csproj /t:Clean
msbuild SampleWebApp.csproj /p:Configuration=Release
```

### IIS Issues
- Ensure .NET Framework 4.8 is installed
- Check Application Pool settings (Integrated pipeline, v4.0)
- Verify web.config handlers are correct

### Docker Issues
- Windows containers require Windows host or Windows nodes in AKS
- Large image size (~5.5GB) requires sufficient disk space
- Build time can be 15-30 minutes on first build

## Performance Considerations

### Image Size
- Base image: ~5.5GB (Windows Server Core)
- Application: ~50MB
- Total: ~5.5GB

### Resource Requirements
- Memory: 1-2GB minimum
- CPU: 2+ cores recommended
- Disk: 10GB for image storage

## Security

- Admin access disabled on ACR
- RBAC-based authentication
- Non-sensitive data only in image
- Health endpoints do not expose sensitive information
- HTTPS recommended for production (configure in Web.config)

## References

- [ASP.NET Web API Documentation](https://docs.microsoft.com/en-us/aspnet/web-api/)
- [.NET Framework 4.8](https://dotnet.microsoft.com/download/dotnet-framework/net48)
- [Windows Containers on AKS](https://learn.microsoft.com/en-us/azure/aks/windows-container-cli)
