import React, { useState } from 'react';
import { LIBRARY_MANIFEST } from '../constants';
import { GoogleDriveService } from '../services/GoogleDriveService';

interface SeedingControlsProps {
  driveService: GoogleDriveService | null;
}

const SeedingControls: React.FC<SeedingControlsProps> = ({ driveService }) => {
  const [seedingStatus, setSeedingStatus] = useState<'idle' | 'seeding' | 'complete' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const handleSeed = async () => {
    if (!driveService) {
      addLog("Error: Drive Service not initialized.");
      return;
    }

    setSeedingStatus('seeding');
    addLog("Starting seeding process...");

    try {
      addLog("Initializing Project Aether Library folder...");
      const folderId = await driveService.initLibrary();
      addLog(`Library folder ready: ${folderId}`);

      addLog(`Seeding ${LIBRARY_MANIFEST.length} books from manifest...`);
      
      // Upload each book individually
      for (const book of LIBRARY_MANIFEST) {
        addLog(`Uploading: ${book.title}...`);
        await driveService.saveBook(book);
        addLog(`Uploaded: ${book.title}`);
      }

      // Upload the catalog index
      addLog("Updating catalog index...");
      await driveService.saveCatalog(LIBRARY_MANIFEST);
      addLog("Catalog index updated.");

      setSeedingStatus('complete');
      addLog("Seeding complete!");
    } catch (e: any) {
      console.error(e);
      setSeedingStatus('error');
      addLog(`Error: ${e.message}`);
      console.error("SEEDING_ERROR_DEBUG:", e);
    }
  };

  if (seedingStatus === 'idle') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={handleSeed}
          disabled={!driveService}
          className="bg-aether-amber text-black font-mono text-xs px-4 py-2 rounded hover:bg-aether-glow disabled:opacity-50"
        >
          SEED LIBRARY TO DRIVE
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-aether-amber p-4 w-80 font-mono text-[10px] text-zinc-300 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-aether-amber font-bold">SEEDING CONTROL</span>
        <button onClick={() => setSeedingStatus('idle')}>X</button>
      </div>
      <div className="h-32 overflow-y-auto bg-black p-2 border border-zinc-800 space-y-1">
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

export default SeedingControls;
