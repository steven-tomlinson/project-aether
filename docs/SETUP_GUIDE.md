# Quick Setup Guide: Finding Your Credentials

To deploy Project Aether, you need three pieces of information. Here is exactly where to find them.

## 1. Project ID
**Where:** [Google Cloud Console Dashboard](https://console.cloud.google.com/home/dashboard)
**Look for:** The "Project Info" card in the top left.
**Value:** It will look like `project-aether-486817` or `gen-lang-client-0551379634`.
*   *Note: Ensure you have the correct project selected in the top dropdown.*

## 2. Gemini API Key
**Where:** [Google AI Studio - API Keys](https://aistudio.google.com/app/apikey)
**Action:** Click **Create API Key**.
**Value:** A long string starting with `AIza...`.

## 3. Google Client ID (OAuth)
**Where:** [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

### Setup for Local & Prod
1.  Look under **OAuth 2.0 Client IDs**.
2.  If none exist, click **Create Credentials** > **OAuth client ID**.
    *   **Application type:** Web application.
    *   **Name:** `Aether App (Prod)`.
    *   **Authorized Javascript origins:** `https://aether.musubipress.com`, `http://localhost:3000`.
3.  Store this in `.env` as `GOOGLE_CLIENT_ID`.

### Setup for Staging
If you use the staging environment (`aether-app-staging`), you must create a separate Client ID for the staging URL.
1.  **Authorized Javascript origins:** `https://aether-app-staging-cf3xkhn3ma-uc.a.run.app`.
2.  Store this in `.env` as `STAGING_CLIENT_ID`.

---

## 🚀 Deployment Scripts

The repository includes two main deployment scripts for PowerShell. Both will prompt you for your API keys and Client IDs, then save them as environment variables in Cloud Run.

### 1. Production Deployment
Deploys to the main `aether-app` service.
```powershell
.\deploy.ps1
```

### 2. Staging Deployment
Deploys to the `aether-app-staging` service for testing.
```powershell
.\deploy_staging.ps1
```

> [!TIP]
> **Authentication Check**: If you get a "403: access_denied" error during sign-in on a new environment, remember to add your email to the **Test Users** list in the Google Cloud Console's OAuth Consent Screen.

