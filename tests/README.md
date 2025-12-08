# Terraform Unit Tests for AKS Infrastructure

This directory contains Terratest-based unit tests for the AKS Terraform configuration.

## Prerequisites

- **Go 1.21+**: Download from [golang.org](https://golang.org/dl)
- **Terraform**: Must be installed and in `$PATH`
- **Azure CLI**: Authenticated with `az login`
- **Azure Subscription**: With permissions to create resources (tests will clean up after themselves)

## Test Coverage

The test suite includes:

- **TestResourceGroupCreation**: Validates resource group is created with correct name and location
- **TestVNetCreation**: Validates virtual network and subnet configuration
- **TestUserAssignedIdentityCreation**: Validates managed identity creation and outputs
- **TestAKSClusterCreation**: Validates AKS cluster configuration and kubeconfig outputs
- **TestAKSNodePoolConfiguration**: Validates default node pool settings (agent count, VM size)
- **TestNetworkProfile**: Validates Azure CNI network configuration
- **TestTerraformValidation**: Runs `terraform validate` to check for syntax errors

## Running Tests

### Quick start (all tests)

```bash
cd tests
go test -v
```

### Run a specific test

```bash
go test -v -run TestResourceGroupCreation
```

### Run tests in parallel

```bash
go test -v -parallel 4
```

### Run with timeout (default 10m, increase if needed for slow deploys)

```bash
go test -v -timeout 30m
```

## Important Notes

- **Resource Creation**: Tests will create real Azure resources (RG, VNet, AKS, etc.). Each test runs in parallel and creates its own resources to avoid conflicts.
- **Cleanup**: Tests automatically destroy resources via `defer terraform.Destroy()`. If a test fails, resources may not be cleaned up; clean up manually using `az group delete -n <resource-group>`.
- **Cost**: Running tests will incur Azure charges. AKS clusters especially can be expensive.
- **Time**: Full AKS cluster creation can take 10-20 minutes per test.

## Terraform Variables for Tests

Tests override Terraform variables to create test-specific resources. Key variables:

- `resource_group_name`: Set to test-specific names (e.g., `test-aks-rg`)
- `agent_count`: Set to `1` or `2` for faster testing (default is 2)
- `agent_vm_size`: Set to `Standard_B2s` (smaller/cheaper than default)

## CI/CD Integration

For GitHub Actions or other CI systems, add this job:

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-go@v4
      with:
        go-version: "1.21"
    - name: Install Terraform
      uses: hashicorp/setup-terraform@v2
    - name: Azure Login
      uses: azure/login@v1
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID }}
        subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
    - name: Run Terraform Tests
      working-directory: ./tests
      run: go test -v -timeout 30m
```

## Troubleshooting

- **"terraform" not found**: Ensure Terraform is in your `$PATH`
- **Authentication errors**: Ensure you've run `az login` and have access to the subscription
- **Permission denied**: Ensure your Azure principal has contributor rights on the subscription
- **Test timeout**: Increase timeout with `-timeout` flag (e.g., `-timeout 60m` for long-running tests)
- **Resource not cleaned up**: Manually delete via `az group delete -n <resource-group>`

## Development

To add a new test:

1. Create a function `TestXxx(t *testing.T)` in `main_test.go`
2. Initialize Terraform options with test-specific variables
3. Call `terraform.InitAndApply(t, terraformOptions)` to deploy
4. Assert expected outputs or query Azure resources
5. Rely on `defer terraform.Destroy()` for cleanup

Example:

```go
func TestMyFeature(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../InfrastructureAsCode",
		Vars: map[string]interface{}{
			"resource_group_name": "test-aks-rg-myfeature",
			"location": "eastus",
		},
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Your assertions here
	assert.NotEmpty(t, terraform.Output(t, terraformOptions, "resource_group_name"))
}
```
