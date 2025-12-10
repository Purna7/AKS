# Azure Cloud Provider Configuration Guide

## Prerequisites
- Azure CLI installed (✓ Already installed)
- Active Azure subscription
- Appropriate permissions to create service principals

## Step 1: Login to Azure
```powershell
az login
```

## Step 2: Get Your Subscription ID
```powershell
az account show --query "{SubscriptionId:id, Name:name, TenantId:tenantId}" -o table
```

This will display:
- **Subscription ID** - Copy this for AZURE_SUBSCRIPTION_ID
- **Tenant ID** - Copy this for AZURE_TENANT_ID

## Step 3: Create a Service Principal (App Registration)

Run this command to create a service principal with Reader access:
```powershell
az ad sp create-for-rbac --name "KloudwitKloudManager" --role Reader --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

Replace `YOUR_SUBSCRIPTION_ID` with your actual subscription ID from Step 2.

This will output:
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",        # This is your AZURE_CLIENT_ID
  "displayName": "KloudwitKloudManager",
  "password": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",           # This is your AZURE_CLIENT_SECRET
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"        # This is your AZURE_TENANT_ID
}
```

## Step 4: Update .env File

Edit the `.env` file in the KloudwitKloudManager folder and update these values:

```env
# Azure Credentials
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=your_secret_from_service_principal
```

## Step 5: Enable Azure Provider in Dashboard

1. Open http://localhost:5000
2. Login with admin/admin123
3. Navigate to "Providers" section
4. Click "Test Connection" for Azure
5. If successful, enable the provider

## Alternative: Use Automated Setup Script

Run the PowerShell setup script:
```powershell
.\configure-azure.ps1
```

## Permissions Required

The service principal needs at least **Reader** role to discover resources. For more capabilities:

- **Reader**: List and view resources (minimum required)
- **Contributor**: Manage resources (recommended for full features)
- **Owner**: Full access including access management

To grant specific resource group access only:
```powershell
az ad sp create-for-rbac --name "KloudwitKloudManager" --role Reader --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP
```

## Verify Configuration

Test the connection using the dashboard or via PowerShell:
```powershell
# Test with Azure CLI
az account show

# Or test from Python
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager
.\venv\Scripts\python.exe -c "from cloud_connectors.azure_connector import AzureConnector; import os; from dotenv import load_dotenv; load_dotenv(); connector = AzureConnector(os.getenv('AZURE_SUBSCRIPTION_ID'), os.getenv('AZURE_TENANT_ID'), os.getenv('AZURE_CLIENT_ID'), os.getenv('AZURE_CLIENT_SECRET')); print(connector.test_connection())"
```

## Troubleshooting

### Error: "Authentication failed"
- Verify all credentials are correct
- Ensure the service principal has appropriate permissions
- Check if the secret has expired (secrets expire by default)

### Error: "Subscription not found"
- Verify subscription ID is correct
- Ensure your account has access to the subscription
- Try: `az account list --all -o table`

### Error: "Insufficient permissions"
- Grant Reader role: `az role assignment create --assignee <CLIENT_ID> --role Reader --scope /subscriptions/<SUBSCRIPTION_ID>`

## Security Best Practices

1. **Rotate secrets regularly** - Service principal secrets should be rotated every 90-180 days
2. **Use least privilege** - Grant only the minimum required permissions
3. **Store secrets securely** - Never commit .env file to git (already in .gitignore)
4. **Monitor access** - Review Azure Activity Logs for service principal activity

## Resource Discovery

Once configured, the Azure connector will discover:
- Virtual Machines (VMs)
- Storage Accounts
- Virtual Networks (VNets)
- Resource Groups
- Network Security Groups
- And more...

## Next Steps

After configuration:
1. Test the connection in the dashboard
2. Enable the Azure provider
3. Click "Refresh" to sync resources
4. View discovered resources in the Resources tab
