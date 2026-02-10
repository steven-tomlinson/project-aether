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
   * Generates additional book sections using the backend proxy.
   * This avoids exposing API keys in the client and uses server-side Gemini 3.
   */
  async generateBookContent(book: BookManifest, startId: number, count: number = 3): Promise<Scene[]> {
    try {
      console.log(`[GeminiService] Requesting scenes from backend for: ${book.id}...`);

      const resp = await fetch('/api/generate/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.id,
          scene_id: startId - 1, // backend adds 1
          prompt: `The book is "${book.title}" by ${book.author}. Description: ${book.description}.`
        })
      });

      if (!resp.ok) throw new Error("Backend scene generation failed");

      const data = await resp.json();
      console.log(`[GeminiService] Successfully received ${data.scenes?.length} scenes from backend`);
      return data.scenes || [];

    } catch (e: any) {
      console.warn(`[GeminiService] Backend generation failed, falling back to mocks:`, e.message);
      return this.getMockScenes(startId, count);
    }
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
      const resp = await fetch('/api/generate/image', {
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
