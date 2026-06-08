
import React from 'react';
import { DetailedTimelineEvent } from '../../../types';

export const TimelineVertical: React.FC<{ events: DetailedTimelineEvent[], onNavigate?: (type: string, payload: any) => void }> = ({ events, onNavigate }) => {
    if (!events || events.length === 0) return null;
    return (
        <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-3 md:ml-6 space-y-12 pl-6 md:pl-10 py-8">
            {events.map((event, i) => (
                <div key={i} className="relative group cursor-pointer" onClick={() => onNavigate && onNavigate('Event', event.title)}>
                    <div className="absolute -left-[31px] md:-left-[47px] top-1 w-4 h-4 bg-stone-50 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-600 rounded-full group-hover:border-academic-gold group-hover:bg-academic-gold transition-all z-10"></div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                        <span className="text-sm font-mono font-bold text-academic-gold">{event.year}</span>
                        {event.month && <span className="text-xs font-mono text-stone-400 uppercase">{event.month}</span>}
                    </div>
                    <h4 className="text-xl font-serif font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{event.title}</h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-500 mb-3 mt-1">{event.type}</span>
                    <p className="text-sm text-stone-600 dark:text-stone-400 font-serif leading-relaxed text-justify">{event.description}</p>
                </div>
            ))}
        </div>
    );
};
