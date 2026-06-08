import React, { useState, useEffect } from 'react';
import { Rocket, ExternalLink } from 'lucide-react';

interface NasaImageWidgetProps {
    queryText: string;
}

export const NasaImageWidget: React.FC<NasaImageWidgetProps> = ({ queryText }) => {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(queryText)}&media_type=image`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.collection && data.collection.items && data.collection.items.length > 0) {
                        setImages(data.collection.items.slice(0, 3));
                    }
                }
            } catch (e) {
                console.warn("NASA API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || images.length === 0) return null;

    return (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-xl mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-blue-500" /> Space Archives
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((item, idx) => {
                     const data = item.data?.[0];
                     const link = item.links?.[0]?.href;

                     if (!data || !link) return null;

                     return (
                         <div key={idx} className="group relative rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex flex-col h-64">
                              <img src={link} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4">
                                  <h4 className="font-serif font-bold text-sm text-white mb-1 line-clamp-2">{data.title}</h4>
                                  <p className="text-[10px] font-mono text-stone-400 uppercase">{data.date_created?.substring(0, 4)} • {data.center}</p>
                              </div>
                         </div>
                     );
                })}
            </div>
        </div>
    );
};
