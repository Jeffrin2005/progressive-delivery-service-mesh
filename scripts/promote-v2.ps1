param(
    [string]$Image = "clouddrop-service:v2.0.0-live-demo",
    [string]$BaseUrl = "http://localhost:8082",
    [int]$TimeoutSeconds = 600
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent

function Assert-Command {
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $LASTEXITCODE" }
}

# Run after building and loading Image into kind-progressive-delivery.
kubectl --context kind-progressive-delivery apply -f "$projectRoot/apps/fileshare/manifests/analysis-template.yaml"
Assert-Command
$rollout = kubectl --context kind-progressive-delivery get rollout clouddrop-service -n prod -o json | ConvertFrom-Json
Assert-Command
$container = $rollout.spec.template.spec.containers | Where-Object name -eq "clouddrop-service"
$container.image = $Image
($container.env | Where-Object name -eq "APP_VERSION").value = "v2.0.0-canary"
($container.env | Where-Object name -eq "RELEASE_COLOR").value = "#7c3aed"
($container.env | Where-Object name -eq "INITIAL_ERROR_PERCENTAGE").value = "0"
$patch = @{ spec = @{ template = @{ spec = @{ containers = @($container) } } } }
$patchFile = Join-Path ([IO.Path]::GetTempPath()) ("clouddrop-promote-" + [guid]::NewGuid() + ".json")
$trafficJob = $null

try {
    $trafficJob = Start-Job -ArgumentList "$PSScriptRoot/generate-traffic.ps1", $BaseUrl -ScriptBlock {
        param($scriptPath, $url)
        & $scriptPath -BaseUrl $url -Requests 100000 -DelayMs 75
    }
    $patch | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $patchFile -Encoding utf8
    kubectl --context kind-progressive-delivery patch rollout clouddrop-service -n prod --type merge --patch-file $patchFile
    Assert-Command

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        $current = kubectl --context kind-progressive-delivery get rollout clouddrop-service -n prod -o json | ConvertFrom-Json
        Assert-Command
        $status = $current.status
        Write-Host ("Phase={0} Step={1} CanaryWeight={2}% Ready={3}" -f $status.phase, $status.currentStepIndex, $status.canary.weights.canary.weight, $status.readyReplicas)
        if ($status.observedGeneration -eq $current.metadata.generation) {
            if ($status.phase -eq "Healthy" -and $status.stableRS -eq $status.currentPodHash) {
                kubectl --context kind-progressive-delivery get analysisruns -n prod
                Write-Host "Purple v2 promoted successfully. Open $BaseUrl" -ForegroundColor Green
                return
            }
            if ($status.phase -eq "Degraded") { throw $status.message }
        }
        if ($trafficJob.State -eq "Failed") { throw "Checkout traffic job failed" }
        Start-Sleep -Seconds 5
    } while ((Get-Date) -lt $deadline)
    throw "Timed out waiting for v2 promotion; inspect the rollout and analysis runs."
} finally {
    if ($trafficJob) {
        Stop-Job $trafficJob
        Receive-Job $trafficJob
        Remove-Job $trafficJob
    }
    Remove-Item -LiteralPath $patchFile -Force -ErrorAction SilentlyContinue
}
