// Azure Resource Group
resource "azurerm_resource_group" "aks_rg" {
	name     = var.resource_group_name
	location = var.location
	tags     = var.tags
}

// Virtual Network and Subnet for AKS
resource "azurerm_virtual_network" "aks_vnet" {
	name                = var.vnet_name
	address_space       = var.vnet_address_space
	location            = azurerm_resource_group.aks_rg.location
	resource_group_name = azurerm_resource_group.aks_rg.name
	tags                = var.tags
}

resource "azurerm_subnet" "aks_subnet" {
	name                 = var.subnet_name
	resource_group_name  = azurerm_resource_group.aks_rg.name
	virtual_network_name = azurerm_virtual_network.aks_vnet.name
	address_prefixes     = [var.subnet_prefix]

	delegation {
		name = "aks_delegation"

		service_delegation {
			name = "Microsoft.ContainerService/managedClusters"

			actions = [
				"Microsoft.Network/virtualNetworks/subnets/join/action",
			]
		}
	}
}

// User-assigned managed identity for AKS (so we can pre-assign subnet permissions)
resource "azurerm_user_assigned_identity" "aks_identity" {
	name                = var.identity_name
	resource_group_name = azurerm_resource_group.aks_rg.name
	location            = azurerm_resource_group.aks_rg.location
}

// Grant Network Contributor on the subnet to the AKS managed identity
resource "azurerm_role_assignment" "aks_subnet_network_contributor" {
	scope              = azurerm_subnet.aks_subnet.id
	role_definition_name = "Network Contributor"
	principal_id       = azurerm_user_assigned_identity.aks_identity.principal_id
}

// AKS cluster using the user-assigned identity and Azure CNI on the subnet
resource "azurerm_kubernetes_cluster" "aks" {
	name                = var.aks_name
	location            = azurerm_resource_group.aks_rg.location
	resource_group_name = azurerm_resource_group.aks_rg.name
	dns_prefix          = var.dns_prefix

	default_node_pool {
		name           = "default"
		node_count     = var.agent_count
		vm_size        = var.agent_vm_size
		vnet_subnet_id = azurerm_subnet.aks_subnet.id
	}

	identity {
		type         = "UserAssigned"
		identity_ids = [azurerm_user_assigned_identity.aks_identity.id]
	}

	role_based_access_control_enabled = true

	network_profile {
		network_plugin    = "azure"
		service_cidr      = "10.2.0.0/24"
		dns_service_ip    = "10.2.0.10"
	}

	tags = var.tags

	depends_on = [
		azurerm_role_assignment.aks_subnet_network_contributor,
	]
}

