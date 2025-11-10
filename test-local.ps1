# MirAI Local Testing Script
# Run this to verify your local setup before deploying

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "MirAI Local Environment Test" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test 1: Check Backend Server
Write-Host "Test 1: Backend Server" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/debug/echo' -Method Post -Body '{"test":"hello"}' -ContentType 'application/json' -TimeoutSec 3
    if ($response.received.test -eq "hello") {
        Write-Host "✅ Backend server is responding correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend response unexpected" -ForegroundColor Red
        Write-Host $response
    }
} catch {
    Write-Host "❌ Backend server not running on port 5000" -ForegroundColor Red
    Write-Host "   Run: node server/index.js" -ForegroundColor Gray
    exit 1
}

# Test 2: Check Environment Variables
Write-Host "`nTest 2: Environment Variables" -ForegroundColor Yellow
$envFile = Get-Content .env -Raw
if ($envFile -match 'VITE_API_BASE_URL=http://localhost:5000') {
    Write-Host "✅ VITE_API_BASE_URL is set to localhost" -ForegroundColor Green
} else {
    Write-Host "⚠️  VITE_API_BASE_URL may not be configured correctly" -ForegroundColor Yellow
}

if ($envFile -match 'VITE_SUPABASE_URL=') {
    Write-Host "✅ Supabase URL is configured" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase URL missing" -ForegroundColor Red
}

# Test 3: Check CORS Configuration
Write-Host "`nTest 3: CORS Configuration" -ForegroundColor Yellow
$serverFile = Get-Content server/index.js -Raw
if ($serverFile -match 'localhost:5173') {
    Write-Host "✅ CORS allows localhost:5173" -ForegroundColor Green
} else {
    Write-Host "⚠️  CORS may not allow local Vite dev server" -ForegroundColor Yellow
}

# Test 4: Check if Vite is running
Write-Host "`nTest 4: Vite Dev Server" -ForegroundColor Yellow
try {
    $viteResponse = Invoke-WebRequest -Uri 'http://localhost:5173' -Method Get -TimeoutSec 2 -UseBasicParsing
    Write-Host "✅ Vite dev server is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vite dev server not running (this is OK if you haven't started it yet)" -ForegroundColor Yellow
    Write-Host "   Run: npm run dev" -ForegroundColor Gray
}

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Testing Instructions" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "1. Ensure backend is running:" -ForegroundColor White
Write-Host "   node server/index.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "4. Test these features:" -ForegroundColor White
Write-Host "   • Login/Register" -ForegroundColor Gray
Write-Host "   • Scan a plant image" -ForegroundColor Gray
Write-Host "   • View plant in Profile" -ForegroundColor Gray
Write-Host "   • View plant in My Garden" -ForegroundColor Gray
Write-Host "   • Click plant for DetailedView" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Check browser console (F12) for:" -ForegroundColor White
Write-Host "   • No CORS errors" -ForegroundColor Gray
Write-Host "   • API calls to http://localhost:5000" -ForegroundColor Gray
Write-Host "   • Successful image loading" -ForegroundColor Gray
Write-Host ""
Write-Host "================================`n" -ForegroundColor Cyan
