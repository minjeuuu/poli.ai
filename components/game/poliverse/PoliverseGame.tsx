
import React, { useState, useEffect, useMemo } from 'react';
import { GameScenario, GameState, GameEntity, EntityType } from '../../../types/gameTypes';
import { getAllGameEntities } from '../../../services/game/poliverseData';
import { generateScenario, calculateMetrics } from '../../../services/game/poliverseEngine';
import { StructureCanvas } from './StructureCanvas';
import { InventoryRail } from './InventoryRail';
import { HUD } from './HUD';
import { playSFX } from '../../../services/soundService';
import { ChevronRight, RefreshCcw, CheckCircle, BrainCircuit, X } from 'lucide-react';
import Confetti from 'react-confetti';

export const PoliverseGame: React.FC = () => {
    // Game State
    const [scenario, setScenario] = useState<GameScenario | null>(null);
    const [slots, setSlots] = useState<Record<string, GameEntity>>({});
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<EntityType | null>(null);
    const [won, setWon] = useState(false);
    const [hudOpen, setHudOpen] = useState(true);

    // Data
    const allEntities = useMemo(() => getAllGameEntities(), []);
    
    // Derived Metrics
    const metrics = useMemo(() => calculateMetrics(slots), [slots]);

    const startNewGame = () => {
        const newScenario = generateScenario();
        setScenario(newScenario);
        setSlots({});
        setWon(false);
        playSFX('open');
    };

    useEffect(() => {
        if (!scenario) startNewGame();
    }, []);

    // Win Check
    useEffect(() => {
        if (!scenario) return;
        const slotsFilled = scenario.requiredSlots?.length === Object.keys(slots).length; // Simplified check
        const integrityPass = metrics.structuralIntegrity >= scenario.targetIntegrity;
        const alignmentPass = metrics.ideologicalAlignment >= scenario.targetAlignment;
        
        if (slotsFilled && integrityPass && alignmentPass && !won) {
            setWon(true);
            playSFX('success');
        }
    }, [slots, metrics, scenario]);

    const handleSlotClick = (type: EntityType, slotId: string) => {
        setActiveSlotId(slotId);
        setActiveFilter(type);
        setInventoryOpen(true);
        playSFX('click');
    };

    const handleEntitySelect = (entity: GameEntity) => {
        if (activeSlotId) {
            setSlots(prev => ({ ...prev, [activeSlotId]: entity }));
            setInventoryOpen(false);
            setActiveSlotId(null);
            playSFX('click');
        }
    };

    const handleRemoveEntity = (slotId: string) => {
        const newSlots = { ...slots };
        delete newSlots[slotId];
        setSlots(newSlots);
        playSFX('close');
    };

    if (!scenario) return null;

    return (
        <div className="h-full flex flex-col bg-stone-50 dark:bg-stone-950 relative overflow-hidden">
            {won && <Confetti numberOfPieces={200} recycle={false} />}
            
            {/* GAME HEADER */}
            <div className="h-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-academic-accent text-white rounded-lg">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100">POLIverse <span className="text-stone-400 font-light">Structure Builder</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-academic-gold">{scenario.title}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <span className="block text-[10px] uppercase font-bold text-stone-400">Objective</span>
                        <span className="text-xs font-mono text-stone-600 dark:text-stone-300">Integrity &gt; {scenario.targetIntegrity}%</span>
                    </div>
                    <button onClick={startNewGame} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500">
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    {won && (
                        <button className="px-6 py-2 bg-green-500 text-white rounded-full font-bold uppercase text-xs tracking-widest shadow-lg animate-pulse flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> System Stable
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN GAME AREA */}
            <div className="flex-1 overflow-hidden flex relative">
                
                {/* HUD Trigger Button (when closed) */}
                {!hudOpen && (
                    <button 
                        onClick={() => setHudOpen(true)}
                        className="absolute left-4 top-4 z-40 p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-lg border border-stone-700 flex items-center gap-2 font-mono text-xs uppercase tracking-wider transition-all"
                    >
                        <BrainCircuit className="w-4 h-4 text-academic-gold" />
                        <span>Diagnostics</span>
                    </button>
                )}

                {/* HUD PANEL (Responsive Drawer) */}
                <div className={`
                    transition-all duration-300 ease-flow
                    absolute md:relative z-50 md:z-20
                    left-0 top-0 bottom-0 h-full
                    bg-stone-900 border-r border-stone-800
                    flex flex-col
                    ${hudOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-0'}
                `}>
                    <div className="flex-1 min-h-0 relative">
                        {/* Collapse Button inside HUD */}
                        <button 
                            onClick={() => setHudOpen(false)}
                            className="absolute top-4 right-4 p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors z-30"
                            title="Collapse HUD"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <HUD metrics={metrics} targets={{ integrity: scenario.targetIntegrity, alignment: scenario.targetAlignment }} />
                    </div>
                </div>

                {/* CANVAS */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6 p-6 bg-white dark:bg-stone-900 border-l-4 border-academic-accent dark:border-indigo-500 rounded-r-xl shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-2">Briefing</h3>
                            <p className="font-serif text-lg text-stone-700 dark:text-stone-200 leading-relaxed text-justify">
                                {scenario.description}
                            </p>
                        </div>
                        
                        <StructureCanvas 
                            requiredSlots={scenario.requiredTypes || []} 
                            placedEntities={slots}
                            onRemove={handleRemoveEntity}
                            onSlotClick={handleSlotClick}
                            lockedEntities={scenario.lockedEntities}
                            metrics={metrics}
                        />
                    </div>
                </div>

                {/* INVENTORY DRAWER */}
                <div className={`absolute top-0 right-0 bottom-0 bg-white dark:bg-stone-900 shadow-2xl transition-transform duration-300 transform z-40 flex flex-col ${inventoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Select {activeFilter}</h3>
                        <button onClick={() => setInventoryOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
                    </div>
                    <InventoryRail 
                        entities={allEntities} 
                        filterType={activeFilter} 
                        onSelect={handleEntitySelect} 
                    />
                </div>

            </div>
        </div>
    );
};
