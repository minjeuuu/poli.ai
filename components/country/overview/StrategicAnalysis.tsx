
import React from 'react';
import { Brain } from 'lucide-react';

export const StrategicAnalysis: React.FC<{ text: string }> = ({ text }) => (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 mb-12 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-6 flex items-center gap-2">
            <Brain className="w-4 h-4" /> Strategic Synthesis
        </h3>
        <div className="prose prose-stone dark:prose-invert font-serif leading-loose text-justify text-base md:text-lg max-w-none">
            <p>{text}</p>
        </div>
    </div>
);
