// Example backend configuration for storing Terraform state in Azure Blob Storage.
// Do NOT enable this block until you've created the storage account and container.
// Replace the placeholders below or use `terraform init -backend-config=...` to configure.

// terraform {
//   backend "azurerm" {
//     resource_group_name  = "<BACKEND_RESOURCE_GROUP>"
//     storage_account_name = "<STORAGE_ACCOUNT_NAME>"
//     container_name       = "<CONTAINER_NAME>"
//     key                  = "aks.terraform.tfstate"
//   }
// }
terraform {
    backend "azurerm" {
        resource_group_name  = "kloudsavvy-commonRG"
        storage_account_name = "kloudsavvyinfraterraform"
        container_name       = "terraformbackend"
        key                  = "aks.terraform.tfstate"
        access_key           = var.azure_storage_account_access_key
    }
}
