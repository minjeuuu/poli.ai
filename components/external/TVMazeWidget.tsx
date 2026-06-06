import { ImageWithFallback } from '../atoms/ImageWithFallback';
import React, { useState, useEffect } from 'react';
import { Tv, ExternalLink } from 'lucide-react';

interface TVMazeWidgetProps {
    queryText: string;
}

export const TVMazeWidget: React.FC<TVMazeWidgetProps> = ({ queryText }) => {
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShows = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://api.tvmaze.com/search/shows?q=${q}`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setShows(data.slice(0, 4));
                    }
                }
            } catch (e) {
                console.warn("TVMaze API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchShows();
    }, [queryText]);

    if (loading || shows.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Tv className="w-4 h-4 text-academic-accent" /> Cultural Depictions (TVmaze API)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shows.map((item, i) => {
                    const show = item.show;
                    return (
                        <a 
                            key={i} 
                            href={show.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-row bg-stone-50 dark:bg-stone-800/50 rounded-xl overflow-hidden hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group h-full"
                        >
                            <div className="w-20 bg-stone-200 dark:bg-stone-800 flex-shrink-0">
                                {show.image?.medium ? (
                                    <ImageWithFallback src={show.image.medium} alt={show.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-200 dark:bg-stone-800">
                                        <Tv className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-center">
                                <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-1">{show.name}</h4>
                                <div className="text-[10px] uppercase font-bold text-stone-400">
                                    <span>{show.premiered ? show.premiered.substring(0, 4) : 'N/A'} • {show.network?.name || show.webChannel?.name || 'Unknown Network'}</span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
