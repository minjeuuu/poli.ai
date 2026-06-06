import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Activity } from 'lucide-react';

interface GDELTWidgetProps {
    queryText: string;
}

export const GDELTWidget: React.FC<GDELTWidgetProps> = ({ queryText }) => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // GDELT 2.0 DOC API
                const q = encodeURIComponent(`"${queryText}"`);
                const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=5&format=json`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.articles) {
                        setArticles(data.articles);
                    }
                }
            } catch (e) {
                console.warn("GDELT API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [queryText]);

    if (loading || articles.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-academic-accent" /> Media Monitor (GDELT API)
            </h3>
            
            <div className="space-y-4">
                {articles.map((article, i) => (
                    <a 
                        key={i} 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                    >
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors">{article.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>{article.domain}</span>
                            <span className="flex items-center gap-1">Read <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest border-t border-stone-200 dark:border-stone-800 pt-3">
                <Activity className="w-3 h-3" /> Automated Global Event Database Analysis
            </div>
        </div>
    );
};
