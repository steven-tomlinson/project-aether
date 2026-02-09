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
*   **Resilient Fallback**: A sophisticated "Graceful Degradation" pattern ensures the experience never breaks, sliding from Pro -> Flash -> Mock data if APIs are unreachable.

---

## 🧠 Powered by Gemini 3.0 Universe

Project Aether doesn't just "use AI"—it is built *on* the new unified model ecosystem:

| Feature | Model Alloy | API ID | Role |
| :--- | :--- | :--- | :--- |
| **Deep Reasoning** | **Gemini 3.0 Pro** | `gemini-3.0-pro` | The "Brain": Narrative extraction, prompt engineering. |
| **High-Speed Logic** | **Gemini 3.0 Flash** | `gemini-3.0-flash` | The "Reflexes": Real-time UI updates, failover logic. |
| **Visual Imagination** | **Nano Banana Pro** | `gemini-3.0-pro-image-preview` | The "Eye": High-fidelity cover & scene generation. |
| **Cinematic Motion** | **Veo 3.1** | `veo-3.1-generate-preview` | The "Dream": (Roadmap) Video backgrounds for reading. |

---

## 🎞️ End-to-End Demo

Watch Project Aether in action: **Ingestion -> Reading -> visual Dreaming.**

![Project Aether Demo](assets/demo.webp)

---

## 🚀 Hackathon Submission Checklist

This repository represents a complete, deployable entry for the **Google Gemini 3 Hackathon**.

- [x] **Gemini 3.0 Integration**: Validated use of `gemini-3.0-pro` and `gemini-3.0-flash` via `GeminiService.ts`.
- [x] **Native Multimodality**: Text-to-Image and Text-to-Metadata pipelines are fully operational.
- [x] **Real-World Utility**: Functioning Google Drive integration for user-owned libraries.
- [x] **"Wow" Factor**: Custom "Retro-Future" UI design system (Vibe Coded).

---

## 🛠️ Deployment Guide

### Prerequisites
- Node.js 18+
- Python 3.10+
- Google Cloud Project (Drive API enabled)
- Gemini API Key

### 1. Frontend (The Interface)
```bash
# Install dependencies
npm install

# Configure Environment
# Create .env.local and add:
# VITE_GEMINI_API_KEY=your_key_here
# VITE_GOOGLE_CLIENT_ID=your_client_id

# Launch
npm run dev
```

### 2. Backend (The Ingestion Engine)
The python microservice handles heavy text processing and image proxying.
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Launch Server
uvicorn main:app --reload
```

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
