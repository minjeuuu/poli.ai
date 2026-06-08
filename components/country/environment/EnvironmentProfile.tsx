
import React from 'react';
import { Leaf, Wind, CloudRain, AlertTriangle } from 'lucide-react';
import { DetailCard } from '../shared/DetailCard';

// Using `any` for now as the type will be dynamic/inferred in the service
export const EnvironmentProfile: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return null;
    return (
        <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500" /> Environmental Audit</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DetailCard label="Carbon Output" value={data.co2Emissions || "N/A"} icon={Wind} subValue="Metric Tons" />
                <DetailCard label="Forest Cover" value={data.forestCover || "N/A"} icon={Leaf} subValue="% of Land Area" />
                <DetailCard label="Air Quality" value={data.airQualityIndex || "N/A"} icon={CloudRain} subValue="AQI Score" />
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl">
                <h5 className="font-bold text-stone-700 dark:text-stone-300 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Major Threats
                </h5>
                <ul className="space-y-2">
                    {(data.threats || []).map((threat: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-serif text-stone-600 dark:text-stone-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                            {threat}
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <h5 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 text-sm uppercase tracking-wide">Climate Policy</h5>
                <p className="text-sm font-serif text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{data.policy}</p>
            </div>
        </div>
    );
};
