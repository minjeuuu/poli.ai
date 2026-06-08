
import React, { useState, useMemo } from 'react';
import { 
  Trophy, BookOpen, Star, Crown, Gamepad2, ChevronRight, Layers, LayoutGrid, Check, Map,
  Globe, Flag, Scale, Swords, History, Landmark, Coins, Users, Brain, Shield,
  Microscope, Gavel, Feather, Pyramid, Infinity, Radio, Rocket, Zap, Leaf, Anchor,
  Code, Eye, Gavel as DebateIcon, AlertTriangle, Shuffle, ChevronUp
} from 'lucide-react';
import { UserProfile } from '../../types';
import FlashcardView from '../FlashcardView';
import QuizView from '../QuizView';
import DebateView from '../DebateView';
import { MatchEngine } from '../game/engines/MatchEngine';
import { CrisisEngine } from '../game/engines/CrisisEngine';
import { playSFX } from '../../services/soundService';

const INITIAL_PROFILE: UserProfile = {
    id: "guest_user",
    username: "",
    email: "",
    lastActive: "Now",
    displayName: "",
    bio: "Beginning the journey into political science.",
    country: "Global",
    joinedDate: new Date().toLocaleDateString(),
    level: 1,
    xp: 0,
    nextLevelXp: 500,
    streak: 1,
    totalGamesPlayed: 0,
    coins: 50,
    title: "Novice Scholar",
    achievements: [],
    researchInterests: [],
    quests: [
        { id: 'q1', title: 'Identify 5 Capitals', xpReward: 150, completed: false, target: 1, current: 0 },
        { id: 'q2', title: 'Master an Ideology', xpReward: 200, completed: false, target: 1, current: 0 },
        { id: 'q3', title: '3 Day Streak', xpReward: 500, completed: false, target: 3, current: 1 },
    ],
    mastery: {},
    stats: { 
        totalXp: 0, 
        currentLevel: 1, 
        nextLevelThreshold: 500, 
        streakDays: 0, 
        longestStreak: 0, 
        articlesRead: 0, 
        booksArchived: 0, 
        simulationsRun: 0, 
        debatesWon: 0, 
        pollsVoted: 0, 
        quizzesTaken: 0, 
        quizzesPerfect: 0, 
        flashcardsReviewed: 0, 
        accuracyRate: 0, 
        gamesPlayed: 0, 
        quizzesMastered: 0, 
        flashcardsReview: 0, 
        lastActive: "Never", 
        accuracy: 0 
    },
    recentActivity: [],
    savedItems: [],
    preferences: {
        language: 'English',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        startOfWeek: 'Monday',
        currency: 'USD',
        measurementSystem: 'Metric',
        themeMode: 'Default',
        themeScope: 'None',
        density: 'Comfortable',
        fontSize: 16,
        fontFamily: 'Serif',
        reduceMotion: false,
        highContrast: false,
        saturation: 100,
        blurEffects: true,
        showGridLines: false,
        borderRadius: 'Medium',
        emailDigest: 'Weekly',
        emailMarketing: false,
        emailSecurity: true,
        pushAlerts: true,
        pushMentions: true,
        pushReplies: true,
        pushTrending: false,
        pushSystem: true,
        pushNewContent: true,
        soundEffects: true,
        hapticFeedback: true,
        publicProfile: true,
        showOnlineStatus: true,
        showActivityLog: true,
        allowIndexing: false,
        shareAnalytics: true,
        allowPersonalization: true,
        dataRetentionPeriod: '1 Year',
        readerTypeface: 'Serif',
        readerLineHeight: 1.6,
        readerWidth: 'Standard',
        autoBookmark: true,
        highlightStyle: 'Yellow',
        showCitationOnCopy: true,
        citationStyle: 'APA',
        textToSpeechVoice: 'Kore',
        textToSpeechSpeed: 1.0,
        autoPlayMedia: false,
        backgroundAudio: false,
        developerMode: false,
        betaFeatures: false,
        offlineMode: true,
        dataSaver: false,
        cacheSize: 124,
        apiEndpoint: 'https://api.poli.ai/v1',
        debugLogging: false
    }
};

type LearnRoute = 'Lobby' | 'MissionSelect' | 'ActiveQuiz' | 'ActiveFlashcards' | 'ActiveDebate' | 'ActiveMatch' | 'ActiveCrisis';

// --- INFINITE CURRICULUM GENERATOR ---
const generateCurriculum = () => {
    // 100+ Topics for massive scale
    const coreTopics = [
        "Global Geography", "Political Theory", "Political History", "Government Systems", 
        "Political Economy", "International Relations", "US Politics", "Ancient World", 
        "Security Studies", "Public Law", "Speculative Politics", "Diplomatic Protocol",
        "Electoral Strategy", "Intelligence Analysis", "Crisis Management", "Legislative Procedure",
        "Cyber Warfare", "Space Law & Politics", "Environmental Justice", "Nuclear Strategy",
        "Post-Colonial Theory", "Urban Planning", "Human Rights Law", "Grand Strategy",
        "Political Psychology", "Game Theory", "Media & Propaganda", "Terrorism Studies",
        "Maritime Law", "Geopolitics of Energy", "Future Studies", "Xenodiplomacy",
        "Constitutional Design", "Revolutionary Tactics", "Public Administration", "Policy Analysis",
        "Biopolitics", "Necropolitics", "Cyber-Diplomacy", "Algorithmic Governance", 
        "Quantum Geopolitics", "Neuropolitics", "Agri-Food Systems", "Water Security", "Arctic Strategy",
        "Post-Human Rights", "Digital Sovereignty", "Crypto-Economics", "Metaverse Governance",
        "Urban Warfare", "Guerrilla Tactics", "Non-Violent Resistance", "Civil Disobedience",
        "Transitional Justice", "Truth Commissions", "Memory Politics", "Heritage Diplomacy",
        "Sport & Politics", "Fashion Diplomacy", "Culinary Diplomacy", "Vaccine Diplomacy",
        "Nuclear Proliferation", "Arms Control", "Disarmament", "Peacekeeping Ops",
        "Humanitarian Aid", "Refugee Law", "Migration Studies", "Border Security",
        "Indigenous Governance", "Tribal Sovereignty", "Subaltern Studies",
        "Queer Theory", "Feminist IR", "Critical Race Theory", "Intersectionality",
        "Marxist Geography", "World-Systems Analysis", "Dependency Theory", "Modernization Theory",
        "Institutionalism", "Behavioralism", "Rational Choice", 
        "Voting Behavior", "Public Opinion", "Media Effects",
        "Propaganda Analysis", "Disinformation Studies", "Strategic Comms", "Soft Power",
        "Military History", "Naval Strategy", "Air Power Theory",
        "Counter-Terrorism", "Hybrid Warfare", "Treaty Law", "International Org", "Global Governance",
        "Climate Security", "Energy Politics", "Resource Curse", "Petro-Politics", "Green Theory", 
        "Eco-Fascism", "Deep Ecology", "Anarchist Theory", "Socialist Thought", "Conservative Thought", 
        "Liberal Theory", "Fascist Studies", "Totalitarianism", "Authoritarianism", "Hybrid Regimes",
        "Democratization", "State Building", "Nation Building", "Federalism",
        "Local Government", "Health Policy", "Education Policy", "Social Policy",
        "Welfare States", "Universal Basic Income", "Monetary Policy", "Fiscal Policy",
        "Trade Theory", "Development Economics", "Labor Politics", "Unionism",
        "Corporate Power", "Lobbying", "Corruption", "Clientelism",
        "Patronage Systems", "Mafia States", "Narco-Politics", "Failed States",
        "Constitutional Law", "Administrative Law", "Criminal Justice", "Criminology",
        "Penology", "Surveillance Studies", "Privacy Rights", "Data Ethics",
        "Bioethics", "Cloning Policy", "AI Regulation", "Robot Rights"
    ];
    
    const subTopics = [
        "Foundations", "Intermediate Concepts", "Advanced Theory", "Case Studies", 
        "Mastery Challenge", "Grand Strategy", "Historical Deep Dive", "Future Scenarios",
        "Crisis Simulation", "Comparative Analysis", "Ethical Dilemmas", "Statistical Methods"
    ];
    
    const generated: any[] = [];
    
    let idCounter = 0;
    
    coreTopics.forEach(topic => {
        const items: any[] = [];
        // Generate ~800 items per category to reach massive scale
        for (let i = 1; i <= 200; i++) {
            const sub = subTopics[i % subTopics.length];
            items.push({
                id: `lvl-${idCounter++}`,
                name: `${topic}: Level ${i} - ${sub}`,
                type: topic.split(' ')[0],
                difficulty: Math.ceil(i / 25) // Difficulty scales 1-8
            });
        }
        
        let icon = Globe;
        let color = 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400';
        
        // Dynamic Icon/Color assignment based on keyword matching
        if (topic.includes("Geography") || topic.includes("Urban")) { icon = Map; color = 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'; }
        else if (topic.includes("Theory") || topic.includes("Psychology")) { icon = Brain; color = 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'; }
        else if (topic.includes("History") || topic.includes("Ancient")) { icon = History; color = 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'; }
        else if (topic.includes("Economy") || topic.includes("Trade")) { icon = Coins; color = 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'; }
        else if (topic.includes("Security") || topic.includes("Warfare") || topic.includes("Nuclear")) { icon = Shield; color = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'; }
        else if (topic.includes("Law") || topic.includes("Constitution")) { icon = Gavel; color = 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400'; }
        else if (topic.includes("Space") || topic.includes("Future") || topic.includes("Xeno")) { icon = Rocket; color = 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'; }
        else if (topic.includes("Cyber") || topic.includes("Media")) { icon = Radio; color = 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'; }
        else if (topic.includes("Environment") || topic.includes("Energy")) { icon = Leaf; color = 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'; }
        else if (topic.includes("Maritime")) { icon = Anchor; color = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'; }
        else if (topic.includes("Analysis") || topic.includes("Game Theory")) { icon = Code; color = 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400'; }
        else if (topic.includes("Intelligence")) { icon = Eye; color = 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-600 dark:text-zinc-400'; }

        generated.push({
            id: topic,
            title: topic,
            description: `${items.length} Modules Available`,
            icon: icon,
            color: color,
            items: items
        });
    });
    
    return generated;
};

const MISSION_CATEGORIES = generateCurriculum();

interface LearnTabProps {
  onNavigate: (type: string, payload: any) => void;
}

const LearnTab: React.FC<LearnTabProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [route, setRoute] = useState<LearnRoute>('Lobby');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Handlers
  const handleStartGame = (topic: string, type: 'Quiz' | 'Flashcards' | 'Debate' | 'Match' | 'Crisis') => {
      playSFX('click');
      setSelectedTopic(topic);
      if (type === 'Quiz') setRoute('ActiveQuiz');
      else if (type === 'Flashcards') setRoute('ActiveFlashcards');
      else if (type === 'Debate') setRoute('ActiveDebate');
      else if (type === 'Match') setRoute('ActiveMatch');
      else if (type === 'Crisis') setRoute('ActiveCrisis');
  };

  const handleGameComplete = (score: number, total: number) => {
      const xpGain = score * 10;
      setProfile(prev => ({
          ...prev,
          xp: prev.xp + xpGain,
          totalGamesPlayed: (prev.totalGamesPlayed || 0) + 1
      }));
      setRoute('Lobby');
      playSFX('success');
  };

  const toggleCategoryExpansion = (e: React.MouseEvent, categoryId: string) => {
      e.stopPropagation();
      playSFX('click');
      setExpandedCategories(prev => {
          const next = new Set(prev);
          if (next.has(categoryId)) {
              next.delete(categoryId);
          } else {
              next.add(categoryId);
          }
          return next;
      });
  };

  const renderLobby = () => (
      <div className="h-full overflow-y-auto pb-32 bg-academic-bg dark:bg-stone-950 p-6 animate-in fade-in">
           {/* HEADER */}
           <div className="flex items-center justify-between mb-8">
               <div>
                   <h1 className="text-3xl font-serif font-bold text-academic-text dark:text-stone-100">The Academy</h1>
                   <p className="text-xs font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-1">20,000+ Modules Loaded</p>
               </div>
               <div className="bg-white dark:bg-stone-900 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3 shadow-sm">
                   <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold uppercase text-stone-400">Level {profile.level}</span>
                       <span className="font-bold text-academic-gold">{profile.xp} XP</span>
                   </div>
                   <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500">
                       <Crown className="w-5 h-5" />
                   </div>
               </div>
           </div>

           {/* DAILY QUESTS */}
           <div className="mb-10">
               <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 px-1">Daily Quests</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {profile.quests?.map((quest) => (
                       <div key={quest.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                           <div>
                               <h4 className="font-bold text-sm text-stone-700 dark:text-stone-200">{quest.title}</h4>
                               <div className="mt-2 w-24 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-academic-accent dark:bg-indigo-500" style={{ width: `${(quest.current / quest.target) * 100}%` }}></div>
                               </div>
                           </div>
                           <span className="text-xs font-bold text-academic-gold">+{quest.xpReward} XP</span>
                       </div>
                   ))}
               </div>
           </div>

           {/* CATEGORIES */}
           <div className="space-y-4">
               {MISSION_CATEGORIES.map((cat) => (
                   <div key={cat.id}>
                       <div 
                        className="flex items-center gap-3 mb-2 p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer group select-none"
                        onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                       >
                           <div className={`p-2 rounded-lg ${cat.color}`}>
                               <cat.icon className="w-5 h-5" />
                           </div>
                           <div className="flex-1">
                               <h3 className="text-lg font-bold font-serif text-stone-800 dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{cat.title}</h3>
                               <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">{cat.description}</p>
                           </div>
                           <ChevronRight className={`w-5 h-5 text-stone-300 transition-transform duration-300 ${activeCategory === cat.id ? 'rotate-90' : ''}`} />
                       </div>
                       
                       {activeCategory === cat.id && (
                           <div className="pl-4 border-l-2 border-stone-100 dark:border-stone-800 ml-5 animate-in slide-in-from-top-2 duration-300">
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                   {/* Render items based on expansion state */}
                                   {cat.items.map((item: any, idx: number) => (
                                       <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 hover:shadow-md hover:border-academic-accent dark:hover:border-indigo-500 transition-all group">
                                           <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-xs text-stone-700 dark:text-stone-200 line-clamp-1">{item.name}</h4>
                                                <span className="text-[9px] font-bold bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-500">T{item.difficulty}</span>
                                           </div>
                                           <div className="grid grid-cols-2 gap-1.5">
                                               <button 
                                                 onClick={() => handleStartGame(item.name, 'Quiz')}
                                                 className="py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-academic-accent hover:text-white dark:hover:bg-indigo-600 transition-colors rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                                               >
                                                   <Check className="w-3 h-3" /> Quiz
                                               </button>
                                               <button 
                                                 onClick={() => handleStartGame(item.name, 'Flashcards')}
                                                 className="py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-academic-gold hover:text-white dark:hover:bg-amber-600 transition-colors rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                                               >
                                                   <LayoutGrid className="w-3 h-3" /> Cards
                                               </button>
                                               <button 
                                                 onClick={() => handleStartGame(item.name, 'Match')}
                                                 className="py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white transition-colors rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                                               >
                                                   <Shuffle className="w-3 h-3" /> Match
                                               </button>
                                               <button 
                                                 onClick={() => handleStartGame(item.name, 'Debate')}
                                                 className="py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-rose-600 hover:text-white transition-colors rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                                               >
                                                   <DebateIcon className="w-3 h-3" /> Debate
                                               </button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               
                               {/* LOAD MORE BUTTON */}
                               {cat.items.length > 10 && (
                                   <div className="sm:col-span-2 lg:col-span-3 text-center py-4 mb-4">
                                       <button 
                                            onClick={(e) => toggleCategoryExpansion(e, cat.id)}
                                            className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 flex items-center justify-center gap-2 transition-colors mx-auto p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                                       >
                                           {expandedCategories.has(cat.id) ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" /> Collapse Modules
                                                </>
                                           ) : (
                                                <>
                                                    <Infinity className="w-4 h-4" /> Load {cat.items.length - 10} More Modules
                                                </>
                                           )}
                                       </button>
                                   </div>
                               )}
                           </div>
                       )}
                   </div>
               ))}
           </div>
           
           <div className="text-center py-16 opacity-50">
                <Layers className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-stone-400">Total Curriculum Loaded</p>
           </div>
      </div>
  );

  // Helper object to construct game definition for Engines
  const createGameDef = (engine: any) => ({
      id: `learn_${Date.now()}`,
      title: selectedTopic,
      description: "Learning Module",
      category: "Education",
      engine: engine,
      difficulty: 1,
      popularity: 100,
      tags: [],
      config: { topic: selectedTopic }
  });

  return (
    <div className="h-full relative">
        {route === 'Lobby' && renderLobby()}
        
        {route === 'ActiveQuiz' && (
            <QuizView 
                topic={selectedTopic} 
                onClose={() => setRoute('Lobby')} 
                onCompleteGame={handleGameComplete} 
            />
        )}
        
        {route === 'ActiveFlashcards' && (
            <FlashcardView 
                topic={selectedTopic} 
                onClose={() => setRoute('Lobby')} 
            />
        )}

        {route === 'ActiveDebate' && (
            <DebateView 
                topic={selectedTopic} 
                onClose={() => setRoute('Lobby')}
                onComplete={(score) => handleGameComplete(score, 100)}
            />
        )}

        {route === 'ActiveMatch' && (
            <MatchEngine 
                game={createGameDef('MATCH') as any}
                onExit={() => setRoute('Lobby')}
            />
        )}

        {route === 'ActiveCrisis' && (
            <CrisisEngine
                game={createGameDef('CRISIS') as any}
                onExit={() => setRoute('Lobby')}
            />
        )}
    </div>
  );
};

export default LearnTab;
