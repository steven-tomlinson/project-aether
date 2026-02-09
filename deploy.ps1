$ErrorActionPreference = "Stop"

Write-Host "Starting deployment for Project Aether..." -ForegroundColor Cyan

# Check for gcloud
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: gcloud CLI is not installed. Please restart your shell if you just installed it." -ForegroundColor Red
    exit 1
}

# Project Configuration
$ProjectID = Read-Host "Enter your Google Cloud Project ID (e.g., project-aether-486817)"
if ([string]::IsNullOrWhiteSpace($ProjectID)) {
    Write-Host "Project ID is required." -ForegroundColor Red
    exit 1
}

$Region = "us-central1"
$ServiceName = "aether-app"

# Authenticate
Write-Host "Authenticating..." -ForegroundColor Green
cmd /c "gcloud auth login"
cmd /c "gcloud config set project $ProjectID"

# Enable Services
Write-Host "Enabling necessary services..." -ForegroundColor Green
cmd /c "gcloud services enable cloudbuild.googleapis.com run.googleapis.com"

# Build and Submit
Write-Host "Building and submitting container image..." -ForegroundColor Green
# Using cmd /c to ensure proper argument parsing for gcloud
cmd /c "gcloud builds submit --tag gcr.io/$ProjectID/$ServiceName ."

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

# Prompt for Secrets
$ApiKey = Read-Host "Enter your Gemini API Key"
$OAuthId = Read-Host "Enter your Google Client ID (OAuth)"

if ([string]::IsNullOrWhiteSpace($ApiKey) -or [string]::IsNullOrWhiteSpace($OAuthId)) {
    Write-Host "API Key and OAuth ID are required for deployment." -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "Deploying to Cloud Run..." -ForegroundColor Green
$DeployCmd = "gcloud run deploy $ServiceName --image gcr.io/$ProjectID/$ServiceName --platform managed --region $Region --allow-unauthenticated --set-env-vars ""VITE_GEMINI_API_KEY=$ApiKey,GOOGLE_CLIENT_ID=$OAuthId"""
Invoke-Expression $DeployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed." -ForegroundColor Red
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Cyan
Write-Host "You can now configure your custom domain at: https://console.cloud.google.com/run/domains?project=$ProjectID" -ForegroundColor Yellow
Write-Host "Target Domain: aether.musubipress.com" -ForegroundColor Yellow
