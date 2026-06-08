import React, { useState, useEffect } from 'react';
import { History, ExternalLink } from 'lucide-react';

interface LibraryOfCongressWidgetProps {
    queryText: string;
}

export const LibraryOfCongressWidget: React.FC<LibraryOfCongressWidgetProps> = ({ queryText }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLOC = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://www.loc.gov/search/?q=${q}&fo=json&c=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results) {
                        setItems(data.results.filter((i: any) => i.title));
                    }
                }
            } catch (e) {
                console.warn("LoC API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLOC();
    }, [queryText]);

    if (loading || items.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-academic-accent" /> Historical Archives
            </h3>
            
            <div className="space-y-4">
                {items.slice(0, 4).map((item, i) => (
                    <a 
                        key={i} 
                        href={item.url || item.id} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                    >
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{item.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>{item.date ? item.date : 'Unknown Date'}</span>
                            <span className="flex items-center gap-1">View Archive <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
