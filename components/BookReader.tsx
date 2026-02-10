import React, { useState, useEffect, useRef } from 'react';
import { BookManifest, ReaderContent, User, Scene } from '../types';
import { X, Zap, Cpu, ScanLine, AlertTriangle, ChevronRight, Music, Image as ImageIcon, Loader2 } from 'lucide-react';
import { geminiService } from '../services/GeminiService';
import VideoPreview from './VideoPreview';
import NarrativeAudio from './NarrativeAudio';

interface BookReaderProps {
  book: BookManifest;
  user: User | null;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ book, user, onClose }) => {
  const [status, setStatus] = useState<'init' | 'generating' | 'ready' | 'error'>('init');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const addLog = (msg: string) => {
    console.log(`[READER_LOG] ${msg}`);
    setLogs(prev => [...prev, `> ${msg}`].slice(-6));
  };
  const initRef = useRef(false);

  useEffect(() => {
    const initializeReader = async () => {
      // Prevent double init
      if (initRef.current) return;
      initRef.current = true;

      // If we have cached scenes, use them
      if (book.scenes && book.scenes.length > 0) {
        setScenes(book.scenes);
        setStatus('ready');
        return;
      }

      // Initial Generation for first batch
      setStatus('generating');
      addLog("SYNCING_WITH_AETHER_GRID...");

      // try { // Removed outer try to allow resilient fallback flow

      // Vite uses import.meta.env for env vars usually, but we configured define in vite.config.ts
      // to map process.env.GEMINI_API_KEY.
      const apiKey = (process.env as any).VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || (window as any).GEMINI_API_KEY;
      if (!apiKey) {
        console.error("API Key not found. Checked VITE_GEMINI_API_KEY, GEMINI_API_KEY and window.GEMINI_API_KEY");
        addLog("SYSTEM_ERROR: API_KEY_MISSING");
        addLog("FAILOVER_TO_MOCK_PROTOCOL");
        setScenes([
          { id: 0, heading: "The Awakening", text: "The stasis pod hissed...", imagePrompt: "Pod opening", audioMood: "Tens" },
          { id: 1, heading: "First Light", text: "He stepped onto the chrome...", imagePrompt: "Chrome world", audioMood: "Awe" }
        ]);
        setStatus('ready');
        return;
      }
      // Use GeminiService for resilient content generation
      try {
        addLog("ATTEMPTING_NEURAL_LINK...");
        const newScenes = await geminiService.generateBookContent(book, 0, 3);

        if (!newScenes || newScenes.length === 0) {
          throw new Error("No content generated");
        }

        setScenes(newScenes);
        setStatus('ready');
        addLog(`NARRATIVE_BUFFERED_${newScenes.length}_SECTIONS`);
      } catch (e: any) {
        console.error("Content generation failed:", e);
        addLog("SYSTEM_ERROR: LINK_FAILED");
        // Initialize with mock fallback if service fails entirely
        setScenes([
          { id: 0, heading: "The Awakening", text: "The stasis pod hissed...", imagePrompt: "Pod opening", audioMood: "Tens" },
          { id: 1, heading: "First Light", text: "He stepped onto the chrome...", imagePrompt: "Chrome world", audioMood: "Awe" }
        ]);
        setStatus('ready');
      }
    };

    initializeReader();
  }, [book]);

  // Intersection Observer for Active Scene Tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-scene-id'));
            setActiveSceneId(id);
          }
        });
      },
      { threshold: 0.5, root: containerRef.current }
    );

    sceneRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [scenes]);

  // Lazy Media Generation for Active Scene
  useEffect(() => {
    const generateMedia = async () => {
      if (status !== 'ready' || !scenes.length) return;
      const currentScene = scenes.find(s => s.id === activeSceneId);
      if (!currentScene) return;

      // Generate Image if missing
      if (!currentScene.generatedImageUrl) {
        addLog(`GENERATING_VISUALS_FOR_SCENE_${activeSceneId}...`);
        try {
          const resp = await fetch('/api/generate/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              book_id: book.id,
              scene_id: activeSceneId,
              prompt: currentScene.imagePrompt
            })
          });
          const data = await resp.json();
          setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, generatedImageUrl: data.url } : s));
        } catch (e) { addLog("VISUAL_LINK_TIMEOUT..."); }
      }

      // Generate Audio if missing
      if (!currentScene.generatedAudioUrl) {
        addLog(`SYNTHESIZING_AUDIO_FOR_SCENE_${activeSceneId}...`);
        try {
          const resp = await fetch('/api/generate/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              book_id: book.id,
              scene_id: activeSceneId,
              prompt: currentScene.text,
              voice: book.audioProfile.narratorVoice
            })
          });
          const data = await resp.json();
          setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, generatedAudioUrl: data.url } : s));
        } catch (e) { addLog("AUDIO_LINK_TIMEOUT..."); }
      }
    };

    generateMedia();
  }, [activeSceneId, status, book.id]);

  // Lazy Loading Trigger (Refactored to use Service)
  const handleLoadMore = async () => {
    if (status === 'generating') return;
    addLog("REQUESTING_NEXT_DATA_PARCEL...");

    try {
      const lastId = scenes.length > 0 ? scenes[scenes.length - 1].id + 1 : 0;
      const newScenes = await geminiService.generateBookContent(book, lastId, 3);

      if (newScenes && newScenes.length > 0) {
        setScenes(prev => [...prev, ...newScenes]);
        addLog(`SEQUENCE_EXTENDED_${newScenes.length}_UNITS`);
      } else {
        addLog("END_OF_ARCHIVE_REACHED");
      }
    } catch (e) {
      addLog("LINK_TIMEOUT_RETRYING...");
    }
  };

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];

  if (status === 'generating' || status === 'init') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-aether-amber">
        <div className="w-full max-w-md p-8 border border-white/10 bg-zinc-900">
          <h2 className="text-sm mb-4 animate-pulse uppercase tracking-[0.2em] flex items-center gap-2">
            <Loader2 className="animate-spin" size={14} /> Neural_Ingestion_Active
          </h2>
          <div className="space-y-1 text-[10px] text-zinc-500">
            {logs.map((l, i) => <div key={i}>{l}</div>)}
            <div>_</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-gray-300 overflow-hidden flex flex-col font-sans">
      {/* HUD Header */}
      <div className="h-14 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1 hover:text-aether-amber transition-colors">
            <X size={20} />
          </button>
          <div className="text-xs font-mono uppercase tracking-widest hidden sm:block">
            <span className="text-zinc-500">Archive_Ref:</span>
            <span className="text-aether-amber ml-2">{book.id.toUpperCase()}</span>
          </div>
        </div>
        <div className="text-sm font-display font-bold text-white tracking-widest uppercase truncate max-w-[200px] sm:max-w-none">
          {book.title}
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="hidden md:flex items-center gap-1 text-green-500/70">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            SYNC_READY
          </div>
          <div className="text-zinc-500 uppercase">{activeSceneId + 1} / {scenes.length}</div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content Scroll */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
        >
          <div className="max-w-2xl mx-auto px-6 py-24 space-y-32">
            {/* Title Page */}
            <div className="text-center space-y-8 mb-40">
              <div className="text-[10px] font-mono text-aether-amber tracking-[0.5em] uppercase border-y border-aether-amber/20 py-2 inline-block">
                Public Domain Access Granted
              </div>
              <h1 className="text-5xl sm:text-7xl font-display font-bold text-white tracking-tighter leading-tight italic">
                {book.title}
              </h1>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">By {book.author}</p>
            </div>

            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                ref={el => sceneRefs.current[idx] = el}
                data-scene-id={scene.id}
                className={`transition-opacity duration-1000 ${activeSceneId === scene.id ? 'opacity-100' : 'opacity-20'}`}
              >
                <div className="space-y-12">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-zinc-800"></div>
                    <div className="font-mono text-[10px] text-aether-amber opacity-50 uppercase tracking-[0.3em]">
                      Section_0{scene.id + 1}
                    </div>
                    <div className="h-px flex-1 bg-zinc-800"></div>
                  </div>

                  <h2 className="text-3xl font-display text-white tracking-wide">
                    {scene.heading || `Part ${scene.id + 1}`}
                  </h2>

                  <p className="text-xl leading-relaxed font-serif text-zinc-300 first-letter:text-5xl first-letter:font-display first-letter:mr-3 first-letter:float-left first-letter:text-white whitespace-pre-wrap">
                    {scene.text}
                  </p>

                  {/* Mobile visual fallback */}
                  <div className="md:hidden space-y-4">
                    <div className="aspect-video bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                      <img
                        src={scene.generatedImageUrl || book.coverImage}
                        className="w-full h-full object-cover opacity-60"
                        alt="AI Illustration"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                    <NarrativeAudio audioUrl={scene.generatedAudioUrl} />
                  </div>
                </div>
              </div>
            ))}

            <div className="h-40 flex items-center justify-center">
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-700 animate-pulse">
                <ScanLine size={12} /> END_OF_LOADED_SEQUENCES
              </div>
            </div>
          </div>
        </div>

        {/* Right: Immersive Media Rail (Desktop) */}
        <div className="hidden md:flex w-[350px] lg:w-[450px] border-l border-white/5 bg-zinc-900/50 flex-col overflow-y-auto">
          <div className="sticky top-0 p-6 space-y-8">

            {/* Active Visual */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <ImageIcon size={12} /> Visualization
                </div>
                <span className="text-aether-amber">{activeScene?.generatedImageUrl ? 'LINK_ACTIVE' : 'SIMULATED'}</span>
              </div>

              <div className="relative aspect-[3/4] bg-black border border-white/10 overflow-hidden group">
                <img
                  src={activeScene?.generatedImageUrl || book.coverImage}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  alt="Active Scene Visualization"
                />
                {/* CRT Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>

                {/* Visual Cue Tag */}
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-md border border-white/5 text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-aether-amber mr-1">&gt;</span> PROMPT: {activeScene?.imagePrompt}
                </div>
              </div>
            </div>

            {/* Audio Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Music size={12} /> Aural_Atmosphere
                </div>
              </div>
              <NarrativeAudio audioUrl={activeScene?.generatedAudioUrl} />
            </div>

            {/* System Stats Decor */}
            <div className="p-4 border border-zinc-800/50 rounded-sm bg-black/20 font-mono text-[9px] text-zinc-600 space-y-2">
              <div className="flex justify-between">
                <span>NEURAL_FIDELITY</span>
                <span className="text-zinc-500">98.4%</span>
              </div>
              <div className="w-full h-0.5 bg-zinc-900">
                <div className="h-full bg-aether-amber/30 w-[98%]"></div>
              </div>
              <div className="flex justify-between">
                <span>MOOD_CONGRUENCE</span>
                <span className="text-aether-amber">{activeScene?.audioMood?.toUpperCase() || 'NEUTRAL'}</span>
              </div>
            </div>

            {/* Video Preview Integration */}
            <div className="pt-8 border-t border-zinc-800">
              <VideoPreview
                book={book}
                existingVideoUrl={book.readerContent?.videoUrl}
                onVideoGenerated={(url) => {
                  if (book.readerContent) book.readerContent.videoUrl = url;
                }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Retro Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFB000; }
        @keyframes flicker {
          0% { opacity: 0.8; }
          5% { opacity: 0.9; }
          10% { opacity: 0.8; }
          15% { opacity: 1; }
          25% { opacity: 0.8; }
          30% { opacity: 1; }
          100% { opacity: 0.9; }
        }
        .animate-flicker { animation: flicker 0.1s infinite; }
      `}} />
    </div>
  );
};

export default BookReader;