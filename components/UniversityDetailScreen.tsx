import React, { useState, useEffect } from 'react';
import { ChevronLeft, GraduationCap, MapPin, Target, Users, BookOpen, Clock, Lightbulb, Compass, Printer, Building2 } from 'lucide-react';
import { fetchUniversityDetail } from '../services/geminiService';

interface UniversityDetailScreenProps {
    entityName: string;
    onClose: () => void;
}

const UniversityDetailScreen: React.FC<UniversityDetailScreenProps> = ({ entityName, onClose }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const parsed = await fetchUniversityDetail(entityName);
                if (parsed) {
                    setData(parsed);
                } else {
                    throw new Error("Failed to load");
                }
            } catch (err) {
                console.error(err);
                setData({ 
                    name: entityName, 
                    type: "Academic Institution",
                    year: "Unknown", 
                    overview: "Information currently unavailable or generation failed." 
                });
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [entityName]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-stone-50 dark:bg-stone-950">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <GraduationCap className="w-12 h-12 text-blue-500 animate-bounce" />
                    <p className="text-stone-500 dark:text-stone-400 font-serif font-bold uppercase tracking-widest text-sm">Consulting Archives...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-full overflow-y-auto bg-stone-50 dark:bg-stone-950 print:bg-white text-academic-text dark:text-stone-200">
            <div className="sticky top-0 z-20 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between print:hidden">
                <button onClick={onClose} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors uppercase tracking-widest text-xs font-bold">
                    <ChevronLeft className="w-4 h-4" /> Back to Directory
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-md text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">
                        <Printer className="w-4 h-4" /> Print Fact Sheet
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
                <div className="text-center space-y-6">
                    {data.imageUrl ? (
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-stone-200 dark:border-stone-800 shadow-md">
                            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-stone-200 dark:bg-stone-800 shadow-inner mb-4">
                            <GraduationCap className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight">{data.name}</h1>
                    <div className="flex items-center justify-center flex-wrap gap-4 text-sm font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {data.type}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Est. {data.year}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.location}</span>
                    </div>
                    {data.motto && <p className="italic font-serif text-lg text-stone-600 dark:text-stone-400">"{data.motto}"</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-8">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30 print:border-black print:bg-white print:border-solid">
                            <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-blue-800 dark:text-blue-400 border-b border-blue-200 dark:border-blue-900/30 pb-2">
                                <Users className="w-4 h-4" /> Notable Alumni
                            </h3>
                            <ul className="space-y-3">
                                {data.notableAlumni?.map((d: string, i: number) => (
                                    <li key={i} className="text-sm font-serif text-blue-900 dark:text-blue-200">• {d}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm print:border-black">
                            <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
                                <Target className="w-4 h-4" /> Key Focus Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {data.focusAreas?.map((d: string, i: number) => (
                                    <span key={i} className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-full text-xs font-mono">
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-academic-paper dark:bg-stone-800/50 p-8 rounded-2xl border border-academic-line dark:border-stone-700 print:bg-stone-100 print:border-black">
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-stone-500" /> Academic Overview
                            </h3>
                            <p className="font-serif text-lg leading-relaxed text-stone-800 dark:text-stone-200 mb-6">{data.overview}</p>
                            
                            <h4 className="font-bold uppercase tracking-widest text-xs text-stone-500 dark:text-stone-400 mb-2 mt-6 flex items-center gap-2">
                                <Compass className="w-4 h-4" /> Geopolitical & Historical Impact
                            </h4>
                            <p className="font-serif text-md leading-relaxed text-stone-700 dark:text-stone-300">{data.historicalImpact}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityDetailScreen;
