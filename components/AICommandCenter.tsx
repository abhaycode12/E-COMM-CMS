
import React, { useState, useEffect, useRef } from 'react';
import { executeCommand } from '../services/geminiService';
import { CommandResponse } from '../types';

interface AICommandCenterProps {
  onNavigate: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AICommandCenter: React.FC<AICommandCenterProps> = ({ onNavigate, isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<CommandResponse | null>(null);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Platform detection for visual hints
    setIsMac(navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Support both Cmd+K (Mac) and Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

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

  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
        <form onSubmit={handleSubmit} className="p-7 border-b border-gray-50 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">✨</div>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-xl font-bold outline-none text-gray-900 placeholder:text-gray-300"
          />
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1.5 rounded-xl border border-gray-200">ESC</span>
          </div>
        </form>

        <div className="flex-1 p-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-indigo-600">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Consulting Lumina Brain...</span>
            </div>
          )}

          {response && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100/50">
                <p className="text-gray-900 font-bold leading-relaxed text-lg">{response.message}</p>
                {response.suggestions && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {response.suggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setQuery(s)}
                        className="text-[11px] font-black text-indigo-600 bg-white px-4 py-2 rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
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
            <div className="space-y-6">
               <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Knowledge Capabilities</h5>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {[
                   { cmd: "Show me sales for last week", icon: "📈" },
                   { cmd: "Search orders from Chicago", icon: "🚚" },
                   { cmd: "Inventory health check", icon: "📦" },
                   { cmd: "Write product description for 'Boots'", icon: "✍️" },
                   { cmd: "Switch to Payment settings", icon: "⚙️" },
                   { cmd: "Generate tax report for Q1", icon: "🧾" }
                 ].map(item => (
                   <button 
                     key={item.cmd} 
                     onClick={() => setQuery(item.cmd)}
                     className="text-left p-4 rounded-3xl hover:bg-indigo-50/50 text-sm font-bold text-gray-700 transition-all border border-gray-50 hover:border-indigo-100 flex items-center gap-3 group"
                   >
                     <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                     {item.cmd}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-5 border-t border-gray-100 flex justify-between items-center px-10">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enterprise Intelligence Hub</p>
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-200">{shortcutKey}</span>
             <span className="text-[10px] font-black text-gray-300">+</span>
             <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-200">K</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AICommandCenter;
