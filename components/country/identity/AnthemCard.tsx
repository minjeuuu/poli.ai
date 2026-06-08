
import React from 'react';
import { Music } from 'lucide-react';

export const AnthemCard: React.FC<{ name?: string, lyrics?: string }> = ({ name, lyrics }) => {
    if (!lyrics) return null;
    
    return (
        <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-academic-text dark:text-stone-200">{name || "National Anthem"}</span>
                <Music className="w-4 h-4 text-academic-gold" />
            </div>
            <p className="text-xs font-serif italic text-stone-600 dark:text-stone-400 leading-relaxed text-justify whitespace-pre-line border-l-2 border-stone-200 dark:border-stone-700 pl-4">
                {lyrics.length > 300 ? `${lyrics.substring(0, 300)}...` : lyrics}
            </p>
        </div>
    );
};
