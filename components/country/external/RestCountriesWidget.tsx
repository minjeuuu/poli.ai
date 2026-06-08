import React, { useState, useEffect } from 'react';
import { Globe, Users, Map as MapIcon, Clock, Languages, Coins, Flag } from 'lucide-react';

interface RestCountriesWidgetProps {
    countryName: string;
}

export const RestCountriesWidget: React.FC<RestCountriesWidgetProps> = ({ countryName }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
                if (res.ok) {
                    const result = await res.json();
                    if (result && result.length > 0) {
                        setData(result[0]);
                    }
                }
            } catch (e) {
                console.warn("REST Countries API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [countryName]);

    if (loading || !data) return null;

    const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-academic-accent" /> Live Demographics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 text-stone-500 mb-1">
                        <Users className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-wider">Population</span>
                    </div>
                    <p className="font-mono font-bold text-stone-800 dark:text-stone-200">{formatNumber(data.population)}</p>
                </div>
                
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 text-stone-500 mb-1">
                        <MapIcon className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-wider">Area</span>
                    </div>
                    <p className="font-mono font-bold text-stone-800 dark:text-stone-200">{formatNumber(data.area)} km²</p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 text-stone-500 mb-1">
                        <Languages className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-wider">Languages</span>
                    </div>
                    <p className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm truncate" title={data.languages ? Object.values(data.languages).join(', ') : 'N/A'}>
                        {data.languages ? Object.values(data.languages).join(', ') : 'N/A'}
                    </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 text-stone-500 mb-1">
                        <Coins className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-wider">Currencies</span>
                    </div>
                    <p className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm truncate" title={data.currencies ? Object.values(data.currencies).map((c: any) => c.name).join(', ') : 'N/A'}>
                        {data.currencies ? Object.values(data.currencies).map((c: any) => c.name).join(', ') : 'N/A'}
                    </p>
                </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-sm"><Globe className="w-3 h-3" /> Region: {data.region}</span>
                <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-sm"><Globe className="w-3 h-3" /> Subregion: {data.subregion}</span>
                <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-sm"><Clock className="w-3 h-3" /> Timezones: {data.timezones?.[0]}</span>
                <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-sm"><Flag className="w-3 h-3" /> Capital: {data.capital?.[0] || 'N/A'}</span>
            </div>
        </div>
    );
};
