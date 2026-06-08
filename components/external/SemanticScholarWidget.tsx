import React, { useState, useEffect } from 'react';
import { Brain, ExternalLink } from 'lucide-react';

interface SemanticScholarWidgetProps {
    queryText: string;
}

export const SemanticScholarWidget: React.FC<SemanticScholarWidgetProps> = ({ queryText }) => {
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${q}&limit=4&fields=title,authors,year,url`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setPapers(data.data);
                    }
                }
            } catch (e) {
                console.warn("Semantic Scholar API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPapers();
    }, [queryText]);

    if (loading || papers.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-academic-accent" /> AI Research Graph
            </h3>
            
            <div className="space-y-4">
                {papers.map((paper, i) => {
                    const authorName = paper.authors && paper.authors.length > 0 ? paper.authors[0].name : 'Unknown';
                    const link = paper.url || '#';
                    
                    return (
                        <a 
                            key={i} 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                        >
                            <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{paper.title}</h4>
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                                <span>{authorName} • {paper.year || 'Unknown Year'}</span>
                                <span className="flex items-center gap-1">View Graph <ExternalLink className="w-3 h-3" /></span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
