
import React, { useState } from 'react';
import { Crown, Play, RotateCw } from 'lucide-react';
import { simulateNationTurn } from '../../services/sim/simEngine';
import { SimStats } from '../sim/SimStats';
import { SimMap } from '../sim/SimMap';
import LoadingScreen from '../LoadingScreen';
import { playSFX } from '../../services/soundService';
import { AtomicButton } from '../shared/AtomicButton';
import { MASSIVE_IDEOLOGIES } from '../../data/sim/ideologies';

const SimTab: React.FC = () => {
  const [simState, setSimState] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupNation, setSetupNation] = useState({ name: 'Republic of Hope', leader: 'President One', ideology: 'Liberal Democracy' });

  const startSimulation = async () => {
      playSFX('swoosh');
      setLoading(true);
      const initialState = {
          turn: 1,
          nationName: setupNation.name,
          leaderName: setupNation.leader,
          ideology: setupNation.ideology,
          stats: { stability: 50, wealth: 50, military: 50, liberty: 50 },
          history: [`${setupNation.name} founded under ${setupNation.ideology}.`],
          currentEvent: undefined,
          warMap: "00000\n00000\n00200\n00000\n00000",
          marketShare: 5
      };
      
      try {
        const nextState = await simulateNationTurn(initialState, "INITIALIZE");
        setSimState(nextState);
      } catch (e) { console.error(e); }
      setLoading(false);
  };

  const handleSimChoice = async (choiceText: string) => {
      if (!simState) return;
      playSFX('click');
      setLoading(true);
      try {
        const nextState = await simulateNationTurn(simState, choiceText);
        setSimState(nextState);
      } catch (e) { console.error(e); }
      setLoading(false);
  };

  if (loading) return (
      <div className="h-full w-full bg-academic-bg dark:bg-stone-950 flex items-center justify-center">
          <LoadingScreen message="Calculating Geopolitical Outcomes..." />
      </div>
  );

  if (!simState) {
      // SETUP SCREEN
      return (
          <div className="h-full w-full bg-academic-bg dark:bg-stone-950 overflow-y-auto p-6 flex flex-col justify-center animate-in zoom-in-95">
              <div className="max-w-md mx-auto w-full">
                  <div className="text-center mb-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-2xl rotate-3">
                          <Crown className="w-12 h-12" />
                      </div>
                      <h1 className="text-4xl font-serif font-bold text-academic-text dark:text-white mb-2">Genesis Protocol</h1>
                      <p className="text-stone-500 dark:text-stone-400 font-serif italic">Design a nation. Rewrite history.</p>
                  </div>

                  <div className="space-y-6 bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
                      <div>
                          <label className="text-xs font-bold uppercase text-stone-400 ml-1 mb-2 block tracking-widest">Nation Name</label>
                          <input 
                            type="text" 
                            value={setupNation.name} 
                            onChange={e => setSetupNation({...setupNation, name: e.target.value})} 
                            className="w-full p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-serif font-bold text-lg text-stone-800 dark:text-stone-200" 
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase text-stone-400 ml-1 mb-2 block tracking-widest">Leader Title & Name</label>
                          <input 
                            type="text" 
                            value={setupNation.leader} 
                            onChange={e => setSetupNation({...setupNation, leader: e.target.value})} 
                            className="w-full p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-serif font-bold text-lg text-stone-800 dark:text-stone-200" 
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase text-stone-400 ml-1 mb-2 block tracking-widest">Ideology</label>
                          <div className="relative">
                              <select 
                                value={setupNation.ideology} 
                                onChange={e => setSetupNation({...setupNation, ideology: e.target.value})} 
                                className="w-full p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-serif font-bold text-lg text-stone-800 dark:text-stone-200 appearance-none"
                              >
                                  {MASSIVE_IDEOLOGIES.sort().map(ideo => (
                                      <option key={ideo} value={ideo}>{ideo}</option>
                                  ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</div>
                          </div>
                      </div>
                  </div>

                  <AtomicButton onClick={startSimulation} variant="primary" size="lg" icon={Play} fullWidth className="mt-8">
                      Initialize State
                  </AtomicButton>
              </div>
          </div>
      );
  }

  // GAMEPLAY SCREEN
  return (
      <div className="h-full w-full bg-academic-bg dark:bg-stone-950 flex flex-col overflow-hidden animate-in fade-in">
          <div className="flex-none p-6 pb-2">
              <SimStats stats={simState.stats} />
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-2 pb-32">
              <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex items-center justify-center">
                       <span className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                           Year {simState.turn}
                       </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SimMap mapString={simState.warMap} />
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-lg border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                          <div className="text-center">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Market Share</h3>
                              <span className="text-4xl font-mono font-bold text-academic-accent dark:text-indigo-400">{simState.marketShare}%</span>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-academic-gold/10 rounded-bl-full -mr-10 -mt-10"></div>
                      <h2 className="text-3xl font-serif font-bold text-center mb-6 text-academic-text dark:text-white leading-tight relative z-10">{simState.currentEvent?.title || "Quiet Year"}</h2>
                      <div className="w-16 h-1 bg-academic-gold mx-auto mb-6 rounded-full"></div>
                      <p className="text-lg font-serif text-center leading-loose text-justify text-stone-600 dark:text-stone-300 relative z-10">
                          {simState.currentEvent?.description || "No major events occurred. The nation continues to develop."}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {simState.currentEvent?.choices.map((choice: any, i: number) => (
                          <button 
                            key={i}
                            onClick={() => handleSimChoice(choice.aiPrompt)}
                            className="p-6 bg-white dark:bg-stone-900/50 border-2 border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 rounded-2xl text-left group transition-all shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-lg text-stone-800 dark:text-white group-hover:text-academic-accent dark:group-hover:text-indigo-400">{choice.text}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">{choice.impact}</span>
                          </button>
                      ))}
                  </div>
                  
                  <div className="text-center pt-8">
                      <button onClick={() => setSimState(null)} className="text-xs font-bold text-stone-400 hover:text-red-500 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                          <RotateCw className="w-3 h-3" /> End Simulation
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default SimTab;
