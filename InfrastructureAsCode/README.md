# AKS Terraform module

This folder provisions a Resource Group and an AKS cluster in Azure using the `azurerm` provider.

Quick start (PowerShell):

```powershell
# Authenticate with Azure CLI
az login

# (Optional) select subscription
az account set --subscription "<YOUR_SUBSCRIPTION_ID_OR_NAME>"

cd .\InfrastructureAsCode
terraform init
terraform apply -var="resource_group_name=aks-rg" -var="location=eastus"
```

Notes:
- Authentication: Terraform will use Azure CLI credentials by default (`az login`) or environment variables (`ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`).
- SSH key: defaults to `~/.ssh/id_rsa.pub`. Adjust `ssh_public_key_path` if needed.
- To get kubeconfig after apply, use the `kube_admin_config` or `kube_config` outputs and write them to a file.

Remote state (Azure Blob Storage)

You can store Terraform state in an Azure Storage account blob container. Steps below create the backend resources and then initialize Terraform with that backend.

1) Create the resource group, storage account and container (PowerShell / Azure CLI). Replace names as needed. Storage account name must be globally unique, lowercase, 3-24 characters.

```powershell
# Example values - change before running
$backendRg = "tfstate-rg"
$location = "eastus"
$storageAccount = "tfstate$([int](Get-Date -UFormat %s))" # quick unique suffix
$container = "tfstate"

az group create --name $backendRg --location $location
az storage account create --name $storageAccount --resource-group $backendRg --location $location --sku Standard_LRS --kind StorageV2
$key = (az storage account keys list --resource-group $backendRg --account-name $storageAccount --query "[0].value" -o tsv)
az storage container create --name $container --account-name $storageAccount --account-key $key

Write-Host "Backend storage created: rg=$backendRg, sa=$storageAccount, container=$container"
```

2) Initialize Terraform with backend config (run from `InfrastructureAsCode` folder):

```powershell
cd .\InfrastructureAsCode
terraform init -backend-config="resource_group_name=$backendRg" -backend-config="storage_account_name=$storageAccount" -backend-config="container_name=$container" -backend-config="key=aks.terraform.tfstate"
```

Alternatively, uncomment and edit the `backend.tf` file and run `terraform init -reconfigure`.

Notes:
- If you prefer, use an existing storage account and container. The `key` determines the blob filename for the state.
- For CI runs (GitHub Actions) you can use the same backend and Azure AD authentication (OIDC) used to run terraform init/apply.
# AKS Terraform module

This folder provisions a Resource Group and an AKS cluster in Azure using the `azurerm` provider.

Quick start (PowerShell):

```powershell
# Authenticate with Azure CLI
az login

# (Optional) select subscription
az account set --subscription "<YOUR_SUBSCRIPTION_ID_OR_NAME>"

cd .\InfrastructureAsCode
terraform init
terraform apply -var="resource_group_name=aks-rg" -var="location=eastus"
```

Notes:
- Authentication: Terraform will use Azure CLI credentials by default (`az login`) or environment variables (`ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`).
- SSH key: defaults to `~/.ssh/id_rsa.pub`. Adjust `ssh_public_key_path` if needed.
- To get kubeconfig after apply, use the `kube_admin_config` or `kube_config` outputs and write them to a file.
