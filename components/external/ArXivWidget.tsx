import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

interface ArXivWidgetProps {
    queryText: string;
}

export const ArXivWidget: React.FC<ArXivWidgetProps> = ({ queryText }) => {
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const q = encodeURIComponent(`all:${queryText}`);
                const url = `http://export.arxiv.org/api/query?search_query=${q}&start=0&max_results=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const str = await res.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(str, "text/xml");
                    
                    const entries = Array.from(xml.querySelectorAll("entry"));
                    const parsedPapers = entries.map(entry => {
                        return {
                            title: entry.querySelector("title")?.textContent || "Untitled",
                            summary: entry.querySelector("summary")?.textContent || "",
                            link: entry.querySelector("id")?.textContent || "",
                            published: entry.querySelector("published")?.textContent || "",
                            author: entry.querySelector("author > name")?.textContent || "Unknown"
                        };
                    });
                    setPapers(parsedPapers);
                }
            } catch (e) {
                console.warn("ArXiv API failed", e);
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
                <Newspaper className="w-4 h-4 text-academic-accent" /> Academic Preprints (ArXiv API)
            </h3>
            
            <div className="space-y-4">
                {papers.map((paper, i) => (
                    <a 
                        key={i} 
                        href={paper.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                    >
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{paper.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>{paper.author} • {new Date(paper.published).getFullYear()}</span>
                            <span className="flex items-center gap-1">Read Paper <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
