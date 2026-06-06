import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

interface DOAJWidgetProps {
    queryText: string;
}

export const DOAJWidget: React.FC<DOAJWidgetProps> = ({ queryText }) => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://doaj.org/api/v1/search/articles/${q}?pageSize=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results) {
                        setArticles(data.results);
                    }
                }
            } catch (e) {
                console.warn("DOAJ API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [queryText]);

    if (loading || articles.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-academic-accent" /> Open Access Journals (DOAJ API)
            </h3>
            
            <div className="space-y-4">
                {articles.map((article, i) => {
                    const bib = article.bibjson || {};
                    const title = bib.title || 'Untitled';
                    const authorName = bib.author && bib.author.length > 0 ? bib.author[0].name : 'Unknown';
                    const link = bib.link && bib.link.length > 0 ? bib.link[0].url : '#';
                    
                    return (
                        <a 
                            key={i} 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                        >
                            <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{title}</h4>
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                                <span>{authorName} • {bib.year || 'Unknown Year'}</span>
                                <span className="flex items-center gap-1">Read Open Access <ExternalLink className="w-3 h-3" /></span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
