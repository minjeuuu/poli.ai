import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface WikidataWidgetProps {
    queryText: string;
}

export const WikidataWidget: React.FC<WikidataWidgetProps> = ({ queryText }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWiki = async () => {
            try {
                const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryText)}&utf8=&format=json&origin=*`);
                const searchData = await searchRes.json();
                if (searchData.query?.search?.length > 0) {
                    const pageTitle = searchData.query.search[0].title;
                    const extractRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                    const extractData = await extractRes.json();
                    if (extractData.extract) {
                        setSummary(extractData.extract);
                        setUrl(extractData.content_urls?.desktop?.page || null);
                    }
                }
            } catch (e) {
                console.warn("Wikimedia API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchWiki();
    }, [queryText]);

    if (loading || !summary) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-academic-accent" /> Encyclopedic Context (Wikipedia API)
            </h3>
            <p className="text-sm font-serif text-academic-text dark:text-stone-300 leading-relaxed mb-4">
                {summary}
            </p>
            {url && (
                <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-academic-accent hover:underline uppercase tracking-widest">
                    Read more on Wikipedia &rarr;
                </a>
            )}
        </div>
    );
};
