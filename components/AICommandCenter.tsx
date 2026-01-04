
import React, { useState, useEffect, useRef } from 'react';
import { executeCommand } from '../services/geminiService';
import { CommandResponse } from '../types';

interface AICommandCenterProps {
  onNavigate: (view: string) => void;
}

const AICommandCenter: React.FC<AICommandCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<CommandResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResponse(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    setResponse(null);
    
    const result = await executeCommand(query);
    setResponse(result);
    setIsProcessing(false);

    if (result.viewToOpen) {
      setTimeout(() => {
        onNavigate(result.viewToOpen!);
        setIsOpen(false);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
        <form onSubmit={handleSubmit} className="p-6 border-b border-gray-50 flex items-center gap-4">
          <span className="text-2xl grayscale group-hover:grayscale-0">✨</span>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Command Lumina... (e.g. 'Show last week sales' or 'Find orders in NY')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg font-bold outline-none text-gray-900 placeholder:text-gray-300"
          />
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-black text-gray-300 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">ESC</span>
          </div>
        </form>

        <div className="flex-1 p-6 space-y-4">
          {isProcessing && (
            <div className="flex items-center gap-3 text-indigo-600">
              <span className="w-5 h-5 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></span>
              <span className="text-sm font-black uppercase tracking-widest">Parsing Intent...</span>
            </div>
          )}

          {response && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                <p className="text-gray-900 font-bold leading-relaxed">{response.message}</p>
                {response.suggestions && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {response.suggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setQuery(s)}
                        className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isProcessing && !response && (
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Commands</h5>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {[
                   "Navigate to analytics",
                   "Inventory health check",
                   "Search orders from Chicago",
                   "Revenue for this month",
                   "Help me write a privacy page"
                 ].map(s => (
                   <button 
                     key={s} 
                     onClick={() => setQuery(s)}
                     className="text-left p-3 rounded-2xl hover:bg-gray-50 text-sm font-bold text-gray-600 transition-colors border border-transparent hover:border-gray-100"
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center px-8">
           <p className="text-[10px] text-gray-400 font-bold">Lumina Intelligence v2.5 • Gemini Driven</p>
           <div className="flex items-center gap-1 text-[10px] text-gray-300">
             <span>⌘</span>
             <span>+</span>
             <span>K</span>
             <span className="ml-1">to toggle</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AICommandCenter;
