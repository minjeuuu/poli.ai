
import React from 'react';
import { User, MessageSquare, X } from 'lucide-react';
import { AtomicButton } from '../shared/AtomicButton';

interface SimAdvisorModalProps {
    onClose: () => void;
    advisorName: string;
    advice: string;
}

export const SimAdvisorModal: React.FC<SimAdvisorModalProps> = ({ onClose, advisorName, advice }) => {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center mb-4">
                        <User className="w-10 h-10 text-stone-400" />
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold text-white mb-1">{advisorName}</h3>
                    <span className="text-xs font-mono text-academic-gold uppercase tracking-widest mb-6">Strategic Advisor</span>
                    
                    <div className="bg-stone-800/50 p-6 rounded-xl border-l-4 border-academic-gold text-left w-full">
                         <div className="flex items-start gap-3">
                             <MessageSquare className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
                             <p className="text-stone-300 font-serif leading-relaxed text-justify text-sm italic">"{advice}"</p>
                         </div>
                    </div>
                    
                    <AtomicButton onClick={onClose} variant="secondary" className="mt-8">
                        Dismiss
                    </AtomicButton>
                </div>
            </div>
        </div>
    );
};
