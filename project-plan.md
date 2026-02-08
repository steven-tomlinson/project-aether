# **Project Aether: The "Vibe Coded" Public Domain Sci-Fi Library**

## **A Strategic Roadmap for the Gemini 3 AI Hackathon**

### **1\. Executive Strategy: Defining the "Vibe Coded" Paradigm**

The objective of this engagement is to architect a winning submission for the DevPost Gemini 3 AI Hackathon by constructing **"Project Aether,"** a virtual library of multimodal web applets. This platform will not only house curated masterworks of public domain science fiction from the "Golden Age" (1934–1963) but also provide a dynamic "Ingestion Engine" allowing users to expand the library with their own public domain discoveries.

To achieve this within a compressed seven-day timeline, we must fundamentally shift our development methodology from traditional engineering to **"Vibe Coding"**. In this paradigm, the developer acts as a "Director of Intent," leveraging large language models (LLMs) to handle the heavy lifting of code generation, asset creation, and logic implementation. The hackathon judges explicitly seek a "wow" factor, technical depth in using Gemini's latest capabilities, and a demonstration of "native multimodality". Project Aether addresses these criteria by transforming static text into immersive, sensorially rich experiences using the full spectrum of the Gemini 3 ecosystem.

#### **1.1 The "Vibe Coding" Thesis & Hackathon Alignment**

"Vibe Coding" is defined as a development method where the programmer uses natural language to guide AI in generating code and assets, prioritizing high-level creative direction over manual syntax management. This aligns perfectly with the "Gemini 3 Vibe Code" theme of the competition.

Our strategy rests on three pillars of innovation that directly map to the judging criteria:

1. **Agentic "Show, Don't Just Tell":** Instead of a static ebook reader, each "applet" will be an active agent. The application will "read" the book *to* the user, not just text-to-speech, but performing the narrative with emotional nuance and visualizing the scene in real-time.  
2. **Native Multimodality:** We will utilize Gemini 3's native ability to understand and generate text, image, and audio simultaneously. We will not use separate APIs stitched together (like OpenAI \+ ElevenLabs); we will use the unified Gemini 3 ecosystem to demonstrate the model's coherence.  
3. **The "Ingestion Engine" (The Wow Factor):** The ability for a user to upload *any* public domain text and have the system essentially "hallucinate" a custom applet—complete with cover art, voice casting, and ambient sound—in real-time is the differentiator that will secure high marks for technical complexity and real-world impact.

#### **1.2 Strategic Resource Allocation: Google One AI Premium vs. API Quotas**

A critical constraint is the API quota management for the Gemini 3 Pro and Nano Banana Pro models. To maximize the output quality without hitting rate limits during development, we will leverage your **Google One AI Premium** (referred to as "Google Plus AI" in your query) subscription strategically.

The Google One AI Premium subscription offers distinct advantages that must be decoupled from the Hackathon API keys :

* **Gemini Code Assist (IDE Integration):** Your subscription provides higher daily request limits for Gemini Code Assist in VS Code. **Strategy:** All application code (React components, Python backend logic, CSS styling) will be generated using Code Assist. This preserves your API usage limits for the *actual* multimodal generation (images/audio) during the app's runtime.  
* **Gemini Advanced (Chat Interface):** The subscription grants access to the most capable models (Gemini 3 Pro/Ultra) in the chat interface. **Strategy:** Use this interface for "Pre-Production." We will generate the prompts, style guides, and even the initial batch of high-resolution "Cover Art" for the six curated stories manually via the chat interface. This offloads the heavy GPU compute from the API quota to your subscription's consumer quota.  
* **NotebookLM Integration:** The subscription offers "5x more Audio Overviews". **Strategy:** For each curated story, we will generate a "Deep Dive" podcast using NotebookLM. This audio file will be embedded in the applet as an "Introduction" or "Literary Analysis" bonus feature, adding immense value with zero API cost.

**Resource Separation Table:**

| Task | Resource Source | Quota Impact |
| :---- | :---- | :---- |
| **Code Generation (Frontend/Backend)** | Gemini Code Assist (VS Code) | **Subscription** (High Limits) |
| **Prompt Engineering & Logic Design** | Gemini Advanced (Web Chat) | **Subscription** (High Limits) |
| **"Deep Dive" Intro Podcasts** | NotebookLM | **Subscription** (High Limits) |
| **Runtime Text Analysis (The App)** | Gemini 3 Flash API | **Free Tier API** (High Rate Limits) |
| **Runtime Image Generation (The App)** | Nano Banana Pro API | **Free Tier API** (Strict Limits \- 50/day) |
| **Runtime Narrative Audio (The App)** | Gemini-TTS API | **Free Tier API** (Preview Limits) |

This hybrid approach allows us to "Vibe Code" rapidly without fear of exhausting the credentials needed for the live demo.

---

### **2\. The "Golden Age" Corpus: Literary & Legal Excavation (1934–1963)**

To demonstrate the "Library" capability, we have curated six masterpieces from the "Golden Age" of science fiction. These selections are critical because they span the transition from "Pulp Adventure" to "Psychological Sci-Fi," allowing us to showcase Gemini's ability to adapt its visual and auditory style to different genres.

Crucially, all selected works fall into the specific legal window of **1929–1963**, where copyright renewal was mandatory in the US. The copyrights for these specific stories were *not* renewed, placing them firmly in the public domain in the United States.

#### **2.1 *A Martian Odyssey* (1934) by Stanley G. Weinbaum**

* **Legal Status:** Published July 1934 in *Wonder Stories*. Copyright was not renewed. Confirmed public domain.  
* **Literary Significance:** This story revolutionized sci-fi by presenting the first truly "alien" alien (Tweel), rather than a human in a suit. It is colorful, adventurous, and bizarre.  
* **Multimodal Vibe Strategy:**  
  * **Visuals:** "Pulp Art" aesthetic. We will instruct Nano Banana Pro to emulate the style of Frank R. Paul (a famous illustrator of that era). Key elements: Bright orange deserts, purple skies, and the ostrich-like alien Tweel.  
  * **Audio:** "Energetic Adventure." We will use a Gemini-TTS voice with a higher pitch and faster speaking rate to capture the excitement of discovery.  
  * **Ambient Sound:** "Martian Winds" and "Crystal Chiming."

#### **2.2 *The Variable Man* (1953) by Philip K. Dick**

* **Legal Status:** Published September 1953 in *Space Science Fiction*. Copyright not renewed. Confirmed public domain.  
* **Literary Significance:** A hard sci-fi war thriller involving time travel and predictive statistics. It deals with pre-determinism vs. chaos.  
* **Multimodal Vibe Strategy:**  
  * **Visuals:** "Atomic Age Industrial." Blueprints, massive mainframes with vacuum tubes, cold steel corridors. We will use a "Technicolor Noir" palette.  
  * **Audio:** "Political Thriller." A serious, baritone narrator voice (e.g., the 'Charon' voice profile ).  
  * **Ambient Sound:** "Computer Humming," "Teletype Clicks," and "Distant Klaxons."

#### **2.3 *The Defenders* (1953) by Philip K. Dick**

* **Legal Status:** Published January 1953 in *Galaxy Science Fiction*. Copyright not renewed. Confirmed public domain.  
* **Literary Significance:** A post-apocalyptic tale where humans live underground while robots fight on the surface (or so they think).  
* **Multimodal Vibe Strategy:**  
  * **Visuals:** "Gritty Dystopia vs. Pastoral Fake." The applet must contrast the claustrophobic underground bunkers (dark, grainy, claustrophobic) with the pristine, nature-reclaimed surface world (verdant, lush, peaceful). This contrast will demonstrate Gemini's context awareness.  
  * **Audio:** "Speaker Diarization." We will use distinct voice processing for the Humans (natural, echoey) vs. the "Leadys" (robots \- metallic, monotone).  
  * **Ambient Sound:** "Subterranean Rumble" vs. "Birds Chirping" (Surface).

#### **2.4 *Piper in the Woods* (1953) by Philip K. Dick**

* **Legal Status:** Published February 1953 in *Imagination*. Copyright not renewed. Confirmed public domain.  
* **Literary Significance:** A psychological mystery about soldiers who believe they are plants. It is surreal and dreamlike.  
* **Multimodal Vibe Strategy:**  
  * **Visuals:** "Surrealist Biological." Dali-esque melting clocks meet dense alien foliage. Soft focus, organic shapes, earth tones mixed with sterile medical whites.  
  * **Audio:** "Hypnotic." A slow, whispering narration style.  
  * **Ambient Sound:** "Wind through leaves," "Soft breathing."

#### **2.5 *The Skull* (1952) by Philip K. Dick**

* **Legal Status:** Published September 1952 in *If*. Copyright not renewed. Confirmed public domain.  
* **Literary Significance:** A time-travel paradox where a man is sent back to kill a religious figure, only to discover the truth about his own identity.  
* **Multimodal Vibe Strategy:**  
  * **Visuals:** "Sepia Noir." 1950s prison cells, dramatic shadows (chiaroscuro), religious iconography.  
  * **Audio:** "Fatalistic." A noir-detective style narration.  
  * **Ambient Sound:** "Dripping water," "Echoing footsteps," "Gregorian chants."

#### **2.6 *2 B R 0 2 B* (1962) by Kurt Vonnegut**

* **Legal Status:** Published January 1962 in *Worlds of If*. Copyright not renewed. Confirmed public domain.  
* **Literary Significance:** A satire on population control and sanitation. The title references Hamlet ("To be or not to be").  
* **Multimodal Vibe Strategy:**  
  * **Visuals:** "Clinical Sterility." Bright white hospital corridors, purple distinct uniforms (as described in the text), murals of gardens. The style should be "Mid-Century Modern" illustration.  
  * **Audio:** "Satirical Cheerful." The narrator should sound disturbingly pleasant despite the dark subject matter, capturing Vonnegut's irony.  
  * **Ambient Sound:** "Hospital beeps," "Muzak."

---

### **3\. System Architecture: The "Bookshelf" Engine**

To satisfy the requirement of a "Virtual Library" that can grow, we cannot simply hard-code these six stories. We must build a **Scalable Single Page Application (SPA)** with a robust backend ingestion system.

#### **3.1 The Tech Stack (Vibe Coded)**

We will use a modern stack that allows for rapid iteration via Gemini Code Assist.

* **Frontend:** **React.js / Next.js**. This framework is ideal for the "Bookshelf" interface and the "Applet" modal windows. It handles state management (which page is the user reading?) and media playback effectively.  
* **Backend:** **Python (FastAPI)**. Python is the native language of AI. Using FastAPI allows us to easily integrate the Google Gen AI SDK (google-genai) for Python.  
* **Database:** **JSON-based Flat File System** (for the Hackathon). To keep deployment simple and fast, we will store book metadata and assets in a structured JSON schema. This avoids the complexity of setting up a SQL database within a one-week sprint.  
* **Hosting:** **Vercel** (Frontend) \+ **Render/Railway** (Backend). These platforms have generous free tiers suitable for hackathon demos.

#### **3.2 The "Applet" Container Design**

The user requested "applets" for each story. In web terms, these will be self-contained modules loaded dynamically.

**The "Universal Reader" Component:**

Instead of coding a unique app for each story, we will Vibe Code a "Universal Reader" component that reconfigures itself based on a manifest.json file.

**Manifest Schema (book\_id/manifest.json):**

JSON

{

  "id": "martian\_odyssey",

  "title": "A Martian Odyssey",

  "author": "Stanley G. Weinbaum",

  "theme": {

    "font": "Orbitron",

    "primary\_color": "\#FF4500", 

    "background\_style": "pulp\_texture"

  },

  "audio\_profile": {

    "narrator\_voice": "Aoede",

    "ambient\_track": "desert\_wind"

  },

  "segments": \[

    {

      "id": 1,

      "text": "Jarvis stretched himself...",

      "image\_prompt": "A spaceman standing on a red desert...",

      "generated\_image\_url": "/assets/mo\_01.png",

      "generated\_audio\_url": "/assets/mo\_01.mp3"

    }

  \]

}

This architecture allows the "Ingestion Engine" to simply generate a new JSON file to add a new book, satisfying the requirement to "allow other public domain stories to be added" without deploying new code.

#### **3.3 The "Ingestion Engine" (Adding Books)**

This is the core technical innovation. When a user uploads a text file (e.g., an .epub or .txt), the backend performs the following **Agentic Workflow**:

1. **Validation:** Checks file type and size.  
2. **Public Domain Verification:** (Mocked or Basic) Uses Gemini 3 Flash to scan the text for copyright notices or publication dates to ensure safety.  
3. **Segmentation:** Splits the text into logical "Scenes" (approx. 200-300 words) suitable for one illustration and one audio clip.  
4. **"Vibe Extraction" (Gemini 3 Flash):**  
   * Analyzes the text to determine the genre (e.g., "Noir", "Pulp", "Horror").  
   * Selects the appropriate CSS theme and Font.  
   * Selects the best TTS Voice Profile.  
5. **Asset Generation (The Expensive Part):**  
   * **Cover Art:** Generates *one* high-quality cover using Nano Banana Pro.  
   * **Scene Art:** *Optimization Strategy:* For the "User Upload" feature, generating images for *every* page instantly is too slow and quota-heavy. **Solution:** We will implement "Lazy Generation." The app generates the text and audio immediately. Images are generated only when the user opens that specific page, or we use a "Generic Atmosphere" image loop (clouds, stars) selected by Gemini until the specific art is ready.

---

### **4\. The Gemini 3 Multimodal Pipeline**

This section details exactly how we use the Gemini 3 API to generate the sensory elements requested: Narrative Audio, Illustrations, and Ambient Sound.

#### **4.1 Narrative Audio (Gemini-TTS)**

The user requires the stories to be read in a "narrative fashion." Standard TTS is flat. Gemini-TTS allows for "granular control over style, accent, pace, tone, and even emotional expression."

**Implementation Strategy:**

We will use **Multi-Speaker Diarization** via prompting.

* **Prompt Engineering:** We will feed the text segment to Gemini 3 Flash first.  
  * *Prompt:* "Analyze this text. Identify the speaker. If it is narration, mark as 'Narrator'. If it is a character, identify the emotion (e.g., 'Angry', 'Whispering'). Output the text with SSML tags or speaker labels for the TTS engine."  
* **TTS Request:** We then send this marked-up text to the Gemini-TTS endpoint.  
  * *Example:* "The machine stopped." "Kuno, is that you?"  
  * This fulfills the requirement for a "narrative fashion" rather than a robotic read.

#### **4.2 Visual Imagination (Nano Banana Pro)**

The user requires "era and genre appropriate illustrations."

* **Model:** gemini-3-pro-image-preview (Nano Banana Pro).  
* **Consistency Control:** A major challenge in AI art is character consistency.  
  * **Solution:** We will use **"Character LoRA"** or **"Reference Image"** techniques if supported by the API. If not, we will use **"Prompt Chaining."**  
  * *System Prompt:* "You are illustrating 'A Martian Odyssey'. The alien 'Tweel' must ALWAYS look like an ostrich with a long neck and a small beak. Maintain this consistency."  
* **Era Adaptation:** We will inject "Art Style modifiers" based on the book's publication year.  
  * 1934: "Technicolor, Pulp Magazine, coarse dot matrix shading."  
  * 1953: "Mid-century modern, gouache painting, flat colors."  
  * 1962: "Pop Art, clean lines, high contrast."

#### **4.3 Aural Scenography (Sound Effects & Ambience)**

The user explicitly asked for "sound effects or background music or ambient sound."

* **Constraint:** While Gemini 3 has "Audio Generating Models" , generating precise *music* tracks that match a specific duration and mood via API can be unpredictable in a preview model.  
* **Hybrid Solution (The "Soundscape Conductor"):**  
  1. **Ambient Library:** We will curate a library of 20-30 public domain ambient loops (Rain, Wind, Space Hum, City Traffic, Jungle).  
  2. **Gemini as DJ:** For each scene, we ask Gemini 3 Flash: "Given this text, which ambient loop fits best? And what volume level (0-100)?"  
     * *Text:* "The wind howled across the red dunes." \-\> *Gemini Decision:* Track: "Wind\_Heavy.mp3", Volume: 80.  
  3. **Experimental Foley:** For specific short sounds (e.g., "A laser blast"), we will attempt to use the gemini-3-pro-audio generation capability to create 2-second clips on the fly. If the API fails or latency is too high, the system will fallback to the Ambient Library. This ensures the requirement is met robustly.

---

### **5\. Development Roadmap: The 7-Day Sprint**

To achieve this in one week, we will execute a "Vibe Coding" sprint. This schedule assumes you will use your evenings (4 hours/night) and the weekend.

**Day 1: Foundation & "Vibe" Setup** [COMPLETED]

* **Goal:** Operational "Hello World" app with Gemini integration.  
* **Status:** Done. Vite + React project structure established.  
* **API Setup:** Done. Google Gen AI SDK integrated.

**Day 2: The Ingestion Engine (Backbone)** [COMPLETED]

* **Goal:** A script that takes a .txt file and outputs a manifest.json.  
* **Status:** Done. `ingestor.py` implements the Gemini 3.0 Flash analysis pipeline.
* **Code:** `backend/ingestor.py` handles scene segmentation and prompt engineering.

**Day 3: The "Golden Age" Asset Factory** [IN PROGRESS]

* **Goal:** Generate assets for the 6 curated stories.  
* **Status:** Partially Done. The `LIBRARY_MANIFEST` in `constants.ts` contains the curated metadata. Visuals are currently being lazy-loaded rather than pre-generated to save quota.

**Day 4: The "Applet" Reader Experience** [COMPLETED]

* **Goal:** A working Reader UI.  
* **Status:** Done. `BookReader.tsx` refactored for split-screen immersive view. `NarrativeAudio.tsx` implemented.
* **Feature:** "Ambient Sound" represented by audio mood tags, ready for integration.

**Day 5: The "Upload" Feature (The Wow Factor)** [COMPLETED]

* **Goal:** Allow users to add their own books.  
* **Status:** Done. Frontend supports file upload which connects to the Python backend for real-time ingestion.
* **Refinement:** Lazy Generation endpoints (`/api/generate/image`, `/api/generate/audio`) implemented to prevent timeouts.

**Day 6: Polish & "Deep Dives"** [PENDING]

* **Goal:** Leverage the Subscription features.  
* **Task:** Use **NotebookLM** (Subscription) to generate "Audio Overviews". *Pending manual generation.*
* **UI Polish:** Reader UI has "Neural Ingestion" effects.

**Day 7: The Video Demo (Crucial)** [PENDING]

* **Goal:** A 3-minute video that tells a story.  
* **Script:**  
  1. **The Hook:** "Public domain stories are treasures, but they are frozen in text. Let's melt them."  
  2. **The Demo:** Open *A Martian Odyssey*. Play the narration. Show the alien visuals.  
  3. **The "Vibe Code" Reveal:** Show a split-screen of you typing a prompt into VS Code and the app appearing. "I didn't write the CSS. Gemini did."  
  4. **The "Ingestion" Wow:** "But what about *your* stories?" Upload a random Gutenberg text file. Watch the app "build" the book in real-time.  
  5. **Closing:** "Project Aether. Built with Gemini 3."

---

### **6\. User Experience (UX) & Interface Design**

To make the "Library of Applets" feel cohesive, the UX must bridge the gap between a utility (ebook reader) and a game (immersive sim).

#### **6.1 The Interface Philosophy: "Retro-Future Archive"**

The UI should feel like a databank from the future of the 1950s.

* **Visual Language:** Dark mode by default. Neon amber and cyan accents (terminal colors).  
* **Typography:** Headers in Orbitron or Share Tech Mono; Body text in Merriweather or Lora for readability.  
* **Navigation:** "Bookshelf" view (Grid of Covers) \-\> "Book Detail" (Metadata \+ NotebookLM Podcast) \-\> "Reader Applet" (Immersive View).

#### **6.2 Accessibility & Inclusivity**

Since we are generating TTS, the app is inherently accessible to the visually impaired.

* **Feature:** The "Reader Applet" will support **High Contrast Mode** and **Dyslexic-Friendly Fonts** (OpenDyslexic).  
* **Control:** Users can toggle the "Ambient Sound" off if it interferes with the narration focus.

#### **6.3 The "Applet" Experience**

Each story launches in a "Modal" (overlay) that takes over the screen, minimizing distractions.

* **Left Pane:** Scrollable Text. The active paragraph is highlighted (Karaoke style) as the TTS plays.  
* **Right Pane:** The "Visual Stage." This displays the generated illustration. It applies a slow "Ken Burns" zoom effect to make the static image feel alive.  
* **Background:** The ambient sound loop plays continuously, cross-fading when the scene changes.

---

### **7\. Conclusion**

Project Aether is not just a hackathon entry; it is a demonstration of the future of digital preservation. By combining the **literary depth** of the 1934–1963 public domain corpus with the **multimodal power** of Gemini 3, we create an experience that is both respectful of the source material and radically new.

The strategic use of your **Google One AI Premium** subscription to handle the "Vibe Coding" and asset pre-production allows us to deliver a production-grade application without exhausting the strict API quotas of the Free Tier. This resource arbitrage, combined with the "Ingestion Engine" feature, ensures that the project meets every requirement of the user prompt and the hackathon judging criteria.

The library is open. It is time to fill the shelves.

1. 