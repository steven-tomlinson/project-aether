import React, { useState, useEffect, useRef } from 'react';
import { BookManifest, ReaderContent, User } from '../types';
import { X, Zap, Cpu, ScanLine, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import VideoPreview from './VideoPreview';

interface BookReaderProps {
  book: BookManifest;
  user: User | null;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ book, user, onClose }) => {
  const [status, setStatus] = useState<'init' | 'generating' | 'ready' | 'error'>('init');
  const [content, setContent] = useState<ReaderContent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  // Mock data for fallback
  const MOCK_CONTENT: ReaderContent = {
    scenes: [
      { heading: "The Awakening", text: "The stasis pod hissed, a serpent of steam escaping into the cold air of the cryo-bay. Use your API Key to generate real stories. For now, imagine the protagonist stepping out into a world of chrome and rust." },
      { heading: "The Discovery", text: "Beneath the ruins, the machine hummed with a rhythm that matched his own heartbeat. It was not dead; it was waiting. The blueprints had been right all along." },
      { heading: "The Confrontation", text: "They stood on the edge of the precipice, the neon city burning below. 'We aren't who we thought we were,' she whispered, the truth hanging heavy in the smog." }
    ],
    masterImageUrl: book.coverImage // Fallback to cover
  };

  useEffect(() => {
    const generateContent = async () => {
      // 1. Check Memory Cache
      if (book.readerContent) {
        setContent(book.readerContent);
        setStatus('ready');
        return;
      }

      // 2. Check Pre-Existing Manifest Data (Existing Illustrations/Text)
      if (book.scenes && book.scenes.length > 0) {
         addLog(`LOADING ARCHIVED DATA MODULES...`);
         const manifestContent: ReaderContent = {
            scenes: book.scenes.map(s => ({
                heading: `SECTION ${s.id}`,
                text: s.text,
                imageUrl: s.generatedImageUrl, // Use existing illustration if present
                visual_cue: s.imagePrompt
            })),
            masterImageUrl: book.coverImage // Fallback if individual images miss
         };
         
         book.readerContent = manifestContent;
         setContent(manifestContent);
         setStatus('ready');
         return;
      }

      // 3. Ingestion Engine (GenAI)
      setStatus('generating');
      addLog(`INITIALIZING NEURAL LINK...`);
      addLog(`TARGET: ${book.title.toUpperCase()}`);
      
      if (user) {
        addLog(`USER_AUTH_DETECTED: ${user.name.toUpperCase()}`);
      }

      try {
        if (!process.env.API_KEY) {
          throw new Error("No API Key");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // A. Generate Text (FULL TEXT / UNABRIDGED)
        addLog(`EXTRACTING FULL TEXT ARCHIVE...`);
        const textModel = "gemini-2.5-flash";
        
        // Personalization Injection
        const userContext = user 
          ? `The user accessing this file is named "${user.name}". Acknowledge them briefly as 'Archivist ${user.name}' in the data retrieval logs or output if relevant, maintaining a sci-fi computer terminal persona.`
          : `Treat the user as an anonymous guest.`;

        // Prompt updated to request full text of the first chapter instead of abridged scenes
        const prompt = `You are a digital archivist system for Project Aether. ${userContext}
        
        Retrieve the full, unabridged text of the first chapter (or the first significant section ~2000 words) of the public domain book "${book.title}" by ${book.author}. 
        Split this text into 3 consecutive, logical reading parts. 
        Do not summarize. Do not abridge. Preserve original formatting.
        Return JSON: [{ "heading": string, "text": string, "visual_cue": string }]
        "visual_cue" should be a description of a key visual moment in that part.`;
        
        const textResp = await ai.models.generateContent({
          model: textModel,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  text: { type: Type.STRING },
                  visual_cue: { type: Type.STRING }
                }
              }
            }
          }
        });

        const scenesData = JSON.parse(textResp.text || "[]");
        if (scenesData.length === 0) throw new Error("Failed to parse narrative data");
        addLog(`TEXT EXTRACTION COMPLETE. ${scenesData.reduce((acc: number, s: any) => acc + s.text.length, 0)} BYTES.`);

        // B. Generate Images (Only if we don't have them)
        // Since we are in the "Generation" block, we assume no existing illustrations exist in the manifest.
        addLog(`RENDERING VISUAL TRIPTYCH...`);
        const imageModel = "gemini-2.5-flash-image";
        
        const panel1 = scenesData[0]?.visual_cue || "Sci-fi scene";
        const panel2 = scenesData[1]?.visual_cue || "Abstract technology";
        const panel3 = scenesData[2]?.visual_cue || "Futuristic landscape";
        
        const imagePrompt = `A wide 16:9 cinematic triptych split into three distinct vertical panels. 
        Left panel: ${panel1}. 
        Center panel: ${panel2}. 
        Right panel: ${panel3}.
        Style: ${book.tags.join(', ')}, ${book.theme.backgroundStyle} aesthetic, detailed, masterpiece.`;

        const imageResp = await ai.models.generateContent({
          model: imageModel,
          contents: imagePrompt,
          config: {
            imageConfig: {
                aspectRatio: "16:9"
            }
          }
        });

        let imageUrl = MOCK_CONTENT.masterImageUrl;
        for (const part of imageResp.candidates?.[0]?.content?.parts || []) {
           if (part.inlineData) {
             imageUrl = `data:image/png;base64,${part.inlineData.data}`;
             break;
           }
        }
        
        addLog(`VISUALIZATION BUFFERED.`);

        const newContent = {
          scenes: scenesData,
          masterImageUrl: imageUrl
        };

        book.readerContent = newContent;
        setContent(newContent);
        setStatus('ready');

      } catch (e) {
        console.error(e);
        addLog(`ERROR: ${e instanceof Error ? e.message : 'Unknown error'}`);
        addLog(`FAILOVER TO OFFLINE CACHE...`);
        setTimeout(() => {
          setContent(MOCK_CONTENT);
          setStatus('ready');
        }, 1500);
      }
    };

    generateContent();
  }, [book, user]); // Re-run if user changes, though usually user is stable during read

  const handleVideoGenerated = (url: string) => {
    if (content) {
      // Update local state
      setContent({ ...content, videoUrl: url });
      // Update cache
      if (book.readerContent) {
        book.readerContent.videoUrl = url;
      }
    }
  };

  // Loading View
  if (status === 'generating' || status === 'init') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-aether-amber">
        <div className="w-full max-w-md p-8 border border-aether-zinc bg-aether-dark relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-aether-amber animate-pulse"></div>
            <h2 className="text-xl mb-4 flex items-center gap-2 animate-pulse">
                <Cpu className="animate-spin" /> PROCESSING_REQUEST
            </h2>
            <div className="space-y-2 text-xs opacity-80 min-h-[150px]">
                {logs.map((log, i) => (
                    <div key={i} className="animate-flicker">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
            </div>
        </div>
      </div>
    );
  }

  // Reader View
  return (
    <div className="fixed inset-0 z-50 bg-black text-gray-300 overflow-hidden flex flex-col">
      {/* HUD Header */}
      <div className="h-16 bg-aether-dark border-b border-aether-zinc flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
            <button 
                onClick={onClose}
                className="p-2 hover:bg-aether-zinc/50 rounded-full transition-colors text-aether-amber border border-transparent hover:border-aether-amber"
            >
                <X size={20} />
            </button>
            <div>
                <h1 className="text-white font-display text-lg tracking-wide">{book.title}</h1>
                <p className="text-xs font-mono text-aether-amber opacity-60 uppercase">{book.author} // {book.publicationYear}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            {user && (
               <div className="hidden md:flex items-center gap-2 mr-4 border-r border-zinc-800 pr-4">
                  <span className="text-zinc-600">ARCHIVIST:</span>
                  <span className="text-aether-amber">{user.name.toUpperCase()}</span>
               </div>
            )}
            <ScanLine size={14} className="text-aether-amber animate-pulse" />
            <span>READING_MODE: IMMERSIVE</span>
        </div>
      </div>

      {/* Main Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-6 py-12">
            
            {/* Title Page */}
            <div className="mb-24 text-center border-b border-zinc-800 pb-12">
                <div className="inline-block px-4 py-1 border border-aether-amber text-aether-amber font-mono text-xs mb-6 tracking-[0.3em]">
                    CLASSIFIED ARCHIVE
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                    {book.title.toUpperCase()}
                </h1>
                <p className="font-serif italic text-zinc-400 max-w-xl mx-auto">
                    {book.description}
                </p>
            </div>

            {/* Video Preview Section */}
            <VideoPreview 
                book={book} 
                existingVideoUrl={content?.videoUrl} 
                onVideoGenerated={handleVideoGenerated}
            />

            {/* Interleaved Content */}
            {content?.scenes.map((scene, index) => (
                <div key={index} className="mb-24 group">
                    {/* Text Section */}
                    <div className="mb-12 relative pl-8 border-l-2 border-zinc-800 hover:border-aether-amber transition-colors duration-500">
                        <span className="absolute -left-[9px] top-0 w-4 h-4 bg-black border-2 border-zinc-800 group-hover:border-aether-amber rounded-full"></span>
                        <h3 className="font-display text-2xl text-white mb-4 flex items-center gap-3">
                            <span className="text-aether-amber text-sm font-mono opacity-50">0{index + 1}</span>
                            {scene.heading}
                        </h3>
                        {/* Use whitespace-pre-wrap to preserve original formatting/paragraphs */}
                        <p className="font-serif text-lg leading-loose text-zinc-300 whitespace-pre-wrap">
                            {scene.text}
                        </p>
                    </div>

                    {/* Image Section: Use specific illustration if available, else triptych crop */}
                    <div className="relative w-full aspect-[21/9] overflow-hidden rounded-sm border border-zinc-800 group-hover:shadow-[0_0_30px_rgba(255,176,0,0.1)] transition-all duration-700">
                        <img 
                            src={scene.imageUrl || content.masterImageUrl}
                            alt={`Visualization for ${scene.heading}`}
                            className="absolute w-full h-full object-cover filter sepia-[.2] contrast-125 group-hover:sepia-0 transition-all duration-700"
                            style={scene.imageUrl ? {
                                // Direct illustration: Show full
                                width: '100%',
                                objectFit: 'contain'
                            } : {
                                // Triptych slice logic
                                width: '300%',
                                maxWidth: 'none',
                                left: index === 0 ? '0%' : index === 1 ? '-100%' : '-200%' 
                            }}
                        />
                        
                        {/* Scanline overlay for the image */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none mix-blend-overlay"></div>
                    </div>
                </div>
            ))}

            {/* Footer */}
            <div className="text-center pt-12 border-t border-zinc-800 font-mono text-zinc-600 text-sm">
                <p>END OF TRANSMISSION</p>
                <div className="mt-4 flex justify-center gap-2">
                    <span className="w-2 h-2 bg-aether-amber rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-aether-amber rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-aether-amber rounded-full animate-pulse delay-150"></span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BookReader;