
import React, { useState, useRef, useEffect } from 'react';
import { DailyContext, HighlightedEntity, SavedItem } from '../../types';
import { ChevronLeft, ChevronRight, Bookmark, Archive, Trash2, MoreHorizontal, Sparkles, Shuffle, Globe } from 'lucide-react';
import HighlightDetailScreen from '../HighlightDetailScreen';
import { COUNTRIES_DATA } from '../../data/countriesData';
import { PERSONS_HIERARCHY } from '../../data/personsData';
import { THEORY_HIERARCHY } from '../../data/theoryData';
import { playSFX } from '../../services/soundService';
import LoadingScreen from '../LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';

// WIDGET IMPORTS
import { HistoryFeed } from '../home/HistoryFeed';
import { TriviaWidget } from '../home/TriviaWidget';
import { NewsWidget } from '../home/NewsWidget';
import { QuoteWidget } from '../home/QuoteWidget';
import { DashboardGrid } from '../home/DashboardGrid';
import { SynthesisWidget } from '../home/SynthesisWidget';

interface HomeTabProps {
  data: DailyContext | null;
  isLoading: boolean;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNavigate: (type: string, payload: any) => void;
  savedItems: SavedItem[];
  onDeleteSaved: (id: string) => void;
  initialSubTab?: 'Today' | 'Highlights' | 'History' | 'Saved';
  myCountry?: string;
}

const flattenPersons = (nodes: any[]): any[] => {
    let persons: any[] = [];
    nodes.forEach(node => {
        if (node.type === 'Person') persons.push(node);
        if (node.items) persons = persons.concat(flattenPersons(node.items));
    });
    return persons;
};

const flattenTheories = () => THEORY_HIERARCHY.flatMap(cat => cat.items);

const HomeTab: React.FC<HomeTabProps> = ({ 
    data, 
    isLoading, 
    currentDate, 
    onDateChange, 
    onNavigate,
    savedItems,
    onDeleteSaved,
    initialSubTab,
    myCountry
}) => {
  const [subTab, setSubTab] = useState<'Today' | 'Highlights' | 'History' | 'Saved'>('Today');
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightedEntity | null>(null);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  useEffect(() => {
      if (initialSubTab) {
          setSubTab(initialSubTab);
      }
  }, [initialSubTab]);

  const handlePrevDay = () => {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      onDateChange(prev);
  };

  const handleNextDay = () => {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      onDateChange(next);
  };

  const handleArchive = (id: string) => {
      onDeleteSaved(id);
      setToast({ visible: true, message: 'Item Archived' });
      setActiveMenuId(null);
      setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const handleDelete = (id: string) => {
      onDeleteSaved(id);
      setToast({ visible: true, message: 'Item Deleted' });
      setActiveMenuId(null);
      setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const handleSurpriseMe = () => {
      playSFX('swoosh');
      const modes = ['Country', 'Person', 'Ideology', 'Theory'];
      const mode = modes[Math.floor(Math.random() * modes.length)];

      let target: any = null;
      let targetType = '';

      switch (mode) {
          case 'Country':
              target = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
              targetType = 'Country';
              break;
          case 'Person':
              const allPersons = flattenPersons(PERSONS_HIERARCHY);
              target = allPersons[Math.floor(Math.random() * allPersons.length)];
              targetType = 'Person';
              break;
          case 'Ideology':
          case 'Theory':
              const allTheories = flattenTheories();
              target = allTheories[Math.floor(Math.random() * allTheories.length)];
              targetType = target.type === 'Ideology' ? 'Ideology' : 'Concept';
              break;
      }

      if (target) {
          onNavigate(targetType, target.name || target.title);
      }
  };
  
  // --- RENDERERS ---

  const renderToday = () => {
      if (!data) return null;
      
      return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="space-y-12"
        >
          
          {/* SURPRISE BUTTON */}
          <div className="flex justify-center px-4 md:px-0 mb-4">
            <button
                onClick={handleSurpriseMe}
                className="
                  group relative overflow-hidden
                  w-full md:w-auto md:min-w-[280px] py-3 px-8
                  rounded-full transition-all duration-300 ease-out
                  active:scale-[0.98]
                  flex items-center justify-center gap-3
                  shadow-sm hover:shadow-md
                  bg-gradient-to-r from-stone-50 via-white to-stone-50
                  border border-stone-200
                  text-stone-500 font-bold uppercase tracking-[0.2em] text-xs
                  hover:border-academic-gold/50 hover:text-academic-gold
                  dark:bg-none dark:bg-stone-900
                  dark:border-stone-800
                  dark:text-stone-400
                  dark:hover:border-indigo-500/50 dark:hover:text-indigo-300
                  dark:hover:bg-stone-800
                "
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-academic-gold/5 to-transparent dark:via-indigo-500/10"></div>
                <Sparkles className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity group-hover:animate-pulse" /> 
                <span className="relative z-10">Surprise Me</span>
                <Shuffle className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <QuoteWidget quote={data.quote} onNavigate={onNavigate} />
          
          <NewsWidget news={data.news} onNavigate={onNavigate} />

          <DashboardGrid data={data} onNavigate={onNavigate} />

          <TriviaWidget 
            fact={data.dailyFact} 
            trivia={data.dailyTrivia} 
            onNavigate={onNavigate} 
          />

          <SynthesisWidget text={data.synthesis} />

        </motion.div>
      );
  };

  const renderHistory = () => {
      if (!data) return null;
      return (
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -15 }}
           transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        >
            <HistoryFeed events={data.historicalEvents} onNavigate={onNavigate} currentDate={currentDate} myCountry={myCountry} />
        </motion.div>
      );
  };

  const renderSaved = () => {
      return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          >
              {savedItems.length === 0 ? (
                  <div className="text-center py-20 opacity-50 flex flex-col items-center">
                      <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-3" />
                      <p className="font-serif italic text-stone-500 dark:text-stone-400">No items saved yet.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {savedItems.map((item, i) => (
                          <motion.div 
                              key={item.id} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="bg-white dark:bg-stone-900 border border-academic-line dark:border-stone-800 p-4 flex justify-between items-start group hover:border-academic-accent dark:hover:border-indigo-500 transition-colors cursor-pointer relative rounded-lg shadow-sm"
                          >
                              <div 
                                className="flex-1 pr-4"
                                onClick={() => {
                                    onNavigate(item.type, item.title);
                                }}
                              >
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-academic-gold mb-1 block">{item.type}</span>
                                  <h3 className="font-serif font-bold text-academic-text dark:text-stone-100 mb-1">{item.title}</h3>
                                  <p className="text-xs text-stone-500 dark:text-stone-400">{item.subtitle}</p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                                className="p-2 -mr-2 text-stone-300 hover:text-academic-text dark:hover:text-stone-100 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                              >
                                  <MoreHorizontal className="w-5 h-5" />
                              </button>
                              
                              <AnimatePresence>
                                  {activeMenuId === item.id && (
                                      <motion.div 
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.95 }}
                                          className="absolute right-4 top-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-20 min-w-[120px] rounded-md overflow-hidden"
                                      >
                                          <button onClick={(e) => { e.stopPropagation(); handleArchive(item.id); }} className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2">
                                              <Archive className="w-3 h-3" /> Archive
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700"
                                          >
                                              <Trash2 className="w-3 h-3" /> Delete
                                          </button>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </motion.div>
                      ))}
                  </div>
              )}
          </motion.div>
      )
  }

  // --- OVERLAYS ---
  if (selectedHighlight) return <HighlightDetailScreen highlight={selectedHighlight} onBack={() => setSelectedHighlight(null)} dateString={currentDate.toLocaleDateString()} />;

  // Standard View
  return (
    <div className="h-full overflow-y-auto scroll-smooth bg-academic-bg dark:bg-stone-950 transition-colors relative pb-32">
      {/* TOAST */}
      <div 
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[70] flex items-center gap-3 px-6 py-3 bg-academic-accent dark:bg-indigo-600 text-white rounded-full shadow-xl transition-all duration-500 ease-out pointer-events-none
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <div className="px-4 md:px-8 pt-4 pb-2 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevDay} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95"><ChevronLeft className="w-5 h-5 text-stone-400 dark:text-stone-500" /></button>
            <div className="flex flex-col items-center cursor-pointer group px-4 py-1 rounded-xl active:bg-stone-100 dark:active:bg-stone-800 transition-all" onClick={() => onDateChange(new Date())}>
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{isLoading ? 'Loading...' : 'Daily Briefing'}</span>
                 <h2 className="font-serif text-lg font-bold text-academic-text dark:text-stone-100">{currentDate.toLocaleDateString(undefined, {month:'long', day:'numeric'})}</h2>
            </div>
            <button onClick={handleNextDay} className="p-2 -mr-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95"><ChevronRight className="w-5 h-5 text-stone-400 dark:text-stone-500" /></button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['Today', 'Highlights', 'History', 'Saved'].map((tab) => (
                <button key={tab} onClick={() => setSubTab(tab as any)} className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full border transition-all duration-300 whitespace-nowrap active:scale-95
                ${subTab === tab ? 'bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 border-academic-text dark:border-stone-100 shadow-md' : 'bg-transparent text-stone-400 dark:text-stone-500 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'}`}>{tab}</button>
            ))}
        </div>
      </div>

      <div className="p-4 md:p-8 pt-6">
          <AnimatePresence mode="wait">
              {isLoading ? (
                  <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 h-full"
                  >
                       <LoadingScreen message="Synthesizing Global Archive..." />
                  </motion.div>
              ) : (
                  <motion.div 
                      key="content"
                      className="min-h-full"
                  >
                    <AnimatePresence mode="wait">
                        {subTab === 'Today' && <motion.div key="today">{renderToday()}</motion.div>}
                        {subTab === 'History' && <motion.div key="history">{renderHistory()}</motion.div>}
                        {subTab === 'Saved' && <motion.div key="saved">{renderSaved()}</motion.div>}
                        {subTab === 'Highlights' && (
                            <motion.div 
                                key="highlights"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-stone-400 dark:text-stone-600 py-10 font-serif italic flex items-center justify-center h-40"
                            >
                                Curated highlights from global archives.
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default HomeTab;
