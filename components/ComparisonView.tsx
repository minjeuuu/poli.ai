
import React, { useEffect, useState, useMemo } from 'react';
import { X, ArrowLeftRight, Check, AlertCircle, Loader2, ArrowUpRight, Scale, History, TrendingUp, Zap, ChevronDown, ChevronUp, BookOpen, LayoutGrid, Swords, Shield, Coins, Brain, Layers, Globe, Gavel, Users, Building2 } from 'lucide-react';
import { ComparisonResult, ComparisonPoint } from '../types';
import { fetchComparison } from '../services/compareService';

interface ComparisonViewProps {
  item1: { name: string, type: string };
  item2: { name: string, type: string };
  onClose: () => void;
  onNavigate?: (type: string, payload: any) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ item1, item2, onClose, onNavigate }) => {
  const [data, setData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Matrix' | 'History' | 'Simulation'>('Overview');
  const [expandedMatrixRow, setExpandedMatrixRow] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchComparison(item1, item2);
        if (mounted) {
            setData(res);
            setLoading(false);
        }
      } catch (e) {
          if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [item1, item2]);

  // Group Matrix Data by Category for rendering
  const groupedMatrix = useMemo(() => {
      if (!data?.matrix) return {};
      const groups: Record<string, ComparisonPoint[]> = {};
      data.matrix.forEach(point => {
          const cat = point.category || "General";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(point);
      });
      return groups;
  }, [data]);

  const sortedCategories = useMemo(() => {
      return Object.keys(groupedMatrix).sort();
  }, [groupedMatrix]);

  const handleEntityClick = (name: string, type: string) => {
      if (onNavigate) onNavigate(type, name);
  };

  const getAdvantageColor = (adv: string) => {
      if (adv === 'Item1') return 'bg-academic-accent/10 text-academic-accent border-academic-accent/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30';
      if (adv === 'Item2') return 'bg-academic-gold/10 text-academic-gold border-academic-gold/20 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30';
      if (adv === 'Equal') return 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700';
      return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700/30';
  };

  const getAdvantageLabel = (adv: string) => {
      if (adv === 'Item1') return `Advantage: ${item1.name}`;
      if (adv === 'Item2') return `Advantage: ${item2.name}`;
      if (adv === 'Equal') return 'Parity';
      return 'Distinct';
  };

  const getCategoryIcon = (cat: string) => {
      const lower = cat.toLowerCase();
      if (lower.includes('politic')) return Building2;
      if (lower.includes('econom')) return Coins;
      if (lower.includes('militar') || lower.includes('security')) return Swords;
      if (lower.includes('society') || lower.includes('cultur')) return Users;
      if (lower.includes('legal') || lower.includes('right')) return Gavel;
      if (lower.includes('geo')) return Globe;
      if (lower.includes('tech') || lower.includes('infra')) return Zap;
      if (lower.includes('leader') || lower.includes('psych')) return Brain;
      return Layers;
  }

  if (loading) return (
      <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-stone-200 dark:border-stone-800 animate-spin border-t-academic-gold"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Scale className="w-6 h-6 text-academic-gold animate-pulse" />
            </div>
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-stone-500 animate-pulse">Running Comparative Analysis...</p>
      </div>
  );

  if (!data) return (
      <div className="h-full flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 mb-4 text-stone-400" />
          <h3 className="text-lg font-bold font-serif text-stone-600 dark:text-stone-300 mb-2">Analysis Unavailable</h3>
          <p className="text-sm text-stone-500 italic mb-6">Comparison data could not be synthesized.</p>
          <button onClick={onClose} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-bold uppercase tracking-widest">Return</button>
      </div>
  );

  const renderOverview = () => (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          {/* SYNTHESIS */}
          <div className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-academic-gold/10 to-transparent rounded-bl-full -mr-20 -mt-20"></div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-academic-gold mb-6 flex items-center gap-2 relative z-10">
                  <Brain className="w-4 h-4" /> Executive Synthesis
              </h3>
              <div className="font-serif text-lg md:text-xl leading-loose text-justify text-stone-800 dark:text-stone-200 relative z-10">
                  {(data?.synthesis || "Synthesis unavailable.").split('\n\n').map((para, i) => (
                      <p key={i} className="mb-4 break-inside-avoid-column">{para}</p>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Convergences */}
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3 pb-4 border-b border-emerald-200 dark:border-emerald-800/50 mb-4">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400"><Check className="w-5 h-5" /></div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-200">Structural Convergences</h3>
                  </div>
                  <div className="space-y-6">
                    {(data?.sharedTraits || []).map((sim, i) => (
                        <div key={i} className="group">
                            <strong className="block text-sm font-bold text-stone-800 dark:text-stone-200 mb-1 group-hover:text-emerald-600 transition-colors">{sim.title}</strong>
                            <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{sim.description}</p>
                        </div>
                    ))}
                  </div>
              </div>

              {/* Divergences */}
              <div className="bg-rose-50/50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                  <div className="flex items-center gap-3 pb-4 border-b border-rose-200 dark:border-rose-800/50 mb-4">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400"><ArrowLeftRight className="w-5 h-5" /></div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-rose-800 dark:text-rose-200">Critical Divergences</h3>
                  </div>
                  <div className="space-y-6">
                    {(data?.divergences || []).map((diff, i) => (
                        <div key={i} className="group">
                            <strong className="block text-sm font-bold text-stone-800 dark:text-stone-200 mb-1 group-hover:text-rose-600 transition-colors">{diff.title}</strong>
                            <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{diff.description}</p>
                        </div>
                    ))}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderMatrix = () => (
      <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
          <div className="bg-academic-bg/95 dark:bg-stone-950/95 backdrop-blur-md py-4 border-b border-stone-200 dark:border-stone-800 shadow-sm flex justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <span className="w-1/4">Metric</span>
              <span className="w-1/3 text-center truncate px-2 text-academic-accent dark:text-indigo-400">{item1.name}</span>
              <span className="w-1/3 text-center truncate px-2 text-academic-gold">{item2.name}</span>
          </div>
          
          {sortedCategories.map((category) => {
              const CatIcon = getCategoryIcon(category);
              return (
                  <div key={category} className="space-y-4">
                      <h3 className="text-xl font-serif font-bold text-academic-text dark:text-stone-100 flex items-center gap-3 px-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                          <CatIcon className="w-6 h-6 text-stone-400" />
                          {category}
                      </h3>
                      
                      <div className="space-y-3">
                          {groupedMatrix[category].map((point, index) => {
                              const rowKey = `${category}-${index}`; 
                              const isExpanded = expandedCategory === rowKey; 

                              return (
                                  <div 
                                    key={index} 
                                    className={`border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-stone-900 shadow-lg ring-1 ring-academic-gold transform scale-[1.01]' : 'bg-white dark:bg-stone-900/50 hover:bg-stone-50 dark:hover:bg-stone-800/80'}`}
                                  >
                                      <div 
                                        className="p-4 flex flex-col md:flex-row items-center cursor-pointer min-h-[60px]"
                                        onClick={() => setExpandedCategory(isExpanded ? null : rowKey)}
                                      >
                                          <div className="w-full md:w-1/4 mb-2 md:mb-0 font-bold text-xs uppercase tracking-wide text-stone-600 dark:text-stone-300 flex items-center gap-2">
                                              <span className={`p-1 rounded-full transition-colors ${point.advantage === 'Item1' ? 'bg-academic-accent text-white' : point.advantage === 'Item2' ? 'bg-academic-gold text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'}`}>
                                                 {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                              </span>
                                              <span className="truncate" title={point.analysis}>{(point.category || "").split(':').pop()?.trim() || "Metric"}</span>
                                          </div>
                                          
                                          <div className={`w-full md:w-1/3 text-center text-xs md:text-sm font-serif p-2 rounded-lg transition-colors ${point.advantage === 'Item1' ? getAdvantageColor('Item1') : 'text-stone-600 dark:text-stone-400'}`}>
                                              {point.item1Value}
                                          </div>
                                          
                                          <div className="hidden md:flex justify-center w-8 opacity-20">
                                              <Scale className="w-4 h-4" />
                                          </div>
                                          
                                          <div className={`w-full md:w-1/3 text-center text-xs md:text-sm font-serif p-2 rounded-lg transition-colors ${point.advantage === 'Item2' ? getAdvantageColor('Item2') : 'text-stone-600 dark:text-stone-400'}`}>
                                              {point.item2Value}
                                          </div>
                                      </div>
                                      
                                      {isExpanded && (
                                          <div className="px-4 pb-4 pt-0">
                                              <div className="md:ml-[25%] p-4 bg-stone-50 dark:bg-stone-950 rounded-lg border-l-4 border-academic-accent dark:border-indigo-500 text-sm font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                                                  <div className="flex justify-between items-center mb-2">
                                                      <span className="text-[10px] font-bold uppercase text-stone-400">Analysis</span>
                                                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${getAdvantageColor(point.advantage || 'Distinct')}`}>
                                                          {getAdvantageLabel(point.advantage || 'Distinct')}
                                                      </span>
                                                  </div>
                                                  {point.analysis}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          })}
      </div>
  );

  const renderSimulation = () => (
      <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
          <div className="bg-stone-900 dark:bg-black text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="w-48 h-48" /></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2 relative z-10">
                  <TrendingUp className="w-4 h-4" /> Future Trajectory Analysis
              </h3>
              <div className="font-serif text-lg leading-loose text-justify relative z-10 text-stone-300">
                  {data?.futureOutlook || "Projection data unavailable."}
              </div>
          </div>

          <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                  <Zap className="w-6 h-6 text-academic-gold" />
                  <h3 className="text-xl font-bold font-serif text-academic-text dark:text-stone-100">Scenario Simulations</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                  {(data?.scenarios || []).map((scenario, i) => (
                      <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group">
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md
                                      ${i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-emerald-500' : i === 3 ? 'bg-indigo-500' : 'bg-stone-500'}`}>
                                      {i + 1}
                                  </div>
                                  <div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Scenario</span>
                                      <h4 className="font-bold text-academic-text dark:text-stone-100 text-lg">{scenario.scenario}</h4>
                                  </div>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border 
                                ${scenario.likelihood === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 
                                  scenario.likelihood === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 
                                  'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'}`}>
                                  {scenario.likelihood} Probability
                              </span>
                          </div>
                          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 leading-loose text-justify pl-16">
                              {scenario.outcome}
                          </p>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 top-16 z-40 bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden transition-colors">
        
        {/* SUB HEADER - Comparison Specific */}
        <div className="flex-none h-16 border-b border-academic-line dark:border-stone-800 bg-academic-paper dark:bg-stone-900 flex justify-between items-center px-6 shadow-sm z-30">
            <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-academic-gold flex items-center gap-2 mb-1">
                    <ArrowLeftRight className="w-4 h-4" /> Comparative Analysis
                </h2>
                <h1 className="text-xl font-serif font-bold text-academic-text dark:text-stone-100 flex items-center gap-2">
                    {item1.name} <span className="text-stone-300 font-light">vs</span> {item2.name}
                </h1>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500 dark:text-stone-400">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* HERO: HEAD TO HEAD (Only on Overview Tab to save space on Matrix) */}
        {activeTab === 'Overview' && (
            <div className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-8 flex-none transition-colors">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center justify-center">
                    <div 
                        onClick={() => handleEntityClick(item1.name, item1.type)}
                        className="text-center flex-1 w-full group cursor-pointer p-6 rounded-2xl hover:bg-white dark:hover:bg-stone-900 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-800 hover:shadow-lg"
                    >
                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">{item1.type}</div>
                        <h1 className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
                            {item1.name} <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h1>
                    </div>
                    
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-academic-gold to-yellow-600 text-white flex items-center justify-center font-bold font-serif text-xl shadow-2xl z-10 ring-8 ring-stone-50 dark:ring-stone-900">VS</div>
                    
                    <div 
                        onClick={() => handleEntityClick(item2.name, item2.type)}
                        className="text-center flex-1 w-full group cursor-pointer p-6 rounded-2xl hover:bg-white dark:hover:bg-stone-900 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-800 hover:shadow-lg"
                    >
                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">{item2.type}</div>
                        <h1 className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
                            {item2.name} <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h1>
                    </div>
                </div>
            </div>
        )}

        {/* TAB NAV */}
        <div className="flex-none bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm z-20">
            <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar">
                {[
                    { id: 'Overview', icon: Scale, label: 'Synthesis' },
                    { id: 'Matrix', icon: LayoutGrid, label: '50-Point Matrix' },
                    { id: 'History', icon: History, label: 'Historical Parallels' },
                    { id: 'Simulation', icon: Zap, label: 'Future Scenarios' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap
                        ${activeTab === tab.id ? 'border-academic-gold text-academic-gold bg-stone-50/50 dark:bg-stone-800/50' : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'}`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 bg-stone-50/30 dark:bg-black/20">
            <div className="max-w-5xl mx-auto min-h-full">
                {activeTab === 'Overview' && renderOverview()}
                {activeTab === 'Matrix' && renderMatrix()}
                {activeTab === 'History' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                        <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-4 space-y-16 py-8">
                            {(data?.historicalParallels || []).map((era, i) => (
                                <div key={i} className="pl-12 relative group">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-stone-900 border-2 border-academic-gold rounded-full group-hover:scale-125 transition-transform shadow-sm"></div>
                                    <h3 className="text-xl font-bold text-academic-text dark:text-stone-100 mb-6 font-serif">{era.era}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm relative hover:border-academic-accent/30 transition-colors">
                                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-2 absolute top-6 right-6 tracking-widest">{item1.name}</div>
                                            <p className="text-sm font-serif text-stone-700 dark:text-stone-300 leading-loose text-justify mt-4">{era.item1Context}</p>
                                        </div>
                                        <div className="p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm relative hover:border-academic-gold/30 transition-colors">
                                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-2 absolute top-6 right-6 tracking-widest">{item2.name}</div>
                                            <p className="text-sm font-serif text-stone-700 dark:text-stone-300 leading-loose text-justify mt-4">{era.item2Context}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'Simulation' && renderSimulation()}
            </div>
        </div>
    </div>
  );
};

export default ComparisonView;
