import React, { useState, useEffect } from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';

export const USASpendingWidget: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch high level agency spending for the current fiscal year
                const res = await fetch(`https://api.usaspending.gov/api/v2/references/toptier_agencies/`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.results) {
                        setStats(data.results.slice(0, 5)); // Top 5
                    }
                }
            } catch (e) {
                console.warn("USASpending API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !stats) return null;

    return (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> US Federal Budgets
            </h3>
            <div className="space-y-3">
                {stats.map((agency: any, idx: number) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800">
                        <h4 className="font-serif font-bold text-sm text-stone-200 mb-1 md:mb-0 line-clamp-1">{agency.agency_name}</h4>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-stone-400">ID: {agency.agency_id}</span>
                            <span className="font-mono font-bold text-emerald-400">
                                ${(agency.outlay_amount || agency.obligated_amount || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[9px] uppercase text-stone-500 mt-4 tracking-widest">* Based on available agency profiles</p>
        </div>
    );
};
