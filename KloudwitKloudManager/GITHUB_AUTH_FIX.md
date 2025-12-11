# 🔧 GitHub Authentication Fix

## Issue
GitHub Personal Access Token (PAT) has **expired** or is invalid - API returns **401 Unauthorized**.

## Solution: Generate New GitHub Token

### Step 1: Generate New Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Click "Generate new token (classic)"**

3. **Configure Token:**
   - **Note**: `kloudmanager-token` (or any name)
   - **Expiration**: Choose expiration (recommend 90 days or No expiration)
   
4. **Select Scopes** (Required permissions):
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Actions workflows
   - ✅ `read:org` - Read organization data (if using organization repos)

5. **Click "Generate token"**

6. **Copy the token immediately** (it won't be shown again!)

### Step 2: Update .env File

1. Open `.env` file in KloudwitKloudManager folder

2. Replace the GitHub token:
   ```bash
   GITHUB_TOKEN=ghp_YOUR_NEW_TOKEN_HERE
   ```

3. Verify organization/username:
   ```bash
   GITHUB_ORGANIZATION=purna7
   GITHUB_USERNAME=Purna7
   ```

4. Save the file

### Step 3: Restart Application

```powershell
# Kill current process
Stop-Process -Name python -Force

# Restart
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager
& .\venv\Scripts\Activate.ps1
python run.py
```

Or simply restart the PowerShell window that's running the Flask app.

### Step 4: Test Connection

1. Go to http://localhost:5000
2. Navigate to **Providers** view
3. Find **GitHub** provider card
4. Click **"Test Connection"** button
5. Should see: ✓ Connected as [your-username]

## Quick Test (PowerShell)

After updating token, test it directly:

```powershell
$token = "YOUR_NEW_TOKEN_HERE"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}
$response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
Write-Host "✓ Connected as: $($response.login)"
```

## Token Format

**Valid formats:**
- Classic: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (40 chars)
- Fine-grained: `github_pat_xxxx...` (varies)

**Your old token** (expired):
```
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
```

## Security Notes

⚠️ **Never commit tokens to git!**
- .env file is already in .gitignore
- Keep tokens secure
- Rotate tokens regularly
- Use minimum required scopes

## Alternative: Fine-Grained Tokens (Beta)

For better security, use fine-grained tokens:

1. Go to: https://github.com/settings/tokens?type=beta
2. Generate new token
3. Select **specific repositories** only
4. Grant minimal permissions:
   - Actions: Read-only
   - Contents: Read-only
   - Metadata: Read-only

## Troubleshooting

### Error: 401 Unauthorized
- Token expired → Generate new token
- Wrong token → Copy/paste carefully
- Missing scopes → Add required scopes

### Error: 403 Forbidden
- Rate limit exceeded → Wait 1 hour
- Organization access denied → Check org permissions

### Error: 404 Not Found
- Wrong organization name → Verify org name
- Private repos inaccessible → Add repo scope

## Current Configuration

After fixing, your .env should look like:

```bash
GITHUB_TOKEN=ghp_YOUR_NEW_40_CHAR_TOKEN
GITHUB_ORGANIZATION=purna7
GITHUB_USERNAME=Purna7
```

---

**Status**: ⚠️ **Action Required** - Generate new GitHub token

**Docs**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
