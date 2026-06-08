
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, User, Bot, Gavel, X, MessageSquare, Award } from 'lucide-react';
import { generateDebateOpening, generateRebuttal, evaluateDebate, DebateTurn } from '../services/learn/debateService';
import { AtomicButton } from './shared/AtomicButton';
import LoadingScreen from './LoadingScreen';
import { playSFX } from '../services/soundService';

interface DebateViewProps {
    topic: string;
    onClose: () => void;
    onComplete: (score: number) => void;
}

const DebateView: React.FC<DebateViewProps> = ({ topic, onClose, onComplete }) => {
    const [history, setHistory] = useState<DebateTurn[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [thinking, setThinking] = useState(false);
    const [turnsLeft, setTurnsLeft] = useState(5);
    const [result, setResult] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const opening = await generateDebateOpening(topic);
            setHistory([{ speaker: 'Opponent', text: opening, timestamp: new Date().toLocaleTimeString() }]);
            setLoading(false);
        };
        init();
    }, [topic]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, thinking]);

    const handleSend = async () => {
        if (!input.trim() || turnsLeft <= 0) return;
        
        playSFX('click');
        const userMove: DebateTurn = { speaker: 'User', text: input, timestamp: new Date().toLocaleTimeString() };
        const newHistory = [...history, userMove];
        setHistory(newHistory);
        setInput('');
        setThinking(true);
        setTurnsLeft(prev => prev - 1);

        if (turnsLeft <= 1) {
            // End Game
            const evalResult = await evaluateDebate(topic, newHistory);
            setResult(evalResult);
            setThinking(false);
            playSFX('success');
            return;
        }

        const rebuttal = await generateRebuttal(topic, newHistory);
        setHistory(prev => [...prev, { speaker: 'Opponent', text: rebuttal, timestamp: new Date().toLocaleTimeString() }]);
        setThinking(false);
        playSFX('type');
    };

    if (loading) return (
        <div className="fixed inset-0 z-[70] bg-academic-bg dark:bg-stone-950 flex items-center justify-center">
            <LoadingScreen message={`Preparing Debate: ${topic}...`} />
        </div>
    );

    if (result) {
        return (
            <div className="fixed inset-0 z-[70] bg-academic-bg dark:bg-stone-950 flex flex-col items-center justify-center p-8 animate-in zoom-in-95">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-academic-gold rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                        <Award className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-academic-text dark:text-stone-100 mb-2">Debate Concluded</h2>
                    <p className="text-stone-500 mb-6 font-serif italic">{result.feedback}</p>
                    
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <span className="block text-xs font-bold uppercase text-stone-400">Score</span>
                            <span className="text-4xl font-mono font-bold text-academic-accent dark:text-indigo-400">{result.score}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-xs font-bold uppercase text-stone-400">Winner</span>
                            <span className={`text-xl font-bold ${result.winner === 'User' ? 'text-green-500' : 'text-stone-500'}`}>{result.winner}</span>
                        </div>
                    </div>

                    <AtomicButton onClick={() => onComplete(result.score)} fullWidth>Return to Lobby</AtomicButton>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="flex-none h-16 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"><Gavel className="w-5 h-5" /></div>
                    <div>
                        <h2 className="font-bold text-sm text-stone-800 dark:text-stone-100">{topic}</h2>
                        <span className="text-[10px] font-bold uppercase text-stone-400">{turnsLeft} Turns Remaining</span>
                    </div>
                </div>
                <button onClick={onClose}><X className="w-6 h-6 text-stone-400 hover:text-red-500" /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-stone-50/50 dark:bg-black/20">
                {history.map((turn, i) => (
                    <div key={i} className={`flex gap-4 ${turn.speaker === 'User' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${turn.speaker === 'User' ? 'bg-academic-accent text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                            {turn.speaker === 'User' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${turn.speaker === 'User' ? 'bg-academic-accent text-white rounded-tr-none' : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-100 dark:border-stone-700'}`}>
                            <p className="font-serif leading-relaxed text-justify text-sm md:text-base">{turn.text}</p>
                        </div>
                    </div>
                ))}
                {thinking && (
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center shrink-0 animate-pulse">
                            <Bot className="w-5 h-5 text-stone-500" />
                        </div>
                        <div className="flex items-center gap-1 p-4">
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Construct your argument..."
                        className="flex-1 bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-academic-accent dark:focus:ring-indigo-500 transition-all font-serif"
                    />
                    <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-academic-accent dark:bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-md">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebateView;
