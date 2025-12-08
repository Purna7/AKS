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
