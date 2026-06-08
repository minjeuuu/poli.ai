
import React from 'react';
import { Users, Utensils, Music, BookOpen } from 'lucide-react';

export const SocietyProfile: React.FC<{ data: any, onNavigate?: (type: string, payload: any) => void }> = ({ data, onNavigate }) => {
    if (!data) return null;
    return (
        <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" /> Societal Fabric</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                    <h5 className="flex items-center gap-2 font-bold text-sm text-stone-700 dark:text-stone-300 mb-4"><Utensils className="w-4 h-4 text-orange-500" /> Cuisine</h5>
                    <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{data.cuisine}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {(data.dishes || []).map((d: string, i: number) => (
                            <span key={i} onClick={() => onNavigate && onNavigate('Concept', d)} className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase rounded">{d}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                    <h5 className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300 mb-4"><Music className="w-4 h-4 text-pink-500" /> Arts & Culture</h5>
                    <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{data.arts}</p>
                </div>
            </div>

            <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded-xl">
                 <h5 className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300 mb-2 text-sm"><BookOpen className="w-4 h-4 text-blue-500" /> Media & Press Freedom</h5>
                 <p className="text-sm font-serif text-stone-600 dark:text-stone-400">{data.mediaFreedom}</p>
            </div>
        </div>
    );
};
