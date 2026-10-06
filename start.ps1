$ErrorActionPreference = "Stop"
Write-Host "🎂 Starting Birthday Surprise Website..." -ForegroundColor Magenta

# Check if server node_modules exist
if (-not (Test-Path "server\node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

# Check if client node_modules exist
if (-not (Test-Path "client\node_modules")) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "✅ Starting servers..." -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Admin:    http://localhost:5173/admin/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Default login: admin / birthday2024" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Gray
Write-Host ""

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\server
    node index.js
}

# Start client in foreground
Set-Location client
npm run dev
