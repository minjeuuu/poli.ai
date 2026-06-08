
import React, { useState, useMemo } from 'react';
import { Gamepad2, BrainCircuit, Globe, Play, Search, Filter, Cpu, Layers, Trophy, BookOpen, AlertTriangle } from 'lucide-react';
import { PoliverseGame } from '../game/poliverse/PoliverseGame';
import { AtomicCard } from '../shared/AtomicCard';
import { GAME_LIBRARY } from '../../data/games/gameLibrary';
import { GameDefinition } from '../../types/gameTypes';
import { MatchEngine } from '../game/engines/MatchEngine';
import { CrisisEngine } from '../game/engines/CrisisEngine';
import QuizView from '../QuizView';
import SimTab from './SimTab'; 

const GamesTab: React.FC = () => {
    const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [displayLimit, setDisplayLimit] = useState(24);

    const categories = ['All', 'Strategy', 'Simulation', 'Trivia', 'Puzzle', 'Roleplay'];

    const filteredLibrary = useMemo(() => {
        return GAME_LIBRARY.filter(g => 
            (activeCategory === 'All' || g.category === activeCategory) &&
            (g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
        );
    }, [searchQuery, activeCategory]);

    const handleLaunch = (game: GameDefinition) => {
        setActiveGame(game);
    };

    const handleCloseGame = () => {
        setActiveGame(null);
    };

    // --- GAME ENGINE ROUTER ---
    if (activeGame) {
        if (activeGame.engine === 'POLIVERSE') return <PoliverseGame />;
        if (activeGame.engine === 'QUIZ') return <QuizView topic={activeGame.config?.topic || 'General Politics'} onClose={handleCloseGame} />;
        if (activeGame.engine === 'MATCH') return <MatchEngine game={activeGame} onExit={handleCloseGame} />;
        if (activeGame.engine === 'CRISIS') return <CrisisEngine game={activeGame} onExit={handleCloseGame} />;
        // Reuse SimTab for simulation games (simplified integration)
        if (activeGame.engine === 'SIM') return (
            <div className="h-full flex flex-col">
                <div className="p-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                    <h2 className="font-bold">{activeGame.title}</h2>
                    <button onClick={handleCloseGame} className="text-sm underline">Exit Simulation</button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <SimTab />
                </div>
            </div>
        );
        
        return <div>Unknown Engine</div>;
    }

    return (
        <div className="h-full bg-academic-bg dark:bg-stone-950 flex flex-col overflow-hidden">
            
            {/* HEADER */}
            <div className="flex-none p-6 md:p-8 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
                            <Gamepad2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-academic-text dark:text-stone-100">Simulation Arcade</h1>
                            <p className="text-stone-500 text-sm font-mono uppercase tracking-widest">{filteredLibrary.length} Titles Available</p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-academic-accent transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search library..." 
                                className="w-full md:w-64 pl-10 pr-4 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-academic-accent transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap
                            ${activeCategory === cat ? 'bg-academic-text text-white border-academic-text' : 'bg-transparent text-stone-500 border-stone-200 hover:border-stone-400'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIBRARY GRID */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                {/* FEATURED SECTION */}
                {activeCategory === 'All' && !searchQuery && (
                    <div className="mb-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Featured Simulations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {/* Manually render top cards for visual emphasis */}
                             {GAME_LIBRARY.slice(0, 3).map(game => (
                                 <div 
                                    key={game.id} 
                                    onClick={() => handleLaunch(game)}
                                    className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                                 >
                                     <div className={`absolute inset-0 bg-gradient-to-br ${game.engine === 'POLIVERSE' ? 'from-indigo-600 to-blue-900' : game.engine === 'CRISIS' ? 'from-red-700 to-orange-900' : 'from-emerald-600 to-teal-900'}`}></div>
                                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20"></div>
                                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                     
                                     <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                         <div className="flex items-center gap-2 mb-2">
                                             <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider">{game.category}</span>
                                             <span className="text-[10px] opacity-70">{game.popularity}% Rating</span>
                                         </div>
                                         <h3 className="text-2xl font-serif font-bold mb-1 leading-tight">{game.title}</h3>
                                         <p className="text-xs text-white/80 line-clamp-2">{game.description}</p>
                                     </div>

                                     <div className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                                         <Play className="w-6 h-6 fill-white" />
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* ARCADE GRID */}
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> {activeCategory === 'All' ? 'Full Archive' : activeCategory}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredLibrary.slice(searchQuery || activeCategory !== 'All' ? 0 : 3, filteredLibrary.length).map((game) => (
                        <div 
                            key={game.id} 
                            onClick={() => handleLaunch(game)}
                            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 hover:border-academic-accent dark:hover:border-indigo-500 cursor-pointer group transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm
                                        ${game.category === 'Strategy' ? 'bg-indigo-500' : 
                                          game.category === 'Trivia' ? 'bg-amber-500' :
                                          game.category === 'Simulation' ? 'bg-emerald-500' :
                                          game.category === 'Roleplay' ? 'bg-red-500' : 'bg-stone-500'}`}>
                                        {game.category.charAt(0)}
                                    </div>
                                    {game.difficulty > 3 && <div className="text-[9px] font-bold text-stone-400 flex gap-0.5">{[...Array(game.difficulty)].map((_,i)=><div key={i} className="w-1 h-1 bg-stone-400 rounded-full"></div>)}</div>}
                                </div>
                                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 leading-tight mb-2 line-clamp-2 group-hover:text-academic-accent transition-colors">{game.title}</h4>
                                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed text-justify">{game.description}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                                {game.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[8px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded uppercase tracking-wider">{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {displayLimit < filteredLibrary.length && (
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setDisplayLimit(prev => prev + 24)}
                            className="px-6 py-2 bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                        >
                            Load More Titles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamesTab;
