
import React, { useState } from 'react';
import { RotateCw, ArrowRightLeft, Languages as TranslateIcon, Check, Brain } from 'lucide-react';
import { translateText } from '../../services/translateService';
import { TranslationResult } from '../../types';
import { playSFX } from '../../services/soundService';

const TranslateTab: React.FC = () => {
    const [input, setInput] = useState('');
    const [targetLang, setTargetLang] = useState('English');
    const [result, setResult] = useState<TranslationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (!input.trim()) return;
        playSFX('click');
        setLoading(true);
        const res = await translateText(input, targetLang);
        setResult(res);
        setLoading(false);
        playSFX('success');
    };

    return (
        <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 p-6 md:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <h2 className="text-4xl font-serif font-bold mb-4 relative z-10 flex items-center gap-4"><TranslateIcon className="w-10 h-10" /> Universal Linguistic Engine</h2>
                    <p className="text-white/70 text-lg relative z-10 max-w-2xl font-serif leading-relaxed text-justify">
                        Political discourse requires precision. Translate treaties, speeches, and documents with context-aware AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea 
                                className="w-full h-80 p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl focus:ring-4 focus:ring-academic-accent/20 dark:focus:ring-indigo-500/20 focus:border-academic-accent dark:focus:border-indigo-500 outline-none resize-none font-serif text-lg shadow-inner transition-all"
                                placeholder="Paste political text, treaty excerpts, or foreign speeches here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <div className="absolute bottom-6 right-6 text-xs text-stone-400 font-mono">{input.length} chars</div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input 
                                type="text" 
                                className="flex-1 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl outline-none font-bold text-stone-700 dark:text-stone-300 placeholder-stone-400 focus:border-academic-accent transition-colors"
                                placeholder="Target Language (e.g. 'Old High German')"
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                            />
                            <button 
                                onClick={handleTranslate}
                                disabled={loading || !input}
                                className="px-10 py-4 bg-academic-accent dark:bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-3 sm:w-auto w-full"
                            >
                                {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
                                Translate
                            </button>
                        </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 relative min-h-[20rem] flex flex-col">
                        {result ? (
                            <div className="space-y-8 animate-in fade-in duration-500 flex-1 flex flex-col">
                                 <div className="flex-1">
                                     <span className="text-[10px] font-bold uppercase text-stone-400 block mb-4 tracking-widest flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Result ({result.targetLanguage})</span>
                                     <p className="text-2xl font-serif text-stone-800 dark:text-stone-100 leading-relaxed text-justify whitespace-pre-wrap">{result.translated}</p>
                                 </div>
                                 {result.nuanceAnalysis && (
                                     <div className="p-6 bg-academic-gold/5 dark:bg-academic-gold/10 border-l-4 border-academic-gold rounded-r-xl mt-auto">
                                         <span className="text-[10px] font-bold uppercase text-academic-gold block mb-2 flex items-center gap-2"><Brain className="w-3 h-3" /> Contextual Analysis</span>
                                         <p className="text-sm font-serif text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{result.nuanceAnalysis}</p>
                                     </div>
                                 )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-stone-300 dark:text-stone-700 h-full">
                                <TranslateIcon className="w-20 h-20 mb-6 opacity-30" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50">Awaiting Input Protocol...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslateTab;
