# Azure DevOps Integration Setup

This guide explains how to set up Azure DevOps pipeline integration in kloudmanager.

## Prerequisites

1. An Azure DevOps organization
2. Access to projects with pipelines
3. A Personal Access Token (PAT) with appropriate permissions

## Creating a Personal Access Token

1. Navigate to your Azure DevOps organization: `https://dev.azure.com/{organization}`
2. Click on **User Settings** (gear icon) > **Personal access tokens**
3. Click **New Token**
4. Configure the token:
   - **Name**: kloudmanager-integration
   - **Organization**: Select your organization
   - **Expiration**: Choose an appropriate expiration date
   - **Scopes**: Select the following permissions:
     - **Build**: Read & Execute
     - **Code**: Read
     - **Project and Team**: Read
     - **Release**: Read & Execute
5. Click **Create** and copy the token (you won't be able to see it again)

## Configuration

Add the following to your `.env` file:

```bash
# Azure DevOps Configuration
AZUREDEVOPS_ORGANIZATION=your_organization_name
AZUREDEVOPS_PAT=your_personal_access_token
AZUREDEVOPS_PROJECT=your_project_name  # Optional: leave empty to discover all projects
```

### Configuration Options

- **AZUREDEVOPS_ORGANIZATION** (required): Your Azure DevOps organization name
  - Example: If your URL is `https://dev.azure.com/mycompany`, use `mycompany`
  
- **AZUREDEVOPS_PAT** (required): Your Personal Access Token
  - Must have Build (Read & Execute) and Project (Read) permissions
  
- **AZUREDEVOPS_PROJECT** (optional): Specific project name to monitor
  - Leave empty to discover pipelines across all accessible projects
  - Example: `MyProject` or `MyTeam/MyProject`

## Features

### Pipeline Discovery
- Automatically discovers all pipelines across your projects
- Supports both YAML and Classic pipelines
- Shows pipeline status, recent runs, and success rates

### Pipeline Monitoring
- View all pipelines in a unified dashboard
- Filter by project
- See recent run statistics (last 7 days)
- Track success/failure rates

### Pipeline Execution
- Trigger pipeline runs directly from the dashboard
- Specify branch for execution
- Pass custom variables (optional)

### Usage Statistics
- Total pipeline count
- Run statistics (30 days)
- Success/failure rates
- Total execution duration
- Breakdown by project

## Usage

### 1. Test Connection

Go to **Providers** menu and click **Test Connection** on the Azure DevOps card to verify your configuration.

### 2. Discover Pipelines

Click **Discover Pipelines** to fetch all pipelines from your Azure DevOps organization.

### 3. View Pipelines

Navigate to **ADOPipelines** menu to see all discovered pipelines with their status and recent runs.

### 4. Trigger Pipeline

Click the **▶️ Trigger Run** button on any pipeline card to start a new run.

## API Endpoints

The following API endpoints are available:

- `POST /api/azuredevops/discover` - Discover all pipelines
- `GET /api/azuredevops/usage-stats?days=30` - Get usage statistics
- `GET /api/azuredevops/projects` - List all projects
- `GET /api/azuredevops/pipelines/{project}` - Get pipelines for a project
- `GET /api/azuredevops/pipeline-runs/{project}/{pipeline_id}?days=7` - Get pipeline runs
- `POST /api/azuredevops/trigger-pipeline` - Trigger a pipeline run

## Troubleshooting

### Connection Failed
- Verify your organization name is correct
- Ensure PAT has not expired
- Check PAT permissions (Build Read & Execute, Project Read)

### No Pipelines Found
- Verify you have access to projects with pipelines
- Check if AZUREDEVOPS_PROJECT is correctly specified (if used)
- Ensure your PAT has appropriate scope

### Trigger Failed
- Verify PAT has Build (Execute) permission
- Check if the pipeline requires specific parameters
- Ensure the branch name is correct

## Security Notes

- Never commit your PAT to version control
- Use environment variables or secure secret management
- Rotate PATs regularly
- Use minimum required permissions for the PAT
- Consider using service principals for production

## Resource Types

Discovered resources are stored with the following type:
- **Resource Type**: `ADO Pipeline`
- **Provider**: `AzureDevOps`

## Example Dashboard View

```
Project: MyProject
├── Build-Pipeline (Succeeded)
│   ├── Runs (7d): 15
│   ├── Success: 14
│   └── Failed: 1
├── Release-Pipeline (Failed)
│   ├── Runs (7d): 8
│   ├── Success: 6
│   └── Failed: 2
```

## Additional Resources

- [Azure DevOps REST API Documentation](https://docs.microsoft.com/en-us/rest/api/azure/devops/)
- [Personal Access Tokens](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)
- [Pipeline Permissions](https://docs.microsoft.com/en-us/azure/devops/pipelines/policies/permissions)
