
import React, { useState, useEffect } from 'react';
import { UserProfile, SavedItem, ThemeScope, UserPreferences, DetailedStats, SpecialTheme, DEFAULT_STATS, DEFAULT_PREFS } from '../../types';
import { Settings, BarChart2, Edit3, Bookmark, LogOut } from 'lucide-react';
import { ProfileHeader } from '../profile/ProfileHeader';
import { ProfileStats } from '../profile/ProfileStats';
import { EditProfileForm } from '../profile/EditProfileForm';
import { SettingsView } from '../profile/SettingsView';
import { InventoryList } from '../profile/InventoryList';
import { playSFX } from '../../services/soundService';

interface ProfileTabProps {
    onNavigate: (type: string, payload: any) => void;
    onAddToCompare: (name: string, type: string) => void;
    onToggleSave: (item: SavedItem) => void;
    isSaved: (title: string, type: string) => boolean;
    appLang: string;
    setAppLang: (lang: string) => void;
    savedItems: SavedItem[];
    onDeleteSaved: (id: string) => void;
    updateThemeScope: (scope: ThemeScope, country?: string) => void;
    setGlobalTheme: (theme: SpecialTheme) => void; // New prop for global theme
    currentTheme: SpecialTheme;
    user: UserProfile | null;
}

// Initial prefs to seed state
// ... migrated to types.ts

const ProfileTab: React.FC<ProfileTabProps> = ({ 
    onNavigate, 
    appLang, 
    setAppLang, 
    savedItems, 
    onDeleteSaved, 
    updateThemeScope,
    setGlobalTheme,
    currentTheme,
    user
}) => {
    // --- STATE ---
    const [view, setView] = useState<'Overview' | 'Edit' | 'Settings' | 'Inventory'>('Overview');
    
    // Ensure the profile reflects the current global theme on mount/update
    const [profile, setProfile] = useState<UserProfile>(user || {
        id: 'guest',
        username: '',
        email: '',
        displayName: '',
        bio: 'Welcome! You are currently using the app as a guest. Logging in allows you to save preferences, synchronize bookmarks, and build your scholarly profile.',
        country: 'Global',
        city: '',
        title: 'Observer',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Now',
        level: 1,
        xp: 0,
        coins: 0,
        stats: { ...DEFAULT_STATS, totalXp: 0, currentLevel: 1, streakDays: 0, longestStreak: 0, articlesRead: 0, booksArchived: 0, simulationsRun: 0, debatesWon: 0, pollsVoted: 0, quizzesTaken: 0, quizzesPerfect: 0, flashcardsReviewed: 0, accuracyRate: 0 },
        preferences: { ...DEFAULT_PREFS, themeMode: currentTheme },
        achievements: [],
        savedItems: savedItems,
        
        socials: {},
        academic: {
            specializations: []
        }
    });

    useEffect(() => {
        if (user) {
            setProfile(user);
        }
    }, [user]);

    // --- HANDLERS ---
    
    const handleUpdateProfile = (updated: UserProfile) => {
        setProfile(updated);
        setView('Overview');
        playSFX('success');
    };

    const handleUpdatePrefs = (newPrefs: UserPreferences) => {
        setProfile(prev => ({ ...prev, preferences: newPrefs }));
        
        // Critical: Update Global State via Props
        setGlobalTheme(newPrefs.themeMode);
        updateThemeScope(newPrefs.themeScope, profile.country);
        setAppLang(newPrefs.language);
        
        playSFX('click');
    };

    const navItems = [
        { id: 'Overview', label: 'Dashboard', icon: BarChart2 },
        { id: 'Inventory', label: 'Archives', icon: Bookmark },
        { id: 'Settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-full overflow-y-auto bg-stone-50/50 dark:bg-black/20 scroll-smooth pb-32">
            
            {/* 1. VIEW SWITCHER (Sub-nav) */}
            <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 py-2 flex justify-between items-center">
                 <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                     {navItems.map(item => (
                         <button
                            key={item.id}
                            onClick={() => { setView(item.id as any); playSFX('click'); }}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
                            ${view === item.id 
                                ? 'bg-academic-bg dark:bg-stone-800 text-academic-accent dark:text-indigo-400 shadow-sm' 
                                : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-600'}`}
                         >
                             <item.icon className="w-4 h-4" /> {item.label}
                         </button>
                     ))}
                 </div>
                 
                 {view === 'Overview' && (
                     <button 
                        onClick={() => setView('Edit')} 
                        className="p-2 text-stone-400 hover:text-academic-accent transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit Profile"
                     >
                         <Edit3 className="w-4 h-4" />
                     </button>
                 )}
            </div>

            {/* 2. MAIN SCROLL AREA */}
            <div className="p-6 md:p-12">
                <div className="max-w-6xl mx-auto">
                    
                    {view === 'Overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <ProfileHeader profile={profile} onEdit={() => setView('Edit')} />
                            <ProfileStats stats={profile.stats} />
                        </div>
                    )}

                    {view === 'Edit' && (
                        <EditProfileForm 
                            profile={profile} 
                            onSave={handleUpdateProfile} 
                            onCancel={() => setView('Overview')} 
                        />
                    )}

                    {view === 'Settings' && (
                        <div className="animate-in fade-in slide-in-from-right duration-500">
                             <div className="mb-8">
                                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-2">System Configuration</h1>
                                 <p className="text-stone-500 font-serif italic">Manage your POLI experience protocol.</p>
                             </div>
                             <SettingsView prefs={profile.preferences} onUpdate={handleUpdatePrefs} />
                             
                             <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
                                 <button className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest transition-colors">
                                     <LogOut className="w-4 h-4" /> Sign Out of All Devices
                                 </button>
                             </div>
                        </div>
                    )}

                    {view === 'Inventory' && (
                        <div className="animate-in fade-in slide-in-from-bottom duration-500">
                            <InventoryList 
                                items={savedItems} 
                                onNavigate={onNavigate} 
                                onDelete={onDeleteSaved} 
                            />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
