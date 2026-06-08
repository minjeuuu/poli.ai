
import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Users, Shield, ArrowRight } from 'lucide-react';
import { AtomicButton } from '../../shared/AtomicButton';
import { GameDefinition } from '../../../types/gameTypes';

interface CrisisEngineProps {
    game: GameDefinition;
    onExit: () => void;
}

export const CrisisEngine: React.FC<CrisisEngineProps> = ({ game, onExit }) => {
    const [turn, setTurn] = useState(1);
    const [stats, setStats] = useState({ popular: 50, elite: 50, budget: 50 });
    
    // Mock Event Generator
    const currentEvent = {
        title: `Crisis #${turn}: Market Crash`,
        desc: "The stock market has plummeted due to rumors of war. The people are panicking.",
        choices: [
            { text: "Bail out the banks", impact: { popular: -10, elite: +20, budget: -20 } },
            { text: "Subsidize food prices", impact: { popular: +20, elite: -10, budget: -20 } },
            { text: "Do nothing", impact: { popular: -20, elite: -5, budget: +10 } }
        ]
    };

    const handleChoice = (impact: any) => {
        setStats(prev => ({
            popular: Math.min(100, Math.max(0, prev.popular + impact.popular)),
            elite: Math.min(100, Math.max(0, prev.elite + impact.elite)),
            budget: Math.min(100, Math.max(0, prev.budget + impact.budget)),
        }));
        setTurn(prev => prev + 1);
    };

    return (
        <div className="h-full flex flex-col max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> {game.title}
                    </h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Turn {turn} / 20</p>
                </div>
                <AtomicButton onClick={onExit} variant="ghost" size="sm">Abort</AtomicButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-12">
                <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-xl text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <div className="h-1 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${stats.popular}%` }}></div>
                    </div>
                </div>
                <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-xl text-center">
                    <Shield className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                    <div className="h-1 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${stats.elite}%` }}></div>
                    </div>
                </div>
                <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-xl text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-500" />
                    <div className="h-1 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${stats.budget}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Event Card */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 p-8 rounded-3xl shadow-xl mb-8">
                    <h3 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-4">{currentEvent.title}</h3>
                    <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed text-justify">
                        {currentEvent.desc}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {currentEvent.choices.map((choice, i) => (
                        <button 
                            key={i}
                            onClick={() => handleChoice(choice.impact)}
                            className="w-full p-4 text-left bg-academic-accent text-white rounded-xl font-bold hover:bg-stone-800 transition-all flex justify-between items-center group"
                        >
                            {choice.text}
                            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
