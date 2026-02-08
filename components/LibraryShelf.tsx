import React, { useState, useRef, useEffect } from 'react';
import { BookManifest, User } from '../types';
import BookCard from './BookCard';
import { Terminal, Cpu, Database, Plus, LogIn, LogOut, HardDrive, User as UserIcon, ShieldAlert, ChevronDown, Upload, FileText } from 'lucide-react';

interface LibraryShelfProps {
  books: BookManifest[];
  onSelectBook: (book: BookManifest) => void;
  onLocalIngest: (file: File) => void;
  onDriveIngest: () => void;
  user: User | null;
  onLogin: () => void;
  onMockLogin: () => void; // New prop for dev bypass
  onLogout: () => void;
  isUploading?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
}

const LibraryShelf: React.FC<LibraryShelfProps> = ({ 
  books, 
  onSelectBook, 
  onLocalIngest, 
  onDriveIngest, 
  user, 
  onLogin, 
  onMockLogin, 
  onLogout, 
  isUploading = false,
  syncStatus = 'idle'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isIngestMenuOpen, setIsIngestMenuOpen] = useState(false);
  const ingestMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ingestMenuRef.current && !ingestMenuRef.current.contains(event.target as Node)) {
        setIsIngestMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          onLocalIngest(file);
      }
      // Reset input
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
      setIsIngestMenuOpen(false);
  };
  
  const handleLocalClick = () => {
     fileInputRef.current?.click();
  };

  const handleDriveClick = () => {
    if (!user) {
      alert("ACCESS DENIED: Google Identity Required for Drive Access.");
      onLogin();
    } else {
      onDriveIngest();
    }
    setIsIngestMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-aether-black text-gray-300 font-sans selection:bg-aether-amber selection:text-black pb-20">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-40 bg-aether-black/90 backdrop-blur-md border-b border-aether-zinc">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-aether-amber flex items-center justify-center bg-aether-dim text-aether-amber">
               <Terminal size={18} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-wider text-white">
                PROJECT <span className="text-aether-amber">AETHER</span>
              </h1>
              <div className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase">
                Public Domain Archive v1.0
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500">
               <span className="flex items-center gap-1"><Cpu size={12} /> SYS: ONLINE</span>
               <span className="flex items-center gap-1"><Database size={12} /> DB: {books.length} VOLS</span>
            </div>
            
            {/* Divider */}
            <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>

            {/* GitHub Link */}
            <a 
              href="https://github.com/steven-tomlinson/project-aether" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              title="View Source on GitHub"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            {/* User / Auth Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-mono text-aether-amber uppercase tracking-widest">{user.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {user.id.startsWith('mock-') ? 'GUEST_ACCESS' : 'GOOGLE_ID_VERIFIED'}
                  </span>
                </div>
                <div className="relative group">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-sm border border-aether-zinc group-hover:border-aether-amber transition-colors"
                    />
                    {/* Dropdown / Logout Trigger */}
                    <button 
                      onClick={onLogout}
                      className="absolute -bottom-2 -right-2 bg-zinc-900 text-zinc-400 p-1 border border-zinc-700 rounded-full hover:text-red-400 hover:border-red-400 transition-colors"
                      title="Disconnect Identity"
                    >
                      <LogOut size={10} />
                    </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Real Auth */}
                <button 
                  onClick={onLogin}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-aether-zinc hover:border-white hover:text-white transition-all text-xs font-mono uppercase tracking-widest group"
                  title="Standard Google Sign-In"
                >
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span>Sign In</span>
                </button>

                {/* Dev Bypass / Mock Auth */}
                <button 
                  onClick={onMockLogin}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-aether-amber hover:border-aether-amber transition-all text-[10px] font-mono uppercase tracking-widest"
                  title="Simulation Mode (Bypass OAuth)"
                >
                  <ShieldAlert size={10} />
                  <span>Guest</span>
                </button>
              </div>
            )}

            {/* Ingest Dropdown */}
            <div className="relative" ref={ingestMenuRef}>
              <button 
                onClick={() => setIsIngestMenuOpen(!isIngestMenuOpen)}
                disabled={isUploading}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 bg-aether-amber/10 border border-aether-amber/50 hover:bg-aether-amber hover:text-black transition-all text-xs font-mono uppercase tracking-widest group text-aether-amber ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus size={14} className={`group-hover:rotate-90 transition-transform ${isUploading ? 'animate-spin' : ''}`} />
                {isUploading ? 'VIBE_CODING...' : 'Ingest'}
                <ChevronDown size={14} className={`transition-transform ${isIngestMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isIngestMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-aether-amber shadow-xl shadow-aether-amber/10 rounded-sm overflow-hidden z-50">
                  <div className="p-2 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Select Data Source
                  </div>
                  
                  <button 
                    onClick={handleLocalClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800 transition-colors text-gray-300 hover:text-white group"
                  >
                    <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center text-aether-amber group-hover:bg-aether-amber group-hover:text-black transition-colors">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold font-display tracking-wide">LOCAL CARTRIDGE</div>
                      <div className="text-[10px] text-zinc-500 font-mono">.TXT / .MD Upload</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleDriveClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800 transition-colors text-gray-300 hover:text-white group border-t border-zinc-800"
                  >
                    <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <HardDrive size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold font-display tracking-wide">GOOGLE DRIVE</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Cloud Import</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Header */}
        <div className="mb-10 flex items-end justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-display text-white mb-1">GOLDEN_AGE_CORPUS</h2>
            <p className="font-mono text-xs text-aether-amber opacity-70">
              // SELECT DATA CARTRIDGE TO BEGIN SIMULATION
            </p>
          </div>
          <div className="hidden sm:block font-mono text-xs text-zinc-600">
             {user ? `USER: ${user.email.split('@')[0].toUpperCase()} // ` : ''} INDEXING: 1934-1963
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onClick={onSelectBook} 
            />
          ))}
        </div>

      </main>

      {/* Decorative Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-aether-black border-t border-aether-zinc flex items-center justify-between px-4 text-[10px] font-mono text-zinc-600 z-40">
        <div className="flex gap-4">
          <span>MEM: 64KB OK</span>
          <span>GEMINI-3: CONNECTED</span>
          {user && <span className={`${syncStatus === 'syncing' ? 'animate-pulse text-blue-400' : 'text-aether-amber'}`}>
            G-DRIVE: {syncStatus.toUpperCase()}
          </span>}
        </div>
        <div className="animate-pulse text-aether-amber opacity-50">
          AWAITING INPUT...
        </div>
      </footer>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".txt,.md" 
      />
    </div>
  );
};

export default LibraryShelf;