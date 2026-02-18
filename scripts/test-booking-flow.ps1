# Comprehensive Booking Flow Smoke Test
# Tests all critical paths and identifies issues

Write-Host "`n=== COMPREHENSIVE BOOKING FLOW SMOKE TEST ===" -ForegroundColor Cyan
Write-Host "Testing all critical paths...`n" -ForegroundColor Yellow

$issues = @()
$warnings = @()

# Test 1: Homepage
Write-Host "1. Testing Homepage..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Homepage loads" -ForegroundColor Green
    } else {
        $issues += "Homepage returned status $($response.StatusCode)"
        Write-Host "   ❌ Homepage status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    $issues += "Homepage failed: $($_.Exception.Message)"
    Write-Host "   ❌ Homepage failed" -ForegroundColor Red
}

# Test 2: Packages API
Write-Host "`n2. Testing Packages API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/packages" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.success -and $response.data -is [array] -and $response.data.Count -gt 0) {
        Write-Host "   ✅ Packages API: OK ($($response.data.Count) packages)" -ForegroundColor Green
        $testPackage = $response.data[0]
        Write-Host "   Sample: $($testPackage.name) (slug: $($testPackage.slug))" -ForegroundColor Gray
    } else {
        $issues += "Packages API returned invalid format"
        Write-Host "   ❌ Packages API: Invalid format" -ForegroundColor Red
    }
} catch {
    $issues += "Packages API failed: $($_.Exception.Message)"
    Write-Host "   ❌ Packages API failed" -ForegroundColor Red
}

# Test 3: Activities API
Write-Host "`n3. Testing Activities API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/activities?published=true" -Method Get -TimeoutSec 15 -ErrorAction Stop
    $data = if ($response -is [array]) { $response } elseif ($response.data -is [array]) { $response.data } else { @() }
    
    if ($data.Count -gt 0) {
        Write-Host "   ✅ Activities API: OK ($($data.Count) activities)" -ForegroundColor Green
        
        # Check for issues in activities
        $badActivities = @()
        foreach ($act in $data) {
            if (-not $act.trainer_ids -or $act.trainer_ids.Count -eq 0) {
                $badActivities += $act.name
            }
            if (-not $act.image_url) {
                $warnings += "Activity '$($act.name)' missing image_url"
            }
        }
        
        if ($badActivities.Count -gt 0) {
            $warnings += "$($badActivities.Count) activities have no trainer_ids"
            Write-Host "   ⚠️  $($badActivities.Count) activities missing trainer_ids" -ForegroundColor Yellow
        }
    } else {
        $issues += "No activities returned from API"
        Write-Host "   ❌ No activities found" -ForegroundColor Red
    }
} catch {
    $issues += "Activities API failed: $($_.Exception.Message)"
    Write-Host "   ❌ Activities API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Trainers API
Write-Host "`n4. Testing Trainers API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/trainers" -Method Get -TimeoutSec 10 -ErrorAction Stop
    $data = if ($response.success -and $response.data -is [array]) { $response.data } elseif ($response -is [array]) { $response } else { @() }
    
    if ($data.Count -gt 0) {
        Write-Host "   ✅ Trainers API: OK ($($data.Count) trainers)" -ForegroundColor Green
    } else {
        $issues += "No trainers returned"
        Write-Host "   ❌ No trainers found" -ForegroundColor Red
    }
} catch {
    $issues += "Trainers API failed: $($_.Exception.Message)"
    Write-Host "   ❌ Trainers API failed" -ForegroundColor Red
}

# Test 5: Booking Page
Write-Host "`n5. Testing Booking Page..." -ForegroundColor Yellow
try {
    $pkgResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/packages" -Method Get -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($pkgResp -and $pkgResp.success -and $pkgResp.data -is [array] -and $pkgResp.data.Count -gt 0) {
        $slug = $pkgResp.data[0].slug
        $pageResp = Invoke-WebRequest -Uri "http://localhost:3000/book/$slug" -Method Get -TimeoutSec 20 -ErrorAction Stop
        if ($pageResp.StatusCode -eq 200) {
            Write-Host "   ✅ Booking page loads (package: $slug)" -ForegroundColor Green
        } else {
            $issues += "Booking page returned status $($pageResp.StatusCode)"
            Write-Host "   ❌ Booking page status: $($pageResp.StatusCode)" -ForegroundColor Red
        }
    } else {
        $warnings += "Cannot test booking page - no packages available"
        Write-Host "   ⚠️  Skipped - no packages" -ForegroundColor Yellow
    }
} catch {
    $issues += "Booking page failed: $($_.Exception.Message)"
    Write-Host "   ❌ Booking page failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Check Frontend Logs
Write-Host "`n6. Checking Frontend Logs..." -ForegroundColor Yellow
$frontendLogs = docker-compose logs frontend --tail=100 --since=5m 2>&1
$frontendErrors = $frontendLogs | Select-String -Pattern "error|Error|ERROR|failed|Failed|FAILED|exception|Exception|Cannot read|undefined" -Context 1
if ($frontendErrors) {
    $uniqueErrors = $frontendErrors | Select-Object -Unique -First 10
    Write-Host "   ⚠️  Found errors in frontend logs:" -ForegroundColor Yellow
    foreach ($err in $uniqueErrors) {
        $warnings += "Frontend: $($err.Line.Trim())"
        Write-Host "   - $($err.Line.Trim())" -ForegroundColor Red
    }
} else {
    Write-Host "   ✅ No recent errors in frontend logs" -ForegroundColor Green
}

# Test 7: Check Backend Logs
Write-Host "`n7. Checking Backend Logs..." -ForegroundColor Yellow
$backendLogs = docker-compose logs backend --tail=100 --since=5m 2>&1
$backendErrors = $backendLogs | Select-String -Pattern "error|Error|ERROR|exception|Exception|failed|Failed" -Context 1
if ($backendErrors) {
    $uniqueErrors = $backendErrors | Select-Object -Unique -First 10
    Write-Host "   ⚠️  Found errors in backend logs:" -ForegroundColor Yellow
    foreach ($err in $uniqueErrors) {
        $warnings += "Backend: $($err.Line.Trim())"
        Write-Host "   - $($err.Line.Trim())" -ForegroundColor Red
    }
} else {
    Write-Host "   ✅ No recent errors in backend logs" -ForegroundColor Green
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ All tests passed! No issues found." -ForegroundColor Green
} else {
    if ($issues.Count -gt 0) {
        Write-Host "`n❌ CRITICAL ISSUES ($($issues.Count)):" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "   - $issue" -ForegroundColor Red
        }
    }
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings | Select-Object -First 10) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   - Fix critical issues first" -ForegroundColor White
Write-Host "   - Address warnings as needed" -ForegroundColor White
Write-Host "   - Test the complete booking flow manually" -ForegroundColor White

