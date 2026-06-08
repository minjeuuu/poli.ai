
import React from 'react';
import { GraduationCap, BookOpen, User } from 'lucide-react';
import { AcademicProfile } from '../../../types';

export const AcademicProfileView: React.FC<{ data: AcademicProfile }> = ({ data }) => {
    if (!data) return null;
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Intellectual History</h4>
                <p className="font-serif text-lg leading-loose text-justify text-stone-700 dark:text-stone-300">
                    {data.intellectualTradition}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Universities</h4>
                    <div className="space-y-3">
                        {data.universities?.map((uni, i) => (
                            <div key={i} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                                <h5 className="font-bold text-academic-text dark:text-stone-100">{uni.name}</h5>
                                <span className="text-xs text-stone-500">{uni.location} • Rank: {uni.rank}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Journals & Think Tanks</h4>
                    <div className="space-y-3">
                        {data.thinkTanks?.map((tt, i) => (
                            <div key={i} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                                <h5 className="font-bold text-academic-text dark:text-stone-100">{tt.name}</h5>
                                <p className="text-xs text-stone-500 italic">{tt.focus}</p>
                            </div>
                        ))}
                         {data.journals?.map((j, i) => (
                            <div key={i} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                                <h5 className="font-bold text-academic-text dark:text-stone-100">{j.name}</h5>
                                <p className="text-xs text-stone-500">{j.publisher}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
