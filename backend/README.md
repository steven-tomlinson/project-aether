# Project Aether: Backend Ingestion Service

This microservice handles the high-performance tasks for Project Aether, specifically the "Ingestion Engine" and image proxying.

## Role & Responsibilities

1.  **Ingestion Engine**:
    -   Processes uploaded text cartridges (TXT/MD).
    -   Analyzes content compatibility.
    -   (Future) Splits text into semantic chunks for vector storage.

2.  **Google Drive Library Proxy**:
    -   Securely fetches public library manifests from Google Drive.
    -   Bypasses client-side referrer restrictions using a multi-key rotation strategy.

3.  **Visual Cortex Proxy**:
    -   Acts as a secure gateway to the Gemini 3.0 API for image generation.
    -   Handles prompt enhancement and error recovery.

## Technology Stack

-   **Framework**: FastAPI (Python)
-   **AI SDK**: `google-genai` (Official Gemini SDK)
-   **Runtime**: Uvicorn

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```
