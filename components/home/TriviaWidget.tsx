
import React from 'react';
import { Lightbulb, HelpCircle } from 'lucide-react';

interface TriviaWidgetProps {
    fact: { content: string; source: string; type: string };
    trivia: { content: string; source: string; type: string };
    onNavigate: (type: string, payload: any) => void;
}

export const TriviaWidget: React.FC<TriviaWidgetProps> = ({ fact, trivia, onNavigate }) => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fact?.content && (
                <div className="bg-stone-100 dark:bg-stone-800 p-6 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors group" onClick={() => onNavigate('Concept', fact.content)}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Did You Know?</span>
                        <Lightbulb className="w-4 h-4 text-academic-gold group-hover:animate-pulse" />
                    </div>
                    <p className="font-serif text-sm text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{fact.content}</p>
                    <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-600 flex justify-end">
                        <span className="text-[9px] text-stone-400 font-mono uppercase">{fact.source}</span>
                    </div>
                </div>
            )}
            {trivia?.content && (
                <div className="bg-stone-900 dark:bg-black text-stone-300 p-6 border border-stone-800 dark:border-stone-800 rounded-lg cursor-pointer hover:bg-black transition-colors group" onClick={() => onNavigate('Concept', trivia.content)}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Political Trivia</span>
                        <HelpCircle className="w-4 h-4 text-stone-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-serif text-sm leading-relaxed text-justify">{trivia.content}</p>
                    <div className="mt-4 pt-3 border-t border-stone-800 flex justify-end">
                        <span className="text-[9px] text-stone-600 font-mono uppercase">{trivia.source}</span>
                    </div>
                </div>
            )}
        </section>
    );
};
