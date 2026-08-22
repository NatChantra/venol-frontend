# ============================================================
#  Venol System - Frontend Test Script (English version)
# ============================================================

$SITE = "https://venol-frontend.onrender.com"
$pass = 0
$fail = 0

function Test-Page {
    param(
        [string]$Name,
        [string]$Path
    )
    Write-Host "`n> Testing: $Name ($Path)" -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest -Uri "$SITE$Path" -Method Get -TimeoutSec 60 -UseBasicParsing
        if ($r.StatusCode -eq 200) {
            Write-Host "  OK - PASSED (Status: $($r.StatusCode), Size: $($r.RawContentLength) bytes)" -ForegroundColor Green
            $script:pass++
        } else {
            Write-Host "  FAILED - Unexpected status: $($r.StatusCode)" -ForegroundColor Red
            $script:fail++
        }
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "============================================================" -ForegroundColor Yellow
Write-Host " Starting Frontend Test - $SITE" -ForegroundColor Yellow
Write-Host " (Static site - may take a moment to load)" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# Test key pages/routes
Test-Page "Home page (root)"       ""
Test-Page "Login page"             "/"
Test-Page "Dashboard route"        "/dashboard"
Test-Page "Stock List route"       "/stock-list"
Test-Page "Stock View route"       "/stock-view"
Test-Page "Stock Add route"        "/stock-add"
Test-Page "Holiday page"           "/holidays"
Test-Page "Settings page"          "/settings"
Test-Page "Attendance route"       "/attendance"
Test-Page "Tasks route"            "/tasks"
Test-Page "Leave Request route"    "/leave-request"

# ============================================================
#  Summary
# ============================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host " SUMMARY" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host " PASSED: $pass" -ForegroundColor Green
Write-Host " FAILED: $fail" -ForegroundColor Red

if ($fail -eq 0) {
    Write-Host "`nAll frontend routes are reachable!" -ForegroundColor Green
    Write-Host "NOTE: This only confirms pages LOAD, not that buttons/features work correctly." -ForegroundColor Yellow
    Write-Host "Manual testing (clicking buttons, checking data) is still needed." -ForegroundColor Yellow
} else {
    Write-Host "`nSome routes failed - copy this output and send to Claude for analysis" -ForegroundColor Yellow
}
