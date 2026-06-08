

// types.ts (Partial update for interfaces)
// ... keeping existing imports ...

export type MainTab = 'home' | 'explore' | 'countries' | 'persons' | 'theory' | 'read' | 'almanac' | 'comparative' | 'sim' | 'games' | 'learn' | 'rates' | 'social' | 'messages' | 'profile' | 'translate' | 'hub';

export type SpecialTheme = 'Default' | 'War' | 'Tech' | 'Cyberpunk' | 'Christmas' | 'NewYear' | 'ChineseNewYear' | 'Royal' | 'Revolution' | 'Retro' | 'Neon' | 'Nature' | 'Corporate' | 'Midnight' | 'Sunset' | 'Ocean' | 'Forest' | 'Desert' | 'Lavender' | 'Mint' | 'Coffee' | 'Steel' | 'Matrix' | 'Steampunk' | 'Vaporwave' | 'Noir' | 'Synth' | 'Solar' | 'Lunar' | 'Arctic' | 'Volcanic' | 'Jungle' | 'Monochrome' | 'Sepia' | 'Velvet' | 'Slate';

export type ThemeScope = 'None' | 'National' | 'Continent';

export interface SavedItem {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    dateAdded: string;
}

// ... Enums ...
export enum Discipline {
    COMPARATIVE_POLITICS = 'Comparative Politics',
    INTERNATIONAL_RELATIONS = 'International Relations',
    POLITICAL_THEORY = 'Political Theory',
    PUBLIC_ADMINISTRATION = 'Public Administration',
    PUBLIC_LAW = 'Public Law',
    POLITICAL_ECONOMY = 'Political Economy'
}

// ... Quote, DailyHistoryEvent, etc ...
export interface Quote {
    text: string;
    author: string;
    year?: string;
    region?: string;
}

export interface DailyHistoryEvent {
    year: string;
    event: string;
    location: string;
    description: string;
    title?: string;
    type?: string;
    month?: string;
    keyFigures?: string[];
}

export interface HighlightedEntity {
    category: string;
    title: string;
    subtitle: string;
    meta: string;
}

export interface HighlightDetail {
    title: string;
    subtitle: string;
    category: string;
    summary: string;
    historicalBackground: string;
    significance: string;
    keyConcepts: { concept: string; definition: string }[];
    modernConnections: string[];
    sources: { title: string; url: string }[];
}

export interface CountryNews {
    headline: string;
    summary: string;
    source: string;
    date: string;
    url?: string;
    snippet?: string;
    tags?: string[];
    sources?: { title: string; uri: string }[];
}

export interface DailyContext {
    date: string;
    quote: Quote;
    news: CountryNews[];
    highlightedPerson: HighlightedEntity;
    highlightedCountry: HighlightedEntity;
    highlightedIdeology: HighlightedEntity;
    highlightedDiscipline: HighlightedEntity;
    highlightedOrg: HighlightedEntity;
    dailyFact: { content: string; source: string; type: string };
    dailyTrivia: { content: string; source: string; type: string };
    historicalEvents: DailyHistoryEvent[];
    otherHighlights: HighlightedEntity[];
    synthesis: string;
}

export interface TrendingTopic {
    topic: string;
    category: string;
}

export interface SocialLinks {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    orcid?: string;
    googleScholar?: string;
    researchGate?: string;
    substack?: string;
    youtube?: string;
    discord?: string;
    mastodon?: string;
    instagram?: string;
    facebook?: string;
}

export interface AcademicCredentials {
    institution?: string;
    department?: string;
    degree?: string;
    startYear?: string;
    endYear?: string;
    advisor?: string;
    thesisTitle?: string;
    officeHours?: string;
    researchGroups?: string[];
    specializations: string[];
}

export interface EducationEntry {
    id: string;
    institution: string;
    degree: string;
    year: string;
}

export interface ExperienceEntry {
    id: string;
    role: string;
    organization: string;
    duration: string;
}

export interface PublicationEntry {
    id: string;
    title: string;
    journal: string;
    year: string;
    link?: string;
}

export interface UserPreferences {
    language: string;
    secondaryLanguage?: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    startOfWeek: string;
    currency: string;
    measurementSystem: string;
    
    themeMode: SpecialTheme;
    themeScope: ThemeScope;
    density: string;
    fontSize: number;
    fontFamily: string;
    reduceMotion: boolean;
    highContrast: boolean;
    colorBlindMode?: string;
    typography?: string;
    saturation: number;
    blurEffects: boolean;
    showGridLines: boolean;
    borderRadius: string;
    
    emailNotifications?: boolean;
    digestFrequency?: string;
    emailDigest: string;
    emailMarketing: boolean;
    emailSecurity: boolean;
    pushAlerts: boolean;
    pushMentions: boolean;
    pushReplies: boolean;
    pushTrending: boolean;
    pushSystem: boolean;
    pushNewContent: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
    
    publicProfile: boolean;
    showOnlineStatus: boolean;
    showActivityLog: boolean;
    allowIndexing: boolean;
    shareAnalytics: boolean;
    allowPersonalization: boolean;
    dataRetentionPeriod: string;
    
    readerTypeface: string;
    readerLineHeight: number;
    readerWidth: string;
    autoBookmark: boolean;
    highlightStyle: string;
    showCitationOnCopy: boolean;
    citationStyle: string;
    
    textToSpeechVoice: string;
    textToSpeechSpeed: number;
    autoPlayMedia: boolean;
    backgroundAudio: boolean;
    
    developerMode: boolean;
    betaFeatures: boolean;
    offlineMode: boolean;
    dataSaver: boolean;
    cacheSize: number;
    apiEndpoint?: string;
    debugLogging: boolean;

    // Added for "more and more" settings coverage
    autoTranslate?: boolean;
    dyslexiaFont?: boolean;
    compactSidebar?: boolean;
    showMinimap?: boolean;
    enableKeyboardShortcuts?: boolean;
    autoSave?: boolean;
    cloudSync?: boolean;
    twoFactorAuth?: boolean;
    biometricLogin?: boolean;
    contentFilterLevel?: 'Strict' | 'Moderate' | 'None';
    downloadQuality?: 'High' | 'Medium' | 'Low';
    streamQuality?: '4k' | '1080p' | '720p' | 'Auto';
    showBreadcrumbs?: boolean;
    animateTransitions?: boolean;
}

export const DEFAULT_PREFS: UserPreferences = {
    language: 'English',
    secondaryLanguage: 'None',
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
    colorBlindMode: 'None',
    emailNotifications: false,
    digestFrequency: 'Daily',
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
};

export interface DetailedStats {
    totalXp: number;
    currentLevel: number;
    nextLevelThreshold: number;
    streakDays: number;
    longestStreak: number;
    
    articlesRead: number;
    booksArchived: number;
    simulationsRun: number;
    debatesWon: number;
    pollsVoted: number;
    
    quizzesTaken: number;
    quizzesPerfect: number;
    flashcardsReviewed: number;
    accuracyRate: number;
    
    postsCreated: number;
    commentsWritten: number;
    likesReceived: number;
    citationsReceived: number;
    
    gamesPlayed?: number; 
    quizzesMastered?: number; 
    flashcardsReview?: number; 
    lastActive?: string; 
    accuracy?: number; 
}

export const DEFAULT_STATS: DetailedStats = {
    totalXp: 0,
    currentLevel: 1,
    nextLevelThreshold: 1000,
    streakDays: 1,
    longestStreak: 1,
    articlesRead: 0,
    booksArchived: 0,
    simulationsRun: 0,
    debatesWon: 0,
    pollsVoted: 0,
    quizzesTaken: 0,
    quizzesPerfect: 0,
    flashcardsReviewed: 0,
    accuracyRate: 0,
    postsCreated: 0,
    commentsWritten: 0,
    likesReceived: 0,
    citationsReceived: 0,
    gamesPlayed: 0,
    quizzesMastered: 0,
    flashcardsReview: 0,
    accuracy: 0
};

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    displayName: string;
    bio: string;
    country: string;
    city?: string;
    
    title: string;
    role?: string; 
    institution?: string; 
    avatarUrl?: string;
    bannerUrl?: string;
    
    socials?: SocialLinks;
    academic?: AcademicCredentials;
    
    // CV Sections
    educationHistory?: EducationEntry[];
    workHistory?: ExperienceEntry[];
    publications?: PublicationEntry[];
    
    joinedDate: string;
    lastActive: string;
    
    level: number;
    xp: number;
    coins: number;
    
    stats: DetailedStats;
    preferences: UserPreferences;
    
    achievements: any[];
    savedItems: SavedItem[];
    
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    specializations?: string[];
    totalGamesPlayed?: number; 
    nextLevelXp?: number; 
    streak?: number; 
    researchInterests?: string[];
    quests?: any[];
    mastery?: Record<string, any>;
    recentActivity?: any[];
}

// ... keeping other interfaces ...
export interface PoliticalRecord {
    entity?: {
        id?: string;
        name: string;
        officialName?: string;
        type: string;
        jurisdiction?: string;
        establishedDate?: string;
        status?: string;
        description?: string;
    };
    historicalContext?: string;
    timeline?: {
        id?: string;
        date: string;
        title: string;
        type?: string;
        description: string;
        outcome?: string;
        citations?: any[];
    }[];
    relatedDisciplines?: string[];
    primarySources?: any[];
}
// ... Rest of types ...
export interface DisciplineDetail {
    name: string;
    iconName?: string;
    overview?: {
        definition: string;
        scope: string;
        importance: string;
        keyQuestions: string[];
    };
    historyNarrative?: string;
    history?: { year: string; event: string; impact: string }[];
    subDisciplines?: string[];
    coreTheories?: { name: string; year: string; summary: string }[];
    methods?: { name: string; description: string; example: string }[];
    scholars?: { name: string; country: string; period: string; contribution: string }[];
    foundationalWorks?: { title: string; author: string; year: string }[];
    regionalFocus?: { region: string; description: string }[];
    relatedDisciplines?: string[];
    intellectualTradition?: string;
    universities?: { name: string; rank: string; location: string; notableAlumni: string[] }[];
    thinkTanks?: { name: string; focus: string; influence: string }[];
    journals?: { name: string; publisher: string; impactFactor?: string }[];
}

export interface RegionalDetail {
    region: string;
    summary: string;
    keyCountries: string[];
    politicalThemes: string[];
    challenges: string[];
    imageUrl?: string;
}

export interface OrganizationDetail {
    name: string;
    abbr?: string;
    type: string;
    headquarters: string;
    founded: string;
    secretaryGeneral: string;
    mission: string;
    members: (string | { name: string; role: string; isoCode: string })[];
    history: string;
    keyOrgans: { name: string; function: string }[];
    majorTreaties: string[];
    budget?: string;
    ideologicalParadigm?: string;
    governanceModel?: string;
    satelliteOffices?: string[];
    logoUrl?: string;
    nativeName?: string;
    leadership?: { name: string; role: string; bio: string }[];
    finances?: { source: string; amount: string }[];
    projects?: { name: string; description: string; status: string }[];
    controversies?: string[];
}

export interface PoliticalPartyDetail {
    name: string;
    abbr?: string;
    founded: string;
    headquarters: string;
    ideology: string;
    politicalPosition: string;
    currentLeader: string;
    colors: string[];
    history: string;
    keyMembers: string[];
    platform: string;
    logoUrl?: string;
}

export interface PersonDetail {
    name: string;
    role: string;
    country: string;
    era: string;
    imageUrl?: string;
    bio: string;
    ideology: string;
    politicalWorks: string[];
    officesHeld: { role: string; years: string }[];
    timeline: { year: string; event: string }[];
    allies?: string[];
    rivals?: string[];
    education?: string[];
    quotes?: string[];
    relatedLinks: { title: string; url: string }[];
    earlyLife?: string;
    personalLife?: string;
    controversies?: string[];
    awards?: string[];
    psychologicalProfile?: {
        traits: string[];
        leadershipStyle: string;
        publicPerception: string;
    };
    mediaPresence?: {
        interviews: string[];
        speeches: string[];
        socialMediaStyle: string;
    };
}

export interface EventDetail {
    title: string;
    date: string;
    location: string;
    imageUrl?: string;
    context: string;
    keyActors: string[];
    outcome: string;
    significance: string;
    casualties?: string;
    forcesInvolved?: string[];
    weather?: string;
    timeline?: { time: string; description: string }[];
    documents: string[];
}

export interface IdeologyDetail {
    name: string;
    definition: string;
    origins: string;
    historyNarrative: string;
    timeline?: { year: string; event: string; impact: string }[];
    branches: string[];
    coreTenets: { concept: string; description: string }[];
    keyThinkers: { name: string; era: string; contribution: string }[];
    globalImpact: string;
    criticisms: string;
    foundationalWorks: { title: string; author: string; year: string }[];
}

export interface ConceptDetail {
    term: string;
    definition: string;
    context: string;
    examples: string[];
    history: string;
}

export interface BookStructure {
    title: string;
    author: string;
    chapters: string[];
}

export interface Flashcard {
    front: string;
    back: string;
    category?: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface ComparisonPoint {
    category: string;
    item1Value: string;
    item2Value: string;
    analysis: string;
    advantage: 'Item1' | 'Item2' | 'Equal' | 'Distinct';
}

export interface ComparisonResult {
    item1: { name: string; type: string };
    item2: { name: string; type: string };
    synthesis: string;
    sharedTraits: { title: string; description: string }[];
    divergences: { title: string; description: string }[];
    matrix: ComparisonPoint[];
    historicalParallels: { era: string; item1Context: string; item2Context: string }[];
    futureOutlook: string;
    scenarios: { scenario: string; outcome: string; likelihood: string }[];
}

export interface ExchangeRate {
    currencyCode: string;
    currencyName: string;
    rate: number;
    symbol: string;
    category: 'Fiat' | 'Crypto' | 'Historical' | 'Fictional';
}

export interface AlmanacData {
    date: string;
    context: string;
    historicalEvents: DailyHistoryEvent[];
    births: { year: string; title: string; description: string; type?: string }[];
    deaths: { year: string; title: string; description: string; type?: string }[];
    treaties: { year: string; title: string; description: string; type?: string }[];
    elections: { year: string; title: string; description: string; type?: string }[];
    revolutions: { year: string; title: string; description: string; type?: string }[];
    laws: { year: string; title: string; description: string; type?: string }[];
    constitutions: { year: string; title: string; description: string; type?: string }[];
}

export interface PoliticalCalendarEvent {
    date: string;
    type: string;
    title: string;
    country: string;
    description: string;
}

export interface SimulationState {
    turn: number;
    nationName: string;
    leaderName: string;
    ideology: string;
    stats: { stability: number; wealth: number; military: number; liberty: number };
    history: string[];
    currentEvent?: {
        title: string;
        description: string;
        choices: { text: string; impact: string; aiPrompt: string }[];
    };
    warMap: string;
    marketShare: number;
    technologies?: string[];
}

export interface TranslationResult {
    original: string;
    translated: string;
    sourceLanguage: string;
    targetLanguage: string;
    nuanceAnalysis: string;
}

export interface SocialPost {
    id: string;
    type: 'Analysis' | 'Video' | 'Reel' | 'Poll' | 'Debate' | 'Historical' | 'Theory';
    title: string;
    author: { name: string; credential: string; avatar: string; handle?: string; verified?: boolean };
    timestamp: string;
    content: string;
    fullContent: string;
    discipline: string;
    region?: string;
    citations: { id: string; source: string; year: number; authorOrBody: string }[];
    reactions: { valid: number; disputed: number; citationNeeded: number; hearts: number };
    comments: Comment[];
    tags: { label: string; type: string }[];
    relatedEntities?: { name: string; type: string }[];
    videoUrl?: string;
    reelUrl?: string;
    poll?: { question: string; options: { text: string; votes: number }[]; totalVotes: number };
    debate?: { sideA: { name: string; argument: string }; sideB: { name: string; argument: string } };
}

export interface Comment {
    id: string;
    user: string;
    text: string;
    timestamp: string;
    likes: number;
}

export interface SpotlightItem {
    type: string;
    name: string;
    desc: string;
    meta: string;
}

export interface ChatMessage {
    id: string;
    chatId?: string;
    conversationId?: string;
    senderId: string;
    text: string;
    timestamp: string;
    isMe: boolean;
    attachments?: { name: string; type: 'doc' | 'image'; url: string }[];
}

export interface ChatParticipant {
    name: string;
    role: string;
    status: 'Online' | 'Offline' | 'Away';
    avatar: string;
}

export interface ChatConversation {
    id: string;
    participant: ChatParticipant;
    lastMessage: string;
    lastTime: string;
    unread: number;
    archived: boolean;
    messages: ChatMessage[];
}

export interface PersonNode {
    name: string;
    type: 'Folder' | 'Person' | 'Category';
    role?: string;
    country?: string;
    era?: string;
    items?: PersonNode[];
}

export interface PersonCategory {
    name: string;
    type: 'Category';
    items: PersonNode[];
}

export interface PoliticalEvent {
    title: string;
    date: string;
    type: string;
    description: string;
    outcome?: string;
    citations?: { source: string }[];
}

export interface PoliticalEntity {
    name: string;
    officialName: string;
    type: string;
    jurisdiction: string;
    establishedDate: string;
    status: string;
    description: string;
}

export type GameMode = 'Classic' | 'Survival' | 'TimeAttack' | 'Typing';

export interface DisciplineWork {
    title: string;
    author: string;
    year: string;
    type: 'Book' | 'Document' | 'Journal' | 'Song';
}

export interface InfrastructureProfile {
    transport?: {
        roadNetwork?: { total: string; paved: string; majorHighways?: string[] };
        railNetwork?: { total: string; gauge?: string; majorLines?: string[]; highSpeed?: boolean };
        airports?: { total: string; international?: string[]; majorCarriers?: string[] };
        ports?: { total: string; majorTerminals?: string[]; merchantMarine?: string };
    };
    energy?: {
        totalProduction?: string;
        consumption?: string;
        energyMix?: { source: string; percentage: string }[];
        gridCoverage?: string;
        majorPlants?: string[];
    };
    digital?: {
        internetPenetration?: string;
        broadbandSpeed?: string;
        mobileSubscriptions?: string;
        cyberSecurityRank?: string;
        ispMarket?: string[];
    };
    water?: {
        accessCleanWater?: string;
        sanitationAccess?: string;
        majorReservoirs?: string[];
    };
}

export interface AcademicProfile {
    intellectualTradition?: string;
    universities?: { name: string; rank: string; location: string; notableAlumni: string[] }[];
    thinkTanks?: { name: string; focus: string; influence: string }[];
    journals?: { name: string; publisher: string; impactFactor?: string }[];
    scholars?: { name: string; field: string; contribution: string }[];
    politicalScienceHistory?: string;
}

export interface LegalProfile {
    constitution?: { name: string; adopted: string; amendments: number; summary: string; preamble?: string };
    historicalConstitutions?: { name: string; year: string; description: string }[];
    codes?: { name: string; year: string; area: string }[];
    systemType?: string;
    highestCourt?: string;
    judiciary?: any;
    rights?: any;
    lawEnforcement?: any;
}

export interface GlobalProfile {
    memberships?: { org: string; status: string; dateJoined: string }[];
    treaties?: { name: string; signed: string; ratified: string; subject: string }[];
    alliances?: { name: string; type: string; partners: string[] }[];
    embassies?: { country: string; location: string }[];
    foreignAid?: any;
    diaspora?: any;
}

export interface AnalysisProfile {
    strategicAnalysis: string;
    politicalCulture: string;
    stateCapacity: string;
    civilSociety: string;
    legitimacySource: string;
    systemHealth: string;
}

export interface DemographicsProfile {
    population: { total: string; density: string; growthRate: string };
    ethnicGroups: { name: string; percentage: string }[];
    religions: { name: string; percentage: string }[];
    languages: { name: string; status: string; percentage: string }[];
    medianAge: string;
}

export interface EconomyProfile {
    gdpNominal: string;
    growthRate: string;
    inflationRate: string;
    unemploymentRate: string;
    currency: { name: string; code: string; symbol: string };
    stockMarket: { name: string; index: string; marketCap: string };
    majorExports: { commodity: string; value: string }[];
    majorImports: { commodity: string; value: string }[];
    partners: { country: string; type: string; percentage: string }[];
    laborForce: any;
    debt: any;
    taxation: any;
    povertyRate: string;
}

export interface SymbolsProfile {
    anthem: { native: string; romanization: string; translation: string; name: string; lyrics: string };
    coatOfArms: { description: string; elements: string[]; history: string; variants: string[] };
    nationalSymbols: { type: string; name: string }[];
    nationalAnthem?: any;
    nationalColors?: string[];
    nationalDay?: string;
    otherSymbols?: any[];
    holidays?: any[];
    orders?: any[];
}

export interface GeographyProfile {
    capitals: { name: string; type: string; population: string; coordinates: string }[];
    totalArea: string;
    landArea: string;
    waterArea: string;
    coastline: string;
    borders: { country: string; length: string }[];
    climateZones: string[];
    terrain: string[];
    hierarchy: any[];
    highestPoint: any;
    lowestPoint: any;
    majorRivers: string[];
    naturalResources: string[];
    naturalHazards: string[];
    environmentalIssues: string[];
    timeZones: string[];
    landUse: any;
    adminDivisions: { level1: { name: string; type: string; official: string }[] };
    maps?: CountryMapData[];
}

export interface CountryImageArchive {
    title: string;
    url: string;
    category: string;
    year: string;
    description: string;
    credit: string;
}

export interface CountryMapData {
    title: string;
    type: string;
    imageUrl: string;
    description: string;
    source: string;
    year: string;
}

export interface DetailedTimelineEvent {
    year: string;
    title: string;
    description: string;
    type: string;
    keyFigures: string[];
    month?: string;
}

export interface CountryDeepDive {
    identity: {
        officialName: string;
        nativeName: { name: string; script: string; romanization: string; pronunciation: string; meaning: string };
        commonName: string;
        motto: { text: string; romanization: string; translation: string; language: string };
        currency: { name: string; code: string; symbol: string };
        flag: { description: string; symbolism: string; history: string; designer: string; adopted: string; imageUrl?: string };
        coatOfArms: { description: string; elements: string[]; history: string; variants: string[] };
        isoCodes: { alpha2: string; alpha3: string; numeric: string };
        internetTLD: string;
        callingCode: string;
        demonym: { singular: string; plural: string; adjective: string };
        nationalFlower: string;
        nationalBird: string;
        nationalTree: string;
        nationalAnimal: string;
        nationalDish: string;
        nationalAnthem: { name: string; composer: string; year: string; lyrics: string; native: string; translation: string };
    };
    geography: GeographyProfile;
    demographics: DemographicsProfile;
    government: {
        form: string;
        headOfState: any;
        headOfGov: any;
        deputyHead: any;
        legislature: any;
        judiciary: any;
        cabinet: any[];
        agencies: any[];
        goccs: any[];
        commissions: any[];
        specialBodies: any[];
        localGovernmentStructure: string;
    };
    politics: {
        parties: any[];
        ideologies: any[];
        recentElections: any[];
        votingAge: string;
        interestGroups: any[];
        politicalFamilies: any[];
        localConcepts: any[];
        lobbyingRegulations: string;
        mediaLandscape: string;
        civilSociety: string;
        electoralHistory: any[];
        families: any[];
    };
    legal: LegalProfile;
    history: {
        timeline: DetailedTimelineEvent[];
        politicalHistory: string[];
        politicalScienceHistory: string[];
        eras: any[];
        wars: any[];
        revolutions: any[];
        institutionalEvolution: any[];
        conflicts: any[];
        headOfStateArchive: any[];
    };
    leadershipHistory: any;
    global: GlobalProfile;
    symbols: SymbolsProfile;
    politicalScience: any;
    economy: EconomyProfile;
    infrastructure: InfrastructureProfile;
    academic: AcademicProfile;
    today: {
        news: CountryNews[];
        currentEvents: string;
        historyToday: string;
    };
    imageArchive: CountryImageArchive[];
    telecom: any;
    militaryComplex: any;
    grandStrategy: any;
    judiciaryDetail: any;
    laborWelfare: any;
    mediaContext: any;
    energy: any;
    analysis: AnalysisProfile;
    culture?: {
        cuisine: string[];
        arts: string[];
        sports: string[];
        holidays: string[];
        literature: string[];
        cinema: string[];
        music: string[];
        fashion: string[];
        architecture: string[];
        folklore: string[];
    };
    health?: {
        lifeExpectancy: string;
        healthcareSystem: string;
        majorDiseases: string[];
        expenditure: string;
    };
    education?: {
        literacyRate: string;
        system: string;
        universities: string[];
        expenditure: string;
    };
}

export interface ElectionDetail {
    country: string;
    year: string;
    type: string;
    result: string;
}
