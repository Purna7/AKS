# Azure Configuration Script for KloudwitKloud Manager
# This script helps you set up Azure credentials automatically

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  KloudwitKloud Manager - Azure Configuration" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Check if Azure CLI is installed
Write-Host "[1/6] Checking Azure CLI installation..." -ForegroundColor Yellow
try {
    $azVersion = az --version 2>&1 | Select-String "azure-cli" | Select-Object -First 1
    Write-Host "✓ Azure CLI is installed: $azVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "`n[2/6] Checking Azure login status..." -ForegroundColor Yellow
$account = az account show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Not logged in to Azure" -ForegroundColor Red
    Write-Host "`nLogging in to Azure..." -ForegroundColor Yellow
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Login failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Logged in to Azure" -ForegroundColor Green

# Get subscription information
Write-Host "`n[3/6] Getting Azure subscription information..." -ForegroundColor Yellow
$subscriptionInfo = az account show --query "{SubscriptionId:id, Name:name, TenantId:tenantId}" -o json | ConvertFrom-Json

Write-Host "`nCurrent Azure Subscription:" -ForegroundColor Cyan
Write-Host "  Name:            $($subscriptionInfo.Name)" -ForegroundColor White
Write-Host "  Subscription ID: $($subscriptionInfo.SubscriptionId)" -ForegroundColor White
Write-Host "  Tenant ID:       $($subscriptionInfo.TenantId)" -ForegroundColor White

# Confirm to proceed
Write-Host "`nDo you want to use this subscription? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Operation cancelled. To switch subscription, run: az account set --subscription <subscription-id>" -ForegroundColor Yellow
    exit 0
}

# Create Service Principal
Write-Host "`n[4/6] Creating Service Principal..." -ForegroundColor Yellow
Write-Host "Creating 'KloudwitKloudManager' app registration with Reader role..." -ForegroundColor Gray

$spName = "KloudwitKloudManager-" + (Get-Date -Format "yyyyMMddHHmm")
$scope = "/subscriptions/$($subscriptionInfo.SubscriptionId)"

try {
    $sp = az ad sp create-for-rbac --name $spName --role Reader --scopes $scope --only-show-errors 2>&1 | ConvertFrom-Json
    
    Write-Host "✓ Service Principal created successfully!" -ForegroundColor Green
    Write-Host "`nService Principal Details:" -ForegroundColor Cyan
    Write-Host "  Display Name: $($sp.displayName)" -ForegroundColor White
    Write-Host "  App ID:       $($sp.appId)" -ForegroundColor White
    Write-Host "  Tenant:       $($sp.tenant)" -ForegroundColor White
    Write-Host "  Secret:       ********** (saved securely)" -ForegroundColor White
}
catch {
    Write-Host "✗ Failed to create service principal" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Update .env file
Write-Host "`n[5/6] Updating .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Update Azure credentials
    $envContent = $envContent -replace "AZURE_SUBSCRIPTION_ID=.*", "AZURE_SUBSCRIPTION_ID=$($subscriptionInfo.SubscriptionId)"
    $envContent = $envContent -replace "AZURE_TENANT_ID=.*", "AZURE_TENANT_ID=$($sp.tenant)"
    $envContent = $envContent -replace "AZURE_CLIENT_ID=.*", "AZURE_CLIENT_ID=$($sp.appId)"
    $envContent = $envContent -replace "AZURE_CLIENT_SECRET=.*", "AZURE_CLIENT_SECRET=$($sp.password)"
    
    Set-Content -Path $envPath -Value $envContent -NoNewline
    Write-Host "✓ .env file updated successfully!" -ForegroundColor Green
}
else {
    Write-Host "✗ .env file not found - creating new one..." -ForegroundColor Yellow
    
    $newEnvContent = "# Application Configuration`n"
    $newEnvContent += "FLASK_APP=app.py`n"
    $newEnvContent += "FLASK_ENV=development`n"
    $newEnvContent += "SECRET_KEY=your-secret-key-change-this-in-production`n"
    $newEnvContent += "DATABASE_URL=sqlite:///cloud_manager.db`n`n"
    $newEnvContent += "# AWS Credentials`n"
    $newEnvContent += "AWS_ACCESS_KEY_ID=your_aws_access_key`n"
    $newEnvContent += "AWS_SECRET_ACCESS_KEY=your_aws_secret_key`n"
    $newEnvContent += "AWS_DEFAULT_REGION=us-east-1`n`n"
    $newEnvContent += "# Azure Credentials`n"
    $newEnvContent += "AZURE_SUBSCRIPTION_ID=$($subscriptionInfo.SubscriptionId)`n"
    $newEnvContent += "AZURE_TENANT_ID=$($sp.tenant)`n"
    $newEnvContent += "AZURE_CLIENT_ID=$($sp.appId)`n"
    $newEnvContent += "AZURE_CLIENT_SECRET=$($sp.password)`n`n"
    $newEnvContent += "# GCP Credentials`n"
    $newEnvContent += "GCP_PROJECT_ID=your_gcp_project_id`n"
    $newEnvContent += "GCP_SERVICE_ACCOUNT_FILE=path_to_service_account_json`n`n"
    $newEnvContent += "# Application Settings`n"
    $newEnvContent += "REFRESH_INTERVAL=300`n"
    $newEnvContent += "MAX_WORKERS=5`n"
    $newEnvContent += "LOG_LEVEL=INFO`n"
    
    Set-Content -Path $envPath -Value $newEnvContent
    Write-Host "✓ New .env file created!" -ForegroundColor Green
}

# Test connection
Write-Host "`n[6/6] Testing Azure connection..." -ForegroundColor Yellow
Write-Host "Running connection test..." -ForegroundColor Gray

$testScriptPath = Join-Path $PSScriptRoot "test_azure_connection.py"
$pythonExe = Join-Path $PSScriptRoot "venv\Scripts\python.exe"

$testResult = & $pythonExe $testScriptPath 2>&1 | Out-String

if ($testResult -match "SUCCESS") {
    Write-Host "✓ Azure connection test successful!" -ForegroundColor Green
}
else {
    Write-Host "✗ Azure connection test failed" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Yellow
    Write-Host "`nPlease verify the credentials and try testing from the dashboard" -ForegroundColor Yellow
}

# Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Azure credentials have been configured:" -ForegroundColor White
Write-Host "  ✓ Subscription ID: $($subscriptionInfo.SubscriptionId)" -ForegroundColor Green
Write-Host "  ✓ Tenant ID:       $($sp.tenant)" -ForegroundColor Green
Write-Host "  ✓ Client ID:       $($sp.appId)" -ForegroundColor Green
Write-Host "  ✓ Client Secret:   ********** (stored in .env)" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Open the dashboard at http://localhost:5000" -ForegroundColor White
Write-Host "2. Navigate to the 'Providers' section" -ForegroundColor White
Write-Host "3. Click 'Test Connection' for Azure" -ForegroundColor White
Write-Host "4. Enable the Azure provider" -ForegroundColor White
Write-Host "5. Click 'Refresh' to discover resources" -ForegroundColor White

Write-Host "`nService Principal Details (save this for reference):" -ForegroundColor Yellow
Write-Host "  Name: $spName" -ForegroundColor White
Write-Host "  App ID: $($sp.appId)" -ForegroundColor White
Write-Host "`nTo delete this service principal later:" -ForegroundColor Gray
Write-Host "  az ad sp delete --id $($sp.appId)" -ForegroundColor Gray

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
