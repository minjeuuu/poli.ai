import { ImageWithFallback } from '../atoms/ImageWithFallback';
import React, { useState, useEffect } from 'react';
import { Palette, ExternalLink } from 'lucide-react';

interface ArtInstituteChicagoWidgetProps {
    queryText: string;
}

export const ArtInstituteChicagoWidget: React.FC<ArtInstituteChicagoWidgetProps> = ({ queryText }) => {
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArt = async () => {
            try {
                const q = encodeURIComponent(queryText);
                const url = `https://api.artic.edu/api/v1/artworks/search?q=${q}&limit=4&fields=id,title,artist_title,image_id`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setArtworks(data.data.filter((item: any) => item.image_id));
                    }
                }
            } catch (e) {
                console.warn("Art Institute of Chicago API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchArt();
    }, [queryText]);

    if (loading || artworks.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-academic-accent" /> Cultural Artifacts (Art Institute of Chicago API)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artworks.slice(0, 4).map((art, i) => {
                    const imageUrl = `https://www.artic.edu/iiif/2/${art.image_id}/full/400,/0/default.jpg`;
                    const linkUrl = `https://www.artic.edu/artworks/${art.id}`;
                    
                    return (
                        <a 
                            key={i} 
                            href={linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block bg-stone-50 dark:bg-stone-800/50 rounded-xl overflow-hidden hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 group h-full"
                        >
                            <div className="aspect-square w-full relative overflow-hidden bg-stone-200 dark:bg-stone-800">
                                <ImageWithFallback src={imageUrl} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-4">
                                <h4 className="text-sm font-bold font-serif text-academic-text dark:text-stone-200 mb-1 leading-snug group-hover:text-academic-accent transition-colors line-clamp-2">{art.title}</h4>
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400">
                                    <span>{art.artist_title || 'Unknown Artist'}</span>
                                    <span className="flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
