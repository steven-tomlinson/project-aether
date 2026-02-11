param(
    [string]$ProjectID,
    [string]$ApiKey,
    [string]$OAuthId,
    [string]$GoogleApiKey,
    [string]$StarterFolderId,
    [string]$StagingClientId
)

$ErrorActionPreference = "Stop"

Write-Host "Starting staging deployment for Project Aether..." -ForegroundColor Cyan

# Check for gcloud
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: gcloud CLI is not installed." -ForegroundColor Red
    exit 1
}

# 1. Configuration
if (-not $ProjectID) {
    if (Test-Path ".env") {
        # Try to infer project ID from existing gcloud config if usually stored there, 
        # but here we'll just ask or look for a file.
    }
    if (-not $ProjectID) { $ProjectID = Read-Host "Enter your Google Cloud Project ID" }
}

# Read .env for defaults
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "GEMINI_API_KEY=(.*)") { if (-not $ApiKey) { $ApiKey = $matches[1].Trim() } }
        if ($line -match "GOOGLE_CLIENT_ID=(.*)") { if (-not $OAuthId) { $OAuthId = $matches[1].Trim() } }
        if ($line -match "VITE_GOOGLE_API_KEY=(.*)") { if (-not $GoogleApiKey) { $GoogleApiKey = $matches[1].Trim() } }
        if ($line -match "VITE_STARTER_FOLDER_ID=(.*)") { if (-not $StarterFolderId) { $StarterFolderId = $matches[1].Trim() } }
        if ($line -match "STAGING_CLIENT_ID=(.*)") { if (-not $StagingClientId) { $StagingClientId = $matches[1].Trim() } }
    }
}

Write-Host "DEBUG: ProjectID: $ProjectID" -ForegroundColor DarkGray
Write-Host "DEBUG: ApiKey found: $([string]::IsNullOrWhiteSpace($ApiKey) -eq $false)" -ForegroundColor DarkGray
Write-Host "DEBUG: OAuthId found: $([string]::IsNullOrWhiteSpace($OAuthId) -eq $false)" -ForegroundColor DarkGray
Write-Host "DEBUG: GoogleApiKey: $GoogleApiKey" -ForegroundColor DarkGray
Write-Host "DEBUG: StarterFolderId: $StarterFolderId" -ForegroundColor DarkGray
Write-Host "DEBUG: StagingClientId: $StagingClientId" -ForegroundColor DarkGray

# Prompt if still missing
if (-not $ApiKey) { $ApiKey = Read-Host "Enter your Gemini API Key" }
if (-not $OAuthId) { $OAuthId = Read-Host "Enter your Google Client ID (OAuth)" }
if (-not $GoogleApiKey) { $GoogleApiKey = Read-Host "Enter your Google API Key (Drive)" }
if (-not $StarterFolderId) { $StarterFolderId = Read-Host "Enter your Starter Folder ID" }
if (-not $StagingClientId) { $StagingClientId = Read-Host "Enter your Staging Client ID" }

$Region = "us-central1"
$ServiceName = "aether-app-staging"

# 2. Authenticate & Configure
Write-Host "Configuring Project: $ProjectID..." -ForegroundColor Green
cmd /c "gcloud config set project $ProjectID"

# 3. Build (Separate staging text/tag if needed, but usually same codebase)
Write-Host "Building Container..." -ForegroundColor Green
Write-Host "Building Container with Staging Config..." -ForegroundColor Green
cmd /c "gcloud builds submit --config cloudbuild_staging.yaml --substitutions=_STAGING_CLIENT_ID=$StagingClientId,_GOOGLE_API_KEY=$GoogleApiKey,_STARTER_FOLDER_ID=$StarterFolderId ."

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

# 4. Deploy
Write-Host "Deploying to Cloud Run (Staging)..." -ForegroundColor Green
# formatting long command
$EnvVars = "VITE_GEMINI_API_KEY=$ApiKey,GOOGLE_CLIENT_ID=$OAuthId,VITE_GOOGLE_API_KEY=$GoogleApiKey,VITE_STARTER_FOLDER_ID=$StarterFolderId"
$DeployCmd = "gcloud run deploy $ServiceName --image gcr.io/$ProjectID/$ServiceName --platform managed --region $Region --allow-unauthenticated --set-env-vars ""$EnvVars"""
Invoke-Expression $DeployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed." -ForegroundColor Red
    exit 1
}

Write-Host "Staging Deployment successful!" -ForegroundColor Cyan
Write-Host "Staging URL should be listed above (ends in .a.run.app)" -ForegroundColor Yellow
