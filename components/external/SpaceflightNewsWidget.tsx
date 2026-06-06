import React, { useState, useEffect } from 'react';
import { Rocket, ExternalLink } from 'lucide-react';

interface SpaceflightNewsWidgetProps {
    queryText: string;
}

export const SpaceflightNewsWidget: React.FC<SpaceflightNewsWidgetProps> = ({ queryText }) => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://api.spaceflightnewsapi.net/v4/articles/?search=${q}&limit=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results) {
                        setArticles(data.results);
                    }
                }
            } catch (e) {
                console.warn("Spaceflight News API failed", e);
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
                <Rocket className="w-4 h-4 text-academic-accent" /> Astropolitics & Aerospace (Spaceflight News API)
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
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{article.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>{article.news_site} • {new Date(article.published_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">Read Post <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
