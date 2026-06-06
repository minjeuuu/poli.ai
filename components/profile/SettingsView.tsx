
import React, { useState } from 'react';
import { UserPreferences, SpecialTheme, ThemeScope } from '../../types';
import { 
    Globe, Palette, Bell, Lock, Database, Code, Type, Mic, Eye, Sliders, 
    Download, HardDrive, Keyboard, Monitor
} from 'lucide-react';
import { AtomicToggle } from '../shared/AtomicToggle';
import { playSFX } from '../../services/soundService';
import { downloadSvgAsPng } from '../../utils/image/imageExport';

interface SettingsViewProps {
    prefs: UserPreferences;
    onUpdate: (newPrefs: UserPreferences) => void;
}

const LANGUAGES = [
    "English", "Español", "Français", "Deutsch", "Italiano", "Português", 
    "Русский", "中文 (Simplified)", "中文 (Traditional)", "日本語", "한국어", "العربية", "हिन्दी",
    "Bengali", "Turkish", "Vietnamese", "Polish", "Dutch", "Greek", "Swedish", 
    "Latin", "Ancient Greek", "Hebrew", "Sanskrit", "Thai", "Indonesian", 
    "Malay", "Filipino", "Persian", "Urdu", "Swahili", "Hausa", "Yoruba", 
    "Zulu", "Amharic", "Somali", "Oromo", "Igbo", "Kinyarwanda", "Luganda",
    "Ukrainian", "Czech", "Hungarian", "Romanian", "Bulgarian", "Serbian", 
    "Croatian", "Slovak", "Finnish", "Norwegian", "Danish", "Icelandic"
];

const SECTIONS = [
    { id: 'general', label: 'System & General', icon: Globe },
    { id: 'appearance', label: 'Appearance & UI', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reading', label: 'Reading Engine', icon: Type },
    { id: 'audio', label: 'Audio & Accessibility', icon: Mic },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'data', label: 'Data & Storage', icon: HardDrive },
    { id: 'assets', label: 'Brand Assets', icon: Download },
    { id: 'advanced', label: 'Advanced / Dev', icon: Code },
];

const SettingRow = ({ label, desc, children }: { label: string, desc?: string, children?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-stone-100 dark:border-stone-800 last:border-0 gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20 px-2 rounded-lg transition-colors">
        <div className="flex-1">
            <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">{label}</h4>
            {desc && <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 leading-tight">{desc}</p>}
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);

const Select = ({ value, options, onChange }: any) => (
    <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="p-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 outline-none focus:border-academic-accent cursor-pointer min-w-[140px]"
    >
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
    </select>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ prefs, onUpdate }) => {
    const [activeSection, setActiveSection] = useState('appearance');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    React.useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallApp = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            if (isIOS) {
                alert('To install on iOS: tap the "Share" button at the bottom of Safari, then tap "Add to Home Screen".');
            } else {
                alert('App is either already installed, or your browser does not support automatic installation. Try using Chrome or Edge, or check your browser menu for "Install App".');
            }
        }
    };

    const update = (key: keyof UserPreferences, val: any) => {
        playSFX('click');
        onUpdate({ ...prefs, [key]: val });
    };

    const getPillarLogoSVG = (bgColor: string, fgColor: string) => {
        // High resolution SVG string for canvas rendering with solid background
        return `
<svg width="1024" height="1024" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="${bgColor}"/>
  <path d="M20 80L80 80" stroke="${fgColor}" stroke-width="4" />
  <rect x="28" y="30" width="8" height="50" fill="${fgColor}" />
  <rect x="46" y="30" width="8" height="50" fill="${fgColor}" />
  <rect x="64" y="30" width="8" height="50" fill="${fgColor}" />
  <rect x="20" y="20" width="60" height="10" stroke="${fgColor}" stroke-width="3" />
  <rect x="25" y="15" width="50" height="5" fill="${fgColor}" opacity="0.5" />
</svg>
        `.trim();
    };

    const handleDownloadLogo = (type: 'BW' | 'WB') => {
        playSFX('success');
        // BW = Black Logo on White Background
        // WB = White Logo on Black Background
        
        let bgColor = '#FFFFFF';
        let fgColor = '#000000';
        
        if (type === 'WB') {
            bgColor = '#000000';
            fgColor = '#FFFFFF';
        }

        const svgString = getPillarLogoSVG(bgColor, fgColor);
        downloadSvgAsPng(svgString, 1024, 1024, `POLI_Logo_${type}.png`);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'general': return (
                <div className="space-y-2">
                    <SettingRow label="Install Native App" desc="Install POLI to your home screen for an app-like experience on Mobile/Desktop.">
                        <button 
                            onClick={handleInstallApp}
                            className={`px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 hover:bg-academic-accent hover:text-white`}
                        >
                            {deferredPrompt ? 'Install App' : 'How to Install'}
                        </button>
                    </SettingRow>
                    <SettingRow label="Primary Language" desc="Main interface language.">
                        <Select value={prefs.language} options={LANGUAGES} onChange={(v: string) => update('language', v)} />
                    </SettingRow>
                    <SettingRow label="Secondary Language" desc="Fallback for untranslated content.">
                        <Select value={prefs.secondaryLanguage || 'None'} options={['None', ...LANGUAGES]} onChange={(v: string) => update('secondaryLanguage', v)} />
                    </SettingRow>
                    <SettingRow label="Timezone" desc="Used for almanac synchronization.">
                        <Select value={prefs.timezone} options={['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST']} onChange={(v: string) => update('timezone', v)} />
                    </SettingRow>
                    <SettingRow label="Date Format" desc="Display format for dates throughout the app.">
                        <Select value={prefs.dateFormat} options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} onChange={(v: string) => update('dateFormat', v)} />
                    </SettingRow>
                    <SettingRow label="Time Format" desc="12-hour vs 24-hour clock.">
                        <Select value={prefs.timeFormat || '12h'} options={['12h', '24h']} onChange={(v: string) => update('timeFormat', v)} />
                    </SettingRow>
                    <SettingRow label="Currency Base" desc="Base currency for market conversions.">
                        <Select value={prefs.currency || 'USD'} options={['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'BTC']} onChange={(v: string) => update('currency', v)} />
                    </SettingRow>
                    <SettingRow label="Measurement System" desc="Metric vs Imperial units.">
                        <Select value={prefs.measurementSystem || 'Metric'} options={['Metric', 'Imperial']} onChange={(v: string) => update('measurementSystem', v)} />
                    </SettingRow>
                    <SettingRow label="First Day of Week" desc="Calendar start day.">
                        <Select value={prefs.startOfWeek || 'Monday'} options={['Sunday', 'Monday', 'Saturday']} onChange={(v: string) => update('startOfWeek', v)} />
                    </SettingRow>
                    <SettingRow label="Keyboard Shortcuts" desc="Enable power user hotkeys.">
                        <AtomicToggle label="" checked={prefs.enableKeyboardShortcuts || false} onChange={(c) => update('enableKeyboardShortcuts', c)} />
                    </SettingRow>
                </div>
            );
            case 'appearance': return (
                <div className="space-y-2">
                     <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                        <label className="text-xs font-bold uppercase text-stone-400 mb-3 block">Theme Mode</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {['Default', 'War', 'Tech', 'Nature', 'Ocean', 'Midnight', 'Royal', 'Retro', 'Neon', 'Forest', 'Desert', 'Lavender', 'Coffee', 'Steel', 'Matrix', 'Steampunk', 'Vaporwave', 'Noir', 'Synth', 'Solar', 'Lunar', 'Arctic', 'Volcanic', 'Jungle', 'Monochrome', 'Sepia', 'Velvet', 'Slate'].map(theme => (
                                <button
                                    key={theme}
                                    onClick={() => update('themeMode', theme)}
                                    className={`py-3 rounded-lg text-[9px] font-bold uppercase border transition-all ${prefs.themeMode === theme ? 'bg-academic-accent text-white border-academic-accent shadow-md scale-105' : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-700 hover:border-academic-accent'}`}
                                >
                                    {theme}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SettingRow label="Theme Scope" desc="Contextual overrides for specific pages.">
                        <Select value={prefs.themeScope} options={['None', 'National', 'Continent']} onChange={(v: string) => update('themeScope', v)} />
                    </SettingRow>
                    <SettingRow label="Interface Density" desc="Spacing between UI elements.">
                        <Select value={prefs.density} options={['Compact', 'Comfortable', 'Spacious']} onChange={(v: string) => update('density', v)} />
                    </SettingRow>
                    <SettingRow label="Base Font Size" desc="Scales the entire UI text.">
                        <input type="range" min="12" max="24" step="1" value={prefs.fontSize} onChange={(e) => update('fontSize', parseInt(e.target.value))} className="accent-academic-accent w-32" />
                    </SettingRow>
                     <SettingRow label="Reduce Motion" desc="Minimizes animations for performance and accessibility.">
                        <AtomicToggle label="" checked={prefs.reduceMotion} onChange={(c) => update('reduceMotion', c)} />
                    </SettingRow>
                    <SettingRow label="High Contrast" desc="Increases contrast for better readability.">
                        <AtomicToggle label="" checked={prefs.highContrast} onChange={(c) => update('highContrast', c)} />
                    </SettingRow>
                    <SettingRow label="UI Blur Effects" desc="Enable glassmorphism in headers and overlays.">
                        <AtomicToggle label="" checked={prefs.blurEffects !== false} onChange={(c) => update('blurEffects', c)} />
                    </SettingRow>
                    <SettingRow label="Show Grid Lines" desc="Display layout guides.">
                        <AtomicToggle label="" checked={prefs.showGridLines !== false} onChange={(c) => update('showGridLines', c)} />
                    </SettingRow>
                    <SettingRow label="Corner Radius" desc="Roundness of UI elements.">
                         <Select value={prefs.borderRadius || 'Medium'} options={['None', 'Small', 'Medium', 'Large', 'Full']} onChange={(v: string) => update('borderRadius', v)} />
                    </SettingRow>
                    <SettingRow label="Compact Sidebar" desc="Minimize sidebar width on large screens.">
                         <AtomicToggle label="" checked={prefs.compactSidebar || false} onChange={(c) => update('compactSidebar', c)} />
                    </SettingRow>
                     <SettingRow label="Show Minimap" desc="Display content minimap in readers.">
                         <AtomicToggle label="" checked={prefs.showMinimap || false} onChange={(c) => update('showMinimap', c)} />
                    </SettingRow>
                </div>
            );
            case 'notifications': return (
                <div className="space-y-2">
                    <SettingRow label="Daily Digest" desc="Receive a daily briefing summary.">
                        <Select value={prefs.emailDigest} options={['Daily', 'Weekly', 'Monthly', 'None']} onChange={(v: string) => update('emailDigest', v)} />
                    </SettingRow>
                    <SettingRow label="Breaking News Alerts" desc="Push notifications for major events.">
                        <AtomicToggle label="" checked={prefs.pushAlerts} onChange={(c) => update('pushAlerts', c)} />
                    </SettingRow>
                     <SettingRow label="System Updates" desc="Notifications about platform changes.">
                        <AtomicToggle label="" checked={prefs.pushSystem} onChange={(c) => update('pushSystem', c)} />
                    </SettingRow>
                     <SettingRow label="New Content" desc="Alerts when new archives are added.">
                        <AtomicToggle label="" checked={prefs.pushNewContent} onChange={(c) => update('pushNewContent', c)} />
                    </SettingRow>
                     <SettingRow label="Community Mentions" desc="When someone replies to your notes.">
                        <AtomicToggle label="" checked={prefs.pushMentions} onChange={(c) => update('pushMentions', c)} />
                    </SettingRow>
                     <SettingRow label="Trending Topics" desc="Viral political discourse alerts.">
                        <AtomicToggle label="" checked={prefs.pushTrending} onChange={(c) => update('pushTrending', c)} />
                    </SettingRow>
                     <SettingRow label="Email Marketing" desc="Partner offers and promotions.">
                        <AtomicToggle label="" checked={prefs.emailMarketing} onChange={(c) => update('emailMarketing', c)} />
                    </SettingRow>
                </div>
            );
            case 'reading': return (
                <div className="space-y-2">
                     <SettingRow label="Reader Typeface" desc="Font for long-form content.">
                        <Select value={prefs.readerTypeface} options={['Serif', 'Sans', 'Mono', 'Dyslexic']} onChange={(v: string) => update('readerTypeface', v)} />
                    </SettingRow>
                    <SettingRow label="Line Height" desc="Vertical spacing between lines.">
                         <input type="range" min="1.0" max="2.5" step="0.1" value={prefs.readerLineHeight} onChange={(e) => update('readerLineHeight', parseFloat(e.target.value))} className="accent-academic-accent w-32" />
                    </SettingRow>
                    <SettingRow label="Line Width" desc="Maximum width of text column.">
                        <Select value={prefs.readerWidth} options={['Narrow', 'Standard', 'Wide', 'Full']} onChange={(v: string) => update('readerWidth', v)} />
                    </SettingRow>
                    <SettingRow label="Auto-Bookmark" desc="Save reading progress automatically.">
                        <AtomicToggle label="" checked={prefs.autoBookmark} onChange={(c) => update('autoBookmark', c)} />
                    </SettingRow>
                    <SettingRow label="Highlight Style" desc="Color for text highlights.">
                         <Select value={prefs.highlightStyle} options={['Yellow', 'Green', 'Blue', 'Pink', 'Underline']} onChange={(v: string) => update('highlightStyle', v)} />
                    </SettingRow>
                    <SettingRow label="Citation Style" desc="Default format for copied citations.">
                        <Select value={prefs.citationStyle} options={['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']} onChange={(v: string) => update('citationStyle', v)} />
                    </SettingRow>
                    <SettingRow label="Auto Translate" desc="Translate foreign texts automatically.">
                        <AtomicToggle label="" checked={prefs.autoTranslate || false} onChange={(c) => update('autoTranslate', c)} />
                    </SettingRow>
                </div>
            );
            case 'audio': return (
                 <div className="space-y-2">
                    <SettingRow label="UI Sound Effects" desc="Clicks, hovers, and transitions.">
                        <AtomicToggle label="" checked={prefs.soundEffects} onChange={(c) => update('soundEffects', c)} />
                    </SettingRow>
                    <SettingRow label="Haptic Feedback" desc="Vibration on mobile interactions.">
                        <AtomicToggle label="" checked={prefs.hapticFeedback} onChange={(c) => update('hapticFeedback', c)} />
                    </SettingRow>
                    <SettingRow label="Text-to-Speech Voice" desc="AI voice model for reading.">
                        <Select value={prefs.textToSpeechVoice} options={['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr']} onChange={(v: string) => update('textToSpeechVoice', v)} />
                    </SettingRow>
                     <SettingRow label="Speech Speed" desc="Playback rate for TTS.">
                         <input type="range" min="0.5" max="2.0" step="0.25" value={prefs.textToSpeechSpeed} onChange={(e) => update('textToSpeechSpeed', parseFloat(e.target.value))} className="accent-academic-accent w-32" />
                    </SettingRow>
                    <SettingRow label="Auto-Play Media" desc="Automatically play videos/audio.">
                        <AtomicToggle label="" checked={prefs.autoPlayMedia} onChange={(c) => update('autoPlayMedia', c)} />
                    </SettingRow>
                    <SettingRow label="Background Audio" desc="Keep audio playing when app is minimized.">
                        <AtomicToggle label="" checked={prefs.backgroundAudio} onChange={(c) => update('backgroundAudio', c)} />
                    </SettingRow>
                 </div>
            );
             case 'assets': return (
                <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-stone-100 to-white dark:from-stone-900 dark:to-black border border-stone-200 dark:border-stone-800 rounded-2xl">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-academic-gold mb-4">Official Brand Assets</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 max-w-sm">
                            Download high-resolution PNGs of the POLI pillar emblem for official academic or press usage.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleDownloadLogo('WB')}
                                className="group relative overflow-hidden bg-black border border-stone-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all"
                            >
                                <div className="w-16 h-16 flex items-center justify-center">
                                     {/* White Logo on Black Background */}
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                                        <rect width="100" height="100" fill="black" />
                                        <path d="M20 80L80 80" stroke="currentColor" strokeWidth="4" />
                                        <rect x="28" y="30" width="8" height="50" fill="currentColor" />
                                        <rect x="46" y="30" width="8" height="50" fill="currentColor" />
                                        <rect x="64" y="30" width="8" height="50" fill="currentColor" />
                                        <rect x="20" y="20" width="60" height="10" stroke="currentColor" strokeWidth="3" />
                                        <rect x="25" y="15" width="50" height="5" fill="currentColor" opacity="0.5" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download Logo (W/B)
                                </span>
                            </button>

                             <button 
                                onClick={() => handleDownloadLogo('BW')}
                                className="group relative overflow-hidden bg-white border border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all"
                            >
                                <div className="w-16 h-16 flex items-center justify-center">
                                     {/* Black Logo on White Background */}
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-black">
                                        <rect width="100" height="100" fill="white" />
                                        <path d="M20 80L80 80" stroke="currentColor" strokeWidth="4" />
                                        <rect x="28" y="30" width="8" height="50" fill="currentColor" />
                                        <rect x="46" y="30" width="8" height="50" fill="currentColor" />
                                        <rect x="64" y="30" width="8" height="50" fill="currentColor" />
                                        <rect x="20" y="20" width="60" height="10" stroke="currentColor" strokeWidth="3" />
                                        <rect x="25" y="15" width="50" height="5" fill="currentColor" opacity="0.5" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-900 flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download Logo (B/W)
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            );
            case 'privacy': return (
                <div className="space-y-2">
                    <SettingRow label="Public Profile" desc="Allow others to find your scholar profile.">
                        <AtomicToggle label="" checked={prefs.publicProfile} onChange={(c) => update('publicProfile', c)} />
                    </SettingRow>
                    <SettingRow label="Show Online Status" desc="Indicate when you are active.">
                        <AtomicToggle label="" checked={prefs.showOnlineStatus} onChange={(c) => update('showOnlineStatus', c)} />
                    </SettingRow>
                     <SettingRow label="Activity Log" desc="Record your reading history.">
                        <AtomicToggle label="" checked={prefs.showActivityLog} onChange={(c) => update('showActivityLog', c)} />
                    </SettingRow>
                    <SettingRow label="Allow Indexing" desc="Permit search engines to index your public work.">
                        <AtomicToggle label="" checked={prefs.allowIndexing} onChange={(c) => update('allowIndexing', c)} />
                    </SettingRow>
                    <SettingRow label="Share Analytics" desc="Help improve POLI with usage data.">
                        <AtomicToggle label="" checked={prefs.shareAnalytics} onChange={(c) => update('shareAnalytics', c)} />
                    </SettingRow>
                    <SettingRow label="Data Retention" desc="How long to keep logs.">
                         <Select value={prefs.dataRetentionPeriod} options={['1 Month', '1 Year', 'Forever']} onChange={(v: string) => update('dataRetentionPeriod', v)} />
                    </SettingRow>
                    <SettingRow label="Biometric Login" desc="Use FaceID/TouchID.">
                         <AtomicToggle label="" checked={prefs.biometricLogin || false} onChange={(c) => update('biometricLogin', c)} />
                    </SettingRow>
                    <SettingRow label="Two-Factor Auth" desc="Extra security layer.">
                         <AtomicToggle label="" checked={prefs.twoFactorAuth || false} onChange={(c) => update('twoFactorAuth', c)} />
                    </SettingRow>
                </div>
            );
             case 'data': return (
                <div className="space-y-2">
                    <SettingRow label="Offline Mode" desc="Download core data for offline use.">
                        <AtomicToggle label="" checked={prefs.offlineMode} onChange={(c) => update('offlineMode', c)} />
                    </SettingRow>
                     <SettingRow label="Data Saver" desc="Reduce image quality and pre-fetching.">
                        <AtomicToggle label="" checked={prefs.dataSaver} onChange={(c) => update('dataSaver', c)} />
                    </SettingRow>
                    <SettingRow label="Cache Size" desc="Max local storage usage (MB).">
                         <input type="number" value={prefs.cacheSize} onChange={(e) => update('cacheSize', parseInt(e.target.value))} className="w-24 p-1 bg-stone-100 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800 text-sm" />
                    </SettingRow>
                    <SettingRow label="Cloud Sync" desc="Sync data across devices.">
                         <AtomicToggle label="" checked={prefs.cloudSync || false} onChange={(c) => update('cloudSync', c)} />
                    </SettingRow>
                    <SettingRow label="Download Quality" desc="Resolution for offline assets.">
                         <Select value={prefs.downloadQuality || 'High'} options={['Low', 'Medium', 'High']} onChange={(v: string) => update('downloadQuality', v)} />
                    </SettingRow>
                     <div className="pt-4 flex gap-2">
                        <button onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prefs));
                            const downloadAnchorNode = document.createElement('a');
                            downloadAnchorNode.setAttribute("href", dataStr);
                            downloadAnchorNode.setAttribute("download", `poli_settings_${new Date().toISOString()}.json`);
                            document.body.appendChild(downloadAnchorNode);
                            downloadAnchorNode.click();
                            downloadAnchorNode.remove();
                        }} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-bold uppercase hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">Export JSON</button>
                        
                        <label className="cursor-pointer px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-bold uppercase hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                            Import Data
                            <input type="file" accept=".json" className="hidden" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const fileReader = new FileReader();
                                    fileReader.readAsText(e.target.files[0], "UTF-8");
                                    fileReader.onload = (event) => {
                                        try {
                                            const result = JSON.parse(event.target?.result as string);
                                            onUpdate(result);
                                            alert("Import successful");
                                        } catch (err) {
                                            alert("Error importing file");
                                        }
                                    };
                                }
                            }} />
                        </label>

                        <button onClick={() => {
                            if (window.confirm("Are you sure you want to clear your local cache? This will reset your session.")) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Clear Cache</button>
                    </div>
                </div>
            );
             case 'advanced': return (
                <div className="space-y-2">
                    <SettingRow label="Developer Mode" desc="Enable advanced debug tools.">
                        <AtomicToggle label="" checked={prefs.developerMode} onChange={(c) => update('developerMode', c)} />
                    </SettingRow>
                    <SettingRow label="Beta Features" desc="Early access to experimental modules.">
                        <AtomicToggle label="" checked={prefs.betaFeatures} onChange={(c) => update('betaFeatures', c)} />
                    </SettingRow>
                     <SettingRow label="Debug Logging" desc="Verbose console output.">
                        <AtomicToggle label="" checked={prefs.debugLogging} onChange={(c) => update('debugLogging', c)} />
                    </SettingRow>
                    <SettingRow label="API Endpoint" desc="Custom server URL.">
                         <input type="text" value={prefs.apiEndpoint} onChange={(e) => update('apiEndpoint', e.target.value)} className="w-full sm:w-64 p-1 bg-stone-100 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800 text-xs font-mono" />
                    </SettingRow>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full min-h-[600px] bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-stone-50/50 dark:bg-stone-950/50 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800">
                <div className="p-4 overflow-x-auto md:overflow-visible flex md:flex-col gap-1">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`flex items-center gap-3 px-4 py-3.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all text-left whitespace-nowrap group
                            ${activeSection === s.id 
                                ? 'bg-white dark:bg-stone-800 text-academic-accent dark:text-indigo-400 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700' 
                                : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                        >
                            <s.icon className={`w-4 h-4 ${activeSection === s.id ? 'text-academic-gold' : 'opacity-70 group-hover:opacity-100'}`} />
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-stone-900">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <h2 className="text-2xl font-serif font-bold text-academic-text dark:text-stone-100">
                            {SECTIONS.find(s => s.id === activeSection)?.label}
                        </h2>
                        <p className="text-xs text-stone-400 mt-1 font-mono uppercase tracking-widest">Configuration Protocol</p>
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
