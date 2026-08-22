# ============================================================
#  Venol System - Backend API Test Script (English version)
# ============================================================

$API = "https://my-system-vp4o.onrender.com/api"
$pass = 0
$fail = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    Write-Host "`n> Testing: $Name" -ForegroundColor Cyan
    try {
        $result = & $Test
        Write-Host "  OK - PASSED" -ForegroundColor Green
        $script:pass++
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "============================================================" -ForegroundColor Yellow
Write-Host " Starting Backend Test - $API" -ForegroundColor Yellow
Write-Host " (Server may take 30-60 sec to wake up if sleeping)" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 1. Ping
Test-Endpoint "Server Ping" {
    $r = Invoke-RestMethod -Uri "$API/ping" -Method Get -TimeoutSec 60
    if ($r.status -ne "ok") { throw "status is not 'ok'" }
}

# 2. Resources (Stock items)
Test-Endpoint "GET /resources" {
    $r = Invoke-RestMethod -Uri "$API/resources" -Method Get
    if ($r.Count -eq 0) { throw "No resources found" }
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
}

# 3. Categories
Test-Endpoint "GET /categories" {
    $r = Invoke-RestMethod -Uri "$API/categories" -Method Get
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
}

# 4. Employees
Test-Endpoint "GET /employees" {
    $r = Invoke-RestMethod -Uri "$API/employees" -Method Get
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
}

# 5. Holidays
Test-Endpoint "GET /holidays" {
    $r = Invoke-RestMethod -Uri "$API/holidays" -Method Get
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
    if ($r.Count -eq 0) { throw "No holidays found - seed Cambodia holidays first" }
}

# 6. Departments
Test-Endpoint "GET /departments" {
    $r = Invoke-RestMethod -Uri "$API/departments" -Method Get
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
}

# 7. Attendance
Test-Endpoint "GET /attendance" {
    $r = Invoke-RestMethod -Uri "$API/attendance" -Method Get
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
}

# 8. Leaves
Test-Endpoint "GET /leaves" {
    $r = Invoke-RestMethod -Uri "$API/leaves" -Method Get
    Write-Host "  Count: $($r.Count)" -ForegroundColor Gray
}

# 9. Login
Test-Endpoint "POST /login (admin1)" {
    $body = @{ username = "admin1"; password = "admin1234" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$API/login" -Method Post -ContentType "application/json" -Body $body
    if (-not $r.user_id) { throw "login did not return user_id" }
    Write-Host "  Logged in as: $($r.username) / role: $($r.role)" -ForegroundColor Gray
}

# 10. Stock Report
Test-Endpoint "GET /stock/report" {
    $r = Invoke-RestMethod -Uri "$API/stock/report" -Method Get
    Write-Host "  Total items: $($r.total_items), Today In: $($r.today_in), Today Out: $($r.today_out)" -ForegroundColor Gray
}

# ============================================================
#  Summary
# ============================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host " SUMMARY" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host " PASSED: $pass" -ForegroundColor Green
Write-Host " FAILED: $fail" -ForegroundColor Red

if ($fail -eq 0) {
    Write-Host "`nAll backend endpoints working correctly!" -ForegroundColor Green
} else {
    Write-Host "`nSome endpoints failed - copy this output and send to Claude for analysis" -ForegroundColor Yellow
}
