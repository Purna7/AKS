# Azure DevOps Integration - Quick Testing Guide

## Prerequisites
Before testing, ensure you have:
- Azure DevOps organization with pipelines
- Personal Access Token (PAT) with Build (Read & Execute) and Project (Read) permissions

## Configuration

1. **Create `.env` file** (if not exists) in `KloudwitKloudManager/` directory:
   ```bash
   cp .env.example .env
   ```

2. **Add Azure DevOps credentials** to `.env`:
   ```bash
   AZUREDEVOPS_ORGANIZATION=your_organization_name
   AZUREDEVOPS_PAT=your_personal_access_token
   AZUREDEVOPS_PROJECT=your_project_name  # Optional
   ```

   Example:
   ```bash
   AZUREDEVOPS_ORGANIZATION=kloudwitsolutions
   AZUREDEVOPS_PAT=abcdef1234567890abcdef1234567890abcdef1234567890
   AZUREDEVOPS_PROJECT=MyProject  # Optional - leave empty for all projects
   ```

## Testing Steps

### 1. Test Connection (Providers View)

1. Navigate to **Providers** menu in sidebar
2. Scroll down to **🔷 Azure DevOps** card
3. Click **Test Connection** button
4. Expected result: ✅ "Connected to {organization} (X projects)"

### 2. Discover Pipelines

**Option A - From Providers View:**
1. In Providers view, Azure DevOps card
2. Click **Discover Pipelines** button
3. Wait for discovery to complete
4. Expected result: ✅ "Discovered X Azure DevOps Pipelines"
5. Stats should appear showing pipelines, runs, success/failure counts

**Option B - From ADOPipelines View:**
1. Click **ADOPipelines** menu item in sidebar
2. Click **🔍 Discover Pipelines** button
3. Wait for discovery to complete
4. Pipeline statistics should update

### 3. View Pipelines (ADOPipelines View)

1. Click **ADOPipelines** in sidebar menu
2. Expected layout:
   ```
   ┌─────────────────────────────────────────┐
   │ Statistics Section                      │
   │ Total Pipelines: X                      │
   │ Total Runs (30d): X                     │
   │ Success Rate: X%                        │
   └─────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────┐
   │ All Azure DevOps Pipelines              │
   │ [Project Filter ▼] [🔄 Refresh]        │
   └─────────────────────────────────────────┘
   
   📁 Project Name
     ┌─────────────────────────────────────┐
     │ Pipeline Name        [Status Badge] │
     │ Pipeline ID: 123                    │
     │ Runs (7d): X | Success: X           │
     │ [View in Azure DevOps] [▶️ Trigger] │
     └─────────────────────────────────────┘
   ```

### 4. Filter by Project

1. In ADOPipelines view, use the project dropdown
2. Select a specific project
3. Expected result: Only pipelines from that project are displayed

### 5. Trigger Pipeline

1. Find a pipeline in ADOPipelines view
2. Click **▶️ Trigger Run** button
3. Confirm the prompt
4. Enter branch name (e.g., "main" or "develop")
5. Expected result: ✅ "Pipeline triggered successfully (Run ID: XXXXX)"
6. Verify in Azure DevOps that the run started

### 6. View in Azure DevOps

1. Find a pipeline card
2. Click **View in Azure DevOps** button
3. Expected result: Opens Azure DevOps web interface in new tab

### 7. Dashboard Integration

1. Navigate to **Dashboard** view
2. The dashboard should reflect Azure DevOps pipelines if integrated in dashboard stats

## Troubleshooting

### Issue: "Azure DevOps connector not available"
**Solution:**
- Check that `azuredevops_connector.py` is in `cloud_connectors/` directory
- Restart the application

### Issue: "Azure DevOps organization not configured"
**Solution:**
- Verify `.env` file contains `AZUREDEVOPS_ORGANIZATION`
- Check for typos in environment variable names
- Restart application after adding variables

### Issue: "Azure DevOps PAT not configured"
**Solution:**
- Verify `.env` file contains `AZUREDEVOPS_PAT`
- Ensure PAT is not expired
- Restart application

### Issue: "Failed to authenticate: 401"
**Solution:**
- Verify PAT is correct and not expired
- Check PAT permissions (Build Read & Execute, Project Read)
- Organization name should match exactly (case-sensitive)

### Issue: No pipelines discovered
**Solution:**
- Verify you have access to projects with pipelines
- Check if `AZUREDEVOPS_PROJECT` is specified correctly
- Ensure PAT has access to the specified project
- Try leaving `AZUREDEVOPS_PROJECT` empty to discover all projects

### Issue: Trigger pipeline fails
**Solution:**
- Verify PAT has Build (Execute) permission
- Check if pipeline requires specific parameters
- Verify branch name exists in repository
- Check Azure DevOps for pipeline configuration issues

## Expected API Responses

### Successful Discovery:
```json
{
  "success": true,
  "message": "Discovered 15 Azure DevOps Pipelines",
  "count": 15
}
```

### Successful Connection Test:
```
✅ Connected to kloudwitsolutions (5 projects)
```

### Successful Trigger:
```json
{
  "success": true,
  "message": "Pipeline triggered successfully (Run ID: 12345)"
}
```

### Usage Stats (30 days):
```
Total Pipelines: 15
Total Runs: 234
Successful: 210
Failed: 20
Success Rate: 89.7%
Total Duration: 4560 min
```

## Verification Checklist

- [ ] Environment variables configured in `.env`
- [ ] Application restarted after configuration
- [ ] Connection test successful
- [ ] Pipelines discovered successfully
- [ ] Pipeline list displays in ADOPipelines view
- [ ] Project filter works correctly
- [ ] Statistics display correctly
- [ ] Can trigger pipeline run
- [ ] Can view pipeline in Azure DevOps web interface
- [ ] Status badges show correct colors
- [ ] Refresh button works

## Sample .env Configuration

```bash
# Required
AZUREDEVOPS_ORGANIZATION=kloudwitsolutions
AZUREDEVOPS_PAT=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz56

# Optional - for single project monitoring
AZUREDEVOPS_PROJECT=MyWebApp

# Or leave empty for all projects
# AZUREDEVOPS_PROJECT=
```

## PAT Permissions Setup

When creating your PAT in Azure DevOps:

1. Go to: https://dev.azure.com/{organization}/_usersSettings/tokens
2. Click "New Token"
3. Set scopes:
   - ✅ **Build** → Read & Execute
   - ✅ **Project and Team** → Read
   - ✅ **Code** → Read (optional, for repo info)
4. Set expiration (recommend 90 days for testing)
5. Click "Create" and copy the token immediately

## Success Indicators

✅ **Connection Successful:**
- Green checkmark appears
- Message shows organization name and project count

✅ **Discovery Successful:**
- Pipeline count updates
- Statistics appear in providers card
- Pipelines display in ADOPipelines view

✅ **Trigger Successful:**
- Success message with Run ID
- Pipeline appears in "In Progress" state
- Can verify in Azure DevOps web interface

✅ **View Integration:**
- Menu item "ADOPipelines" visible with 🔷 icon
- Click switches to dedicated view
- Statistics update correctly

## Testing Complete!

Once all verification checkpoints pass, the Azure DevOps integration is working correctly!

## Next Steps

- Configure additional projects (if using multi-project setup)
- Set up automated pipeline monitoring
- Explore usage statistics over time
- Integrate with alerting (future enhancement)
