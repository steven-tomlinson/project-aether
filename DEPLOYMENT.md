# Deploying Project Aether to Google Cloud Run

Since the `gcloud` CLI is not available in the current environment, follow these steps to deploy the application manually or via your local terminal.

## Architecture
We are using a **Unified Container** strategy.
-   **Frontend**: React (Vite) built to static files.
-   **Backend**: FastAPI serving the API *and* the static frontend files.
-   **Entrypoint**: `Dockerfile` in the project root.

## Prerequisites
1.  **Google Cloud Project**: Ensure you have a project created (e.g., `project-aether-486817`).
2.  **APIs Enabled**: Cloud Run API, Artifact Registry API.
3.  **gcloud CLI**: Installed and authenticated on your local machine.

## Step 1: Build & Submit Container
Run this in your local terminal where you have `gcloud` access:

```bash
# Authenticate
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]

# Enable Services
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Build and Submit Image to Google Container Registry (GCR)
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/aether-app .
```

## Step 2: Deploy to Cloud Run

```bash
gcloud run deploy aether-app \
  --image gcr.io/[YOUR_PROJECT_ID]/aether-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_GEMINI_API_KEY=[YOUR_GEMINI_KEY],GOOGLE_CLIENT_ID=[YOUR_OAUTH_CLIENT_ID]"
```

*Note: Replace `[YOUR_GEMINI_KEY]` and `[YOUR_OAUTH_CLIENT_ID]` with your actual credentials.*

## Step 3: Map Custom Domain
**Status:** `lockb0x.io` is VERIFIED.
**Pending:** Waiting for Cloud Run to sync verification status.

1.  Go to the **[Cloud Run Domain Mappings](https://console.cloud.google.com/run/domains?project=project-aether-486716)**.
2.  Click **Add Mapping**.
3.  Select Service: `aether-app`.
4.  Select Domain: `lockb0x.io` (If not visible, wait 15-60 mins for sync).
5.  Set Subdomain: `aether`.
6.  **Action**: Google will display `A` and `AAAA` records.
7.  **DNS Update**: Add these records to your Namecheap DNS for `aether`.

## Troubleshooting
-   **502 Bad Gateway**: Ensure the container listens on `$PORT` (Defaults to 8080).
-   **CORS Errors**: The backend is configured to allow `*` origins, but ensure your OAuth Client ID allows the deployed domain.
