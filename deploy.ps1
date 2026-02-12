param(
    [string]$ProjectID,
    [string]$ApiKey,
    [string]$OAuthId,
    [string]$GoogleApiKey,
    [string]$StarterFolderId
)

$ErrorActionPreference = "Stop"

Write-Host "Starting PROD deployment for Project Aether... (aether-app)" -ForegroundColor Cyan

# Check for gcloud
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: gcloud CLI is not installed." -ForegroundColor Red
    exit 1
}

# 1. Configuration
if (-not $ProjectID) {
    if (-not $ProjectID) { $ProjectID = Read-Host "Enter your Google Cloud Project ID" }
}

# Read .env for defaults
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "GEMINI_API_KEY=(.*)") { if (-not $ApiKey) { $ApiKey = $matches[1].Trim() } }
        # Note: For PROD, we want GOOGLE_CLIENT_ID, not STAGING_CLIENT_ID
        if ($line -match "^GOOGLE_CLIENT_ID=(.*)") { if (-not $OAuthId) { $OAuthId = $matches[1].Trim() } }
        if ($line -match "VITE_GOOGLE_API_KEY=(.*)") { if (-not $GoogleApiKey) { $GoogleApiKey = $matches[1].Trim() } }
        if ($line -match "VITE_STARTER_FOLDER_ID=(.*)") { if (-not $StarterFolderId) { $StarterFolderId = $matches[1].Trim() } }
    }
}

Write-Host "DEBUG: ProjectID: $ProjectID" -ForegroundColor DarkGray
Write-Host "DEBUG: ApiKey found: $([string]::IsNullOrWhiteSpace($ApiKey) -eq $false)" -ForegroundColor DarkGray
Write-Host "DEBUG: OAuthId (Prod): $OAuthId" -ForegroundColor DarkGray
Write-Host "DEBUG: GoogleApiKey: $GoogleApiKey" -ForegroundColor DarkGray
Write-Host "DEBUG: StarterFolderId: $StarterFolderId" -ForegroundColor DarkGray

# Prompt if still missing
if (-not $ApiKey) { $ApiKey = Read-Host "Enter your Gemini API Key" }
if (-not $OAuthId) { $OAuthId = Read-Host "Enter your Google Client ID (OAuth)" }
if (-not $GoogleApiKey) { $GoogleApiKey = Read-Host "Enter your Google API Key (Drive)" }
if (-not $StarterFolderId) { $StarterFolderId = Read-Host "Enter your Starter Folder ID" }

$Region = "us-central1"
$ServiceName = "aether-app"

# 2. Authenticate & Configure
Write-Host "Configuring Project: $ProjectID..." -ForegroundColor Green
cmd /c "gcloud config set project $ProjectID"

# 3. Build using cloudbuild.yaml (Prod Config)
Write-Host "Building Container (Prod Config)..." -ForegroundColor Green
# Quote substitutions to prevent PowerShell parsing errors
$Substitutions = "_GOOGLE_CLIENT_ID=$OAuthId,_GOOGLE_API_KEY=$GoogleApiKey,_STARTER_FOLDER_ID=$StarterFolderId"
$BuildCmd = "gcloud builds submit --config cloudbuild.yaml --substitutions `"$Substitutions`" ."
Write-Host "DEBUG: Running command: $BuildCmd" -ForegroundColor DarkGray
Invoke-Expression $BuildCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

# 4. Deploy
Write-Host "Deploying to Cloud Run (Prod)..." -ForegroundColor Green
# Pass Env Vars for Runtime
$EnvVars = "VITE_GEMINI_API_KEY=$ApiKey,GOOGLE_CLIENT_ID=$OAuthId,VITE_GOOGLE_API_KEY=$GoogleApiKey,VITE_STARTER_FOLDER_ID=$StarterFolderId"
$DeployCmd = "gcloud run deploy $ServiceName --image gcr.io/$ProjectID/$ServiceName --platform managed --region $Region --allow-unauthenticated --set-env-vars ""$EnvVars"""
Invoke-Expression $DeployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed." -ForegroundColor Red
    exit 1
}

Write-Host "Prod Deployment successful!" -ForegroundColor Cyan
Write-Host "Target URL: https://aether.musubipress.com (Mapped via Cloud Run Domain Mapping)" -ForegroundColor Yellow
