import { ImageWithFallback } from '../../atoms/ImageWithFallback';

import React, { useState } from 'react';
import { CountryImageArchive } from '../../../types';

export const ImageArchiveGrid: React.FC<{ images: CountryImageArchive[] }> = ({ images }) => {
    if (!images || images.length === 0) return <div className="p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-stone-400">No archival images available.</div>;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-stone-200 dark:border-stone-800">
                    <ImageWithFallback src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <span className="text-[9px] font-bold uppercase text-academic-gold mb-1">{img.year}</span>
                        <h4 className="text-white font-serif text-sm leading-tight">{img.title}</h4>
                        <span className="text-[8px] text-stone-300 mt-1 uppercase tracking-wider">{img.category}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
