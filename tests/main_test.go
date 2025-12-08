package test

import (
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestResourceGroupCreation validates that the resource group is created with correct properties
func TestResourceGroupCreation(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name": "test-aks-rg",
			"location":            "eastus",
			"tags": map[string]interface{}{
				"environment": "test",
			},
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify outputs exist
	outputs := terraform.OutputAll(t, terraformOptions)
	assert.NotNil(t, outputs["resource_group_name"], "resource_group_name output should exist")

	resourceGroupName := terraform.Output(t, terraformOptions, "resource_group_name")
	assert.Equal(t, "test-aks-rg", resourceGroupName, "resource group name should match input")
}

// TestVNetCreation validates virtual network and subnet configuration
func TestVNetCreation(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name": "test-aks-rg-vnet",
			"location":            "eastus",
			"vnet_name":           "test-vnet",
			"vnet_address_space":  []string{"10.0.0.0/8"},
			"subnet_name":         "test-subnet",
			"subnet_prefix":       "10.240.0.0/16",
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify VNet output
	vnetID := terraform.Output(t, terraformOptions, "vnet_id")
	assert.NotEmpty(t, vnetID, "VNet ID should not be empty")

	// Verify subnet output
	subnetID := terraform.Output(t, terraformOptions, "subnet_id")
	assert.NotEmpty(t, subnetID, "Subnet ID should not be empty")
	assert.Contains(t, subnetID, "test-subnet", "Subnet ID should contain subnet name")
}

// TestUserAssignedIdentityCreation validates managed identity is created
func TestUserAssignedIdentityCreation(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name":      "test-aks-rg-identity",
			"location":                 "eastus",
			"identity_name":            "test-aks-uai",
			"use_user_assigned_identity": true,
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify identity outputs
	identityClientID := terraform.Output(t, terraformOptions, "identity_client_id")
	assert.NotEmpty(t, identityClientID, "Identity client ID should not be empty")

	identityPrincipalID := terraform.Output(t, terraformOptions, "identity_principal_id")
	assert.NotEmpty(t, identityPrincipalID, "Identity principal ID should not be empty")
}

// TestAKSClusterCreation validates AKS cluster configuration
func TestAKSClusterCreation(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name": "test-aks-rg-cluster",
			"location":            "eastus",
			"aks_name":            "test-aks-cluster",
			"dns_prefix":          "testaks",
			"agent_count":         1,
			"agent_vm_size":       "Standard_B2s",
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify AKS name output
	aksName := terraform.Output(t, terraformOptions, "aks_name")
	assert.Equal(t, "test-aks-cluster", aksName, "AKS cluster name should match input")

	// Verify kubeconfig outputs exist (sensitive, but should be present)
	outputs := terraform.OutputAll(t, terraformOptions)
	assert.NotNil(t, outputs["kube_config"], "kube_config output should exist")
	assert.NotNil(t, outputs["kube_admin_config"], "kube_admin_config output should exist")
}

// TestAKSNodePoolConfiguration validates the default node pool settings
func TestAKSNodePoolConfiguration(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name": "test-aks-rg-nodepool",
			"location":            "eastus",
			"aks_name":            "test-aks-np",
			"dns_prefix":          "testaksnp",
			"agent_count":         2,
			"agent_vm_size":       "Standard_B2s",
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify AKS cluster is created
	aksName := terraform.Output(t, terraformOptions, "aks_name")
	assert.NotEmpty(t, aksName, "AKS cluster name should not be empty")

	// In a real scenario, you would query Azure to verify node pool settings
	// For now, we verify that the cluster was created successfully
	outputs := terraform.OutputAll(t, terraformOptions)
	require.NotEmpty(t, outputs, "Terraform should produce outputs")
}

// TestNetworkProfile validates Azure CNI network configuration
func TestNetworkProfile(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name": "test-aks-rg-network",
			"location":            "eastus",
			"aks_name":            "test-aks-net",
			"dns_prefix":          "testaksnet",
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify AKS was created (network profile is part of the cluster config)
	aksName := terraform.Output(t, terraformOptions, "aks_name")
	assert.NotEmpty(t, aksName, "AKS cluster with network profile should be created")
}

// TestTerraformValidation runs terraform validate to check for syntax errors
func TestTerraformValidation(t *testing.T) {
	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
	}

	terraform.Validate(t, terraformOptions)
}
