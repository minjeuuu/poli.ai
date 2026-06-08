import React, { useState, useEffect } from 'react';
import { Calendar, Globe } from 'lucide-react';

interface PublicHolidaysWidgetProps {
    countryName: string;
}

export const PublicHolidaysWidget: React.FC<PublicHolidaysWidgetProps> = ({ countryName }) => {
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get Country Code first
                const geoRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData && geoData[0] && geoData[0].cca2) {
                        const code = geoData[0].cca2;
                        const year = new Date().getFullYear();
                        const raw = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`);
                        if (raw.ok) {
                            const data = await raw.json();
                            if (data && data.length > 0) {
                                // Exclude regional holidays for simplicity, or just show first 6 upcoming
                                const dateToday = new Date().toISOString().split('T')[0];
                                const upcoming = data.filter((h: any) => h.date >= dateToday).slice(0, 6);
                                // If near end of year, just show last 6
                                setHolidays(upcoming.length > 0 ? upcoming : data.slice(-6));
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Public Holidays API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || holidays.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-academic-gold" /> Civic Schedule
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {holidays.map((h, idx) => (
                     <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col justify-center">
                         <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">{h.date}</span>
                         <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 leading-tight mb-1">{h.localName}</h4>
                         {h.localName !== h.name && (
                             <p className="text-[10px] uppercase font-bold text-stone-500">{h.name}</p>
                         )}
                     </div>
                 ))}
            </div>
        </div>
    );
};
