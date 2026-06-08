
import React from 'react';
import { TrendingUp, BookOpen, Brain, Zap, MessageSquare, Award, Target, Activity } from 'lucide-react';
import { DetailedStats } from '../../types';

interface ProfileStatsProps {
    stats: DetailedStats;
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between group hover:border-academic-accent dark:hover:border-indigo-500 transition-all">
        <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">{label}</span>
            <span className="text-2xl font-mono font-bold text-academic-text dark:text-stone-100">{value}</span>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Activity Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total XP" value={stats.totalXp.toLocaleString()} icon={Zap} color="bg-yellow-500" />
                    <StatCard label="Articles Read" value={stats.articlesRead} icon={BookOpen} color="bg-blue-500" />
                    <StatCard label="Simulations" value={stats.simulationsRun} icon={TrendingUp} color="bg-emerald-500" />
                    <StatCard label="Accuracy" value={`${stats.accuracyRate}%`} icon={Target} color="bg-red-500" />
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Intellectual Capital
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Quizzes" value={stats.quizzesPerfect} icon={Award} color="bg-purple-500" />
                    <StatCard label="Books" value={stats.booksArchived} icon={BookOpen} color="bg-pink-500" />
                    <StatCard label="Debates" value={stats.debatesWon} icon={Award} color="bg-amber-500" />
                    <StatCard label="Flashcards" value={stats.flashcardsReviewed} icon={Brain} color="bg-cyan-500" />
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-stone-100 dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-stone-500">
                    <span>Level Progress ({stats.currentLevel})</span>
                    <span>{stats.nextLevelThreshold - (stats.totalXp % stats.nextLevelThreshold)} XP to Next Level</span>
                </div>
                <div className="w-full h-4 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-academic-gold to-orange-500 transition-all duration-1000" 
                        style={{ width: `${((stats.totalXp % stats.nextLevelThreshold) / stats.nextLevelThreshold) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
