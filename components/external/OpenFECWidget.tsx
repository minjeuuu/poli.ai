import React, { useState, useEffect } from 'react';
import { BadgeDollarSign, ExternalLink } from 'lucide-react';

interface OpenFECWidgetProps {
    queryText: string;
}

export const OpenFECWidget: React.FC<OpenFECWidgetProps> = ({ queryText }) => {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the DEMO_KEY for FEC api
                const query = queryText.split(' ')[0]; // use surname primarily
                const res = await fetch(`https://api.open.fec.gov/v1/candidates/?api_key=DEMO_KEY&q=${encodeURIComponent(query)}&sort_null_only=false&per_page=5`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.results && data.results.length > 0) {
                        setCandidates(data.results);
                    }
                }
            } catch (e) {
                console.warn("OpenFEC API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || candidates.length === 0) return null;

    return (
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#156082] dark:text-[#4198c0] mb-4 flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4" /> Campaign Finance
            </h3>
            <div className="space-y-3">
                {candidates.map((cand, idx) => (
                    <div 
                        key={idx}
                        className="p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800"
                    >
                        <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">{cand.name}</h4>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                                {cand.party_full || cand.party}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                                • {cand.office_full} {cand.state ? `(${cand.state})` : ''}
                            </span>
                        </div>
                        <p className="text-[9px] font-mono text-stone-400 mt-2">ID: {cand.candidate_id}</p>
                    </div>
                ))}
            </div>
            <a href="https://www.fec.gov/data/candidates/" target="_blank" rel="noopener noreferrer" className="block mt-4 text-[10px] uppercase font-bold text-[#156082] hover:underline">
                View Federal Elections Commission <ExternalLink className="w-3 h-3 inline mb-0.5" />
            </a>
        </div>
    );
};
