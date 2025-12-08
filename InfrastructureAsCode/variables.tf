variable "location" {
	description = "Azure region to deploy into"
	type        = string
	default     = "eastus"
}

variable "resource_group_name" {
	description = "Name of the resource group to create"
	type        = string
	default     = "aks-rg"
}

variable "aks_name" {
	description = "Name of the AKS cluster"
	type        = string
	default     = "aks-cluster"
}

variable "dns_prefix" {
	description = "DNS prefix for the AKS cluster"
	type        = string
	default     = "aks"
}

variable "agent_count" {
	description = "Number of nodes in the default node pool"
	type        = number
	default     = 1
}

variable "agent_vm_size" {
	description = "VM size for AKS nodes"
	type        = string
	default     = "standard_dc16ads_cc_v5"
}

variable "ssh_admin_username" {
	description = "Admin username for AKS Linux nodes"
	type        = string
	default     = "azureuser"
}

variable "ssh_public_key_path" {
	description = "Path to SSH public key used for node SSH access"
	type        = string
	default     = "~/.ssh/id_rsa.pub"
}

variable "tags" {
	description = "Tags to apply to resources"
	type        = map(string)
	default     = { "environment" = "dev" }
}

variable "vnet_name" {
	description = "Name of the virtual network"
	type        = string
	default     = "aks-vnet"
}

variable "vnet_address_space" {
	description = "Address space for the VNet"
	type        = list(string)
	default     = ["10.0.0.0/8"]
}

variable "subnet_name" {
	description = "Name of the subnet for AKS nodes"
	type        = string
	default     = "aks-subnet"
}

variable "subnet_prefix" {
	description = "Address prefix for the AKS subnet"
	type        = string
	default     = "10.240.0.0/16"
}

variable "use_user_assigned_identity" {
	description = "Whether to create and use a user-assigned managed identity for AKS (recommended for Azure CNI)"
	type        = bool
	default     = true
}

variable "identity_name" {
	description = "Name for the user-assigned managed identity"
	type        = string
	default     = "aks-uai"
}

variable "azure_storage_account_access_key" {
	description = "Storage account access key for Terraform remote state (sensitive). Prefer passing via CI secret or -backend-config at init."
	type        = string
	sensitive   = true
	default     = ""
}


