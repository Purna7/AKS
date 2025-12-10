# KloudwitKloud Manager - Quick Start Script
# This script helps you set up and run the enterprise frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KloudwitKloud Manager - Enterprise UI" -ForegroundColor Cyan
Write-Host "Next.js + TypeScript + Ant Design" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "  Option 1: Download from https://nodejs.org/" -ForegroundColor White
    Write-Host "  Option 2: choco install nodejs-lts" -ForegroundColor White
    Write-Host "  Option 3: winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    Write-Host ""
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Navigate to frontend directory
$frontendDir = "c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager\frontend"
if (Test-Path $frontendDir) {
    Set-Location $frontendDir
    Write-Host "✓ Frontend directory found" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend directory not found: $frontendDir" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "Dependencies already installed" -ForegroundColor Green
    $install = Read-Host "Do you want to reinstall dependencies? (y/N)"
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
} else {
    Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "Checking if Flask backend is running on port 5000..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($connection) {
    Write-Host "✓ Flask backend is running" -ForegroundColor Green
} else {
    Write-Host "⚠ Flask backend not detected on port 5000" -ForegroundColor Yellow
    Write-Host "  Please start the backend first:" -ForegroundColor White
    Write-Host "  cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager" -ForegroundColor White
    Write-Host "  python run.py" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend will be available at:" -ForegroundColor Cyan
Write-Host "  → http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev
