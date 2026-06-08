import React, { useState, useEffect } from 'react';
import { Database, ExternalLink } from 'lucide-react';

interface InternetArchiveWidgetProps {
    queryText: string;
}

export const InternetArchiveWidget: React.FC<InternetArchiveWidgetProps> = ({ queryText }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(queryText)}&fl[]=identifier,title,creator,mediatype,year&rows=5&output=json`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.response && data.response.docs) {
                        setItems(data.response.docs);
                    }
                }
            } catch (e) {
                console.warn("Internet Archive API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || items.length === 0) return null;

    return (
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-stone-700 dark:text-stone-300" /> Digital Artifacts
            </h3>
            <div className="space-y-3">
                {items.map((item, idx) => (
                     <a 
                        key={idx}
                        href={`https://archive.org/details/${item.identifier}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="block p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-academic-accent dark:hover:border-indigo-500 transition-colors"
                     >
                         <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 mb-1">{item.title || 'Untitled'}</h4>
                         <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-stone-500">
                             {item.creator && <span>{Array.isArray(item.creator) ? item.creator[0] : item.creator}</span>}
                             {item.year && <span>• {item.year}</span>}
                             {item.mediatype && <span>• {item.mediatype}</span>}
                         </div>
                     </a>
                ))}
            </div>
        </div>
    );
};
