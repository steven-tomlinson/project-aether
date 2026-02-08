import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface NarrativeAudioProps {
  audioUrl?: string;
  autoPlay?: boolean;
}

const NarrativeAudio: React.FC<NarrativeAudioProps> = ({ audioUrl, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Autoplay blocked", e));
    }
  }, [audioUrl, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  if (!audioUrl) {
    return (
      <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px] uppercase opacity-50">
        <VolumeX size={12} />
        <span>AUDIO_PROCESSING...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm group hover:border-aether-amber transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-aether-amber/10 border border-aether-amber/30 text-aether-amber hover:bg-aether-amber hover:text-black transition-all"
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Narrator Unit</span>
            <span className="text-[10px] font-mono text-aether-amber uppercase tracking-widest leading-none">
              {isPlaying ? 'DATA_STREAM_ACTIVE' : 'AUDIO_READY'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-zinc-500 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-aether-amber transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <audio 
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default NarrativeAudio;
