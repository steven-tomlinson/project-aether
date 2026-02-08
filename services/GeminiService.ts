import { GoogleGenAI, Type } from "@google/genai";
import { BookManifest, Scene } from "../types";

// Define the response schema explicitly for Gemini
const SCENE_GENERATION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER },
      heading: { type: Type.STRING },
      text: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      audioMood: { type: Type.STRING }
    }
  }
};

export class GeminiService {
  private genAI: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = (process.env as any).VITE_GEMINI_API_KEY || 
                  (process.env as any).GEMINI_API_KEY || 
                  (window as any).GEMINI_API_KEY;

    if (this.apiKey) {
      this.genAI = new GoogleGenAI({ apiKey: this.apiKey, apiVersion: 'v1beta' });
    } else {
      console.warn("GeminiService initialized without API Key. Fallback mode only.");
    }
  }

  /**
   * Generates additional book sections using a resilient model fallback strategy.
   * Logic: Gemini 3 Pro -> Gemini 3 Flash -> Gemini 2.5 Pro -> Mock Fallback
   */
  async generateBookContent(book: BookManifest, startId: number, count: number = 3): Promise<Scene[]> {
    if (!this.genAI) {
      return this.getMockScenes(startId, count);
    }

    const models = [
      "gemini-3.0-pro",
      "gemini-3.0-flash", 
      "gemini-2.5-pro"
    ];

    const prompt = `Act as an archivist for Project Aether. Retrieve ${count} new sections of the book "${book.title}" by ${book.author}, starting from section ID ${startId}. 
    Return JSON per scene: { id, heading, text, imagePrompt, audioMood }`;

    for (const modelName of models) {
      try {
        console.log(`[GeminiService] Attempting generation with ${modelName}...`);
        
        const result = await this.genAI.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: SCENE_GENERATION_SCHEMA
          }
        });

        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        
        // Robust JSON cleaning
        if (text.includes("```")) {
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }
        
        const data = JSON.parse(text);
        console.log(`[GeminiService] Success with ${modelName}`);
        return data; // Return successfully parsed data

      } catch (e: any) {
        console.warn(`[GeminiService] Model ${modelName} failed:`, e.message);
        // Continue to next model
      }
    }

    console.error("[GeminiService] All models failed. Returning mock data.");
    return this.getMockScenes(startId, count);
  }

  /**
   * Generates a cover image prompt based on the book description.
   * This is a "Reasoning" step before calling the image generation backend.
   */
  async generateCoverPrompt(book: BookManifest): Promise<string> {
    if (!this.genAI) return "A mysterious book cover";

    try {
        const result = await this.genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ 
                role: 'user', 
                parts: [{ text: `Create a vivid, detailed image prompt for the cover of the sci-fi book "${book.title}" by ${book.author}. Description: ${book.description}. Style: ${book.tags.join(', ')}. Return ONLY the prompt.` }] 
            }]
        });
        return result.candidates?.[0]?.content?.parts?.[0]?.text || book.title;
    } catch (e) {
        return `Cover art for ${book.title}`;
    }
  }

  /**
   * Proxies image generation to the backend (Nano Banana Pro).
   */
  async generateImage(prompt: string, bookId: string, sceneId: number = 999): Promise<string | null> {
    try {
        const resp = await fetch('http://localhost:8000/api/generate/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                book_id: bookId,
                scene_id: sceneId,
                prompt: prompt
            })
        });
        
        if (!resp.ok) throw new Error("Backend image generation failed");
        
        const data = await resp.json();
        return data.url;
    } catch (e) {
        console.error("[GeminiService] Image generation failed:", e);
        return null; // Let the caller decide on fallback (e.g. keep old image)
    }
  }

  private getMockScenes(startId: number, count: number): Scene[] {
      return Array.from({ length: count }).map((_, i) => ({
          id: startId + i,
          heading: "Neural Link Offline",
          text: "The connection to the Aether Archives has been interrupted. Displaying cached simulation data...",
          imagePrompt: "Static noise",
          audioMood: "Glitch"
      }));
  }
}

export const geminiService = new GeminiService();
