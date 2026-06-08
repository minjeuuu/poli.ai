import React, { useState, useEffect } from 'react';
import { Activity, ExternalLink, Rocket } from 'lucide-react';

interface SpaceXWidgetProps {
    limit?: number;
}

export const SpaceXWidget: React.FC<SpaceXWidgetProps> = ({ limit = 3 }) => {
    const [launches, setLaunches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get latest launches
                const res = await fetch(`https://api.spacexdata.com/v4/launches/past`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        // reverse to get most recent first
                        const sorted = data.sort((a: any, b: any) => b.date_unix - a.date_unix);
                        setLaunches(sorted.slice(0, limit));
                    }
                }
            } catch (e) {
                console.warn("SpaceX API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [limit]);

    if (loading || launches.length === 0) return null;

    return (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-xl mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Orbital Operations
            </h3>
            
            <div className="space-y-3">
                {launches.map((launch, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-stone-800 bg-stone-900 flex items-center gap-4">
                        <div className="w-12 h-12 shrink-0 bg-white/5 rounded-full flex items-center justify-center border border-stone-700 p-2">
                             {launch.links?.patch?.small ? (
                                 <img src={launch.links.patch.small} alt="Mission Patch" className="w-full h-full object-contain filter drop-shadow-md" />
                             ) : (
                                 <Rocket className="w-5 h-5 text-stone-500" />
                             )}
                        </div>
                        <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-serif font-bold text-sm text-stone-200">{launch.name}</h4>
                                 <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${launch.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                     {launch.success ? 'SUCCESS' : 'FAILURE'}
                                 </span>
                             </div>
                             <p className="text-[10px] font-mono text-stone-400">Flight {launch.flight_number} • {new Date(launch.date_utc).toLocaleDateString()}</p>
                        </div>
                        {launch.links?.webcast && (
                            <a href={launch.links.webcast} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded border border-stone-700 transition-colors text-stone-300">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
