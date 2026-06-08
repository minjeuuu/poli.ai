import React, { useState, useEffect } from 'react';
import { Palette, ExternalLink } from 'lucide-react';

interface MetMuseumWidgetProps {
    queryText: string;
}

export const MetMuseumWidget: React.FC<MetMuseumWidgetProps> = ({ queryText }) => {
    const [artwork, setArtwork] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // First search for object IDs
                const searchRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(queryText)}&hasImages=true`);
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData && searchData.objectIDs && searchData.objectIDs.length > 0) {
                        // Pick the first result to display
                        const objectId = searchData.objectIDs[0];
                        const itemRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
                        if (itemRes.ok) {
                            const itemData = await itemRes.json();
                            setArtwork(itemData);
                        }
                    }
                }
            } catch (e) {
                console.warn("Met Museum API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || !artwork || !artwork.primaryImageSmall) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-academic-accent" /> Metropolitan Museum of Art
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-64 shrink-0 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                    <img 
                        src={artwork.primaryImageSmall} 
                        alt={artwork.title} 
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" 
                    />
                </div>
                <div className="flex flex-col justify-center">
                     <h4 className="font-serif font-bold text-xl text-stone-800 dark:text-stone-200 leading-tight mb-2">{artwork.title}</h4>
                     {artwork.artistDisplayName && (
                         <p className="text-sm font-bold text-stone-600 dark:text-stone-400 mb-1">{artwork.artistDisplayName} {artwork.artistDisplayBio && <span className="text-stone-400 font-normal">({artwork.artistDisplayBio})</span>}</p>
                     )}
                     <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-stone-500 mt-4">
                         {artwork.objectDate && <span>Date: {artwork.objectDate}</span>}
                         {artwork.medium && <span>Medium: {artwork.medium}</span>}
                     </div>
                     {artwork.creditLine && (
                         <p className="text-[10px] mt-2 text-stone-400">{artwork.creditLine}</p>
                     )}
                     <a href={artwork.objectURL} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors inline-block text-center w-max">
                         View in Met Collection <ExternalLink className="w-3 h-3 inline ml-1 mb-0.5" />
                     </a>
                </div>
            </div>
        </div>
    );
};
