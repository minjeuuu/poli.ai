import React, { useState, useEffect } from 'react';
import { Wind, MapPin } from 'lucide-react';

interface OpenAQWidgetProps {
    countryName: string;
}

export const OpenAQWidget: React.FC<OpenAQWidgetProps> = ({ countryName }) => {
    const [aqData, setAqData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // We need country CCA2 code first
                const geoRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData && geoData[0] && geoData[0].cca2) {
                        const code = geoData[0].cca2;
                        // Fetch latest measurements for this country
                        const res = await fetch(`https://api.openaq.org/v2/latest?country=${code}&limit=3`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.results) {
                                setAqData(data.results);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("OpenAQ API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || aqData.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-500" /> Environment & Air Quality
            </h3>
            <div className="space-y-4">
                {aqData.map((station, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {station.city || 'Unknown Region'}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">{station.location}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {station.measurements?.map((m: any, mIdx: number) => (
                                <div key={mIdx} className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded flex flex-col items-center min-w-[60px]">
                                    <span className="text-[9px] font-bold tracking-widest text-stone-500 uppercase">{m.parameter}</span>
                                    <span className="font-mono text-sm font-bold text-stone-800 dark:text-stone-200">{m.value.toFixed(1)}</span>
                                    <span className="text-[8px] text-stone-400">{m.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
