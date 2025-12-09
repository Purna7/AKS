output "resource_group_name" {
  description = "Name of the resource group created"
  value       = azurerm_resource_group.aks_rg.name
}

output "aks_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.aks.name
}

output "kube_config" {
  description = "Kubeconfig for the cluster (user)"
  value     = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}

output "kube_admin_config" {
  description = "Admin kubeconfig for the cluster"
  value       = azurerm_kubernetes_cluster.aks.kube_admin_config_raw
  sensitive   = true
}

output "vnet_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.aks_vnet.id
}

output "subnet_id" {
  description = "ID of the AKS subnet"
  value       = azurerm_subnet.aks_subnet.id
}

output "identity_client_id" {
  description = "Client ID for the user-assigned managed identity"
  value       = azurerm_user_assigned_identity.aks_identity.client_id
  sensitive    = false
}

output "identity_principal_id" {
  description = "Principal ID for the user-assigned managed identity"
  value       = azurerm_user_assigned_identity.aks_identity.principal_id
}

output "acr_id" {
  description = "ID of the Azure Container Registry"
  value       = azurerm_container_registry.acr.id
}

output "acr_login_server" {
  description = "Login server for the Azure Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_name" {
  description = "Name of the Azure Container Registry"
  value       = azurerm_container_registry.acr.name
}
