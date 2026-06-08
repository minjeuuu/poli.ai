import React, { useState, useEffect } from 'react';
import { Building2, Globe } from 'lucide-react';

interface UniversitiesWidgetProps {
    countryName: string;
}

export const UniversitiesWidget: React.FC<UniversitiesWidgetProps> = ({ countryName }) => {
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // The API needs the country name. E.g., 'United States'
                const res = await fetch(`http://universities.hipolabs.com/search?country=${encodeURIComponent(countryName)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        // Just show top 10 to prevent overflow
                        setUniversities(data.slice(0, 10));
                    }
                }
            } catch (e) {
                console.warn("Universities API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || universities.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-academic-accent" /> Institutional Landscape
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {universities.map((uni, idx) => (
                     <a 
                        key={idx}
                        href={uni.web_pages?.[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center gap-3 hover:border-academic-accent dark:hover:border-indigo-500 transition-colors group"
                     >
                         <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center shrink-0 group-hover:bg-academic-accent group-hover:text-white transition-colors">
                             <Building2 className="w-5 h-5 text-stone-500 group-hover:text-white" />
                         </div>
                         <div>
                             <p className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 leading-tight mb-1">{uni.name}</p>
                             <p className="text-[10px] font-mono text-stone-400 capitalize">{uni.web_pages?.[0]?.replace('https://', '').replace('http://', '').replace(/\/$/, '')}</p>
                         </div>
                     </a>
                 ))}
            </div>
            {universities.length === 10 && (
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 text-center mt-4">Showing Top 10 Institutions</p>
            )}
        </div>
    );
};
