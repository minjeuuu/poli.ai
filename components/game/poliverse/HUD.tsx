
import React from 'react';
import { Activity, Shield, Coins, Users, AlertTriangle } from 'lucide-react';
import { AtomicProgressBar } from '../../shared/AtomicProgressBar';

interface HUDProps {
    metrics: {
        structuralIntegrity: number;
        ideologicalAlignment: number;
        economicViability: number;
        socialCohesion: number;
        feedback: string[];
    };
    targets: {
        integrity: number;
        alignment: number;
    }
}

export const HUD: React.FC<HUDProps> = ({ metrics, targets }) => {
    return (
        <div className="bg-stone-900 text-white p-6 flex flex-col h-full w-full">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-academic-gold" /> System Diagnostics
            </h3>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-1 text-[10px] uppercase font-bold text-stone-400">
                        <span>Structural Integrity</span>
                        <span className={metrics.structuralIntegrity >= targets.integrity ? 'text-green-400' : 'text-red-400'}>{Math.round(metrics.structuralIntegrity)}%</span>
                    </div>
                    <AtomicProgressBar value={metrics.structuralIntegrity} max={100} color={metrics.structuralIntegrity < 30 ? 'bg-red-500' : 'bg-cyan-500'} />
                    <span className="text-[9px] text-stone-500">Target: {targets.integrity}%</span>
                </div>

                <div>
                    <div className="flex justify-between mb-1 text-[10px] uppercase font-bold text-stone-400">
                        <span>Ideological Alignment</span>
                        <span className={metrics.ideologicalAlignment >= targets.alignment ? 'text-green-400' : 'text-amber-400'}>{Math.round(metrics.ideologicalAlignment)}%</span>
                    </div>
                    <AtomicProgressBar value={metrics.ideologicalAlignment} max={100} color="bg-purple-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                         <Coins className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                         <span className="block text-lg font-mono font-bold">{Math.round(metrics.economicViability)}</span>
                         <span className="text-[9px] uppercase text-stone-500">Economy</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                         <Users className="w-5 h-5 mx-auto mb-1 text-pink-400" />
                         <span className="block text-lg font-mono font-bold">{Math.round(metrics.socialCohesion)}</span>
                         <span className="text-[9px] uppercase text-stone-500">Cohesion</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex-1 overflow-y-auto min-h-0 bg-black/20 rounded-xl p-3 border border-white/5">
                <h4 className="text-[9px] font-bold uppercase text-stone-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Live Feed
                </h4>
                <div className="space-y-2">
                    {metrics.feedback.length === 0 ? (
                        <span className="text-xs text-stone-600 italic">System Nominal.</span>
                    ) : (
                        metrics.feedback.map((msg, i) => (
                            <div key={i} className="text-[10px] font-mono text-red-300 border-l-2 border-red-500 pl-2 py-1 leading-tight">
                                {msg}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
