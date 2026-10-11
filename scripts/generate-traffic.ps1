# Simulates real customer checkout traffic against Istio Ingress using curl.exe
param (
    [int]$Requests = 50,
    [int]$DelayMs = 150
)

Write-Host "Sending $Requests checkout requests to http://localhost/checkout..." -ForegroundColor Cyan

$success = 0
$failed = 0

for ($i = 1; $i -le $Requests; $i++) {
    $out = curl.exe -s -w "%{http_code}" http://localhost/checkout
    $code = $out.Substring($out.Length - 3)
    $body = $out.Substring(0, $out.Length - 3)

    if ($code -eq "200") {
        $success++
        Write-Host "[$i/$Requests] HTTP $code SUCCESS | Body: $body" -ForegroundColor Green
    } else {
        $failed++
        Write-Host "[$i/$Requests] HTTP $code FAILED  | Body: $body" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds $DelayMs
}

Write-Host "`nSummary: $success Succeeded (200 OK), $failed Failed" -ForegroundColor Yellow
