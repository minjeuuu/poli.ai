import { ImageWithFallback } from '../../atoms/ImageWithFallback';

import React from 'react';
import { ArrowLeft, Flag } from 'lucide-react';
import { CountryDeepDive } from '../../../types';

interface CountryHeroProps {
    data: CountryDeepDive;
    onBack: () => void;
}

export const CountryHero: React.FC<CountryHeroProps> = ({ data, onBack }) => (
    <div className="relative h-80 w-full overflow-hidden bg-stone-900 group">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-academic-bg dark:from-stone-950 via-transparent to-transparent"></div>
        
        {data.imageArchive && data.imageArchive.length > 0 && (
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <ImageWithFallback src={data.imageArchive[0].url} className="w-full h-full object-cover grayscale" alt="Background" />
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 z-10">
            <div className="flex items-end gap-6">
                <div className="w-32 h-20 bg-stone-800 rounded-lg shadow-2xl border-2 border-white dark:border-stone-700 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                    {data.identity.flag?.imageUrl ? (
                        <ImageWithFallback src={data.identity.flag.imageUrl} className="w-full h-full object-cover" alt="Flag" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400"><Flag className="w-8 h-8" /></div>
                    )}
                </div>
                <div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-academic-text dark:text-stone-100 leading-none mb-2 drop-shadow-sm tracking-tight">{data.identity.commonName}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-widest text-stone-600 dark:text-stone-400">
                        <span>{data.identity.officialName}</span>
                        <span className="w-1 h-1 bg-academic-gold rounded-full"></span>
                        <span>{data.identity.isoCodes.alpha3}</span>
                        <span className="w-1 h-1 bg-academic-gold rounded-full"></span>
                        <span>{data.government.form}</span>
                    </div>
                </div>
            </div>
        </div>

        <button onClick={onBack} className="absolute top-4 left-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors z-50">
            <ArrowLeft className="w-6 h-6" />
        </button>
    </div>
);
