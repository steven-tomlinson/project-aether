# System Architecture: Project Aether

Project Aether is a hybrid application combining a high-fidelity React frontend with a robust FastAPI backend proxy. This separation of concerns allows us to bypass browser limitations while maintaining a smooth User Experience.

## 1. Multimodal Proxy Pipeline

The core technical challenge of Project Aether was reliably fetching book manifests from personal Google Drive folders while operating in a multi-tenant environment.

### The Problem
Google Drive API requests from a browser (Client-side) are heavily restricted by:
- **CORS**: Cross-Origin Resource Sharing.
- **Referrer Blocks**: API Keys restricted to specific domains (e.g., `aether.musubipress.com`) often fail when requested directly from the browser's dynamic origin.

### The Solution: Backend Proxy
We moved the public library loading to the server.
1. **Request**: The Frontend calls `GET /api/library`.
2. **Proxying**: The FastAPI backend makes the request to Google Drive on behalf of the user.
3. **Spoofing**: The server manually sets the `Referer` header to match what the API Key expects, effectively bypassing browser-side header restrictions.
4. **Key Rotation**: If the primary API key is blocked or limited, the backend rotates through a strategy of secondary keys (e.g., `GEMINI_API_KEY`) to ensure data delivery.

## 2. Dynamic Vibe Configuration

The "Vibe Coding" philosophy extends to the data layer. Every book in the library is a **Data Cartridge** defined by a `manifest.json`.

- **Style Tokens**: Each manifest contains HSL color tokens, specific Google Fonts, and ambient sound profiles.
- **On-Demand Generation**: Images and detailed summaries are generated lazily using **Gemini 3.0 Pro** and **Nano Banana** only when the user selects a book, preserving API quota.

## 3. High-Resilience Deployments

The application is deployed as a **Unified Container**:
- **Frontend**: Built with Vite and served statically or through a proxy.
- **Backend**: Python FastAPI service running in the same container.
- **Platform**: Google Cloud Run provides auto-scaling and managed SSL.

Deployment is orchestrated via `cloudbuild.yaml` which bakes environment variables into the container image at build time for maximum performance.
