
import React from 'react';
import { PoliticalEntity } from '../types';
import { Activity } from 'lucide-react';

interface EntityHeaderProps {
  entity: PoliticalEntity;
  onNavigate?: (type: string, payload: any) => void;
}

const EntityHeader: React.FC<EntityHeaderProps> = ({ entity, onNavigate }) => {
  const handleNav = (type: string, term: string) => {
      if (onNavigate) onNavigate(type, term);
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-academic-line dark:border-stone-800 pb-8">
        <div className="max-w-3xl">
           <div className="flex items-center gap-3 mb-4">
                <span 
                    onClick={() => handleNav('Concept', entity.type)}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500 hover:text-academic-accent dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                    {entity.type}
                </span>
                <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600"></span>
                <span 
                    onClick={() => handleNav('Country', entity.jurisdiction)}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500 hover:text-academic-accent dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                    {entity.jurisdiction}
                </span>
           </div>
           <h1 className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-3 tracking-tight">{entity.name}</h1>
           <h2 className="text-sm font-mono text-academic-muted dark:text-stone-400 uppercase tracking-wider mb-6">{entity.officialName}</h2>
           
           <p className="text-lg font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-justify max-w-2xl">
               {entity.description}
           </p>
        </div>
        
        <div className="mt-8 md:mt-0 flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80" onClick={() => handleNav('Concept', entity.status)}>
                <div className={`w-2 h-2 rounded-full ${entity.status === 'Active' ? 'bg-emerald-700 dark:bg-emerald-500' : 'bg-stone-400'}`}></div>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">{entity.status}</span>
            </div>
            <div className="text-right">
                <span className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">Established</span>
                <span className="font-serif text-academic-text dark:text-stone-200">{entity.establishedDate}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EntityHeader;
