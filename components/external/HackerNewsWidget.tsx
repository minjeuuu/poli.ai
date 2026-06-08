import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

export const HackerNewsWidget: React.FC = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch top stories
                const res = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
                if (res.ok) {
                    const ids = await res.json();
                    if (ids && ids.length > 0) {
                        const top5 = ids.slice(0, 5);
                        const storyPromises = top5.map((id: number) => 
                            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
                        );
                        const data = await Promise.all(storyPromises);
                        setStories(data);
                    }
                }
            } catch (e) {
                console.warn("HackerNews API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || stories.length === 0) return null;

    return (
        <div className="bg-[#ff6600]/5 border border-[#ff6600]/20 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ff6600] mb-4 flex items-center gap-2">
                <Newspaper className="w-4 h-4" /> Tech & Policy Signals
            </h3>
            <div className="space-y-3">
                {stories.map((story, idx) => (
                    <a 
                        key={idx}
                        href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="block p-3 rounded-lg bg-white dark:bg-stone-950 border border-[#ff6600]/10 hover:border-[#ff6600]/40 transition-colors"
                    >
                        <h4 className="font-serif text-sm text-stone-800 dark:text-stone-200 mb-1 leading-tight">{story.title}</h4>
                        <div className="flex gap-3 text-[10px] font-mono text-stone-500">
                            <span>{story.score} pts</span>
                            <span>by {story.by}</span>
                            <span>{story.descendants || 0} comments</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
