import React, { useState, useEffect } from 'react';
import { Landmark, Users } from 'lucide-react';

interface GovTrackWidgetProps {
    roleType?: string; // e.g. 'senator', 'representative'
}

export const GovTrackWidget: React.FC<GovTrackWidgetProps> = ({ roleType = 'senator' }) => {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://www.govtrack.us/api/v2/role?current=true&role_type=${roleType}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.objects && data.objects.length > 0) {
                        setRoles(data.objects);
                    }
                }
            } catch (e) {
                console.warn("GovTrack API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roleType]);

    if (loading || roles.length === 0) return null;

    return (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#005187] dark:text-[#4da8e8] mb-4 flex items-center gap-2">
                <Landmark className="w-4 h-4" /> US Congress Data
            </h3>
            <div className="space-y-3">
                {roles.map((role, idx) => (
                    <a 
                        key={idx}
                        href={role.person.link}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="block p-3 rounded-lg bg-white dark:bg-stone-900 border border-blue-100 dark:border-blue-900/40 hover:border-blue-400 transition-colors"
                    >
                        <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">{role.person.name}</h4>
                        <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${role.party === 'Democrat' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : role.party === 'Republican' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'}`}>
                                {role.party}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 py-0.5">
                                {role.title} • {role.state} {role.district ? `Dist. ${role.district}` : ''}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
            <p className="text-[9px] uppercase text-stone-500 mt-4 tracking-widest">* Showing latest current matching roles</p>
        </div>
    );
};
