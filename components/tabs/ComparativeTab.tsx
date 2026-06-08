import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Scale, Globe, Lightbulb, Users, Building2, Brain, ChevronRight, Hexagon, Swords } from 'lucide-react';
import ComparisonView from '../ComparisonView';

interface ComparativeTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave?: (item: any) => void;
  isSaved?: (title: string, type: string) => boolean;
  initialItem?: any;
}

const COMPARISON_CATEGORIES = [
    { id: 'Country', label: 'Countries', icon: Globe, desc: 'Nations & Regions' },
    { id: 'Person', label: 'Leaders', icon: Users, desc: 'Key Figures' },
    { id: 'Ideology', label: 'Ideologies', icon: Lightbulb, desc: 'Belief Systems' },
    { id: 'System', label: 'Systems', icon: Building2, desc: 'Governments' },
    { id: 'Theory', label: 'Theories', icon: Brain, desc: 'Concepts' },
];

const ComparativeTab: React.FC<ComparativeTabProps> = ({ onNavigate, onAddToCompare, initialItem }) => {
  const [selectedCategory, setSelectedCategory] = useState('Country');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
      if (initialItem && typeof initialItem === 'object' && initialItem.name) {
          // Try to match category
          const type = initialItem.type || 'Country';
          // Check if type is one of our categories, or map it
          const matchedCat = COMPARISON_CATEGORIES.find(c => c.id === type || c.id === type.replace('Political ', ''))?.id;
          
          if (matchedCat) {
              setSelectedCategory(matchedCat);
          }
          setItem1(initialItem.name);
      }
  }, [initialItem]);

  const handleCompare = () => {
      if (item1.trim() && item2.trim()) {
          setShowComparison(true);
      }
  };

  if (showComparison) {
      return (
          <ComparisonView 
            item1={{ name: item1, type: selectedCategory }} 
            item2={{ name: item2, type: selectedCategory }} 
            onClose={() => setShowComparison(false)}
            onNavigate={onNavigate} 
          />
      );
  }

  const activeCat = COMPARISON_CATEGORIES.find(c => c.id === selectedCategory) || COMPARISON_CATEGORIES[0];

  return (
    <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 overflow-y-auto pb-24 transition-colors duration-500">
        
        {/* HERO HEADER */}
        <div className="p-10 bg-gradient-to-b from-white to-academic-bg dark:from-stone-900 dark:to-stone-950 border-b border-academic-line dark:border-stone-800 transition-colors">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-serif font-bold text-academic-text dark:text-stone-100 mb-6 tracking-tight">Comparative Analysis</h2>
                <p className="text-xl font-serif text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed text-justify">
                    Evaluate political entities side-by-side to uncover structural differences, historical parallels, and ideological divergences.
                </p>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="p-8 max-w-5xl mx-auto w-full">
            
            {/* 1. Category Selection */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                {COMPARISON_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group cursor-pointer active:scale-95
                        ${selectedCategory === cat.id 
                            ? 'bg-white dark:bg-stone-900 border-academic-accent dark:border-indigo-500 shadow-xl transform -translate-y-1' 
                            : 'bg-transparent border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900'}`}
                    >
                        <cat.icon className={`w-8 h-8 mb-3 transition-colors ${selectedCategory === cat.id ? 'text-academic-accent dark:text-indigo-400' : 'text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400'}`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${selectedCategory === cat.id ? 'text-academic-text dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'}`}>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Input Engine */}
            <div className="bg-stone-100 dark:bg-stone-900 p-2 rounded-3xl flex flex-col md:flex-row gap-2 shadow-inner border border-stone-200 dark:border-stone-800">
                
                {/* Card A */}
                <div className="flex-1 bg-white dark:bg-stone-950 rounded-2xl p-10 flex flex-col items-center justify-center border border-stone-100 dark:border-stone-800 relative group focus-within:border-academic-accent dark:focus-within:border-indigo-500 transition-colors shadow-sm">
                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-stone-300 dark:text-stone-600 group-focus-within:text-academic-gold transition-colors">Entity A</span>
                    <activeCat.icon className="w-16 h-16 text-stone-200 dark:text-stone-800 mb-8 group-focus-within:text-academic-accent dark:group-focus-within:text-indigo-400 transition-colors opacity-50" />
                    <input 
                        type="text"
                        placeholder={`Name of ${activeCat.label.slice(0, -1)}...`}
                        value={item1}
                        onChange={(e) => setItem1(e.target.value)}
                        className="w-full text-center text-2xl font-serif font-bold text-academic-text dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-700 bg-transparent outline-none border-b-2 border-transparent focus:border-academic-accent dark:focus:border-indigo-500 pb-2 transition-all"
                    />
                </div>

                {/* VS Connector */}
                <div className="flex items-center justify-center p-2 relative">
                    <div className="w-16 h-16 rounded-full bg-academic-gold text-white flex items-center justify-center shadow-2xl z-10 border-4 border-stone-100 dark:border-stone-900">
                        <Swords className="w-8 h-8" />
                    </div>
                    {/* Line Connector */}
                    <div className="absolute inset-0 flex items-center justify-center -z-0">
                         <div className="w-[1px] h-full md:w-full md:h-[1px] bg-stone-300 dark:bg-stone-700"></div>
                    </div>
                </div>

                {/* Card B */}
                <div className="flex-1 bg-white dark:bg-stone-950 rounded-2xl p-10 flex flex-col items-center justify-center border border-stone-100 dark:border-stone-800 relative group focus-within:border-academic-accent dark:focus-within:border-indigo-500 transition-colors shadow-sm">
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-stone-300 dark:text-stone-600 group-focus-within:text-academic-gold transition-colors">Entity B</span>
                    <activeCat.icon className="w-16 h-16 text-stone-200 dark:text-stone-800 mb-8 group-focus-within:text-academic-accent dark:group-focus-within:text-indigo-400 transition-colors opacity-50" />
                    <input 
                        type="text"
                        placeholder={`Name of ${activeCat.label.slice(0, -1)}...`}
                        value={item2}
                        onChange={(e) => setItem2(e.target.value)}
                        className="w-full text-center text-2xl font-serif font-bold text-academic-text dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-700 bg-transparent outline-none border-b-2 border-transparent focus:border-academic-accent dark:focus:border-indigo-500 pb-2 transition-all"
                    />
                </div>
            </div>

            {/* Action */}
            <div className="mt-12 flex justify-center">
                <button 
                    onClick={handleCompare}
                    disabled={!item1.trim() || !item2.trim()}
                    className="px-12 py-5 bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 font-bold uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 hover:shadow-2xl hover:bg-academic-accent dark:hover:bg-white"
                >
                    Run Simulation <ChevronRight className="w-5 h-5" />
                </button>
            </div>

        </div>

    </div>
  );
};

export default ComparativeTab;