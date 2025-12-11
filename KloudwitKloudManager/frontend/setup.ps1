# KloudManager Frontend - Quick Start Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   KloudManager Frontend Setup" -ForegroundColor Cyan
Write-Host "   React + Next.js + Ant + MUI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js $nodeVersion is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Node.js is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Download LTS version (v20.x recommended)" -ForegroundColor White
    Write-Host "3. Run installer and restart PowerShell" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, run this command to verify:" -ForegroundColor Yellow
    Write-Host "  node --version" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm $npmVersion is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ npm is NOT installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies..." -ForegroundColor Yellow
Write-Host "This may take 2-5 minutes..." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Installation Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📦 Installed Packages:" -ForegroundColor Cyan
    Write-Host "  • React 18.3 + React DOM" -ForegroundColor White
    Write-Host "  • Next.js 14.2 (App Router)" -ForegroundColor White
    Write-Host "  • Ant Design 5.20 + Icons" -ForegroundColor White
    Write-Host "  • Material-UI 5.15 + Icons" -ForegroundColor White
    Write-Host "  • Framer Motion (Animations)" -ForegroundColor White
    Write-Host "  • TypeScript 5.5" -ForegroundColor White
    Write-Host "  • Axios, SWR, Zustand" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🚀 Quick Start Commands:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Start Development Server:" -ForegroundColor Yellow
    Write-Host "    npm run dev" -ForegroundColor White
    Write-Host "    → Opens http://localhost:3000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Build for Production:" -ForegroundColor Yellow
    Write-Host "    npm run build" -ForegroundColor White
    Write-Host ""
    Write-Host "  Start Production Server:" -ForegroundColor Yellow
    Write-Host "    npm start" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📝 Configuration:" -ForegroundColor Cyan
    Write-Host "  • Backend API: http://localhost:5000" -ForegroundColor White
    Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  • Make sure Flask backend is running!" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📚 Documentation:" -ForegroundColor Cyan
    Write-Host "  See FRONTEND_SETUP.md for detailed guide" -ForegroundColor White
    Write-Host ""
    
    $startNow = Read-Host "Start development server now? (Y/N)"
    if ($startNow -eq "Y" -or $startNow -eq "y") {
        Write-Host ""
        Write-Host "Starting Next.js development server..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        npm run dev
    } else {
        Write-Host ""
        Write-Host "To start later, run:" -ForegroundColor Yellow
        Write-Host "  cd frontend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Installation Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check internet connection" -ForegroundColor White
    Write-Host "2. Delete node_modules and package-lock.json" -ForegroundColor White
    Write-Host "3. Run 'npm cache clean --force'" -ForegroundColor White
    Write-Host "4. Try again with 'npm install'" -ForegroundColor White
    Write-Host ""
}
