import React, { useState, useEffect } from 'react';
import { BookA } from 'lucide-react';

interface DictionaryWidgetProps {
    queryText: string;
}

export const DictionaryWidget: React.FC<DictionaryWidgetProps> = ({ queryText }) => {
    const [wordData, setWordData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Take only the first word
                const word = encodeURIComponent(queryText.split(' ')[0]);
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setWordData(data[0]);
                    }
                }
            } catch (e) {
                console.warn("Dictionary API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || !wordData) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <BookA className="w-4 h-4 text-academic-text dark:text-stone-300" /> Etymology & Definition
            </h3>
            
            <div className="flex flex-col gap-2">
                <div className="flex items-end gap-3 mb-2">
                    <h4 className="font-serif font-bold text-2xl text-stone-900 dark:text-white capitalize">{wordData.word}</h4>
                    {wordData.phonetic && <span className="font-mono text-stone-500 mb-1">{wordData.phonetic}</span>}
                </div>
                
                {wordData.meanings && wordData.meanings.slice(0, 2).map((meaning: any, index: number) => (
                    <div key={index} className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-academic-accent dark:text-indigo-400 mb-2 block">{meaning.partOfSpeech}</span>
                        <ul className="list-disc list-inside space-y-2 text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
                            {meaning.definitions.slice(0, 3).map((def: any, dIndex: number) => (
                                <li key={dIndex}>{def.definition}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
