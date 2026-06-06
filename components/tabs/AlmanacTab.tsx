
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Clock, Users, FileText, Globe, Scale, Flame, RefreshCcw, Scroll, Vote, UserPlus, UserMinus, Shuffle, Search, Award } from 'lucide-react';
import { AlmanacData, PoliticalCalendarEvent } from '../../types';
import { fetchDailyAlmanac, fetchUpcomingCalendar } from '../../services/almanacService';
import LoadingScreen from '../LoadingScreen';
import { playSFX } from '../../services/soundService';
import AlmanacDetailScreen from '../AlmanacDetailScreen';
import { resolveSearchQuery } from '../../utils/searchLogic';

interface AlmanacTabProps {
  onNavigate: (type: string, payload: any) => void;
}

const AlmanacTab: React.FC<AlmanacTabProps> = ({ onNavigate }) => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<AlmanacData | null>(null);
  const [calendar, setCalendar] = useState<PoliticalCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'Day' | 'Calendar'>('Day');
  
  // Drill Down
  const [selectedEra, setSelectedEra] = useState<string | null>(null); // For detail screen reuse
  
  // Fetch Data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      
      const [almanac, cal] = await Promise.all([
          fetchDailyAlmanac(currentDate),
          fetchUpcomingCalendar()
      ]);
      
      if (mounted) {
        setData(almanac);
        setCalendar(cal);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentDate]);

  // Handlers
  const handleDateChange = (days: number) => {
      playSFX('click');
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      setCurrentDate(newDate);
  };

  const handleRandomDate = () => {
      playSFX('swoosh');
      const start = new Date(1900, 0, 1);
      const end = new Date();
      const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      setCurrentDate(randomDate);
  };

  const handleEntityClick = (entity: string) => {
      // Use the smart resolver to decide where to go
      const { type, payload } = resolveSearchQuery(entity);
      onNavigate(type, payload); 
  };

  if (loading) return <div className="h-full bg-academic-bg dark:bg-stone-950"><LoadingScreen message="Accessing Global Chronos..." /></div>;

  return (
    <>
    <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 overflow-hidden animate-in fade-in">
        
        {/* HEADER */}
        <div className="flex-none p-4 sm:p-6 border-b border-academic-line dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm relative z-20">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500 text-white rounded-lg shadow-md hidden sm:block">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-academic-text dark:text-stone-100">Political Almanac</h1>
                        <p className="text-[10px] sm:text-xs font-mono text-stone-500 uppercase tracking-widest">The Living Record</p>
                    </div>
                </div>
                <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-lg self-start sm:self-auto">
                    <button onClick={() => setActiveView('Day')} className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-colors ${activeView === 'Day' ? 'bg-white dark:bg-stone-700 shadow-sm text-academic-accent dark:text-indigo-400' : 'text-stone-400'}`}>Day View</button>
                    <button onClick={() => setActiveView('Calendar')} className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-colors ${activeView === 'Calendar' ? 'bg-white dark:bg-stone-700 shadow-sm text-academic-accent dark:text-indigo-400' : 'text-stone-400'}`}>Upcoming</button>
                </div>
            </div>

            {activeView === 'Day' && (
                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                    <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-stone-500" /></button>
                    <div className="text-center group cursor-pointer relative">
                        <span className="text-xs font-bold uppercase text-stone-400 block tracking-widest group-hover:text-academic-gold transition-colors">Current Record</span>
                        <h2 className="text-xl font-serif font-bold text-academic-text dark:text-stone-100">{currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                        <input 
                            type="date" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setCurrentDate(new Date(e.target.value))}
                        />
                    </div>
                    <div className="flex gap-2">
                         <button onClick={handleRandomDate} className="p-2 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors text-stone-500 hover:text-academic-accent" title="Random Date"><Shuffle className="w-5 h-5" /></button>
                         <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-stone-500" /></button>
                    </div>
                </div>
            )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth pb-32">
            
            {activeView === 'Day' && data ? (
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* CONTEXT */}
                    <section className="bg-academic-paper dark:bg-stone-900 p-8 rounded-2xl shadow-sm border-l-4 border-academic-gold">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Historical Synthesis</h3>
                        <p className="font-serif text-lg leading-loose text-stone-800 dark:text-stone-200">{data.context}</p>
                    </section>

                    {/* CATEGORY GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AlmanacSection title="Major Events" icon={Clock} color="text-academic-accent" items={data.historicalEvents} onNavigate={handleEntityClick} />
                        <AlmanacSection title="Treaties & Pacts" icon={Scroll} color="text-emerald-600" items={data.treaties} onNavigate={handleEntityClick} />
                        <AlmanacSection title="Laws & Acts" icon={Scale} color="text-indigo-600" items={data.laws} onNavigate={handleEntityClick} />
                        <AlmanacSection title="Revolutions" icon={Flame} color="text-rose-600" items={data.revolutions} onNavigate={handleEntityClick} />
                        <AlmanacSection title="Elections" icon={Vote} color="text-blue-600" items={data.elections} onNavigate={handleEntityClick} />
                        <AlmanacSection title="Constitutions" icon={FileText} color="text-amber-600" items={data.constitutions} onNavigate={handleEntityClick} />
                    </div>

                    {/* PEOPLE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2"><UserPlus className="w-4 h-4 text-green-500" /> Born on this Day</h3>
                            <div className="space-y-4">
                                {data.births.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start group">
                                        <span className="font-mono text-xs font-bold text-stone-400 min-w-[40px]">{item.year}</span>
                                        <div>
                                            <span className="font-bold text-sm text-stone-800 dark:text-stone-200 block group-hover:text-academic-accent cursor-pointer" onClick={() => onNavigate('Person', item.title)}>{item.title}</span>
                                            <span className="text-xs text-stone-500 dark:text-stone-400">{item.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2"><UserMinus className="w-4 h-4 text-stone-400" /> Died on this Day</h3>
                            <div className="space-y-4">
                                {data.deaths.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start group">
                                        <span className="font-mono text-xs font-bold text-stone-400 min-w-[40px]">{item.year}</span>
                                        <div>
                                            <span className="font-bold text-sm text-stone-800 dark:text-stone-200 block group-hover:text-academic-accent cursor-pointer" onClick={() => onNavigate('Person', item.title)}>{item.title}</span>
                                            <span className="text-xs text-stone-500 dark:text-stone-400">{item.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                    {calendar.length === 0 ? (
                        <div className="text-center py-20 opacity-50">No upcoming events found.</div>
                    ) : (
                        <div className="space-y-4">
                            {calendar.map((event, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                                        <span className="text-xs font-bold uppercase text-red-500">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-2xl font-bold text-stone-800 dark:text-stone-200">{new Date(event.date).getDate()}</span>
                                        <span className="text-[10px] text-stone-400">{new Date(event.date).getFullYear()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                ${event.type === 'Election' ? 'bg-blue-100 text-blue-700' : 
                                                  event.type === 'Summit' ? 'bg-purple-100 text-purple-700' :
                                                  'bg-stone-100 text-stone-600'}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{event.country}</span>
                                        </div>
                                        <h3 className="text-lg font-serif font-bold text-academic-text dark:text-stone-100 mb-2">{event.title}</h3>
                                        <p className="text-sm text-stone-600 dark:text-stone-400">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    </div>

    {selectedEra && (
        <AlmanacDetailScreen 
            mode="Era" 
            title={selectedEra} 
            onClose={() => setSelectedEra(null)} 
        />
    )}
    </>
  );
};

const AlmanacSection = ({ title, icon: Icon, color, items, onNavigate }: any) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${color}`}>
                <Icon className="w-4 h-4" /> {title}
            </h3>
            <div className="space-y-4">
                {items.map((item: any, i: number) => (
                    <div key={i} className="group cursor-pointer" onClick={() => onNavigate(item.title)}>
                        <div className="flex justify-between items-baseline mb-1">
                             <span className="font-bold text-sm text-stone-800 dark:text-stone-200 group-hover:underline decoration-stone-300 underline-offset-4">{item.title}</span>
                             <span className="font-mono text-xs text-stone-400 bg-stone-50 dark:bg-stone-800 px-1.5 rounded">{item.year}</span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AlmanacTab;
