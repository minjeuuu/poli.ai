import React, { useState, useEffect } from 'react';
import { Layers, ExternalLink } from 'lucide-react';

interface CrossrefWidgetProps {
    queryText: string;
}

export const CrossrefWidget: React.FC<CrossrefWidgetProps> = ({ queryText }) => {
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://api.crossref.org/works?query=${q}&select=title,author,URL,published-print&rows=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.message?.items) {
                        setPapers(data.message.items);
                    }
                }
            } catch (e) {
                console.warn("Crossref API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchWorks();
    }, [queryText]);

    if (loading || papers.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-academic-accent" /> Scholarly Metadata (Crossref API)
            </h3>
            
            <div className="space-y-4">
                {papers.map((paper, i) => {
                    const authorName = paper.author && paper.author.length > 0 ? `${paper.author[0].family || ''}` : 'Unknown';
                    const title = paper.title && paper.title.length > 0 ? paper.title[0] : 'Untitled';
                    const year = paper['published-print']?.['date-parts']?.[0]?.[0] || 'Unknown Year';
                    
                    return (
                        <a 
                            key={i} 
                            href={paper.URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                        >
                            <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{title}</h4>
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                                <span>{authorName} et al. • {year}</span>
                                <span className="flex items-center gap-1">DOI Link <ExternalLink className="w-3 h-3" /></span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
