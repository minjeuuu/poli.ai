
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COUNTRIES_DATA } from '../../data/countriesData';
import { 
  Search, Globe, Clock, MapPin, MoreHorizontal, Bookmark, 
  ArrowRightLeft, ArrowDownAZ, ArrowUpAZ, Shuffle, LayoutGrid, List, Table as TableIcon, Flag, Layers, ArrowUp
} from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'table';
type SortOrder = 'asc' | 'desc';
type GroupMode = 'alphabet' | 'none';

interface CountriesTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave: (item: any) => void;
  isSaved: (title: string, type: string) => boolean;
  initialCountry?: string; 
}

const CountriesTab: React.FC<CountriesTabProps> = ({ onNavigate, onAddToCompare, onToggleSave, isSaved, initialCountry }) => {
  // --- STATE ---
  const [mainTab, setMainTab] = useState<'Current' | 'Historical' | 'Future' | 'Micronations' | 'Fictional'>('Current');
  const [activeRegion, setActiveRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UX State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [groupMode, setGroupMode] = useState<GroupMode>('alphabet');
  
  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // --- EFFECT FOR DEEP LINKING ---
  useEffect(() => {
      if (initialCountry && typeof initialCountry === 'string') {
          // Instead of local state, we rely on the parent (App) to show the overlay.
          // This effect mainly ensures the correct tab context is selected if we return to this view.
          const countryData = COUNTRIES_DATA.find(c => c.name === initialCountry);
          if (countryData) {
              const category = getMainTabFilter(countryData.status);
              setMainTab(category as any);
          }
      }
  }, [initialCountry]);

  // --- LOGIC ---

  const getMainTabFilter = (status: string) => {
      if (['Sovereign', 'Observer', 'Partial', 'Dependency'].includes(status)) return 'Current';
      if (['Historical', 'Ancient', 'Medieval', 'Modern Historical', 'Colonial', 'Indigenous'].includes(status)) return 'Historical';
      if (status === 'Proposed' || status === 'Future') return 'Future';
      if (status === 'Micronation') return 'Micronations';
      if (status === 'Fictional') return 'Fictional';
      return 'Current';
  };
  
  const getSubTabs = () => {
      switch(mainTab) {
          case 'Historical': return ['All', 'Ancient', 'Medieval', 'Modern', 'Colonial', 'Indigenous'];
          case 'Fictional': return ['All', 'Fantasy', 'Space', 'Anime', 'Games', 'Literature', 'Movies'];
          case 'Current': return ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Partial', 'Dependency'];
          case 'Future': return ['All', 'Proposed', 'Space'];
          case 'Micronations': return ['All', 'Europe', 'Americas', 'Oceania', 'Internet'];
          default: return ['All'];
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Sovereign': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
          case 'Observer': return 'bg-blue-500';
          case 'Partial': return 'bg-orange-500';
          case 'Dependency': return 'bg-purple-500';
          case 'Ancient': return 'bg-amber-600';
          case 'Medieval': return 'bg-amber-700';
          case 'Modern Historical': return 'bg-stone-600';
          case 'Colonial': return 'bg-indigo-600';
          case 'Indigenous': return 'bg-emerald-800';
          case 'Proposed': return 'bg-pink-500';
          case 'Future': return 'bg-cyan-500';
          case 'Micronation': return 'bg-violet-500';
          case 'Fictional': return 'bg-rose-500';
          default: return 'bg-stone-400';
      }
  };

  // --- FILTERING & SORTING ---
  const filteredList = useMemo(() => {
      let filtered = COUNTRIES_DATA.filter(c => {
          if (!c || !c.name) return false;
          const itemCategory = getMainTabFilter(c.status);
          if (itemCategory !== mainTab) return false;

          if (activeRegion !== 'All') {
              if (mainTab === 'Historical') {
                  if (activeRegion === 'Modern') return c.status === 'Modern Historical';
                  if (['Ancient', 'Medieval', 'Colonial', 'Indigenous'].includes(activeRegion)) return c.status === activeRegion;
              } else if (mainTab === 'Current') {
                  if (activeRegion === 'Partial') return c.status === 'Partial';
                  if (activeRegion === 'Dependency') return c.status === 'Dependency';
                  return c.region === activeRegion;
              } else if (mainTab === 'Fictional') {
                  if (['Anime', 'Games', 'Fantasy', 'Space'].includes(activeRegion)) return c.region === activeRegion;
                  if (activeRegion === 'Literature' || activeRegion === 'Movies') return ['Global', 'Americas', 'Europe', 'Africa', 'Asia'].includes(c.region); 
                  return c.region === activeRegion;
              } else {
                  return c.region === activeRegion;
              }
          }
          
          if (searchQuery) {
              return c.name.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return true;
      });

      filtered.sort((a, b) => {
          if (!a.name || !b.name) return 0;
          const comp = a.name.localeCompare(b.name);
          return sortOrder === 'asc' ? comp : -comp;
      });

      return filtered;
  }, [mainTab, activeRegion, searchQuery, sortOrder]);

  const groupedCountries = useMemo(() => {
      if (groupMode === 'none') return null;
      const groups: Record<string, typeof filteredList> = {};
      filteredList.forEach(country => {
          const letter = (country.name || '').charAt(0).toUpperCase();
          const key = /[A-Z]/.test(letter) ? letter : '#';
          if (!groups[key]) groups[key] = [];
          groups[key].push(country);
      });
      return groups;
  }, [filteredList, groupMode]);

  const sortedKeys = useMemo(() => {
      if (!groupedCountries) return [];
      const keys = Object.keys(groupedCountries).sort();
      return sortOrder === 'asc' ? keys : keys.reverse();
  }, [groupedCountries, sortOrder]);

  const scrollToLetter = (letter: string) => {
      sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRandomDiscovery = () => {
      if (filteredList.length > 0) {
          const random = filteredList[Math.floor(Math.random() * filteredList.length)];
          onNavigate('Country', random.name);
      }
  };
  
  const renderIcon = (country: any, size: 'sm' | 'md' | 'lg' = 'md') => {
      const Icon = Flag;
      const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
      return (
        <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 group-hover:bg-stone-200 dark:group-hover:bg-stone-700 transition-colors">
            <Icon className={`${iconSize} text-stone-300 dark:text-stone-600 opacity-80 group-hover:scale-110 transition-transform duration-500`} />
        </div>
      );
  };

  const handleSave = (country: any) => {
      onToggleSave({ 
          id: `saved_Country_${Date.now()}`, 
          type: 'Country', 
          title: country.name, 
          subtitle: country.status, 
          dateAdded: new Date().toLocaleDateString() 
      });
      setActiveMenu(null);
  };

  const handleCompare = (country: any) => {
      onAddToCompare(country.name, 'Country');
      setActiveMenu(null);
  };

  const renderMenu = (country: any) => (
      <div className="absolute right-2 top-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-30 min-w-[140px] rounded-lg overflow-hidden animate-in zoom-in-95 origin-top-right">
          <button 
            onClick={(e) => { e.stopPropagation(); handleSave(country); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2"
          >
              <Bookmark className={`w-3 h-3 ${isSaved(country.name, 'Country') ? 'fill-academic-gold text-academic-gold' : ''}`} /> 
              {isSaved(country.name, 'Country') ? 'Saved' : 'Save'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCompare(country); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700"
          >
              <ArrowRightLeft className="w-3 h-3" /> Compare
          </button>
      </div>
  );

  const renderGridItem = (country: any, i: number) => (
      <div 
        key={`${country.name}-${i}`} 
        className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-academic-accent/50 dark:hover:border-indigo-500/50 transition-all duration-300 relative flex flex-col active:scale-[0.99] cursor-pointer h-full"
        onClick={() => onNavigate('Country', country.name)}
      >
          <div className="h-32 w-full relative border-b border-stone-100 dark:border-stone-800">
              {renderIcon(country, 'lg')}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === country.name ? null : country.name); }}
                className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-20 opacity-0 group-hover:opacity-100"
              >
                  <MoreHorizontal className="w-4 h-4" />
              </button>
              {activeMenu === country.name && renderMenu(country)}
          </div>
          
          <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(country.status)}`}></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 truncate">{country.status}</span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-academic-text dark:text-stone-100 leading-tight group-hover:text-academic-accent dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                      {country.name}
                  </h3>
              </div>
          </div>
      </div>
  );

  const renderListItem = (country: any, i: number) => (
      <div 
        key={`${country.name}-${i}`} 
        onClick={() => onNavigate('Country', country.name)}
        className="group flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-academic-accent dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer relative active:scale-[0.99]"
      >
          <div className="w-16 h-10 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden flex-shrink-0 shadow-sm">
              {renderIcon(country, 'sm')}
          </div>
          
          <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-sm text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 truncate">{country.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(country.status)}`}></div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest">{country.status}</span>
              </div>
          </div>

          <div className="hidden sm:block text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest text-right">
              {country.region}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === country.name ? null : country.name); }}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-300 dark:text-stone-500 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
          >
              <MoreHorizontal className="w-4 h-4" />
          </button>
          {activeMenu === country.name && renderMenu(country)}
      </div>
  );

  const renderTableItem = (country: any, i: number) => (
      <div 
        key={`${country.name}-${i}`} 
        onClick={() => onNavigate('Country', country.name)}
        className="group flex items-center p-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 last:border-0 cursor-pointer transition-colors text-xs"
      >
          <div className="w-8 flex-shrink-0 text-center font-mono text-stone-300 dark:text-stone-600">{i + 1}</div>
          <div className="flex-1 font-serif font-bold text-academic-text dark:text-stone-200 group-hover:text-academic-accent dark:group-hover:text-indigo-400 truncate pr-4 pl-2">{country.name}</div>
          <div className="w-32 hidden sm:block text-stone-500 dark:text-stone-400 truncate flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(country.status)}`}></div>
             {country.status}
          </div>
          <div className="w-24 hidden md:block text-stone-400 dark:text-stone-500 text-right font-mono truncate">{country.region}</div>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 relative overflow-hidden transition-colors duration-500" onClick={() => setActiveMenu(null)}>
      
      {/* 1. ADVANCED HEADER */}
      <div className="flex-none px-4 pt-4 pb-3 space-y-3 sm:px-6 sm:pt-6 sm:pb-4 sm:space-y-4 bg-academic-bg/95 dark:bg-stone-950/95 backdrop-blur-xl z-20 border-b border-academic-line dark:border-stone-800 transition-colors duration-500 shadow-sm relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-academic-text dark:text-stone-100 tracking-tight">Global Archives</h1>
                    <span className="px-2 py-1 bg-academic-accent/10 dark:bg-indigo-500/10 text-academic-accent dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-md hidden sm:block">
                        {mainTab}
                    </span>
                  </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto hidden sm:flex">
                  <div className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest bg-stone-100 dark:bg-stone-900 px-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-800 hidden sm:flex items-center gap-2">
                      <Globe className="w-3 h-3" /> {Object.values(groupedCountries || {}).flat().length || filteredList.length} Records
                  </div>
                  <button 
                    onClick={handleRandomDiscovery}
                    className="flex items-center gap-2 px-4 py-1.5 bg-academic-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-yellow-600 transition-colors shadow-sm active:scale-95"
                  >
                      <Shuffle className="w-3 h-3" /> Discover
                  </button>
                  
                  {/* View Toggle */}
                  <div className="flex bg-stone-100 dark:bg-stone-900 rounded-lg p-1 border border-stone-200 dark:border-stone-800">
                      <button onClick={() => setViewMode('grid')} title="Grid View" className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-white ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}><LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                      <button onClick={() => setViewMode('list')} title="List View" className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-white ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}><List className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                      <button onClick={() => setViewMode('table')} title="Table View" className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-white ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}><TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                  </div>
              </div>
          </div>
          
          <div className="flex gap-2">
              <div className="relative flex-1 shadow-sm group focus-within:shadow-md transition-shadow rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus-within:border-academic-accent dark:focus-within:border-indigo-500">
                  <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 flex items-center justify-center border-r border-stone-100 dark:border-stone-800">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 dark:text-stone-500 group-focus-within:text-academic-accent dark:group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder={`Search ${mainTab} entities...`} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 sm:pl-14 sm:pr-10 py-2 sm:py-3 bg-white dark:bg-stone-900 outline-none font-serif text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 transition-colors"
                  />
              </div>
              
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 sm:px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-academic-accent dark:hover:border-indigo-500 transition-colors group text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400"
                title="Sort Order"
              >
                  {sortOrder === 'asc' ? <ArrowDownAZ className="w-4 h-4 sm:w-5 h-5" /> : <ArrowUpAZ className="w-4 h-4 sm:w-5 h-5" />}
              </button>

              <button 
                onClick={() => setGroupMode(prev => prev === 'alphabet' ? 'none' : 'alphabet')}
                className={`px-3 sm:px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-academic-accent dark:hover:border-indigo-500 transition-colors group
                ${groupMode === 'alphabet' ? 'text-academic-accent dark:text-indigo-400 border-academic-accent dark:border-indigo-500' : 'text-stone-400 hover:text-academic-accent'}`}
                title="Toggle Grouping"
              >
                  <Layers className="w-4 h-4 sm:w-5 h-5" />
              </button>
          </div>

          <div className="flex flex-col gap-3 pt-1">
              {/* Main Categories */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {['Current', 'Historical', 'Future', 'Micronations', 'Fictional'].map(tab => (
                      <button 
                          key={tab} 
                          onClick={() => { setMainTab(tab as any); setActiveRegion('All'); }}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap
                          ${mainTab === tab ? 'bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              {/* Sub-Filters */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar border-t border-stone-100 dark:border-stone-800 pt-3">
                  {getSubTabs().map(region => (
                      <button
                          key={region}
                          onClick={() => setActiveRegion(region)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap border
                          ${activeRegion === region 
                              ? 'bg-academic-accent/10 dark:bg-indigo-500/10 text-academic-accent dark:text-indigo-400 border-academic-accent/20 dark:border-indigo-500/20' 
                              : 'border-transparent text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                      >
                          {region}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex bg-stone-50/50 dark:bg-black/20">
            <div ref={containerRef} className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 scroll-smooth">
                
                {filteredList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 h-full">
                        <Search className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-4" />
                        <p className="font-serif italic text-stone-500 dark:text-stone-400">No matching entities found in the archives.</p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        {groupedCountries ? (
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
                                            {groupedCountries[letter].map((country, i) => (
                                                viewMode === 'grid' ? renderGridItem(country, i) : 
                                                viewMode === 'list' ? renderListItem(country, i) :
                                                renderTableItem(country, i)
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
                                {filteredList.map((country, i) => (
                                    viewMode === 'grid' ? renderGridItem(country, i) : 
                                    viewMode === 'list' ? renderListItem(country, i) :
                                    renderTableItem(country, i)
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SIDEBAR NAV */}
            {groupedCountries && (
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
  );
};

export default CountriesTab;
