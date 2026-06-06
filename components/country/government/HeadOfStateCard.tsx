import { ImageWithFallback } from '../../atoms/ImageWithFallback';

import React from 'react';
import { User } from 'lucide-react';

export const HeadOfStateCard: React.FC<{ data: any, onNavigate: (t:string, p:any)=>void }> = ({ data, onNavigate }) => (
   <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-6 shadow-sm group hover:border-academic-gold transition-colors">
       <div className="w-24 h-24 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden flex-shrink-0 border-4 border-white dark:border-stone-700 shadow-md">
           {data.imageUrl ? (
               <ImageWithFallback src={data.imageUrl} className="w-full h-full object-cover" alt={data.name} />
           ) : (
               <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-stone-400" /></div>
           )}
       </div>
       <div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-academic-gold mb-1 block">{data.title}</span>
           <h3 
                className="text-2xl font-serif font-bold text-academic-text dark:text-stone-100 mb-1 cursor-pointer hover:underline decoration-academic-gold underline-offset-4" 
                onClick={() => onNavigate('Person', data.name)}
            >
                {data.name}
           </h3>
           <div className="flex gap-2 text-xs text-stone-500 mt-2">
                <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">{data.party}</span>
                <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">{data.since}</span>
           </div>
       </div>
   </div>
);
