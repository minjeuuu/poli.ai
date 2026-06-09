
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
    { id: 'data', label: 'Data Management', icon: HardDrive },
    { id: 'assets', label: 'Brand Assets', icon: Download },
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
    const [showCustomAI, setShowCustomAI] = useState(false);
    const [aiProvider, setAiProvider] = useState<'Gemini' | 'Claude' | 'Groq' | 'OpenRouter' | 'Ollama'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('poli_ai_provider') as any) || 'Gemini';
        }
        return 'Gemini';
    });
    const [aiModel, setAiModel] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('poli_ai_model') || '';
        }
        return '';
    });
    const [aiApiKey, setAiApiKey] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('poli_ai_api_key') || '';
        }
        return '';
    });
    const [aiApiUrl, setAiApiUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('poli_ai_api_url') || '';
        }
        return '';
    });

    React.useEffect(() => {
        if (prefs.aiProvider !== undefined) setAiProvider(prefs.aiProvider || 'Gemini');
        if (prefs.aiModel !== undefined) setAiModel(prefs.aiModel || '');
        if (prefs.aiApiKey !== undefined) setAiApiKey(prefs.aiApiKey || '');
        if (prefs.aiApiUrl !== undefined) setAiApiUrl(prefs.aiApiUrl || '');
    }, [prefs.aiProvider, prefs.aiModel, prefs.aiApiKey, prefs.aiApiUrl]);

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
                    <SettingRow 
                        label="AI Service Status" 
                        desc="POLI uses a pre-configured public API key. High-availability online generation is active by default. No setup or IT skills required."
                    >
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-full shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Connected & Free</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowCustomAI(!showCustomAI)}
                                className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 underline transition-colors"
                            >
                                {showCustomAI ? 'Hide Custom Provider' : 'Custom AI Provider (Optional)'}
                            </button>
                        </div>
                    </SettingRow>

                    {showCustomAI && (
                        <div className="p-4 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800/80 space-y-4 my-2 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-800">
                                <span className="text-xs font-bold uppercase tracking-widest text-academic-gold">Custom AI Config</span>
                            </div>
                            
                            <SettingRow label="AI Service Provider" desc="Select your preferred AI engine fallback.">
                                <select 
                                    value={aiProvider}
                                    onChange={(e) => {
                                        const val = e.target.value as any;
                                        setAiProvider(val);
                                        localStorage.setItem('poli_ai_provider', val);
                                        update('aiProvider', val);
                                    }}
                                    className="p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 outline-none cursor-pointer"
                                >
                                    <option value="Gemini">Google Gemini</option>
                                    <option value="Claude">Anthropic Claude</option>
                                    <option value="Groq">Groq (Llama/Qwen)</option>
                                    <option value="OpenRouter">OpenRouter (Free Models)</option>
                                    <option value="Ollama">Ollama (Local Offline)</option>
                                </select>
                            </SettingRow>

                            {aiProvider !== 'Ollama' && (
                                <SettingRow 
                                    label="Custom API Key" 
                                    desc={`Enter your custom ${aiProvider} API Key.`}
                                >
                                    <input 
                                        type="password"
                                        placeholder="Paste key here..."
                                        value={aiApiKey}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setAiApiKey(val);
                                            localStorage.setItem('poli_ai_api_key', val);
                                        }}
                                        onBlur={() => update('aiApiKey', aiApiKey)}
                                        className="p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono text-stone-700 dark:text-stone-300 outline-none w-48"
                                    />
                                </SettingRow>
                            )}

                            <SettingRow 
                                label="Custom AI Model" 
                                desc="Specify target model ID (leave empty for default fallback)."
                            >
                                <input 
                                    type="text"
                                    placeholder={
                                        aiProvider === 'Gemini' ? 'gemini-3-pro-preview' :
                                        aiProvider === 'Claude' ? 'claude-3-5-sonnet-20240620' :
                                        aiProvider === 'Groq' ? 'llama-3.3-70b-versatile' :
                                        aiProvider === 'OpenRouter' ? 'meta-llama/llama-3-8b-instruct:free' : 'llama3'
                                    }
                                    value={aiModel}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setAiModel(val);
                                        localStorage.setItem('poli_ai_model', val);
                                    }}
                                    onBlur={() => update('aiModel', aiModel)}
                                    className="p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono text-stone-700 dark:text-stone-300 outline-none w-48"
                                />
                            </SettingRow>

                            {aiProvider === 'Ollama' && (
                                <SettingRow 
                                    label="Local Endpoint URL" 
                                    desc="The local server port where Ollama API is exposed."
                                >
                                    <input 
                                        type="text"
                                        placeholder="http://localhost:11434"
                                        value={aiApiUrl}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setAiApiUrl(val);
                                            localStorage.setItem('poli_ai_api_url', val);
                                        }}
                                        onBlur={() => update('aiApiUrl', aiApiUrl)}
                                        className="p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono text-stone-700 dark:text-stone-300 outline-none w-48"
                                    />
                                </SettingRow>
                            )}
                        </div>
                    )}

                    <SettingRow label="Primary Language" desc="Main interface language (Uses Google Translate engine).">
                        <Select value={prefs.language} options={LANGUAGES} onChange={(v: string) => update('language', v)} />
                    </SettingRow>
                    <SettingRow label="UI Sound Effects" desc="Clicks, hovers, and transitions.">
                        <AtomicToggle label="" checked={prefs.soundEffects} onChange={(c) => update('soundEffects', c)} />
                    </SettingRow>
                </div>
            );
            case 'appearance': return (
                <div className="space-y-2">
                     <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                        <label className="text-xs font-bold uppercase text-stone-400 mb-3 block">Theme Mode</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {['Default', 'War', 'Tech', 'Nature', 'Ocean', 'Midnight', 'Retro', 'Neon', 'Coffee', 'Matrix', 'Steampunk', 'Monochrome', 'Sepia', 'Slate'].map(theme => (
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
                    <SettingRow label="Global Typeface" desc="Font for interface context.">
                        <Select value={prefs.typography} options={['Serif', 'Sans-Serif', 'Monospace', 'System']} onChange={(v: string) => update('typography', v)} />
                    </SettingRow>
                    <SettingRow label="Interface Density" desc="Spacing between UI elements.">
                        <Select value={prefs.density} options={['Compact', 'Comfortable', 'Spacious']} onChange={(v: string) => update('density', v)} />
                    </SettingRow>
                    <SettingRow label="Base Font Size" desc="Scales the entire UI text.">
                        <input type="range" min="12" max="24" step="1" value={prefs.fontSize || 16} onChange={(e) => update('fontSize', parseInt(e.target.value))} className="accent-academic-accent w-32" />
                    </SettingRow>
                     <SettingRow label="Reduce Motion" desc="Minimizes animations for better performance.">
                        <AtomicToggle label="" checked={prefs.reduceMotion} onChange={(c) => update('reduceMotion', c)} />
                    </SettingRow>
                    <SettingRow label="High Contrast" desc="Increases contrast for better readability.">
                        <AtomicToggle label="" checked={prefs.highContrast} onChange={(c) => update('highContrast', c)} />
                    </SettingRow>
                    <SettingRow label="UI Blur Effects" desc="Enable glassmorphism in headers and overlays.">
                        <AtomicToggle label="" checked={prefs.blurEffects !== false} onChange={(c) => update('blurEffects', c)} />
                    </SettingRow>
                    <SettingRow label="Show Grid Lines" desc="Display structural layout guides for debugging.">
                        <AtomicToggle label="" checked={prefs.showGridLines !== false} onChange={(c) => update('showGridLines', c)} />
                    </SettingRow>
                    <SettingRow label="Corner Radius" desc="Roundness of UI elements.">
                         <Select value={prefs.borderRadius || 'Medium'} options={['None', 'Small', 'Medium', 'Large', 'Full']} onChange={(v: string) => update('borderRadius', v)} />
                    </SettingRow>
                    <SettingRow label="Compact Sidebar" desc="Minimize sidebar width on large screens.">
                         <AtomicToggle label="" checked={prefs.compactSidebar || false} onChange={(c) => update('compactSidebar', c)} />
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
             case 'data': return (
                <div className="space-y-4">
                     <div className="flex flex-col gap-4">
                        <button onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prefs));
                            const downloadAnchorNode = document.createElement('a');
                            downloadAnchorNode.setAttribute("href", dataStr);
                            downloadAnchorNode.setAttribute("download", `poli_settings_${new Date().toISOString()}.json`);
                            document.body.appendChild(downloadAnchorNode);
                            downloadAnchorNode.click();
                            downloadAnchorNode.remove();
                        }} className="px-5 py-4 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm font-bold shadow hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors w-full text-left">
                            Export Configuration to JSON
                        </button>
                        
                        <label className="cursor-pointer px-5 py-4 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm font-bold shadow hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors w-full text-left">
                            Import Configuration
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
                        }} className="px-5 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm font-bold shadow hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors w-full text-left">
                            Clear Cache & Reset
                        </button>
                    </div>
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
