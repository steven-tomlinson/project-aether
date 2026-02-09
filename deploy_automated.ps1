param(
    [string]$ProjectID,
    [string]$ApiKey,
    [string]$OAuthId
)

$ErrorActionPreference = "Stop"

Write-Host "Starting automated deployment for Project Aether..." -ForegroundColor Cyan

# Check for gcloud
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: gcloud CLI is not installed." -ForegroundColor Red
    exit 1
}

# 1. Configuration
if (-not $ProjectID) {
    $ProjectID = Read-Host "Enter your Google Cloud Project ID"
}
if (-not $ApiKey) {
    if (Test-Path ".env") {
        # Try to read from .env if available
        $envContent = Get-Content ".env"
        foreach ($line in $envContent) {
            if ($line -match "GEMINI_API_KEY=(.*)") { $ApiKey = $matches[1] }
            if ($line -match "GOOGLE_CLIENT_ID=(.*)") { $OAuthId = $matches[1] }
        }
    }
    if (-not $ApiKey) { $ApiKey = Read-Host "Enter your Gemini API Key" }
}
if (-not $OAuthId) { 
    if (-not $OAuthId) { $OAuthId = Read-Host "Enter your Google Client ID (OAuth)" }
}

$Region = "us-central1"
$ServiceName = "aether-app"

# 2. Authenticate & Configure
Write-Host "Configuring Project: $ProjectID..." -ForegroundColor Green
cmd /c "gcloud config set project $ProjectID"

# 3. Build
Write-Host "Building Container..." -ForegroundColor Green
cmd /c "gcloud builds submit --tag gcr.io/$ProjectID/$ServiceName ."

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

# 4. Deploy
Write-Host "Deploying to Cloud Run..." -ForegroundColor Green
$DeployCmd = "gcloud run deploy $ServiceName --image gcr.io/$ProjectID/$ServiceName --platform managed --region $Region --allow-unauthenticated --set-env-vars ""VITE_GEMINI_API_KEY=$ApiKey,GOOGLE_CLIENT_ID=$OAuthId"""
Invoke-Expression $DeployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed." -ForegroundColor Red
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Cyan
Write-Host "Target Domain: aether.musubipress.com" -ForegroundColor Yellow
