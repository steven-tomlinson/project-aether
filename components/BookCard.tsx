import React from 'react';
import { BookManifest } from '../types';
import { Disc, BookOpen, Clock } from 'lucide-react';

interface BookCardProps {
  book: BookManifest;
  onClick: (book: BookManifest) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  return (
    <div 
      onClick={() => onClick(book)}
      className="group relative flex flex-col w-full bg-aether-dark border border-aether-zinc cursor-pointer overflow-hidden transition-all duration-300 hover:border-aether-amber hover:shadow-[0_0_15px_rgba(255,176,0,0.3)]"
    >
      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-2 py-1 bg-aether-black border-b border-aether-zinc text-[10px] font-mono text-aether-amber uppercase tracking-widest opacity-70 group-hover:opacity-100">
        <span>ID: {book.id.substring(0, 6).toUpperCase()}</span>
        <span>ARCHIVE.PD.{book.publicationYear}</span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full h-full object-cover opacity-60 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105"
        />
        
        {/* Overlay Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
        
        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
           <div className="border border-aether-amber text-aether-amber px-6 py-2 font-mono text-sm tracking-widest hover:bg-aether-amber hover:text-black transition-colors">
             INIT_SEQUENCE
           </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex flex-col gap-2 flex-grow bg-aether-dark">
        <h3 className="text-xl font-display font-bold text-gray-200 group-hover:text-aether-amber transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm font-mono text-gray-400 border-l-2 border-aether-zinc pl-2 group-hover:border-aether-amber transition-colors">
          {book.author}
        </p>
        
        <p className="text-xs text-gray-500 line-clamp-3 mt-2 leading-relaxed font-serif">
          {book.description}
        </p>

        {/* Tags */}
        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {book.tags.map(tag => (
            <span key={tag} className="text-[10px] uppercase font-mono px-2 py-1 border border-zinc-700 text-zinc-400 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-mono">
            <div className="flex items-center gap-1">
               <BookOpen size={12} />
               <span>TXT</span>
            </div>
            <div className="flex items-center gap-1 group-hover:text-aether-amber transition-colors">
               <Disc size={12} className="animate-[spin_4s_linear_infinite]" />
               <span>AUDIO_RDY</span>
            </div>
        </div>
      </div>
      
      {/* Corner Decor */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-aether-amber opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-aether-amber opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default BookCard;
