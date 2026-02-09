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
**Action:**
1.  Look under **OAuth 2.0 Client IDs**.
2.  If none exist, click **Create Credentials** > **OAuth client ID**.
    *   **Application type:** Web application.
    *   **Name:** `Aether App`.
    *   **Authorized Javascript origins:** `https://aether.musubipress.com` (and `http://localhost:3000` for dev).
    *   **Authorized redirect URIs:** `https://aether.musubipress.com` (and `http://localhost:3000` for dev).
**Value:** A string ending in `.apps.googleusercontent.com`.

---

## Prerequisite: Authenticate your Terminal
Before running the deployment script, you **MUST** log in to Google Cloud in your terminal:

```powershell
gcloud auth login
```

Then, try the deployment script again:

```powershell
.\deploy_automated.ps1
```
