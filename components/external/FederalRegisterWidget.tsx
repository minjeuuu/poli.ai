import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface FederalRegisterWidgetProps {
    queryText: string;
}

export const FederalRegisterWidget: React.FC<FederalRegisterWidgetProps> = ({ queryText }) => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFederalRegister = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://www.federalregister.gov/api/v1/documents.json?conditions[term]=${q}&per_page=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results) {
                        setDocuments(data.results);
                    }
                }
            } catch (e) {
                console.warn("Federal Register API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFederalRegister();
    }, [queryText]);

    if (loading || documents.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-academic-accent" /> Federal Register Documents (US API)
            </h3>
            
            <div className="space-y-4">
                {documents.map((doc, i) => (
                    <a 
                        key={i} 
                        href={doc.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                    >
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{doc.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>{doc.type} • {doc.publication_date}</span>
                            <span className="flex items-center gap-1">View Gov Doc <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
