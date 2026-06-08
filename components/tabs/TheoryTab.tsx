
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { THEORY_HIERARCHY, TheoryCategory, TheoryItem } from '../../data/theoryData';
import { ArrowLeft, ChevronRight, Search, BookOpen, Lightbulb, Building2, Brain, Filter, ArrowUp, History, Layers, Activity, Users, Zap, Hexagon, MoreHorizontal, Bookmark, ArrowRightLeft } from 'lucide-react';
import IdeologyDetailScreen from '../IdeologyDetailScreen';
import ConceptDetailModal from '../ConceptDetailModal';

// --- ICONS MAPPING ---
const getIconForType = (type: string) => {
    switch (type) {
        case 'Ideology': return Lightbulb;
        case 'Theory': return Brain;
        case 'Philosophy': return BookOpen;
        case 'System': return Building2;
        case 'School': return Users;
        case 'Movement': return Activity;
        case 'Method': return Filter;
        case 'Tradition': return History;
        default: return Layers;
    }
};

const getColorForType = (type: string) => {
    switch (type) {
        case 'Ideology': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        case 'Theory': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800';
        case 'System': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
        default: return 'text-stone-500 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700';
    }
};

interface TheoryTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave: (item: any) => void;
  isSaved: (title: string, type: string) => boolean;
  initialItem?: string;
}

const TheoryTab: React.FC<TheoryTabProps> = ({ onNavigate, onAddToCompare, onToggleSave, isSaved, initialItem }) => {
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<TheoryCategory | null>(null);
  
  // Drill Down State
  const [selectedItem, setSelectedItem] = useState<TheoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // --- DEEP LINKING ---
  useEffect(() => {
      if (initialItem) {
          // Attempt to find the item
          let foundItem: TheoryItem | null = null;
          let foundCat: TheoryCategory | null = null;

          for (const cat of THEORY_HIERARCHY) {
              const item = cat.items.find(i => i.name === initialItem);
              if (item) {
                  foundItem = item;
                  foundCat = cat;
                  break;
              }
          }

          if (foundItem) {
              setSelectedItem(foundItem);
              setActiveCategory(foundCat);
          } else {
              // Fallback: Just try to open concept modal even if not in static list
              setSelectedItem({ name: initialItem, type: 'Concept' });
          }
      }
  }, [initialItem]);


  // --- FILTERING & GROUPING LOGIC ---

  const filteredItems = useMemo(() => {
      if (!activeCategory) return [];
      if (!searchQuery) return activeCategory.items;
      const lowerQuery = searchQuery.toLowerCase();
      return activeCategory.items.filter(item => 
          item.name.toLowerCase().includes(lowerQuery) || 
          item.origin?.toLowerCase().includes(lowerQuery) ||
          item.era?.toLowerCase().includes(lowerQuery)
      );
  }, [activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
      const groups: Record<string, TheoryItem[]> = {};
      filteredItems.forEach(item => {
          if (!item || !item.name) return;
          const letter = (item.name || '').charAt(0).toUpperCase();
          const key = /[A-Z]/.test(letter) ? letter : '#';
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
      });
      return groups;
  }, [filteredItems]);

  const sortedKeys = Object.keys(groupedItems).sort();

  // --- HANDLERS ---
  const handleCategoryClick = (category: TheoryCategory) => {
      setActiveCategory(category);
      setSearchQuery('');
  };

  const handleBack = () => {
      if (selectedItem) {
          setSelectedItem(null);
      } else if (activeCategory) {
          setActiveCategory(null);
      }
  };

  const scrollToLetter = (letter: string) => {
      const el = document.getElementById(`section-${letter}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSave = (item: TheoryItem) => {
      onToggleSave({ 
          id: `saved_${item.type}_${Date.now()}`, 
          type: item.type === 'Ideology' ? 'Ideology' : 'Theory', 
          title: item.name, 
          subtitle: item.type, 
          dateAdded: new Date().toLocaleDateString() 
      });
      setActiveMenu(null);
  };

  const handleCompare = (item: TheoryItem) => {
      onAddToCompare(item.name, item.type);
      setActiveMenu(null);
  };

  // --- RENDERERS ---

  const renderMenu = (item: TheoryItem) => (
      <div className="absolute right-2 top-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-30 min-w-[140px] rounded-lg overflow-hidden animate-in zoom-in-95 origin-top-right">
          <button 
            onClick={(e) => { e.stopPropagation(); handleSave(item); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2"
          >
              <Bookmark className={`w-3 h-3 ${isSaved(item.name, item.type) ? 'fill-academic-gold text-academic-gold' : ''}`} /> 
              {isSaved(item.name, item.type) ? 'Saved' : 'Save'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCompare(item); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700"
          >
              <ArrowRightLeft className="w-3 h-3" /> Compare
          </button>
      </div>
  );

  // 1. DETAIL OVERLAYS
  if (selectedItem) {
      if (['System', 'Concept', 'Method', 'School', 'Tradition', 'Paradigm', 'Model', 'Framework', 'Theory', 'Philosophy'].includes(selectedItem.type)) {
           return <ConceptDetailModal term={selectedItem.name} context={activeCategory?.category || 'Political Science'} onClose={() => setSelectedItem(null)} />;
      }
      return <IdeologyDetailScreen ideologyName={selectedItem.name} onClose={() => setSelectedItem(null)} onNavigate={onNavigate} />;
  }

  // 2. TOPIC DRILL-DOWN (Category View)
  if (activeCategory) {
      return (
          <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 relative animate-in slide-in-from-right duration-500" onClick={() => setActiveMenu(null)}>
              {/* HEADER */}
              <div className="bg-academic-paper dark:bg-stone-900 border-b border-academic-line dark:border-stone-800 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm transition-colors gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <button onClick={handleBack} className="p-1 sm:p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <div className="flex-1">
                          <h2 className="font-serif font-bold text-base sm:text-lg text-academic-text dark:text-stone-100 leading-tight line-clamp-1">{activeCategory.category}</h2>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest">{activeCategory.items.length} Entries</p>
                      </div>
                  </div>
                  <div className="relative w-full sm:w-auto self-end sm:self-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                      <input 
                          type="text" 
                          placeholder="Filter..." 
                          className="w-full sm:w-32 focus:sm:w-48 pl-9 pr-4 py-1.5 sm:py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-xs sm:text-sm font-serif focus:border-academic-accent dark:focus:border-indigo-500 outline-none transition-all text-academic-text dark:text-stone-200 placeholder-stone-400"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
              </div>

              {/* LIST CONTENT */}
              <div className="flex-1 overflow-hidden flex">
                  <div ref={containerRef} className="flex-1 overflow-y-auto scroll-smooth p-6 pb-32">
                      <div className="space-y-10">
                          {sortedKeys.map(letter => (
                              <div key={letter} id={`section-${letter}`} className="scroll-mt-20">
                                  <div className="flex items-center gap-4 mb-4 sm:mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                                      <span className="text-xl sm:text-4xl font-serif font-bold text-academic-gold/80">{letter}</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                      {groupedItems[letter].map((item, i) => {
                                          const Icon = getIconForType(item.type);
                                          const colorClass = getColorForType(item.type);
                                          return (
                                              <div 
                                                  key={i} 
                                                  onClick={() => setSelectedItem(item)}
                                                  className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer rounded-xl flex flex-col justify-between min-h-[120px] p-5 relative overflow-hidden active:scale-[0.98]"
                                              >
                                                  <div className="flex justify-between items-start mb-3 relative z-10">
                                                      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                                                          <Icon className="w-5 h-5" />
                                                      </div>
                                                      <button 
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.name ? null : item.name); }}
                                                        className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-300 dark:text-stone-600 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors"
                                                      >
                                                          <MoreHorizontal className="w-4 h-4" />
                                                      </button>
                                                      {activeMenu === item.name && renderMenu(item)}
                                                  </div>
                                                  <div className="relative z-10">
                                                      <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors leading-tight mb-1">{item.name}</h3>
                                                      <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold">{item.origin || 'Unknown'}</span>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* ALPHABET NAV */}
                  <div className="w-10 flex-none flex flex-col items-center justify-center py-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-l border-stone-100 dark:border-stone-800 select-none z-30">
                      <button onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="mb-2 text-stone-300 hover:text-academic-accent dark:hover:text-indigo-400"><ArrowUp className="w-4 h-4" /></button>
                      <div className="flex flex-col gap-1 h-full overflow-y-auto no-scrollbar items-center justify-center">
                          {sortedKeys.map(letter => (
                              <button 
                                key={letter}
                                onClick={() => scrollToLetter(letter)}
                                className="text-[10px] font-bold text-stone-400 dark:text-stone-500 hover:text-academic-accent dark:hover:text-indigo-400 hover:scale-150 transition-all w-6 h-5 flex items-center justify-center rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                              >
                                  {letter}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // 3. MAIN ENTRY VIEW
  return (
    <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 relative pb-24 overflow-y-auto transition-colors">
        
        {/* HERO HEADER */}
        <div className="p-10 bg-gradient-to-b from-white to-academic-bg dark:from-stone-900 dark:to-stone-950 border-b border-academic-line dark:border-stone-800 transition-colors">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-serif font-bold text-academic-text dark:text-stone-100 mb-6 tracking-tight">Political Theory</h2>
                <p className="text-xl font-serif text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed text-justify">
                    Explore the vast network of political thought, from ancient philosophies to contemporary critical theories.
                </p>
            </div>
        </div>

        {/* VIEW CONTENT */}
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {THEORY_HIERARCHY.map((cat, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => handleCategoryClick(cat)}
                        className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 cursor-pointer hover:shadow-2xl hover:border-academic-accent/30 dark:hover:border-indigo-500/30 transition-all relative overflow-hidden rounded-2xl active:scale-[0.99]"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-stone-50 to-transparent dark:from-stone-800/50 dark:to-transparent rounded-bl-full -mr-20 -mt-20 z-0 group-hover:scale-110 transition-transform duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 group-hover:bg-academic-accent dark:group-hover:bg-indigo-600 group-hover:text-white transition-colors rounded-full border border-stone-200 dark:border-stone-700">
                                    {cat.items.length} Concepts
                                </span>
                                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-400 dark:text-stone-500 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                            
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-4 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                {cat.category}
                            </h3>
                            <p className="text-xl md:text-2xl text-stone-500 dark:text-stone-400 font-serif leading-relaxed text-justify mb-8 flex-1">
                                {cat.description}
                            </p>

                            <div className="flex flex-col gap-2 mt-auto">
                                <div className="flex flex-wrap gap-2">
                                    {cat.items.slice(0, 4).map((item, i) => (
                                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-stone-800/50">
                                            {item.name}
                                        </span>
                                    ))}
                                </div>
                                {cat.items.length > 4 && (
                                    <details className="group/details">
                                        <summary className="text-[10px] font-bold text-academic-gold cursor-pointer inline-flex items-center gap-1 hover:text-orange-500 transition-colors list-none">
                                            <span className="group-open/details:hidden">+{cat.items.length - 4} more</span>
                                            <span className="hidden group-open/details:inline">Hide</span>
                                        </summary>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {cat.items.slice(4).map((item, i) => (
                                                <span key={i + 4} className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-stone-800/50">
                                                    {item.name}
                                                </span>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center py-16 opacity-40">
            <Layers className="w-10 h-10 mx-auto mb-4 text-stone-300 dark:text-stone-600" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600">End of Ontology</p>
        </div>

    </div>
  );
};

export default TheoryTab;
