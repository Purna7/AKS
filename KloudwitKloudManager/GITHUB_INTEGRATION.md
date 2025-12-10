# GitHub Actions Integration

kloudmanager now supports GitHub Actions as a provider to monitor and track your GitHub workflow executions.

## Features

- **Discover GitHub Actions**: Automatically discover all workflows across your repositories
- **Track Executions**: Monitor workflow runs with their status (success, failure, in progress)
- **Usage Statistics**: View comprehensive usage stats including:
  - Total workflows and runs
  - Success/failure rates
  - Total execution duration
  - Runs by repository
- **Real-time Status**: See the current status of all GitHub Actions workflows

## Setup Instructions

### 1. Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   Or visit: https://github.com/settings/tokens

2. Click "Generate new token (classic)"

3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows
   - `read:org` - Read org and team membership (if accessing organization repos)

4. Click "Generate token" and copy the token

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_ORGANIZATION=your_organization_name  # Optional: for organization repos
GITHUB_USERNAME=your_github_username        # Optional: for personal repos
```

**Note**: You can specify either `GITHUB_ORGANIZATION`, `GITHUB_USERNAME`, or both. If neither is specified, kloudmanager will fetch repos accessible to the authenticated user.

### 3. Restart the Application

```powershell
# Stop the current application
Get-Process python | Stop-Process -Force

# Start the application
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager
.\venv\Scripts\Activate.ps1
python run.py
```

## Usage

### Via Web Dashboard

1. Navigate to the **Providers** section
2. Click **Test Connection** on the GitHub Actions card to verify your token
3. Click **Discover Actions** to fetch all workflows and their runs
4. View discovered GitHub Actions in the **Resources** section
5. See usage statistics on the Providers page

### Via API Endpoints

#### Test Connection
```bash
GET /api/test-connection/GitHub
```

#### Discover GitHub Actions
```bash
GET /api/github/discover
```

Response:
```json
{
  "success": true,
  "message": "Discovered 15 GitHub Actions",
  "count": 15,
  "resources": [...]
}
```

#### Get Usage Statistics
```bash
GET /api/github/usage-stats?days=30
```

Response:
```json
{
  "success": true,
  "stats": {
    "total_workflows": 15,
    "total_runs": 245,
    "successful_runs": 220,
    "failed_runs": 25,
    "in_progress_runs": 0,
    "total_duration_minutes": 1250.5,
    "workflows_by_repository": {...},
    "runs_by_status": {...},
    "runs_by_conclusion": {...}
  }
}
```

#### Get Repository Workflows
```bash
GET /api/github/workflows/<owner>/<repo>
```

#### Get Workflow Runs
```bash
GET /api/github/workflow-runs/<owner>/<repo>/<workflow_id>?days=30
```

## Resource Display

GitHub Actions are displayed in the Resources view with:

- **Name**: Repository/Workflow name (e.g., `my-repo/CI Pipeline`)
- **Type**: GitHub Action
- **Status**: Current status (Success, Failure, In Progress, etc.)
- **Region**: GitHub Cloud
- **Size**: Number of runs in the last 7 days
- **Metadata**:
  - Repository name and owner
  - Workflow ID and path
  - Total, successful, and failed runs
  - Last run date
  - Repository and workflow URLs

## Security Notes

1. **Token Security**: Keep your GitHub Personal Access Token secure. Never commit it to version control.

2. **Token Scopes**: Only grant the minimum required scopes. The `repo` scope gives access to all repository data.

3. **Token Rotation**: Regularly rotate your personal access tokens for security.

4. **Environment Variables**: Use environment variables or secure secret management for production deployments.

## Troubleshooting

### "GitHub connector not available"
- Ensure `requests` library is installed: `pip install requests`
- Check if GitHub connector is properly imported in `run.py`

### "GitHub token not configured"
- Verify `GITHUB_TOKEN` is set in your `.env` file
- Restart the application after adding the token

### "Failed to authenticate: 401"
- Check if your token is valid and hasn't expired
- Verify the token has the required scopes
- Regenerate the token if necessary

### No workflows discovered
- Ensure you have repositories with GitHub Actions workflows
- Check if your token has access to the repositories
- Verify `GITHUB_ORGANIZATION` or `GITHUB_USERNAME` is correct

## API Rate Limits

GitHub API has rate limits:
- Authenticated requests: 5,000 requests per hour
- kloudmanager makes multiple API calls during discovery

To avoid rate limits:
- Don't run discovery too frequently
- Use the cached resource data
- Monitor your rate limit: https://api.github.com/rate_limit

## Example Workflow

1. **Initial Setup**:
   ```bash
   # Add to .env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
   GITHUB_ORGANIZATION=mycompany
   ```

2. **Discover Actions**:
   - Navigate to Providers → GitHub Actions
   - Click "Discover Actions"
   - Wait for discovery to complete

3. **View Results**:
   - Go to Resources view
   - Filter by "GitHub Action"
   - See all discovered workflows

4. **Monitor Stats**:
   - View success/failure rates
   - Track execution duration
   - Identify problematic workflows

## Future Enhancements

Planned features for GitHub integration:
- [ ] Manual workflow trigger from dashboard
- [ ] Workflow run logs viewing
- [ ] Cost estimation for GitHub Actions minutes
- [ ] Alerts for failed workflows
- [ ] Trend analysis and charts
- [ ] Repository-level filtering
- [ ] Workflow configuration editing

## Support

For issues or questions:
- Check application logs for detailed error messages
- Verify GitHub API status: https://www.githubstatus.com/
- Review GitHub API documentation: https://docs.github.com/rest

---

© 2025 Kloudwit Solutions Pvt Ltd. All rights reserved.
