import React, { useState, useEffect } from 'react';
import { Quote, ExternalLink } from 'lucide-react';

interface WikiquoteWidgetProps {
    queryText: string;
}

export const WikiquoteWidget: React.FC<WikiquoteWidgetProps> = ({ queryText }) => {
    const [quotes, setQuotes] = useState<string[]>([]);
    const [pageTitle, setPageTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // First search to get exact title
                const query = encodeURIComponent(queryText.split(' (')[0]);
                const searchRes = await fetch(`https://en.wikiquote.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json&origin=*`);
                
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.query?.search?.length > 0) {
                        const title = searchData.query.search[0].title;
                        setPageTitle(title);
                        // Get page text
                        const extractRes = await fetch(`https://en.wikiquote.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(title)}&format=json&origin=*`);
                        if (extractRes.ok) {
                            const extractData = await extractRes.json();
                            const pages = extractData.query.pages;
                            const pageId = Object.keys(pages)[0];
                            if (pageId && pageId !== '-1') {
                                const text = pages[pageId].extract;
                                // Simple naive parsing of quotes (lines starting with quotes or just long lines)
                                const lines = text.split('\n').filter((l: string) => l.length > 50 && !l.startsWith('='));
                                setQuotes(lines.slice(0, 3));
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Wikiquote API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || quotes.length === 0) return null;

    return (
        <div className="bg-stone-50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Quote className="w-4 h-4 text-academic-accent" /> Relevant Quotations
            </h3>
            <div className="space-y-4">
                {quotes.map((quote, idx) => (
                    <blockquote key={idx} className="border-l-2 border-academic-accent/50 pl-4 py-1">
                        <p className="font-serif text-sm text-stone-700 dark:text-stone-300 italic">{quote}</p>
                    </blockquote>
                ))}
            </div>
            {pageTitle && (
                <a href={`https://en.wikiquote.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`} target="_blank" rel="noopener noreferrer" className="block mt-4 text-[10px] uppercase font-bold text-academic-accent hover:underline">
                    View on Wikiquote <ExternalLink className="w-3 h-3 inline mb-0.5" />
                </a>
            )}
        </div>
    );
};
