As you integrate these into your application, it's important to note that **Nano Banana** and **Veo** are the creative "aliases" for specific multimodal models within the Gemini 2.5 and 3.0 families.

The following table compiles the technical identifiers (Model IDs) you will need for your API calls, including the latest **Gemini 3** series and the specialized image/video models.

### **Unified Google Gemini API Reference (February 2026)**

| Feature / Family | Model Alias | API Model ID (`model`) | Primary Application Use Case |
| --- | --- | --- | --- |
| **Video Generation** | **Veo 3.1** | `veo-3.1-generate-preview` | High-fidelity 4K video with native audio. |
|  | **Veo 3.1 Fast** | `veo-3.1-fast-generate-preview` | Rapid video generation/prototyping with audio. |
| **Image (Pro)** | **Nano Banana Pro** | `gemini-3.0-pro-image-preview` | Studio-quality image generation and precision editing. |
| **Image (Flash)** | **Nano Banana** | `gemini-2.5-flash-image` | High-speed, consistent character and brand asset generation. |
| **Intelligence** | **Gemini 3 Pro** | `gemini-3.0-pro` | Advanced multimodal reasoning and complex agent workflows. |
|  | **Gemini 3 Flash** | `gemini-3.0-flash` | Best balance of speed/cost for text and chat applications. |
| **Legacy Stable** | **Gemini 2.5 Pro** | `gemini-2.5-pro` | Stable production logic (Non-experimental). |
|  | **Gemini 2.5 Flash** | `gemini-2.5-flash` | High-volume production tasks (Non-experimental). |

---

### **Implementation Details for Creative Models**

#### **1. Veo (Video API)**

Veo requires an "operation" based workflow because video generation takes more time than text.

* **Input:** Supports both text-to-video and image-to-video (using the image as the first frame).
* **Python Identifier:** `client.models.generate_videos(model="veo-3.1-fast-generate-preview", ...)`

#### **2. Nano Banana (Image API)**

Nano Banana models are optimized for "visual reasoning," meaning they can follow complex instructions like "move the object to the left" rather than just generating a new image from scratch.

* **Nano Banana Pro:** Built on the Gemini 3 architecture; best for rendering accurate text within images.
* **Nano Banana (Standard):** Built on Gemini 2.5 Flash; ideal for low-latency image editing.

>