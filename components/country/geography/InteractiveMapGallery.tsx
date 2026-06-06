import { ImageWithFallback } from '../../atoms/ImageWithFallback';

import React from 'react';
import { CountryMapData } from '../../../types';

export const InteractiveMapGallery: React.FC<{ maps: CountryMapData[] }> = ({ maps }) => {
    if (!maps || maps.length === 0) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {maps.map((map, i) => (
                <div key={i} className="group relative aspect-video bg-stone-100 dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm cursor-pointer">
                    <ImageWithFallback src={map.imageUrl} alt={map.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-academic-gold mb-1">{map.type} Map</span>
                        <h4 className="text-white font-serif font-bold">{map.title}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
};
