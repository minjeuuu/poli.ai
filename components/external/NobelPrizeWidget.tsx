import React, { useState, useEffect } from 'react';
import { Award, ExternalLink } from 'lucide-react';

interface NobelPrizeWidgetProps {
    countryName?: string; // Optional filter by birth country
}

export const NobelPrizeWidget: React.FC<NobelPrizeWidgetProps> = ({ countryName }) => {
    const [laureates, setLaureates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Nobel Prize API v2.1
                // We'll search laureates by birthCountry
                let url = 'https://api.nobelprize.org/2.1/laureates?limit=10&sort=desc';
                if (countryName) {
                    url += `&birthCountryExact=${encodeURIComponent(countryName)}`;
                }
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.laureates && data.laureates.length > 0) {
                        setLaureates(data.laureates);
                    }
                }
            } catch (e) {
                console.warn("Nobel Prize API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || laureates.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-academic-gold" /> Laureates & Honorees
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {laureates.slice(0, 6).map((laureate, idx) => {
                     const name = laureate.knownName?.en || laureate.orgName?.en || 'Unknown';
                     const prize = laureate.nobelPrizes?.[0];
                     const year = prize?.awardYear;
                     const category = prize?.category?.en;
                     const motivation = prize?.motivations?.[0]?.en;

                     return (
                        <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 flex gap-4 items-start">
                             <div className="w-10 h-10 shrink-0 bg-academic-gold/10 flex items-center justify-center rounded-full border border-academic-gold/30">
                                 <Award className="w-5 h-5 text-academic-gold" />
                             </div>
                             <div>
                                 <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 mb-1">{name}</h4>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-academic-gold mb-2">{year} • {category}</p>
                                 {motivation && (
                                     <p className="text-xs font-serif text-stone-600 dark:text-stone-400 italic">"{motivation}"</p>
                                 )}
                             </div>
                        </div>
                     );
                })}
            </div>
            {laureates.length > 6 && (
                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
                    <a href="https://www.nobelprize.org/prizes/lists/all-nobel-prizes/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold hover:underline">
                        View All Laureates <ExternalLink className="w-3 h-3 inline mb-0.5" />
                    </a>
                </div>
            )}
        </div>
    );
};
