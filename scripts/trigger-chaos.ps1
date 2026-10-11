param (
    [int]$Percentage = 0
)

Write-Host "Updating cluster-wide error rate to $Percentage% across all pods..." -ForegroundColor Yellow

# Set environment variable on the Rollout so ALL replicas inherit it declaratively
kubectl patch rollout clouddrop-service -n prod --type=merge -p "{\`"spec\`":{\`"template\`":{\`"spec\`":{\`"containers\`":[{\`"name\`":\`"clouddrop-service\`",\`"env\`":[{\`"name\`":\`"INITIAL_ERROR_PERCENTAGE\`",\`"value\`":\`"$Percentage\`"}]}]}}}}"

Write-Host "`nCluster updated! All pods now configured with $Percentage% error rate." -ForegroundColor Green
