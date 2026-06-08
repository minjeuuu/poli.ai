
import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { Search, Bell, Sun, Moon, User, X, AlertTriangle, ArrowRight, Zap, Database, Globe, ArrowLeft } from 'lucide-react';
import { resolveSearchQuery } from '../utils/searchLogic';
import { playSFX } from '../services/soundService';

interface GlobalHeaderProps {
  toggleTheme: () => void;
  isDark: boolean;
  onNavigate: (type: string, payload: any) => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ toggleTheme, isDark, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playSFX('swoosh');
      
      const { type, payload } = resolveSearchQuery(searchQuery);
      onNavigate(type, payload);

      setSearchQuery(''); 
      setIsSearchExpanded(false);
    }
  };

  const handleNotificationClick = (type: string, payload: any) => {
      playSFX('click');
      onNavigate(type, payload);
      setShowNotifications(false);
  };

  const toggleSearch = () => {
      if (!isSearchExpanded) playSFX('click');
      setIsSearchExpanded(!isSearchExpanded);
  }

  const notifications = [
      { id: 1, title: "Leviathan Protocol Active", desc: "Country modules expanded to infinite depth.", time: "Now", icon: Zap, type: "Country", payload: "United States" },
      { id: 2, title: "Data Ingestion Complete", desc: "50,000+ administrative units indexed.", time: "1m ago", icon: Database, type: "Explore", payload: null },
      { id: 3, title: "Simulation Engine Ready", desc: "Geopolitical conflict scenarios initialized.", time: "1h ago", icon: Globe, type: "Sim", payload: null },
      { id: 4, title: "Daily Briefing Available", desc: "New intelligence for today's date.", time: "4h ago", icon: AlertTriangle, type: "Home", payload: null }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 pt-[env(safe-area-inset-top)] bg-white/70 dark:bg-stone-950/70 backdrop-blur-2xl border-b border-stone-200/50 dark:border-stone-800/50 z-[100] shadow-sm transition-colors duration-500 box-content">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        
        {/* LEFT: BRANDING */}
        <div className="flex items-center gap-4">
             {/* Global Back Button (Visual Hint, functionality delegated to App.tsx mostly, but we can offer 'Home' reset) */}
            <button 
                onClick={() => onNavigate('Home', null)} 
                className="flex items-center gap-3 group focus:outline-none flex-shrink-0"
            >
                <div className="text-academic-accent dark:text-stone-100 group-hover:scale-110 transition-transform duration-300">
                    <Logo size="sm" />
                </div>
                {/* Branding Text - Hides on search expansion on small screens */}
                <div className={`flex flex-col items-start transition-all duration-300 ${isSearchExpanded ? 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto' : 'opacity-100 w-auto'}`}>
                    <span className="text-lg font-serif font-bold text-academic-text dark:text-stone-100 tracking-widest leading-none group-hover:text-academic-accent transition-colors">POLI</span>
                </div>
            </button>
        </div>

        {/* RIGHT SIDE GROUP: ACTIONS + SEARCH */}
        <div className="flex items-center justify-end flex-1 gap-1 md:gap-2">
            
            {/* SEARCH CONTAINER - Expands to fill available space */}
            <div className={`flex items-center justify-end transition-all duration-500 ease-elastic ${isSearchExpanded ? 'flex-1 max-w-md mr-2' : 'w-10'}`}>
                <form onSubmit={handleSearch} className="relative w-full flex items-center">
                    {isSearchExpanded ? (
                        <div className="relative w-full animate-in fade-in zoom-in-95 duration-300">
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder="Direct Access..." 
                                className="w-full pl-4 pr-10 py-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-academic-gold transition-all text-stone-700 dark:text-stone-300 placeholder-stone-400 shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                            />
                            <button 
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-academic-gold text-white rounded-full hover:bg-yellow-600 transition-colors shadow-sm"
                            >
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={toggleSearch}
                            className="p-2 text-stone-400 hover:text-academic-gold transition-colors flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-900"
                            title="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}
                </form>
            </div>

            {/* DIVIDER - Hides on small screens if search expanded */}
            <div className={`h-6 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden md:block`}></div>

            {/* THEME TOGGLE */}
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-stone-400 hover:text-academic-gold hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* NOTIFICATIONS */}
            <div className="relative">
                <button 
                    onClick={() => { playSFX('click'); setShowNotifications(!showNotifications); }}
                    className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors relative ${showNotifications ? 'text-academic-accent dark:text-indigo-400 bg-stone-100 dark:bg-stone-900' : 'text-stone-400'}`}
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-stone-950 animate-pulse"></span>
                </button>

                {showNotifications && (
                    <div className="fixed sm:absolute left-4 right-4 sm:left-auto top-20 sm:top-14 sm:w-80 sm:right-0 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl animate-in zoom-in-95 sm:origin-top-right overflow-hidden z-50">
                        <div className="p-3 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-950">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">System Alerts</span>
                            <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-stone-400 hover:text-red-500" /></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.map((note) => (
                                <button 
                                    key={note.id} 
                                    onClick={() => handleNotificationClick(note.type, note.payload)}
                                    className="w-full text-left p-4 border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors group flex items-start gap-3"
                                >
                                    <div className="mt-1 p-1.5 bg-academic-gold/10 rounded-full text-academic-gold group-hover:bg-academic-gold group-hover:text-white transition-colors">
                                        <note.icon className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-stone-700 dark:text-stone-200 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{note.title}</p>
                                        <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">{note.desc}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-[9px] text-stone-400 font-mono">{note.time}</span>
                                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-academic-accent dark:text-indigo-400 flex items-center gap-0.5">
                                                Go to {note.type} <ArrowRight className="w-2 h-2" />
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* PROFILE */}
            <button 
                onClick={() => onNavigate('Profile', null)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-800 flex-shrink-0"
            >
                <div className="hidden md:block text-right">
                    <span className="block text-xs font-bold text-academic-text dark:text-stone-200">Scholar</span>
                    <span className="block text-[9px] text-academic-gold font-mono uppercase tracking-wider">Level 7</span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-academic-gold to-orange-500 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition-transform active:scale-95 ring-2 ring-white dark:ring-stone-950">
                    <User className="w-4 h-4" />
                </div>
            </button>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
