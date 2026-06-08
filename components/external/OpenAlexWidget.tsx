import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react';

interface OpenAlexWidgetProps {
    queryText: string;
}

export const OpenAlexWidget: React.FC<OpenAlexWidgetProps> = ({ queryText }) => {
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(queryText)}&per-page=5`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.results) {
                        setWorks(data.results);
                    }
                }
            } catch (e) {
                console.warn("OpenAlex API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || works.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" /> Open Source Bibliometrics
            </h3>
            <div className="space-y-4">
                {works.map((work, idx) => (
                    <a 
                        key={idx}
                        href={work.id}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="block p-3 rounded-lg border border-stone-100 dark:border-stone-800 hover:border-emerald-500/50 transition-colors"
                    >
                        <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 mb-1">{work.title || 'Unknown Title'}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-stone-500">
                           {work.publication_year && <span>{work.publication_year}</span>}
                           {work.type && <span>• {work.type.replace('-', ' ')}</span>}
                           {work.cited_by_count !== undefined && <span>• {work.cited_by_count} Citations</span>}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
