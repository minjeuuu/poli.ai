
import React, { useState } from 'react';
import { Gavel, Scroll, Scale, Search, Loader2, FileText, ChevronRight, History, BookOpen } from 'lucide-react';
import { LegalProfile } from '../../../types';
import { fetchSpecificLaw } from '../../../services/country/countryLegalService';

interface LegalCodeViewerProps {
    data: LegalProfile;
    countryName: string;
}

export const LegalCodeViewer: React.FC<LegalCodeViewerProps> = ({ data, countryName }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [expandedHistory, setExpandedHistory] = useState(false);

    if (!data) return null;

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        
        setSearching(true);
        setResult(null);
        try {
            const res = await fetchSpecificLaw(countryName, query);
            setResult(res);
        } catch (error) {
            setResult("Unable to access legal archives at this time.");
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Constitution Header */}
            <div className="bg-stone-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Scroll className="w-32 h-32" /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Scroll className="w-6 h-6 text-academic-gold" />
                        <h3 className="text-xl font-serif font-bold">{data.constitution?.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm font-mono text-stone-400 mb-6">
                        <div>Adopted: {data.constitution?.adopted}</div>
                        <div>Amendments: {data.constitution?.amendments}</div>
                    </div>
                    <p className="font-serif leading-relaxed text-justify opacity-90 border-t border-white/20 pt-6">
                        {data.constitution?.summary}
                    </p>
                </div>
            </div>

            {/* Historical Constitutions (NEW) */}
            {(data.historicalConstitutions || []).length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setExpandedHistory(!expandedHistory)}
                        className="w-full flex items-center justify-between p-6 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-academic-accent dark:text-indigo-400" />
                            <h4 className="font-bold text-sm uppercase tracking-widest text-stone-600 dark:text-stone-300">Historical Constitutions</h4>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${expandedHistory ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {expandedHistory && (
                        <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                            {data.historicalConstitutions.map((consti, i) => (
                                <div key={i} className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h5 className="font-serif font-bold text-stone-800 dark:text-stone-200">{consti.name}</h5>
                                        <span className="text-xs font-mono text-academic-gold">{consti.year}</span>
                                    </div>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{consti.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Law Search Engine */}
            <div className="bg-stone-100 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4" /> Legal Archive Query
                </h4>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search specific laws in ${countryName} (e.g. "Labor Code", "Article 5")...`}
                        className="flex-1 p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif focus:ring-2 focus:ring-academic-accent dark:focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={searching || !query.trim()}
                        className="px-6 py-2 bg-academic-accent dark:bg-indigo-600 text-white font-bold uppercase text-xs tracking-widest rounded-lg hover:bg-stone-700 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                        Query
                    </button>
                </form>

                {result && (
                    <div className="mt-4 p-6 bg-white dark:bg-stone-900 rounded-lg border-l-4 border-academic-gold shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-4 text-academic-gold">
                            <FileText className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Query Result</span>
                        </div>
                        <div className="prose prose-stone dark:prose-invert prose-sm max-w-none font-serif leading-relaxed text-justify whitespace-pre-line">
                            {result}
                        </div>
                    </div>
                )}
            </div>

            {/* Codes & Judiciary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Scale className="w-4 h-4" /> Primary Codes</h4>
                    <ul className="space-y-2">
                        {data.codes?.map((code, i) => (
                            <li 
                                key={i} 
                                className="flex justify-between items-center p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer group"
                                onClick={() => { setQuery(code.name); handleSearch(); }}
                            >
                                <span className="font-serif font-bold text-academic-text dark:text-stone-200 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{code.name}</span>
                                <span className="text-xs font-mono text-stone-400">{code.year}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Gavel className="w-4 h-4" /> Judiciary Structure</h4>
                    <div className="space-y-4">
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                            <span className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Highest Court</span>
                            <span className="text-lg font-serif text-stone-800 dark:text-stone-200">{data.highestCourt}</span>
                        </div>
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                            <span className="block text-[10px] font-bold uppercase text-stone-500 mb-1">System Type</span>
                            <span className="text-lg font-serif text-stone-800 dark:text-stone-200">{data.systemType}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
