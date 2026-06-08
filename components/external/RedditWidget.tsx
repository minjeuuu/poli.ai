import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

interface RedditWidgetProps {
    queryText: string;
}

export const RedditWidget: React.FC<RedditWidgetProps> = ({ queryText }) => {
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://www.reddit.com/search.json?q=${q}&sort=relevance&limit=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.children) {
                        setThreads(data.data.children.map((child: any) => child.data));
                    }
                }
            } catch (e) {
                console.warn("Reddit API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [queryText]);

    if (loading || threads.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-academic-accent" /> Live Public Discourse
            </h3>
            
            <div className="space-y-4">
                {threads.map((thread, i) => (
                    <a 
                        key={i} 
                        href={`https://www.reddit.com${thread.permalink}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                    >
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors">{thread.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>r/{thread.subreddit} • {thread.score} upvotes</span>
                            <span className="flex items-center gap-1">View thread <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
