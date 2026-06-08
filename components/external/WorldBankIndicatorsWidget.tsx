import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, Users } from 'lucide-react';

interface WorldBankIndicatorsWidgetProps {
    countryName: string;
}

export const WorldBankIndicatorsWidget: React.FC<WorldBankIndicatorsWidgetProps> = ({ countryName }) => {
    const [indicators, setIndicators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get code
                const geoRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData && geoData[0] && geoData[0].cca2) {
                        const code = geoData[0].cca2;
                        
                        // We will just fetch a few indicators specifically:
                        // SP.POP.TOTL (Population), NY.GDP.MKTP.CD (GDP), SE.ADT.LITR.ZS (Literacy)
                        const endpoints = [
                            { id: 'SP.POP.TOTL', name: 'Total Population' },
                            { id: 'NY.GDP.MKTP.CD', name: 'GDP (Current US$)' },
                            { id: 'SI.POV.GINI', name: 'Gini Index' }
                        ];

                        const reqs = endpoints.map(ep => 
                             fetch(`https://api.worldbank.org/v2/country/${code}/indicator/${ep.id}?format=json&per_page=1`).then(r => r.json())
                        );

                        const results = await Promise.all(reqs);
                        
                        const processed = results.map((res, i) => {
                             if (res && res[1] && res[1].length > 0) {
                                 const item = res[1][0];
                                 return {
                                     name: endpoints[i].name,
                                     value: item.value,
                                     year: item.date
                                 };
                             }
                             return null;
                        }).filter(Boolean);

                        setIndicators(processed);
                    }
                }
            } catch (e) {
                console.warn("WB Indicators API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || indicators.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0071bc] dark:text-[#2da5f8] mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" /> Global Development Indicators
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {indicators.map((ind: any, idx: number) => (
                      <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-xl relative overflow-hidden">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">{ind.name}</p>
                           <p className="font-mono font-bold text-lg text-stone-800 dark:text-stone-200">
                               {ind.value != null ? (ind.value > 1000 ? ind.value.toLocaleString() : ind.value.toFixed(2)) : 'N/A'}
                           </p>
                           <p className="text-[9px] text-stone-400 mt-1">Reported: {ind.year}</p>
                      </div>
                 ))}
            </div>
        </div>
    );
};
