import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Globe } from 'lucide-react';

interface WikipediaWidgetProps {
    title: string;
    description?: string; // Optional description if it's not the exact title
}

export const WikipediaWidget: React.FC<WikipediaWidgetProps> = ({ title, description }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. First search using both title and description to find the most relevant exact page title
                let searchQuery = title;
                if (description) {
                    searchQuery += ' ' + description;
                }
                
                const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&origin=*`);
                const searchData = await searchRes.json();
                
                if (searchData.query?.search?.length > 0) {
                    const pageTitle = searchData.query.search[0].title;
                    
                    // 2. Fetch the extract and image for the matched page title
                    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts|pageimages&format=json&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=400&redirects=1&titles=${encodeURIComponent(pageTitle)}`);
                    if (res.ok) {
                        const json = await res.json();
                        const pages = json.query.pages;
                        const pageId = Object.keys(pages)[0];
                        if (pageId && pageId !== '-1') {
                            setData(pages[pageId]);
                        }
                    }
                }
            } catch (e) {
                console.warn("Wikipedia fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [title, description]);

    if (loading || !data) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mt-8 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-academic-accent" /> Encyclopedic Context
                </h3>
                <a href={`https://en.wikipedia.org/wiki/${data.title.replace(/ /g, '_')}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-academic-accent hover:underline flex items-center gap-1">
                    Read Article <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {data.thumbnail && (
                    <img 
                        src={data.thumbnail.source} 
                        alt={data.title} 
                        className="w-full md:w-48 h-48 object-cover rounded-xl shadow-sm filter grayscale hover:grayscale-0 transition-all duration-500 border border-stone-200 dark:border-stone-800"
                    />
                )}
                <div className="flex-1">
                    <h4 className="font-serif font-bold text-xl text-stone-800 dark:text-stone-200 mb-2">{data.title}</h4>
                    <p className="text-stone-600 dark:text-stone-400 font-serif leading-relaxed text-justify text-sm line-clamp-6">
                        {data.extract}
                    </p>
                </div>
            </div>
        </div>
    );
};
