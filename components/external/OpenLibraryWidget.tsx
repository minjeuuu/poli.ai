import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

interface OpenLibraryWidgetProps {
    queryText: string;
}

export const OpenLibraryWidget: React.FC<OpenLibraryWidgetProps> = ({ queryText }) => {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://openlibrary.org/search.json?q=${q}&limit=4`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.docs) {
                        setBooks(data.docs);
                    }
                }
            } catch (e) {
                console.warn("Open Library API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [queryText]);

    if (loading || books.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-academic-accent" /> Literature Scan
            </h3>
            
            <div className="space-y-4">
                {books.map((book, i) => (
                    <a 
                        key={i} 
                        href={`https://openlibrary.org${book.key}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group"
                    >
                        <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors">{book.title}</h4>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                            <span>{book.author_name ? book.author_name[0] : 'Unknown Author'} • {book.first_publish_year || 'Unknown Year'}</span>
                            <span className="flex items-center gap-1">View Archive <ExternalLink className="w-3 h-3" /></span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
