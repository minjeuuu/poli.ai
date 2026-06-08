
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AtomicButton } from '../shared/AtomicButton';

interface SimEventModalProps {
    event: {
        title: string;
        description: string;
        choices: { text: string, impact: string, aiPrompt: string }[];
    };
    onChoice: (prompt: string) => void;
}

export const SimEventModal: React.FC<SimEventModalProps> = ({ event, onChoice }) => {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-stone-900 border-2 border-stone-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Decorative Header */}
                <div className="h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse"></div>
                
                <div className="p-8 md:p-12 text-center relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <AlertTriangle className="w-64 h-64 text-white" />
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 relative z-10 text-shadow-lg">{event.title}</h2>
                    <p className="text-lg text-stone-300 font-serif leading-relaxed text-justify mb-10 relative z-10 max-w-xl mx-auto">
                        {event.description}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 relative z-10">
                        {event.choices.map((choice, i) => (
                            <button
                                key={i}
                                onClick={() => onChoice(choice.aiPrompt)}
                                className="group relative p-6 bg-stone-800 hover:bg-stone-700 border border-stone-600 hover:border-academic-gold rounded-xl transition-all text-left flex flex-col gap-1 active:scale-[0.99]"
                            >
                                <span className="text-lg font-bold text-white group-hover:text-academic-gold transition-colors">{choice.text}</span>
                                <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">{choice.impact}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
