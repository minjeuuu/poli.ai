
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe, Lock, Search } from 'lucide-react';

export const BrowserApp: React.FC = () => {
    const [url, setUrl] = useState('https://poli.ai/archive');
    const [loading, setLoading] = useState(false);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="h-full flex flex-col bg-stone-50 dark:bg-stone-900 rounded-b-lg">
            {/* Browser Bar */}
            <div className="p-2 bg-stone-200 dark:bg-stone-800 flex items-center gap-2 border-b border-stone-300 dark:border-stone-700">
                <div className="flex gap-1 text-stone-500">
                    <ArrowLeft className="w-4 h-4 cursor-pointer hover:text-stone-800" />
                    <ArrowRight className="w-4 h-4 cursor-pointer hover:text-stone-800" />
                    <RotateCw className={`w-4 h-4 cursor-pointer hover:text-stone-800 ${loading ? 'animate-spin' : ''}`} />
                </div>
                <form onSubmit={handleNavigate} className="flex-1">
                    <div className="bg-white dark:bg-stone-950 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs border border-stone-300 dark:border-stone-700 shadow-sm">
                        <Lock className="w-3 h-3 text-green-500" />
                        <input 
                            type="text" 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-stone-700 dark:text-stone-300 font-mono"
                        />
                    </div>
                </form>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
                {loading ? (
                    <div className="animate-pulse">
                        <Globe className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                        <div className="h-2 w-32 bg-stone-200 dark:bg-stone-800 rounded mx-auto"></div>
                    </div>
                ) : (
                    <div className="max-w-lg space-y-6">
                        <div className="w-24 h-24 mx-auto bg-academic-gold/10 rounded-full flex items-center justify-center text-academic-gold mb-6">
                            <Globe className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">The Global Archive</h1>
                        <p className="text-stone-500 dark:text-stone-400 font-serif leading-relaxed text-justify">
                            Accessing restricted knowledge base at <strong>{url}</strong>. Connection secure.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-32 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
