
import React from 'react';
import { PoliticalEvent } from '../types';

interface TimelineProps {
  events: PoliticalEvent[];
  onEventClick?: (title: string) => void;
}

// Defensive helper to prevent object-as-child crash
const safeText = (val: any): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && val !== null) {
        // Try common keys if the AI hallucinated an object structure
        return val.title || val.name || val.period || val.date || JSON.stringify(val);
    }
    return '';
};

const Timeline: React.FC<TimelineProps> = ({ events, onEventClick }) => {
  const sortedEvents = [...events].sort((a, b) => {
      if (!a || !b) return 0;
      return new Date(safeText(a.date)).getTime() - new Date(safeText(b.date)).getTime();
  });

  return (
    <div className="mt-8">
      <h3 className="text-xs font-bold text-academic-muted dark:text-stone-500 uppercase tracking-widest mb-8">
        Chronological Sequence
      </h3>
      <div className="relative border-l border-stone-200 dark:border-stone-800 ml-2 space-y-12 pb-4">
        {sortedEvents.map((event, index) => {
          if (!event) return null;
          return (
          <div 
            key={index} 
            className={`relative pl-8 group transition-all duration-300 ${onEventClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
            onClick={() => onEventClick && onEventClick(safeText(event.title))}
          >
            {/* Timeline Node - Subtle */}
            <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-academic-bg dark:bg-stone-950 border border-stone-400 dark:border-stone-600 group-hover:bg-academic-accent dark:group-hover:bg-indigo-500 group-hover:border-academic-accent dark:group-hover:border-indigo-500 transition-colors shadow-sm"></div>

            <div className="flex flex-col mb-2">
              <span className="font-mono text-xs text-stone-500 dark:text-stone-400 mb-1 block group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{safeText(event.date)}</span>
              <h4 className="text-xl font-serif font-medium text-academic-text dark:text-stone-100 leading-snug group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors decoration-academic-gold/50 group-hover:underline decoration-1 underline-offset-4">{safeText(event.title)}</h4>
            </div>

            <div className="flex items-center gap-2 mb-3">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-academic-gold border border-academic-gold/30 px-2 py-0.5 rounded-full bg-academic-gold/5 dark:bg-academic-gold/10">
                  {safeText(event.type)}
                </span>
            </div>

            <p className="text-stone-600 dark:text-stone-400 font-serif text-sm leading-relaxed text-justify max-w-prose mb-3 group-hover:text-stone-800 dark:group-hover:text-stone-200">
              {safeText(event.description)}
            </p>

            {event.outcome && (
                <div className="text-sm text-stone-800 dark:text-stone-300 italic pl-3 border-l-2 border-stone-200 dark:border-stone-700 py-1 bg-stone-50/50 dark:bg-stone-900/50">
                    {safeText(event.outcome)}
                </div>
            )}
            
            {/* Minimal Citations */}
             {event.citations && event.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {event.citations.map((cite, i) => (
                        <span key={i} className="text-[10px] text-stone-400 dark:text-stone-500 font-serif hover:text-academic-text dark:hover:text-stone-300 transition-colors cursor-help border-b border-dotted border-stone-300 dark:border-stone-700">
                            [{i + 1}] {safeText(cite.source)}
                        </span>
                    ))}
                </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
};

export default Timeline;
