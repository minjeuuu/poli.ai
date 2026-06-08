import React, { useState, useEffect } from 'react';
import { ChevronLeft, Flame, Building2, Map as MapIcon, Users, FileText, Sparkles, AlertCircle, BookOpen, Clock, Fingerprint, Compass, ShieldAlert, Zap, Search, Printer, Eye, Lock } from 'lucide-react';
import { fetchAgencyDetail } from '../services/geminiService';

interface AgencyDetailScreenProps {
    agencyName: string;
    onClose: () => void;
}

const AgencyDetailScreen: React.FC<AgencyDetailScreenProps> = ({ agencyName, onClose }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const parsed = await fetchAgencyDetail(agencyName);
                if (parsed) {
                    setData(parsed);
                } else {
                    throw new Error("Failed to load");
                }
            } catch (err) {
                console.error(err);
                setData({ 
                    name: agencyName, 
                    type: "Intelligence Agency",
                    country: "Unknown", 
                    historicalImpact: "Information currently unavailable or generation failed." 
                });
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [agencyName]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-stone-50 dark:bg-stone-950">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Eye className="w-12 h-12 text-stone-500 animate-bounce" />
                    <p className="text-stone-500 dark:text-stone-400 font-serif font-bold uppercase tracking-widest text-sm">Decrypting Dossier...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-full overflow-y-auto bg-stone-50 dark:bg-stone-950 print:bg-white text-academic-text dark:text-stone-200">
            {/* Header / Nav */}
            <div className="sticky top-0 z-20 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between print:hidden">
                <button onClick={onClose} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors uppercase tracking-widest text-xs font-bold">
                    <ChevronLeft className="w-4 h-4" /> Back to Directory
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-md text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">
                        <Printer className="w-4 h-4" /> Print Dossier
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
                
                {/* HERO TITLE */}
                <div className="text-center space-y-6">
                    {data.imageUrl ? (
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-stone-200 dark:border-stone-800 shadow-md">
                            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-stone-200 dark:bg-stone-800 shadow-inner mb-4">
                            <Lock className="w-12 h-12 text-stone-600 dark:text-stone-400" />
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight">{data.name}</h1>
                    <div className="flex items-center justify-center flex-wrap gap-4 text-sm font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1"><Fingerprint className="w-4 h-4" /> {data.type}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Formed {data.foundedYear}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><MapIcon className="w-4 h-4" /> {data.country}</span>
                    </div>
                </div>

                {/* MODULAR GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN - Quick Facts */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm print:border-black print:shadow-none">
                            <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2"><Users className="w-4 h-4" /> Notable Directors</h3>
                            <ul className="space-y-2">
                                {data.keyFigures?.map((d: string, i: number) => <li key={i} className="font-serif text-md">{d}</li>)}
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm print:border-black print:shadow-none">
                            <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2"><Search className="w-4 h-4" /> Core Focus</h3>
                            <ul className="space-y-2 text-sm font-serif text-stone-600 dark:text-stone-300">
                                {data.coreFocus?.map((d: string, i: number) => <li key={i}>• {d}</li>)}
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm print:border-black print:shadow-none">
                            <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2"><Building2 className="w-4 h-4" /> Jurisdiction</h3>
                            <p className="text-sm font-serif leading-relaxed">{data.jurisdiction || "Classified"}</p>
                        </div>
                    </div>

                    {/* MAIN COLUMN - Core Analysis */}
                    <div className="md:col-span-2 space-y-8">
                        
                        <div className="bg-academic-paper dark:bg-stone-800/50 p-8 rounded-2xl border border-academic-line dark:border-stone-700 print:bg-stone-100 print:border-black">
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-3"><Eye className="w-6 h-6 text-stone-500" /> Function & Historical Impact</h3>
                            <p className="font-serif text-lg leading-relaxed text-stone-800 dark:text-stone-200 mb-6">{data.historicalImpact}</p>
                            
                            <h4 className="font-bold uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 mb-2 mt-6">Geopolitical Influence</h4>
                            <p className="font-serif text-md leading-relaxed text-stone-700 dark:text-stone-300">{data.politicalInfluence}</p>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm print:border-black print:shadow-none">
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">Declassified Major Operations</h3>
                            <ul className="space-y-4">
                                {data.majorOperations?.map((t: string, i: number) => (
                                    <li key={i} className="flex font-serif text-lg leading-relaxed items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-stone-500 mt-2 flex-shrink-0" />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Controversies & Disasters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                             <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 print:border-red-500">
                                <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-red-800 dark:text-red-400 border-b border-red-200 dark:border-red-900/30 pb-2"><AlertCircle className="w-4 h-4" /> Controversies / Failures</h3>
                                <ul className="space-y-3">
                                    {data.controversies?.length > 0 ? data.controversies.map((c: string, i: number) => (
                                        <li key={i} className="text-sm font-serif text-red-900 dark:text-red-300 leading-relaxed">• {c}</li>
                                    )) : <li className="text-sm italic text-red-900 dark:text-red-300">None declassified.</li>}
                                </ul>
                            </div>
                            <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded-2xl border border-stone-300 dark:border-stone-700 shadow-sm print:border-black">
                                <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 border-b border-stone-300 dark:border-stone-700 pb-2"><Zap className="w-4 h-4" /> Spycraft & Capabilities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.capabilities?.map((s: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-700">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgencyDetailScreen;
