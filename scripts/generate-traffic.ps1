
param(
    [ValidateRange(1, 100000)]
    [int]$Requests = 4000,

    [ValidateRange(0, 5000)]
    [int]$DelayMs = 75,

    [string]$BaseUrl = "http://localhost:8082"
)

$success = 0
$failed = 0
$networkErrors = 0

Write-Host "Generating CloudDrop checkout traffic..." -ForegroundColor Cyan
Write-Host "Requests: $Requests | Delay: $DelayMs ms"

for ($i = 1; $i -le $Requests; $i++) {
    $code = & curl.exe `
        --silent `
        --output NUL `
        --write-out "%{http_code}" `
        --max-time 5 `
        "$BaseUrl/checkout"

    if ($LASTEXITCODE -ne 0) {
        $networkErrors++
    }
    elseif ($code -eq "200") {
        $success++
    }
    else {
        $failed++
    }

    if ($i -eq 1 -or $i % 50 -eq 0 -or $i -eq $Requests) {
        Write-Host "[$i/$Requests] OK=$success FAILED=$failed NETWORK=$networkErrors"
    }

    if ($DelayMs -gt 0) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

Write-Host "`nTraffic test complete." -ForegroundColor Green
Write-Host "HTTP 200: $success"
Write-Host "HTTP failures: $failed"
Write-Host "Network failures: $networkErrors"
