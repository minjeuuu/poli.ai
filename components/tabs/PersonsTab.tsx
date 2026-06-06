
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PERSONS_HIERARCHY } from '../../data/personsData';
import { PersonNode } from '../../types';
import { Search, ArrowLeft, ChevronRight, User, Folder, LayoutGrid, List, Globe, Brain, Gamepad2, Hexagon, ArrowUp, MoreHorizontal, Bookmark, ArrowRightLeft } from 'lucide-react';
import PersonDetailScreen from '../PersonDetailScreen';

interface PersonsTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave: (item: any) => void;
  isSaved: (title: string, type: string) => boolean;
  initialPerson?: string;
}

// Local Nav Item for the Tab's own internal stack
interface LocalNavItem {
    name: string;
    items: PersonNode[];
}

type ViewMode = 'grid' | 'list';

const PersonsTab: React.FC<PersonsTabProps> = ({ onNavigate, onAddToCompare, onToggleSave, isSaved, initialPerson }) => {
  // Navigation State
  const [navStack, setNavStack] = useState<LocalNavItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Drill Down State
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // --- DEEP LINKING ---
  useEffect(() => {
      if (initialPerson) {
          setSelectedPerson(initialPerson);
      }
  }, [initialPerson]);

  // Derive current level data
  const currentItems = navStack.length > 0 ? navStack[navStack.length - 1].items : PERSONS_HIERARCHY;
  const currentTitle = navStack.length > 0 ? navStack[navStack.length - 1].name : "Biographical Archive";

  // Filter Logic
  const filteredItems = useMemo(() => {
      if (!searchQuery) return currentItems;
      return currentItems.filter(item => item && item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [currentItems, searchQuery]);

  // Grouping
  const groupedItems = useMemo(() => {
      if (filteredItems.length < 20) return null; 
      
      const groups: Record<string, PersonNode[]> = {};
      filteredItems.forEach(item => {
          if (!item || !item.name) return;
          const letter = (item.name || '').charAt(0).toUpperCase();
          const key = /[A-Z]/.test(letter) ? letter : '#';
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
      });
      return groups;
  }, [filteredItems]);

  const sortedKeys = groupedItems ? Object.keys(groupedItems).sort() : [];

  // Handlers
  const handleItemClick = (item: PersonNode) => {
      if (item.type === 'Folder' || item.type === 'Category') {
          setNavStack([...navStack, { name: item.name, items: item.items || [] }]);
          setSearchQuery('');
          containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          setSelectedPerson(item.name);
      }
  };

  const handleSave = (item: PersonNode) => {
      onToggleSave({ 
          id: `saved_Person_${Date.now()}`, 
          type: 'Person', 
          title: item.name, 
          subtitle: item.role || item.country, 
          dateAdded: new Date().toLocaleDateString() 
      });
      setActiveMenu(null);
  };

  const handleCompare = (item: PersonNode) => {
      onAddToCompare(item.name, 'Person');
      setActiveMenu(null);
  };

  const goBack = () => {
      setNavStack(prev => prev.slice(0, -1));
      setSearchQuery('');
  };

  const resetNav = () => {
      setNavStack([]);
      setSearchQuery('');
  };

  const scrollToLetter = (letter: string) => {
      sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Icon Helper
  const getIconForType = (item: PersonNode) => {
      if (item.type === 'Folder' || item.type === 'Category') {
          if (navStack.length === 0) {
              if (item.name.includes("Real World")) return Globe;
              if (item.name.includes("Political Scientists")) return Brain;
              if (item.name.includes("Fictional")) return Gamepad2;
              return Folder;
          }
          if (item.name.includes("Africa") || item.name.includes("Asia") || item.name.includes("Europe")) return Globe;
          return Folder;
      }
      return User;
  };

  const getColorClass = (item: PersonNode) => {
      if (item.type === 'Folder' || item.type === 'Category') {
          if (item.name.includes("Real World")) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
          if (item.name.includes("Political Scientists")) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
          if (item.name.includes("Fictional")) return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
          return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800';
      }
      return 'text-stone-500 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700';
  };

  const renderMenu = (item: PersonNode) => (
      <div className="absolute right-2 top-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-30 min-w-[140px] rounded-lg overflow-hidden animate-in zoom-in-95 origin-top-right">
          <button 
            onClick={(e) => { e.stopPropagation(); handleSave(item); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2"
          >
              <Bookmark className={`w-3 h-3 ${isSaved(item.name, 'Person') ? 'fill-academic-gold text-academic-gold' : ''}`} /> 
              {isSaved(item.name, 'Person') ? 'Saved' : 'Save'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCompare(item); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700"
          >
              <ArrowRightLeft className="w-3 h-3" /> Compare
          </button>
      </div>
  );

  return (
    <>
    <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 relative overflow-hidden transition-colors duration-500" onClick={() => setActiveMenu(null)}>
         
         {/* 1. HERO HEADER */}
         {navStack.length === 0 && (
            <div className="p-10 bg-gradient-to-b from-white to-academic-bg dark:from-stone-900 dark:to-stone-950 border-b border-academic-line dark:border-stone-800 transition-colors flex-none">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-6 text-academic-gold">
                        <Hexagon className="w-10 h-10 fill-academic-gold/10" />
                        <h1 className="text-sm font-bold uppercase tracking-[0.3em]">Knowledge Graph</h1>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-academic-text dark:text-stone-100 mb-6 tracking-tight">Profiles & Leaders</h2>
                    <p className="text-xl font-serif text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                        Explore the key figures shaping history, theory, and fiction. From presidents to philosophers.
                    </p>
                </div>
            </div>
         )}

         {/* 2. NAVIGATION BAR */}
         <div className="relative md:sticky md:top-0 z-20 bg-academic-paper dark:bg-stone-900 border-b border-academic-line dark:border-stone-800 p-3 sm:p-4 shadow-sm transition-colors flex-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1">
                       {navStack.length > 0 && (
                          <button onClick={goBack} className="p-1 sm:p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">
                              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                       )}
                       <div>
                           <h1 className="font-serif font-bold text-base sm:text-lg text-academic-text dark:text-stone-100 leading-tight line-clamp-1">{currentTitle}</h1>
                           {navStack.length > 0 && (
                               <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">
                                   <button onClick={resetNav} className="hover:text-academic-accent dark:hover:text-indigo-400">Root</button>
                                   <span>/</span>
                                   <span>...</span>
                               </div>
                           )}
                       </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="relative group w-full sm:w-48 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-academic-accent dark:group-focus-within:text-indigo-400 transition-colors" />
                          <input 
                              type="text" 
                              placeholder="Filter..."
                              className="w-full pl-9 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-xs sm:text-sm font-serif focus:border-academic-accent dark:focus:border-indigo-500 outline-none sm:w-32 focus:sm:w-48 transition-all text-academic-text dark:text-stone-200 placeholder-stone-400"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                      
                      <div className="flex bg-stone-100 dark:bg-stone-900 rounded-lg p-1 border border-stone-200 dark:border-stone-800 flex-shrink-0">
                          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-white' : 'text-stone-400'}`}><LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-white' : 'text-stone-400'}`}><List className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                      </div>
                  </div>
              </div>
         </div>

         {/* 3. LIST CONTENT */}
         <div className="flex-1 overflow-hidden flex bg-stone-50/50 dark:bg-black/20">
            <div ref={containerRef} className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 scroll-smooth">
                
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 h-full">
                        <Search className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-4" />
                        <p className="font-serif italic text-stone-500 dark:text-stone-400">No matching entries found.</p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        {groupedItems ? (
                            // GROUPED VIEW
                            <div className="space-y-12">
                                {sortedKeys.map(letter => (
                                    <div key={letter} ref={el => { sectionRefs.current[letter] = el; }} className="scroll-mt-40">
                                        <div className="sticky top-0 z-10 py-2 sm:py-3 border-b border-stone-200 dark:border-stone-800 mb-4 sm:mb-6 bg-academic-bg/95 dark:bg-stone-950/95 backdrop-blur-sm flex items-center">
                                            <span className="text-xl sm:text-3xl font-serif font-bold text-academic-gold">{letter}</span>
                                        </div>
                                        <div className={`
                                            ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-2'}
                                        `}>
                                            {groupedItems[letter].map((item, i) => (
                                                <PersonCard 
                                                    key={i} 
                                                    item={item} 
                                                    viewMode={viewMode} 
                                                    onClick={() => handleItemClick(item)} 
                                                    icon={getIconForType(item)}
                                                    colorClass={getColorClass(item)}
                                                    activeMenu={activeMenu}
                                                    setActiveMenu={setActiveMenu}
                                                    renderMenu={renderMenu}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // FLAT VIEW
                            <div className={`
                                ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-2'}
                            `}>
                                {filteredItems.map((item, i) => (
                                    <PersonCard 
                                        key={i} 
                                        item={item} 
                                        viewMode={viewMode} 
                                        onClick={() => handleItemClick(item)} 
                                        icon={getIconForType(item)}
                                        colorClass={getColorClass(item)}
                                        activeMenu={activeMenu}
                                        setActiveMenu={setActiveMenu}
                                        renderMenu={renderMenu}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SIDEBAR NAV */}
            {groupedItems && (
                <div className="w-10 flex-none flex flex-col items-center justify-center py-6 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-l border-stone-100 dark:border-stone-800 select-none z-30 hidden sm:flex">
                    <button onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="mb-4 text-stone-300 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors"><ArrowUp className="w-4 h-4" /></button>
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
            )}
         </div>
    </div>

    {/* OVERLAY */}
    {selectedPerson && (
        <PersonDetailScreen 
            personName={selectedPerson} 
            onClose={() => setSelectedPerson(null)}
            onNavigate={onNavigate}
            isSaved={isSaved(selectedPerson, 'Person')}
            onToggleSave={() => onToggleSave({ 
                id: `saved_Person_${Date.now()}`, 
                type: 'Person', 
                title: selectedPerson, 
                subtitle: 'Profile', 
                dateAdded: new Date().toLocaleDateString() 
            })}
        />
    )}
    </>
  );
};

const PersonCard = ({ item, viewMode, onClick, icon: Icon, colorClass, activeMenu, setActiveMenu, renderMenu }: any) => {
    const isFolder = item.type === 'Folder' || item.type === 'Category';

    if (isFolder) {
        return (
            <button
                onClick={onClick}
                className={`group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 hover:shadow-xl transition-all rounded-xl text-left relative overflow-hidden active:scale-[0.98]
                ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'p-6 flex flex-col justify-between min-h-[140px]'}`}
            >
                {/* Decorative BG */}
                {viewMode !== 'list' && <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-stone-50 to-transparent dark:from-stone-800/30 rounded-bl-full -mr-10 -mt-10 z-0 group-hover:scale-110 transition-transform duration-500"></div>}

                <div className={`relative z-10 flex ${viewMode === 'list' ? 'items-center gap-4' : 'flex-col h-full'}`}>
                    <div className={`${viewMode === 'list' ? `p-2 rounded-lg ${colorClass}` : 'mb-4 flex justify-between items-start'}`}>
                        <div className={viewMode !== 'list' ? `p-3 rounded-xl ${colorClass}` : ''}>
                            <Icon className={viewMode === 'list' ? 'w-5 h-5' : 'w-6 h-6'} />
                        </div>
                        {viewMode !== 'list' && (
                            <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-full border border-stone-200 dark:border-stone-700 group-hover:border-academic-accent/30 dark:group-hover:border-indigo-500/30 transition-colors">
                                {item.items?.length || 0}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 leading-tight truncate transition-colors">{item.name}</h3>
                        {viewMode === 'list' && <span className="text-xs text-stone-400 ml-2">({item.items?.length || 0})</span>}
                        {viewMode !== 'list' && <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">{item.role || 'Collection'}</p>}
                    </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-stone-300 dark:text-stone-600 group-hover:text-academic-gold transition-colors absolute right-4 bottom-4 opacity-0 group-hover:opacity-100" />
            </button>
        );
    }

    // PERSON CARD
    return (
        <div
            onClick={onClick}
            className={`group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 hover:shadow-lg transition-all rounded-xl text-left relative overflow-hidden cursor-pointer active:scale-[0.98]
            ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'p-5 flex flex-col h-auto'}`}
        >
            <div className={`${viewMode === 'list' ? '' : 'flex justify-between items-start mb-4 relative'}`}>
                <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 font-serif font-bold text-xl border border-stone-200 dark:border-stone-700 shadow-sm group-hover:bg-academic-accent group-hover:text-white dark:group-hover:bg-indigo-600 transition-colors shrink-0">
                    {(item.name || '').charAt(0)}
                </div>
                
                {viewMode !== 'list' && (
                    <div className="flex flex-col items-end">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.name ? null : item.name); }}
                            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-300 dark:text-stone-600 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors z-20"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeMenu === item.name && renderMenu(item)}
                        <span className="mt-1 px-2 py-0.5 bg-stone-50 dark:bg-stone-800 rounded text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{item.era}</span>
                    </div>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-base text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors leading-tight mb-1 truncate">{item.name}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate">{item.role || 'Political Figure'}</p>
                {viewMode !== 'list' && <p className="text-[10px] text-stone-400 dark:text-stone-600 uppercase tracking-widest mt-2">{item.country}</p>}
            </div>
            
            {viewMode === 'list' && (
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 hidden sm:block">{item.country}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.name ? null : item.name); }}
                        className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-300 dark:text-stone-600 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors relative"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                        {activeMenu === item.name && renderMenu(item)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PersonsTab;
