import React, { useState, useEffect } from 'react';
import { BookText, Globe } from 'lucide-react';

interface CrossrefWidgetProps {
    queryText: string;
}

export const CrossrefWidget: React.FC<CrossrefWidgetProps> = ({ queryText }) => {
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(queryText)}&select=title,author,URL,published-print,publisher&rows=5`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.message && data.message.items) {
                        setWorks(data.message.items);
                    }
                }
            } catch (e) {
                console.warn("Crossref API failed", e);
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
                <BookText className="w-4 h-4 text-academic-text dark:text-stone-300" /> Academic Citations
            </h3>
            <div className="space-y-4">
                {works.map((work, idx) => (
                    <a 
                        key={idx}
                        href={work.URL}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="block p-3 rounded-lg border border-stone-100 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 transition-colors"
                    >
                        <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 mb-1">{work.title?.[0] || 'Unknown Title'}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-stone-500">
                           {work.author && work.author.length > 0 && (
                               <span>{work.author[0].family}, {work.author[0].given} {work.author.length > 1 ? 'et al.' : ''}</span>
                           )}
                           {work.publisher && <span>• {work.publisher}</span>}
                           {work['published-print'] && work['published-print']['date-parts'] && (
                               <span>• {work['published-print']['date-parts'][0][0]}</span>
                           )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
