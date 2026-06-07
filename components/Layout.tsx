
import React, { useState, useEffect, useMemo } from 'react';
import { Home, Compass, Globe, Languages, Scale, BookOpen, Users, GraduationCap, DollarSign, User, Gamepad2, MessageSquare, Library, Mail, Calendar, Brain, Grid } from 'lucide-react';
import { MainTab, SpecialTheme } from '../types';
import GlobalHeader from './GlobalHeader';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onNavigate: (type: string, payload: any) => void;
  themeMode?: SpecialTheme;
  userPrefs?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onNavigate, themeMode = 'Default', userPrefs }) => {
  const [isDark, setIsDark] = useState(false);

  // --- CONTEXTUAL THEME ENGINE ---
  const themeClasses = useMemo(() => {
      let base = "bg-academic-bg dark:bg-stone-950 text-academic-text dark:text-stone-100";
      
      switch (themeMode) {
          case 'War': return "bg-stone-900 text-stone-300 font-mono tracking-tight border-red-900";
          case 'Tech': case 'Cyberpunk': return "bg-slate-950 text-cyan-400 font-mono tracking-widest selection:bg-cyan-900";
          case 'Christmas': return isDark ? "bg-green-950 text-red-100" : "bg-red-50 text-green-900";
          case 'NewYear': return "bg-stone-950 text-amber-200 selection:bg-amber-900";
          case 'ChineseNewYear': return "bg-red-950 text-yellow-200 border-yellow-600";
          case 'Royal': return "bg-indigo-950 text-yellow-100 font-serif";
          case 'Revolution': return "bg-stone-800 text-red-500 font-bold uppercase";
          case 'Retro': return "bg-orange-50 dark:bg-orange-950 text-orange-900 dark:text-orange-100 font-mono";
          case 'Neon': return "bg-black text-pink-500 font-bold selection:bg-pink-900";
          case 'Nature': return "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100";
          case 'Corporate': return "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans tracking-tight";
          case 'Midnight': return "bg-indigo-950 text-indigo-100 selection:bg-indigo-700";
          case 'Sunset': return "bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100";
          case 'Ocean': return "bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-100";
          case 'Forest': return "bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100";
          case 'Desert': return "bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100";
          case 'Lavender': return "bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-100";
          case 'Mint': return "bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-100";
          case 'Coffee': return "bg-[#f5f5dc] dark:bg-[#3e2723] text-[#4b3621] dark:text-[#d7ccc8]";
          case 'Steel': return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono";
          case 'Matrix': return "bg-black text-green-500 font-mono tracking-widest";
          case 'Steampunk': return "bg-[#2b2b2b] text-[#d4af37] font-serif border-[#b8860b]";
          case 'Vaporwave': return "bg-purple-900 text-cyan-300 font-mono";
          case 'Noir': return "bg-black text-gray-400 font-sans grayscale";
          case 'Synth': return "bg-fuchsia-950 text-yellow-300 font-bold";
          case 'Solar': return "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200";
          case 'Lunar': return "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
          case 'Arctic': return "bg-cyan-50 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-100";
          case 'Volcanic': return "bg-red-950 text-orange-500";
          case 'Jungle': return "bg-green-900 text-lime-300";
          case 'Monochrome': return "bg-white dark:bg-black text-black dark:text-white grayscale";
          case 'Sepia': return "bg-[#f4ecd8] text-[#5b4636]";
          case 'Velvet': return "bg-fuchsia-950 text-fuchsia-100";
          case 'Slate': return "bg-slate-800 text-slate-200";
          default: return base;
      }
  }, [themeMode, isDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

    const accentMap: Record<string, string> = {
        'War': '#ef4444', 'Tech': '#06b6d4', 'Christmas': '#166534',
        'Neon': '#ec4899', 'Nature': '#22c55e', 'Ocean': '#0ea5e9',
        'Forest': '#10b981', 'Desert': '#f59e0b', 'Lavender': '#a855f7',
        'Mint': '#14b8a6', 'Coffee': '#795548', 'Matrix': '#22c55e',
        'Steampunk': '#d4af37', 'Vaporwave': '#d946ef', 'Volcanic': '#f97316'
    };

    if (accentMap[themeMode]) root.style.setProperty('--color-accent', accentMap[themeMode]);
    else root.style.removeProperty('--color-accent');

    // Apply User Preferences safely
    if (userPrefs) {
         if (userPrefs.fontSize) root.style.fontSize = `${userPrefs.fontSize}px`;
         else root.style.fontSize = '16px';

         if (userPrefs.highContrast) root.classList.add('contrast-125');
         else root.classList.remove('contrast-125');

         if (userPrefs.reduceMotion) {
             root.style.setProperty('--reduce-motion-duration', '0s');
             root.classList.add('reduce-motion');
         } else {
             root.style.removeProperty('--reduce-motion-duration');
             root.classList.remove('reduce-motion');
         }
         
         if (userPrefs.showGridLines) root.classList.add('debug-grid');
         else root.classList.remove('debug-grid');

         root.classList.remove('typography-sans', 'typography-mono', 'typography-system', 'typography-serif');
         if (userPrefs.typography) {
             if (userPrefs.typography === 'Sans-Serif') root.classList.add('typography-sans');
             else if (userPrefs.typography === 'Monospace') root.classList.add('typography-mono');
             else if (userPrefs.typography === 'System') root.classList.add('typography-system');
             else root.classList.add('typography-serif');
         }

         root.setAttribute('data-radius', userPrefs.borderRadius || 'Medium');
         root.setAttribute('data-density', userPrefs.density || 'Comfortable');
         root.setAttribute('data-blur', userPrefs.blurEffects !== false ? 'true' : 'false');
         root.setAttribute('data-reader-width', userPrefs.readerWidth || 'Standard');

         if (userPrefs.fontSize && userPrefs.fontSize !== 16) {
             root.style.fontSize = `${userPrefs.fontSize}px`;
         } else {
             root.style.fontSize = '16px';
         }

         import('../services/common').then(({ setAppLanguage }) => {
             if (userPrefs.language) {
                 setAppLanguage(userPrefs.language);
             }
         });
    }

  }, [isDark, themeMode, userPrefs]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navItems: { id: MainTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'hub', label: 'Hub', icon: Grid },
    { id: 'rates', label: 'Mkts', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-[100vw] transition-colors duration-500 overflow-hidden ${themeClasses}`}>
      
      <GlobalHeader toggleTheme={toggleTheme} isDark={isDark} onNavigate={onNavigate} />

      <main className="flex-1 overflow-hidden relative pt-[calc(4rem+env(safe-area-inset-top))]">
        {(themeMode === 'War' || themeMode === 'Steampunk') && <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>}
        {themeMode === 'Christmas' && <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>}
        {(themeMode === 'Tech' || themeMode === 'Matrix' || themeMode === 'Cyberpunk') && <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>}
        {themeMode === 'Nature' && <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>}

        {/* MAIN APP CONTENT WITH TRANSITIONS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
      </main>

      <nav className={`flex-none border-t pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-500 
          ${['War', 'Steampunk', 'Volcanic', 'Coffee'].includes(themeMode) ? 'bg-stone-900 border-red-900' : 
            ['Tech', 'Matrix', 'Cyberpunk', 'Neon'].includes(themeMode) ? 'bg-slate-950 border-cyan-900' : 
            'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'}`}>
        <div className={`flex justify-around items-center ${userPrefs?.compactSidebar ? 'h-12' : 'h-16'} px-2 w-full max-w-md mx-auto sm:max-w-none sm:justify-center sm:gap-8 transition-spacing`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            let activeColorClass = 'text-academic-accent dark:text-indigo-400';
            let activeBgClass = 'bg-academic-accent/10 dark:bg-indigo-500/20';
            
            if (themeMode === 'War') { activeColorClass = 'text-red-500'; activeBgClass = 'bg-red-900/30'; }
            if (themeMode === 'Tech') { activeColorClass = 'text-cyan-400'; activeBgClass = 'bg-cyan-900/30'; }
            if (themeMode === 'Christmas') { activeColorClass = 'text-red-600 dark:text-red-400'; activeBgClass = 'bg-green-100 dark:bg-green-900/30'; }
            if (themeMode === 'Neon') { activeColorClass = 'text-pink-500'; activeBgClass = 'bg-pink-900/30'; }
            if (themeMode === 'Matrix') { activeColorClass = 'text-green-500'; activeBgClass = 'bg-green-900/30'; }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] flex-1 h-full transition-all duration-300 group
                  ${isActive ? activeColorClass : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'}
                `}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${userPrefs?.compactSidebar ? 'mb-0.5' : 'mb-1'} ${isActive ? `${activeBgClass} translate-y-[-2px]` : 'group-hover:bg-stone-50 dark:group-hover:bg-stone-800'}`}>
                   <item.icon className={`${userPrefs?.compactSidebar ? 'w-4 h-4' : 'w-6 h-6'} ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                </div>
                <span className={`${userPrefs?.compactSidebar ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-widest opacity-80 mt-0.5`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
