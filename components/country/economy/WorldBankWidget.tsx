import React, { useState, useEffect } from 'react';
import { Activity, Globe, Info } from 'lucide-react';

interface WorldBankWidgetProps {
    countryName: string;
}

export const WorldBankWidget: React.FC<WorldBankWidgetProps> = ({ countryName }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // First get the ISO alpha2 code
                const isoRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
                if (!isoRes.ok) throw new Error("ISO fetch failed");
                const isoData = await isoRes.json();
                const code = isoData[0]?.cca2;
                
                if (code) {
                    // NY.GDP.MKTP.CD is GDP (current US$)
                    const res = await fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.MKTP.CD?format=json&per_page=1&mrv=1`);
                    if (res.ok) {
                        const result = await res.json();
                        if (result && result[1] && result[1].length > 0) {
                            setData(result[1][0]);
                        }
                    }
                }
            } catch (e) {
                console.warn("WorldBank API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || !data) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm mt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> World Bank Open Data
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-bold text-academic-text dark:text-stone-300 mb-1">GDP (Current US$)</p>
                    <p className="text-3xl font-mono font-bold text-green-600 dark:text-green-500">
                        ${(data.value / 1000000000).toFixed(2)}B
                    </p>
                    <p className="text-[10px] uppercase text-stone-400 mt-1">Year: {data.date}</p>
                </div>
                <div className="flex-1">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-serif leading-relaxed text-justify flex items-start gap-2">
                        <Activity className="w-4 h-4 mt-0.5 shrink-0" />
                        Live data sourced directly from the World Bank representing the latest official estimate of the size of the national economy.
                    </div>
                </div>
            </div>
            <p className="text-[9px] text-stone-400 italic text-right mt-4 flex items-center justify-end gap-1"><Info className="w-3 h-3"/> Provided by The World Bank Group</p>
        </div>
    );
};
