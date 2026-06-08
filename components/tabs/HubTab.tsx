import React from 'react';
import { Globe, Users, BookOpen, Library, Calendar, Scale, Gamepad2, Brain, GraduationCap, DollarSign, MessageSquare, Mail, Languages, LayoutGrid } from 'lucide-react';
import { MainTab } from '../../types';

interface HubTabProps {
    onNavigate: (tab: MainTab) => void;
}

const APPS = [
    { id: 'countries', label: 'Nations', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'persons', label: 'People', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'theory', label: 'Theory', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'read', label: 'Library', icon: Library, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'almanac', label: 'Almanac', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'comparative', label: 'Compare', icon: Scale, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'sim', label: 'Simulate', icon: Gamepad2, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'games', label: 'Games', icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'learn', label: 'Learn', icon: GraduationCap, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { id: 'translate', label: 'Translate', icon: Languages, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export const HubTab: React.FC<HubTabProps> = ({ onNavigate }) => {
    return (
        <div className="flex-1 overflow-y-auto w-full h-full pb-32">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10">
                <div className="flex flex-col items-center text-center gap-4 mb-12 animate-in slide-in-from-top-4 duration-500">
                    <div className="p-4 bg-academic-accent text-white rounded-2xl shadow-xl shadow-academic-accent/20">
                        <LayoutGrid className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-academic-text dark:text-stone-100 mb-2">Network Hub</h1>
                        <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base max-w-lg mx-auto">Access the world's most comprehensive repository of political, historical, and demographic data streams.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {APPS.map(app => (
                        <button
                            key={app.id}
                            onClick={() => onNavigate(app.id as MainTab)}
                            className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur border border-stone-200/50 dark:border-stone-800/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 group aspect-square active:scale-95"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${app.bg} ${app.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 rotate-0 group-hover:rotate-3 shadow-inner`}>
                                <app.icon className="w-8 h-8 stroke-[1.5px]" />
                            </div>
                            <span className="font-serif font-bold text-sm tracking-wide text-stone-700 dark:text-stone-200">{app.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
