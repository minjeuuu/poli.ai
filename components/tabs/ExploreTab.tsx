
import React, { useState, useMemo, useEffect } from 'react';
import { EXPLORE_HIERARCHY } from '../../data/exploreData';
import { COUNTRIES_DATA } from '../../data/countriesData';
import { ArrowUpRight, Building2, ChevronRight, Scale, Globe, Shield, BookOpen, Vote, Map, Users, Database, GraduationCap, Gamepad2, FileText, Landmark, Clock, Search, ChevronLeft, Lightbulb, Coins, Microscope, Tv, Lock, Home, BarChart2, MoreHorizontal, Bookmark, ArrowRightLeft, ShieldAlert, TriangleAlert } from 'lucide-react';
import { IconRenderer } from '../IconMap';
import DisciplineDetailScreen from '../DisciplineDetailScreen';
import OrgDetailScreen from '../OrgDetailScreen';
import ReaderView from '../ReaderView';
import IdeologyDetailScreen from '../IdeologyDetailScreen';
import EventDetailScreen from '../EventDetailScreen';
import ConceptDetailModal from '../ConceptDetailModal';
import ReligionDetailScreen from '../ReligionDetailScreen';
import TreatyDetailScreen from '../TreatyDetailScreen';
import MovementDetailScreen from '../MovementDetailScreen';
import AgencyDetailScreen from '../AgencyDetailScreen';
import ElectionDetailScreen from '../ElectionDetailScreen';
import LegalCaseDetailScreen from '../LegalCaseDetailScreen';
import ScandalDetailScreen from '../ScandalDetailScreen';
import ThinkTankDetailScreen from '../ThinkTankDetailScreen';
import UniversityDetailScreen from '../UniversityDetailScreen';

// Root Categories Config - Ordered for visual balance
const EXPLORE_CATS = [
    { id: 'Disciplines', label: 'Disciplines', icon: BookOpen, desc: 'Academic Fields & Study' },
    { id: 'Governments', label: 'Governments', icon: Landmark, desc: 'Executives & Regimes' },
    { id: 'Int. Orgs', label: 'Organizations', icon: Globe, desc: 'IGOs & NGOs' },
    { id: 'Human Rights', label: 'Human Rights', icon: Users, desc: 'Rights & Justice' },
    { id: 'Political History', label: 'History', icon: Clock, desc: 'Events & Eras' },
    { id: 'Int. Relations', label: 'IR Theory', icon: Globe, desc: 'Global Politics' },
    { id: 'Elections & Parties', label: 'Elections', icon: Vote, desc: 'Voting & Campaigns' },
    { id: 'Public Policy', label: 'Public Policy', icon: FileText, desc: 'Governance in Action' },
    { id: 'Governance', label: 'Governance', icon: Building2, desc: 'Statecraft' },
    { id: 'Political Behavior', label: 'Behavior', icon: Users, desc: 'Psychology & Opinion' },
    { id: 'Media & Politics', label: 'Media', icon: Tv, desc: 'Comms & Press' },
    { id: 'Tech & Politics', label: 'Technology', icon: Database, desc: 'Digital & Cyber' },
    { id: 'Research Methods', label: 'Methods', icon: Microscope, desc: 'Analysis Tools' },
    { id: 'Data & Stats', label: 'Data', icon: BarChart2, desc: 'Statistics' },
    { id: 'Maps & Visuals', label: 'Geopolitics', icon: Map, desc: 'Maps & Regions' },
    { id: 'Constitutions', label: 'Constitutions', icon: FileText, desc: 'Legal Frameworks' },
    { id: 'Laws & Systems', label: 'Law', icon: Scale, desc: 'Legal Systems' },
    { id: 'Ideologies', label: 'Ideologies', icon: Lightbulb, desc: 'Belief Systems' },
    { id: 'Religions', label: 'Religions', icon: Globe, desc: 'Faiths & Cults' },
    { id: 'Political Systems', label: 'Systems', icon: Building2, desc: 'Regime Types' },
    { id: 'Political Economy', label: 'Economy', icon: Coins, desc: 'Wealth & Power' },
    { id: 'Security & Conflict', label: 'Security', icon: Shield, desc: 'War & Peace' },
    { id: 'Treaties & Pacts', label: 'Treaties', icon: FileText, desc: 'Global Agreements' },
    { id: 'Social Movements', label: 'Movements', icon: Users, desc: 'Protests & Revolts' },
    { id: 'Intelligence', label: 'Espionage', icon: ShieldAlert, desc: 'Agencies & Ops' },
    { id: 'Historical Campaigns', label: 'Precedents', icon: Vote, desc: 'Historical Campaigns' },
    { id: 'Legal Cases', label: 'Court Cases', icon: Scale, desc: 'Supreme Court & Law' },
    { id: 'Scandals & Crises', label: 'Scandals', icon: TriangleAlert, desc: 'Political Crises' },
    { id: 'Think Tanks', label: 'Think Tanks', icon: Lightbulb, desc: 'Policy Institutes' },
    { id: 'Universities', label: 'Universities', icon: GraduationCap, desc: 'Academic Institutions' },
    { id: 'Books & Lit', label: 'Library', icon: BookOpen, desc: 'Core Texts' },
    { id: 'Journals', label: 'Journals', icon: FileText, desc: 'Academic Papers' },
    { id: 'Archives', label: 'Archives', icon: FileText, desc: 'Primary Sources' },
    { id: 'Games & Learning', label: 'Games', icon: Gamepad2, desc: 'Simulations' },
];

interface NavItem {
    name: string;
    data: any;
    type: 'List' | 'Discipline' | 'Org' | 'Ideology' | 'Religion' | 'Treaty' | 'Movement' | 'Intelligence' | 'Election' | 'LegalCase' | 'Scandal' | 'Reader' | 'Concept' | 'Event' | 'System' | 'ThinkTank' | 'University';
}

interface ExploreTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave: (item: any) => void;
  isSaved: (title: string, type: string) => boolean;
  initialPayload?: any;
}

const ExploreTab: React.FC<ExploreTabProps> = ({ onNavigate, onAddToCompare, onToggleSave, isSaved, initialPayload }) => {
  const [navStack, setNavStack] = useState<NavItem[]>([]);
  const [activeRootTab, setActiveRootTab] = useState<string>('Disciplines');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interaction State
  const [selectedConcept, setSelectedConcept] = useState<{term: string, context: string} | null>(null);
  
  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Direct Read State
  const [directReadQuery, setDirectReadQuery] = useState('');

  const [wikiResults, setWikiResults] = useState<any[]>([]);
  const [isSearchingWiki, setIsSearchingWiki] = useState(false);

  // --- DEEP LINKING ---
  useEffect(() => {
      if (initialPayload) {
          // If payload is object with search, use that
          if (typeof initialPayload === 'object' && initialPayload.search) {
             setSearchQuery(initialPayload.search);
             // Stay on current root tab but filter
          } 
          // If payload is a string (e.g. Org Name), try to navigate to it
          else if (typeof initialPayload === 'string') {
             // Heuristic: Try to find what it is. For now, assume simple concept lookup
             setNavStack([...navStack, { name: initialPayload, data: null, type: 'Concept' }]);
          }
      }
  }, [initialPayload]);

  useEffect(() => {
      if (searchQuery.length < 3) {
          setWikiResults([]);
          return;
      }
      const delayFn = setTimeout(async () => {
          setIsSearchingWiki(true);
          try {
              const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}+politics&utf8=&format=json&origin=*`);
              const data = await res.json();
              if (data.query?.search) {
                  const mapped = data.query.search.slice(0, 8).map((r: any) => ({
                      name: r.title,
                      type: 'Concept',
                      icon: 'Globe'
                  }));
                  setWikiResults(mapped);
              }
          } catch (e) { console.warn("Wiki search failed"); }
          finally { setIsSearchingWiki(false); }
      }, 500);
      return () => clearTimeout(delayFn);
  }, [searchQuery]);

  // --- DYNAMIC DATA GENERATORS ---
  const generateConstitutions = () => {
    // Dynamically create folder structure based on COUNTRIES_DATA regions
    const relevantCountries = COUNTRIES_DATA.filter(c => ['Sovereign', 'Partial', 'Observer'].includes(c.status));
    
    const regions = Array.from(new Set(relevantCountries.map(c => c.region))).sort();
    
    const regionFolders = regions.map(region => ({
        name: region,
        type: 'RegionFolder',
        icon: 'Globe',
        items: relevantCountries
            .filter(c => c.region === region)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(c => ({
                name: `Constitution of ${c.name}`,
                type: 'Document',
                icon: 'Scroll'
            }))
    }));

    return [
        {
            category: "By Region (Exhaustive)",
            icon: "Globe",
            items: regionFolders
        },
        {
            category: "Historical Constitutions",
            icon: "History",
            items: [
                { name: "Magna Carta (1215)", type: "Document" },
                { name: "Code of Hammurabi", type: "Document" },
                { name: "Justinian Code", type: "Document" },
                { name: "Napoleonic Code (1804)", type: "Document" },
                { name: "Weimar Constitution (1919)", type: "Document" },
                { name: "Constitution of Medina", type: "Document" },
                { name: "Meiji Constitution", type: "Document" },
                { name: "Polish Constitution of May 3, 1791", type: "Document" },
                { name: "French Constitution of 1791", type: "Document" },
                { name: "Constitution of Cadiz (1812)", type: "Document" }
            ]
        }
    ];
  };

  // --- NAVIGATION HANDLERS ---
  const handleItemClick = (item: any) => {
      if (!item) return;
      // Determine click action based on type
      if (item.type === 'Discipline') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Discipline' }]);
      } else if (item.type === 'Org') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Org' }]);
      } else if (item.type === 'Ideology') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Ideology' }]);
      } else if (item.type === 'Religion') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Religion' }]);
      } else if (item.type === 'Treaty') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Treaty' }]);
      } else if (item.type === 'Movement') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Movement' }]);
      } else if (item.type === 'Intelligence') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Intelligence' }]);
      } else if (item.type === 'Election') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Election' }]);
      } else if (item.type === 'LegalCase') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'LegalCase' }]);
      } else if (item.type === 'Scandal') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Scandal' }]);
      } else if (item.type === 'ThinkTank') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'ThinkTank' }]);
      } else if (item.type === 'University') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'University' }]);
      } else if (item.type === 'Event' || item.type === 'Era') { // Handle History events
          setNavStack([...navStack, { name: item.name, data: null, type: 'Event' }]);
      } else if (item.type === 'Document' || item.type === 'Book' || item.type === 'Journal') {
          setNavStack([...navStack, { name: item.name, data: null, type: 'Reader' }]);
      } else if (['Concept', 'System', 'Method', 'Dataset', 'Place', 'Map'].includes(item.type)) {
          // Open Concept Modal immediately for flat concepts
          setSelectedConcept({ term: item.name, context: activeRootTab });
      } else if (item.items) {
          // It's a folder/category
          setNavStack([...navStack, { name: item.name || item.category, data: item.items, type: 'List' }]);
      } else {
          // Fallback to concept modal for flat items
          setSelectedConcept({ term: item.name, context: activeRootTab });
      }
  };

  const handleSave = (item: any) => {
      onToggleSave({ 
          id: `saved_${item.type}_${Date.now()}`, 
          type: item.type, 
          title: item.name, 
          subtitle: activeRootTab, 
          dateAdded: new Date().toLocaleDateString() 
      });
      setActiveMenu(null);
  };

  const handleCompare = (item: any) => {
      onAddToCompare(item.name, item.type);
      setActiveMenu(null);
  };

  const renderMenu = (item: any) => (
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

  const handleDirectRead = (e: React.FormEvent) => {
      e.preventDefault();
      if (directReadQuery.trim()) {
          setNavStack([...navStack, { name: directReadQuery, data: null, type: 'Reader' }]);
          setDirectReadQuery('');
      }
  };

  const goBack = () => {
      setNavStack(prev => prev.slice(0, -1));
  };

  const handleRootTabChange = (id: string) => {
      setActiveRootTab(id);
      setNavStack([]); // Clear stack when switching roots
      setSearchQuery('');
      setDirectReadQuery('');
  };

  const getActiveData = () => {
      if (navStack.length > 0) {
          const top = navStack[navStack.length - 1];
          return top.data; 
      }
      // Root Level Data
      if (activeRootTab === 'Constitutions') {
          return generateConstitutions();
      }
      return EXPLORE_HIERARCHY[activeRootTab] || [];
  };

  const currentList = getActiveData();
  const currentTitle = navStack.length > 0 ? navStack[navStack.length - 1].name : activeRootTab;
  
  // Check if current view supports direct reading (Library/Archives/Journals)
  const isReaderCategory = ['Books & Lit', 'Journals', 'Archives', 'Constitutions'].includes(activeRootTab);

  // Optimized Search Filter
  const filteredList = useMemo(() => {
      if (!currentList) return [];
      if (!searchQuery) return currentList;
      
      const lowerQuery = searchQuery.toLowerCase();
      let localResults: any[] = [];
      
      // If categories (e.g. root view)
      if (currentList[0]?.category) {
          localResults = currentList.map((cat: any) => ({
              ...cat,
              items: (cat.items || []).filter((item: any) => item && item.name && item.name.toLowerCase().includes(lowerQuery))
          })).filter((cat: any) => cat.items.length > 0 || (cat.category && cat.category.toLowerCase().includes(lowerQuery)));
      } else {
          // If flat list
          localResults = currentList.filter((item: any) => item && item.name && item.name.toLowerCase().includes(lowerQuery));
      }

      if (wikiResults.length > 0 || isSearchingWiki) {
          if (localResults.length > 0 && localResults[0].category) {
               localResults.push({
                   category: 'Global Web Search (Wikipedia)',
                   icon: 'Globe',
                   items: wikiResults
               });
          } else {
               localResults.push(...wikiResults);
          }
      }

      return localResults;
  }, [currentList, searchQuery, wikiResults, isSearchingWiki]);


  // --- RENDERERS ---

  // Detail Screens (when navigating deeper)
  if (navStack.length > 0) {
      const current = navStack[navStack.length - 1];
      if (current.type === 'Discipline') return <DisciplineDetailScreen disciplineName={current.name} onBack={goBack} onNavigate={(d) => handleItemClick({name: d, type: 'Discipline'})} />;
      if (current.type === 'Org') return (
        <OrgDetailScreen 
            orgName={current.name} 
            onClose={goBack} 
            onNavigate={onNavigate}
            onAddToCompare={onAddToCompare}
            isSaved={isSaved(current.name, 'Org')}
            onToggleSave={() => onToggleSave({ 
                id: `saved_Org_${Date.now()}`, 
                type: 'Org', 
                title: current.name, 
                subtitle: activeRootTab, 
                dateAdded: new Date().toLocaleDateString() 
            })}
        />
      );
      if (current.type === 'Ideology') return <IdeologyDetailScreen ideologyName={current.name} onClose={goBack} />;
      if (current.type === 'Religion') return <ReligionDetailScreen religionName={current.name} onClose={goBack} />;
      if (current.type === 'Treaty') return <TreatyDetailScreen treatyName={current.name} onClose={goBack} />;
      if (current.type === 'Movement') return <MovementDetailScreen movementName={current.name} onClose={goBack} />;
      if (current.type === 'Intelligence') return <AgencyDetailScreen agencyName={current.name} onClose={goBack} />;
      if (current.type === 'Election') return <ElectionDetailScreen electionName={current.name} onClose={goBack} />;
      if (current.type === 'LegalCase') return <LegalCaseDetailScreen caseName={current.name} onClose={goBack} />;
      if (current.type === 'Scandal') return <ScandalDetailScreen scandalName={current.name} onClose={goBack} />;
      if (current.type === 'ThinkTank') return <ThinkTankDetailScreen entityName={current.name} onClose={goBack} />;
      if (current.type === 'University') return <UniversityDetailScreen entityName={current.name} onClose={goBack} />;
      if (current.type === 'Event') return <EventDetailScreen eventName={current.name} onClose={goBack} />;
      if (current.type === 'Reader') return <ReaderView title={current.name} author="Archive" onClose={goBack} onNavigate={onNavigate} />;
      if (current.type === 'Concept') return <ConceptDetailModal term={current.name} context={activeRootTab} onClose={goBack} />;
  }

  return (
    <>
    <div className="h-full overflow-y-auto scroll-smooth bg-academic-bg dark:bg-stone-950 pb-32" onClick={() => setActiveMenu(null)}>
        
        {/* 1. HERO HEADER (Search & Breadcrumbs) */}
        <div className="bg-academic-paper dark:bg-stone-900 border-b border-academic-line dark:border-stone-800 pt-4 pb-2 shadow-sm transition-colors">
            <div className="px-4">
                <div className="flex items-center gap-4 mb-3">
                    {navStack.length > 0 ? (
                        <button onClick={goBack} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors active:scale-95">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="p-2">
                            <Home className="w-5 h-5 text-academic-accent dark:text-indigo-400" />
                        </div>
                    )}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <input 
                            type="text" 
                            placeholder={`Filter ${currentTitle}...`}
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-academic-line dark:border-stone-700 rounded-md text-sm font-serif focus:border-academic-accent dark:focus:border-indigo-500 outline-none transition-all focus:bg-white dark:focus:bg-stone-800 text-academic-text dark:text-stone-200 placeholder-stone-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 overflow-x-auto no-scrollbar whitespace-nowrap px-1 pb-3">
                    <span onClick={() => { setNavStack([]); setSearchQuery(''); }} className="cursor-pointer hover:text-academic-accent dark:hover:text-indigo-400">Directory</span>
                    <ChevronRight className="w-3 h-3" />
                    <span onClick={() => setNavStack([])} className={`cursor-pointer hover:text-academic-accent dark:hover:text-indigo-400 ${navStack.length === 0 ? 'text-academic-gold font-bold' : ''}`}>
                        {activeRootTab}
                    </span>
                    {navStack.map((item, i) => (
                        <React.Fragment key={i}>
                            <ChevronRight className="w-3 h-3" />
                            <span 
                                onClick={() => setNavStack(navStack.slice(0, i + 1))}
                                className={`cursor-pointer hover:text-academic-accent dark:hover:text-indigo-400 ${i === navStack.length - 1 ? 'text-academic-gold font-bold' : ''}`}
                            >
                                {item.name}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Mobile Root Category Selector */}
            {navStack.length === 0 && (
                <div className="lg:hidden border-t border-stone-100 dark:border-stone-800 px-4 pt-2 overflow-x-auto no-scrollbar flex gap-2">
                     {EXPLORE_CATS.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleRootTabChange(cat.id)}
                            className={`flex-none flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors active:scale-95
                            ${activeRootTab === cat.id ? 'bg-academic-accent dark:bg-indigo-600 text-white shadow-sm' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700'}`}
                        >
                            <cat.icon className="w-3 h-3" />
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex relative">
            
            {/* 2. SIDEBAR (Desktop) */}
            {navStack.length === 0 && (
                <div className="w-64 bg-white dark:bg-stone-900 border-r border-academic-line dark:border-stone-800 flex-shrink-0 hidden lg:block border-b">
                    <div className="p-4 space-y-1">
                        {EXPLORE_CATS.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleRootTabChange(cat.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all text-left
                                ${activeRootTab === cat.id ? 'bg-stone-100 dark:bg-stone-800 text-academic-accent dark:text-indigo-400 border-l-4 border-academic-accent dark:border-indigo-500' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 border-l-4 border-transparent'}`}
                            >
                                <cat.icon className={`w-4 h-4 ${activeRootTab === cat.id ? 'text-academic-gold' : 'text-stone-400 dark:text-stone-500'}`} />
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. MAIN CONTENT GRID */}
            <div className="flex-1 bg-stone-50/30 dark:bg-black/30 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Root Header */}
                    {navStack.length === 0 && (
                        <div className="mb-8 animate-in fade-in slide-in-from-top-4 flex items-center gap-4 border-b border-academic-line dark:border-stone-800 pb-6">
                            <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm text-academic-gold">
                                {React.createElement(EXPLORE_CATS.find(c => c.id === activeRootTab)?.icon || BookOpen, { className: "w-8 h-8" })}
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-academic-text dark:text-stone-100">{EXPLORE_CATS.find(c => c.id === activeRootTab)?.label}</h1>
                                <p className="text-stone-500 dark:text-stone-400 font-serif italic text-sm">{EXPLORE_CATS.find(c => c.id === activeRootTab)?.desc}</p>
                            </div>
                        </div>
                    )}

                    {/* DIRECT READ INPUT (Only for Library/Archive/Journals) */}
                    {isReaderCategory && (
                        <div className="mb-8 bg-academic-accent dark:bg-indigo-900 p-6 rounded-lg shadow-md animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2 flex items-center gap-2">
                                <BookOpen className="w-3 h-3" /> Direct Access
                            </h3>
                            <form onSubmit={handleDirectRead} className="relative flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Enter full title of any book, document, or article..."
                                    className="flex-1 bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 font-serif text-sm focus:outline-none focus:bg-white/20 focus:border-academic-gold transition-colors"
                                    value={directReadQuery}
                                    onChange={(e) => setDirectReadQuery(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-academic-gold text-white font-bold uppercase text-xs tracking-widest rounded-md hover:bg-yellow-600 transition-colors"
                                >
                                    Read
                                </button>
                            </form>
                        </div>
                    )}

                    {filteredList && filteredList.length > 0 ? (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            {/* Render Categories if data has structure [Category -> Items] */}
                            {filteredList[0]?.category ? (
                                filteredList.map((section: any, idx: number) => (
                                    <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm break-inside-avoid">
                                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center gap-3">
                                            <IconRenderer name={section.icon || 'BookOpen'} className="w-5 h-5 text-academic-gold" />
                                            <h3 className="font-bold text-base text-academic-text dark:text-stone-100 font-serif">{section.category}</h3>
                                            <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300 px-2 py-0.5 rounded-full ml-auto">{section.items.length}</span>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {section.items.map((item: any, i: number) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => handleItemClick(item)} 
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all group active:scale-[0.99] relative"
                                                >
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-stone-400 dark:text-stone-500 group-hover:text-white transition-colors flex-shrink-0 shadow-sm
                                                        ${item.type === 'Discipline' ? 'bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-500' : 
                                                          item.type === 'Org' ? 'bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-500' :
                                                          item.type === 'Ideology' ? 'bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-500' :
                                                          'bg-stone-100 dark:bg-stone-800 group-hover:bg-academic-accent'}`}
                                                    >
                                                        <IconRenderer name={item.icon || (item.type === 'Document' ? 'FileText' : 'Hash')} className="w-5 h-5" />
                                                    </div>
                                                    <div className="overflow-hidden flex-1">
                                                        <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 group-hover:text-academic-text dark:group-hover:text-white truncate">{item.name}</h4>
                                                        <p className="text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-widest">{item.type}</p>
                                                    </div>
                                                    {item.items ? (
                                                        <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 ml-auto group-hover:text-academic-gold" />
                                                    ) : (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.name ? null : item.name); }}
                                                            className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-full text-stone-300 dark:text-stone-500 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors z-20 opacity-0 group-hover:opacity-100 relative"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                            {activeMenu === item.name && renderMenu(item)}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* Flat List Renderer */
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredList.map((item: any, i: number) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleItemClick(item)} 
                                            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between h-32 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:bg-academic-gold/10 transition-colors"></div>
                                            
                                            <div className="relative z-10 flex justify-between items-start mb-2">
                                                <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg text-stone-400 dark:text-stone-500 group-hover:bg-academic-accent group-hover:text-white transition-colors">
                                                    <IconRenderer name={item.icon || (item.type === 'Document' ? 'FileText' : 'Circle')} className="w-5 h-5" />
                                                </div>
                                                {item.items ? (
                                                    <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                                                ) : (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.name ? null : item.name); }}
                                                        className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-300 dark:text-stone-500 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 relative"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                        {activeMenu === item.name && renderMenu(item)}
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="relative z-10 mt-auto">
                                                <h4 className="font-serif text-sm font-bold text-academic-text dark:text-stone-200 line-clamp-2 leading-snug group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                                                <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-1 block">{item.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Search className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
                            <p className="font-serif italic text-stone-500 dark:text-stone-400">No entries found matching "{searchQuery}".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>

    {/* Concept Modal */}
    {selectedConcept && (
        <ConceptDetailModal 
            term={selectedConcept.term} 
            context={selectedConcept.context} 
            onClose={() => setSelectedConcept(null)} 
        />
    )}
    </>
  );
};

export default ExploreTab;
