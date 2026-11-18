
param(
    [ValidateRange(0, 100)]
    [int]$Percentage = 100
)

$ErrorActionPreference = "Stop"

Write-Host "Preparing v2 canary with $Percentage% simulated failures..."

$raw = & kubectl get rollout clouddrop-service -n prod -o json

if ($LASTEXITCODE -ne 0) {
    throw "Cannot find the CloudDrop rollout."
}

$rollout = $raw | ConvertFrom-Json
$containers = @($rollout.spec.template.spec.containers)

$containerIndex = -1

for ($i = 0; $i -lt $containers.Count; $i++) {
    if ($containers[$i].name -eq "clouddrop-service") {
        $containerIndex = $i
        break
    }
}

if ($containerIndex -lt 0) {
    throw "CloudDrop application container not found."
}

$envVars = @($containers[$containerIndex].env)
$versionIndex = -1
$errorIndex = -1

for ($i = 0; $i -lt $envVars.Count; $i++) {
    if ($envVars[$i].name -eq "APP_VERSION") {
        $versionIndex = $i
    }
    if ($envVars[$i].name -eq "INITIAL_ERROR_PERCENTAGE") {
        $errorIndex = $i
    }
}

if ($versionIndex -lt 0 -or $errorIndex -lt 0) {
    throw "Required container environment variables missing."
}

$base = "/spec/template/spec/containers/$containerIndex"

$patch = @(
    @{
        op = "replace"
        path = "$base/image"
        value = "clouddrop-service:v2.0.0"
    },
    @{
        op = "replace"
        path = "$base/env/$versionIndex/value"
        value = "v2.0.0-canary"
    },
    @{
        op = "replace"
        path = "$base/env/$errorIndex/value"
        value = "$Percentage"
    }
)

$patchFile = Join-Path $env:TEMP "clouddrop-canary-patch.json"

ConvertTo-Json -InputObject $patch -Depth 8 |
    Set-Content -Path $patchFile -Encoding ascii

& kubectl patch rollout clouddrop-service `
    -n prod `
    --type=json `
    --patch-file $patchFile

if ($LASTEXITCODE -ne 0) {
    throw "Failed to update canary rollout."
}

Write-Host "Canary revision submitted." -ForegroundColor Green
Write-Host "HTTP checkout failure probability: $Percentage%"
Write-Host "Monitor with: kubectl get rollout clouddrop-service -n prod -w"
