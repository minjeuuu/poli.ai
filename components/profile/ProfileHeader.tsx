import { ImageWithFallback } from '../atoms/ImageWithFallback';

import React from 'react';
import { User, MapPin, Calendar, Link as LinkIcon, Edit3 } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileHeaderProps {
    profile: UserProfile;
    onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onEdit }) => {
    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 relative overflow-hidden shadow-sm">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-academic-accent to-academic-gold opacity-10"></div>
            
            <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 mt-12">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-academic-paper dark:bg-stone-800 border-4 border-white dark:border-stone-900 shadow-xl flex items-center justify-center text-stone-300 relative">
                    {profile.avatarUrl ? (
                        <ImageWithFallback src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <User className="w-16 h-16" />
                    )}
                    <button 
                        onClick={onEdit}
                        className="absolute bottom-0 right-0 p-2 bg-academic-accent text-white rounded-full hover:bg-indigo-600 transition-colors shadow-md"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 pb-2">
                    <h1 className="text-3xl font-serif font-bold text-academic-text dark:text-stone-100">{profile.displayName}</h1>
                    <p className="text-stone-500 dark:text-stone-400 font-mono text-xs uppercase tracking-widest mb-2">@{profile.username} • {profile.title}</p>
                    <p className="text-stone-600 dark:text-stone-300 font-serif italic max-w-2xl">{profile.bio || "No biography set."}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-stone-500">
                        {profile.country && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.country}</div>}
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(profile.joinedDate).toLocaleDateString()}</div>
                        {profile.website && <div className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline">Website</a></div>}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="text-center px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                        <span className="block font-bold text-xl text-academic-text dark:text-stone-100">{profile.level}</span>
                        <span className="text-[9px] uppercase tracking-widest text-stone-400">Level</span>
                    </div>
                    <div className="text-center px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                        <span className="block font-bold text-xl text-academic-gold">{profile.stats.streakDays}</span>
                        <span className="text-[9px] uppercase tracking-widest text-stone-400">Streak</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
