
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ArrowRight, Filter } from 'lucide-react';
import { DailyHistoryEvent } from '../../types';

interface HistoryFeedProps {
    events: DailyHistoryEvent[];
    onNavigate: (type: string, payload: any) => void;
    currentDate?: Date;
    myCountry?: string;
}

const ERAS = ["All", "Ancient", "Medieval", "Modern", "20th Century", "21st Century"];

export const HistoryFeed: React.FC<HistoryFeedProps> = ({ events, onNavigate, currentDate, myCountry }) => {
    const [displayCount, setDisplayCount] = useState(1000);
    const [activeEra, setActiveEra] = useState("All");

    const formattedDate = currentDate ? currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'Today';
    const regionName = myCountry && myCountry !== 'Global Citizen' ? myCountry : 'Global';

    const filteredEvents = useMemo(() => {
        if (activeEra === "All") return events;
        
        return events.filter(e => {
            const year = parseInt(e.year.replace(/[^0-9-]/g, ''));
            const isBCE = e.year.includes("BCE");
            const actualYear = isBCE ? -year : year;

            if (activeEra === "Ancient") return actualYear < 500;
            if (activeEra === "Medieval") return actualYear >= 500 && actualYear < 1500;
            if (activeEra === "Modern") return actualYear >= 1500 && actualYear < 1900;
            if (activeEra === "20th Century") return actualYear >= 1900 && actualYear < 2000;
            if (activeEra === "21st Century") return actualYear >= 2000;
            return true;
        });
    }, [events, activeEra]);

    const loadMore = () => {
        setDisplayCount(prev => prev + 50);
    };

    const visibleEvents = filteredEvents.slice(0, displayCount);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-1 gap-4">
                <h2 className="text-[10px] font-bold text-academic-muted dark:text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {regionName} Timeline Archive: On This Day ({formattedDate})
                </h2>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {ERAS.map(era => (
                        <button
                            key={era}
                            onClick={() => { setActiveEra(era); setDisplayCount(20); }}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap
                            ${activeEra === era 
                                ? 'bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-sm' 
                                : 'bg-transparent text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-400'}`}
                        >
                            {era}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-end mb-4 px-1">
                 <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
                    Showing {visibleEvents.length} of {filteredEvents.length} Records
                </span>
            </div>
            
            <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-4 space-y-8">
                {visibleEvents.map((event, i) => (
                    <div 
                        key={i} 
                        onClick={() => onNavigate('Event', event.title || event.event)} 
                        className="relative pl-8 group cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/30 -mr-6 pr-6 py-4 transition-all rounded-r-lg hover:translate-x-1"
                    >
                        <div className="absolute -left-[7px] top-5 w-3.5 h-3.5 rounded-full bg-stone-50 dark:bg-stone-900 border-2 border-academic-gold group-hover:scale-125 group-hover:bg-academic-gold group-hover:border-white transition-all z-10 shadow-sm"></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                            <span className="text-sm font-mono font-bold text-academic-gold min-w-[60px] group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{event.year}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                                {event.location}
                            </span>
                        </div>
                        
                        <h3 className="font-serif text-lg text-academic-text dark:text-stone-100 mb-2 leading-snug group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors underline-offset-4 group-hover:underline decoration-academic-gold/50">
                        {event.title || event.event}
                        </h3>
                        
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-serif leading-relaxed opacity-90 group-hover:opacity-100 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">
                        {event.description}
                        </p>
                        
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-300 dark:text-stone-600 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100">
                            Read Dossier <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                ))}
            </div>

            {displayCount < filteredEvents.length && (
                <div className="mt-12 text-center">
                    <button 
                        onClick={loadMore}
                        className="px-8 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mx-auto shadow-sm"
                    >
                        Load {Math.min(50, filteredEvents.length - displayCount)} More Events <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {displayCount >= filteredEvents.length && filteredEvents.length > 0 && (
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-mono text-stone-300 dark:text-stone-600 uppercase tracking-widest">End of Archive</p>
                </div>
            )}
        </div>
    );
};
