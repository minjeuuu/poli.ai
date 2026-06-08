
import React from 'react';
import { ExternalLink, Copy, AlertTriangle } from 'lucide-react';

interface FallbackAIProps {
  prompt?: string;
  context?: string;
}

export const FallbackAI: React.FC<FallbackAIProps> = ({ prompt = "Analyze this political topic.", context = "" }) => {
  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

  const handleCopyAndOpen = (url: string) => {
    navigator.clipboard.writeText(fullPrompt);
    window.open(url, '_blank');
  };

  return (
    <div className="p-8 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-center max-w-lg mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-stone-800 dark:text-stone-200 font-serif font-bold text-lg mb-2">Connection Interrupted</h3>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 leading-relaxed text-justify font-serif">
        The internal research engine is currently at capacity or unreachable. You can continue your research by consulting external archives.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button 
          onClick={() => handleCopyAndOpen('https://chat.openai.com/')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-academic-accent dark:hover:border-indigo-500 hover:text-academic-accent dark:hover:text-indigo-400 transition-all shadow-sm"
        >
          <Copy className="w-4 h-4" /> Copy to ChatGPT
        </button>
        <button 
          onClick={() => handleCopyAndOpen('https://gemini.google.com/')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-academic-accent dark:hover:border-indigo-500 hover:text-academic-accent dark:hover:text-indigo-400 transition-all shadow-sm"
        >
          <ExternalLink className="w-4 h-4" /> Copy to Gemini
        </button>
      </div>
    </div>
  );
};
