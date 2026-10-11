param (
    [int]$Percentage = 0
)

Write-Host "Updating cluster-wide error rate to $Percentage% across all pods..." -ForegroundColor Yellow

# Set environment variable on the Rollout so ALL replicas inherit it declaratively
kubectl set env rollout/payment-service INITIAL_ERROR_PERCENTAGE="$Percentage" -n prod

Write-Host "`nCluster updated! All pods now configured with $Percentage% error rate." -ForegroundColor Green
