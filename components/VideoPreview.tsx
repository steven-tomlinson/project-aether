import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BookManifest } from '../types';
import { Film, Play, Loader2, AlertTriangle, Clapperboard, Key } from 'lucide-react';

interface VideoPreviewProps {
  book: BookManifest;
  onVideoGenerated: (url: string) => void;
  existingVideoUrl?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ book, onVideoGenerated, existingVideoUrl }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(existingVideoUrl || null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 3));

  const handleGenerate = async () => {
    try {
      setStatus('generating');
      addLog("CHECKING_CREDENTIALS...");

      // 1. API Key Selection (Mandatory for Veo)
      // Accessing via (window as any) to avoid TypeScript interface merge conflicts with global types
      const win = window as any;
      if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          addLog("WAITING_FOR_AUTH...");
          await win.aistudio.openSelectKey();
        }
      }

      // 2. Generate Prompt using Flash
      addLog("SYNTHESIZING_SCENE_DATA...");
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const summaryPrompt = `Create a highly detailed visual prompt for a 5-second cinematic video trailer for the book "${book.title}". 
      Description: ${book.description}. 
      Style keywords: ${book.tags.join(', ')}, ${book.theme.backgroundStyle}.
      Output strictly the prompt text only. No explanations.`;

      const promptResp = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }]
      });
      const veoPrompt = promptResp.candidates?.[0]?.content?.parts?.[0]?.text || `Cinematic trailer for ${book.title}, sci-fi, retro-future`;
      addLog("VEO_PROMPT_LOCKED.");

      // 3. Generate Video using Veo
      addLog("INITIATING_HOLOGRAPHIC_RENDER...");
      let operation;
      try {
        operation = await genAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: veoPrompt,
            config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
            }
        });
      } catch (genError: any) {
          // Handle 403/Permission errors by triggering key selection again
          if (genError.toString().includes('403') || genError.message?.includes('PERMISSION_DENIED')) {
              addLog("AUTH_FAILURE: PERMISSION_DENIED");
              if (win.aistudio) {
                  addLog("OPENING_KEY_SELECTOR...");
                  await win.aistudio.openSelectKey();
                  addLog("KEY_UPDATED. RETRY_GENERATION.");
                  setStatus('idle'); // Reset to allow retry
                  return;
              }
          }
          throw genError;
      }

      // 4. Polling Loop
      addLog("RENDERING_FRAMES...");
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        addLog("PROCESSING_CHUNKS...");
        operation = await genAI.operations.getVideosOperation({ operation: operation });
      }

      // 5. Fetch Result
      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) throw new Error("Video URI not found in response");

      // The URI requires the API key appended
      const authenticatedUrl = `${uri}&key=${process.env.API_KEY}`;
      
      setVideoUrl(authenticatedUrl);
      onVideoGenerated(authenticatedUrl);
      setStatus('ready');
      addLog("STREAM_ACTIVE.");

    } catch (e: any) {
      console.error(e);
      let errorMsg = e instanceof Error ? e.message : "Unknown";
      if (errorMsg.includes("403")) errorMsg = "Permission Denied: Paid Key Required";
      addLog(`ERROR: ${errorMsg}`);
      setStatus('error');
    }
  };

  if (videoUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-24 border-2 border-aether-zinc bg-black relative group">
         <div className="absolute top-0 left-0 bg-aether-amber text-black px-2 py-1 text-[10px] font-mono font-bold z-10">
            HOLOGRAPHIC_PREVIEW // VEO-3.1
         </div>
         <video 
           src={videoUrl} 
           controls 
           autoPlay 
           loop 
           className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
         />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-24 flex flex-col items-center justify-center border border-dashed border-aether-zinc p-12 bg-aether-dark/50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
         <Film size={200} />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <h3 className="text-xl font-display text-zinc-400">VISUAL_COPROCESSOR_LINK</h3>
        
        {status === 'idle' || status === 'error' ? (
          <div className="flex flex-col items-center gap-4">
             <p className="font-mono text-xs text-zinc-500 max-w-md">
               Generate a neural video preview based on the ingested narrative summary using the VEO-3.1 model.
               <br/>
               <span className="text-aether-amber">Note: Requires Paid API Key (GCP Project).</span>
             </p>
             <button 
               onClick={handleGenerate}
               className="flex items-center gap-3 px-6 py-3 bg-aether-zinc/50 hover:bg-aether-amber hover:text-black border border-aether-amber text-aether-amber transition-all font-mono tracking-widest uppercase text-sm group"
             >
               <Clapperboard size={18} className="group-hover:animate-pulse" />
               Generate_Teaser
             </button>
             {status === 'error' && (
               <div className="flex flex-col items-center gap-2">
                 <div className="text-red-500 font-mono text-xs flex items-center gap-2">
                   <AlertTriangle size={12} />
                   <span>GENERATION_FAILED</span>
                 </div>
                 <button 
                    onClick={() => {
                        const win = window as any;
                        if (win.aistudio) win.aistudio.openSelectKey();
                    }}
                    className="flex items-center gap-2 text-[10px] text-zinc-400 hover:text-white underline mt-1"
                 >
                    <Key size={10} /> Change API Key
                 </button>
               </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <Loader2 size={32} className="text-aether-amber animate-spin" />
             <div className="font-mono text-xs text-aether-amber animate-pulse">
               {logs[0] || "INITIALIZING..."}
             </div>
             <div className="h-1 w-32 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-aether-amber animate-[width_2s_ease-in-out_infinite] w-full origin-left"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;