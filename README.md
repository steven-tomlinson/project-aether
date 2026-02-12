<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">

# PROJECT AETHER
### PUBLIC DOMAIN ARCHIVE v1.0

![Gemini 3.0](https://img.shields.io/badge/Powered_by-Gemini_3.0-8E44AD?style=for-the-badge&logo=google-gemini)
![React](https://img.shields.io/badge/Front--End-React_18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Back--End-FastAPI-009688?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🌌 Introduction: The "Vibe Coded" Library

**Project Aether is not an ebook reader. It is a resurrection engine.**

Built for the **Google Gemini 3 Hackathon**, Project Aether reimagines the public domain as a living, breathing entity. By leveraging the Unified Gemini 2026 Model Portfolio, we transform static text cartridges into immersive, multimodal experiences.

> "The books of the past are frozen. Aether melts them down and reforges them in real-time."

### Key Features
*   **Neural Ingestion**: Drag-and-drop any `.txt` or `.md` file (or import from Google Drive). The system analyzes the narrative structure, extracting metadata and mood instantaneously.
*   **Vibe Coding**: A "System Shock" inspired interface that feels like a databank from 2077, built with modern React and Tailwind.
*   **Generative Visuals**: As you read, **Nano Banana Pro** (Gemini 3.0 Image) hallucinates scene-accurate artwork for each chapter.
*   **Deep Reasoning**: **Gemini 3.0 Pro** acts as the "Librarian," understanding context, summarizing themes, and even generating cover art prompts.
*   **Resilient Data Access**: A specialized **Backend Proxy** in FastAPI bypasses common browser restrictions (CORS/Referrer) to deliver Google Drive manifests with high reliability using a automated key-rotation strategy.
*   **Persistent Indexing**: The "Universal Reader" reconfigures its UI (Fonts, Colors, Sounds) based on a `manifest.json` fetched directly from the cloud.

---

## 🧠 Powered by Gemini 3.0 Universe

Project Aether is built on the new unified model ecosystem:

| Feature | Model Alloy | API ID | Role |
| :--- | :--- | :--- | :--- |
| **Deep Reasoning** | **Gemini 3.0 Pro** | `gemini-3.0-pro` | The "Brain": Narrative extraction, prompt engineering. |
| **High-Speed Logic** | **Gemini 3.0 Flash** | `gemini-3.0-flash` | The "Reflexes": Real-time UI updates, failover logic. |
| **Visual Imagination** | **Nano Banana Pro** | `gemini-3.0-pro-image-preview` | The "Eye": High-fidelity cover & scene generation. |
| **Cinematic Motion** | **Veo 3.1** | `veo-3.1-generate-preview` | The "Dream": (Roadmap) Video backgrounds for reading. |

---

## 🏗️ Architecture: The Hybrid Proxy

Project Aether uses a hybrid architecture to solve traditional Web API restrictions:
1.  **Frontend (React/Vite)**: Requests the public library from the Backend.
2.  **Backend (FastAPI)**: Proxies requests to Google Drive, spoofing referrers and rotating API keys if a limit or block is encountered.
3.  **Storage (Google Drive)**: Acts as the "Cloud Bookshelf" containing book metadata and text.

---

## 🛠️ Deployment & Setup

### Requirements
- Node.js 18+ & Python 3.10+
- Google Cloud Project with Drive API enabled.
- Gemini API Key.

### Local Development
```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Automated Deployment (Cloud Run)
We provide PowerShell scripts to deploy the unified container (Frontend + Backend) to Google Cloud Run.

*   **Production**: `.\deploy.ps1`
*   **Staging**: `.\deploy_staging.ps1`

These scripts handle image building via `cloudbuild.yaml`, pushing to Google Container Registry, and deploying with the correct environment variables.

---

## 📝 Environment Variables

Create a `.env` in the root:
- `GEMINI_API_KEY`: Your Gemini 3 Pro/Flash API Key.
- `GOOGLE_CLIENT_ID`: OAuth Client ID (for Production/Localhost).
- `STAGING_CLIENT_ID`: OAuth Client ID (Specific to Staging URL).
- `VITE_GOOGLE_API_KEY`: Google API Key with Drive Read access (restricted).
- `VITE_STARTER_FOLDER_ID`: The Folder ID for your public book manifest library.


---

## 🔮 Future Roadmap

Project Aether is v1.0. The roadmap for v2.0 includes:

1.  **Veo 3.1 Integration**: Replacing static chapter images with 4-second looping ambient videos.
2.  **Vector Search**: "Talk to your Library" using Gemini's long-context window to query the entire corpus.
3.  **Community Cartridges**: A P2P operational mode to share "Vibe Coded" book manifests without copyright infringement.


---

<div align="center">
<sub>Built with 🧡 during the Gemini 3 Hackathon.</sub>
</div>
