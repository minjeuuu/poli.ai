
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, Award, ChevronRight, RefreshCcw, Keyboard, Clock, Heart, Zap } from 'lucide-react';
import { GameMode, QuizQuestion } from '../types';
import { fetchQuiz } from '../services/geminiService';
import LoadingScreen from './LoadingScreen';

interface QuizViewProps {
  topic: string;
  mode?: GameMode;
  onClose: () => void;
  onCompleteGame?: (score: number, total: number) => void; // Callback for parent to handle XP
}

const QuizView: React.FC<QuizViewProps> = ({ topic, mode = 'Classic', onClose, onCompleteGame }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typingInput, setTypingInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60); // For Time Attack
  const [streak, setStreak] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Logic
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      // Fetch initial batch
      const data = await fetchQuiz(topic);
      if (mounted) {
        setQuestions(data);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [topic]);

  // Timer Logic for Time Attack
  useEffect(() => {
      if (mode === 'TimeAttack' && !loading && !completed && timeLeft > 0) {
          const timer = setInterval(() => {
              setTimeLeft(prev => {
                  if (prev <= 1) {
                      finishGame();
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
          return () => clearInterval(timer);
      }
  }, [mode, loading, completed, timeLeft]);

  // Helper to trigger completion
  const finishGame = () => {
      setCompleted(true);
      if (onCompleteGame) {
          // Calculate a normalized score for parent
          onCompleteGame(score, questions.length); 
      }
  };

  // --- HANDLERS ---

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null || completed) return;

    const currentQ = questions[currentIndex];
    const correct = index === currentQ.correctAnswer;
    
    setSelectedOption(index);
    setIsCorrect(correct);
    
    processResult(correct);
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isCorrect !== null || completed) return;

      const currentQ = questions[currentIndex];
      const correctText = currentQ.options[currentQ.correctAnswer].toLowerCase();
      const userText = typingInput.toLowerCase().trim();

      // Basic fuzzy matching: contains or is contained by (if long enough)
      const isMatch = userText === correctText || (userText.length > 4 && correctText.includes(userText));
      
      setIsCorrect(isMatch);
      processResult(isMatch);
  };

  const processResult = (correct: boolean) => {
      if (correct) {
          setScore(prev => prev + 1);
          setStreak(prev => prev + 1);
          // Bonus time for Time Attack
          if (mode === 'TimeAttack') setTimeLeft(prev => Math.min(prev + 5, 120));
      } else {
          setStreak(0);
          if (mode === 'Survival') {
              setLives(prev => {
                  const newLives = prev - 1;
                  if (newLives <= 0) finishGame();
                  return newLives;
              });
          }
      }
  };

  const handleNext = async () => {
    // Check if we need to fetch more questions (Endless mode for Survival/TimeAttack)
    if (currentIndex >= questions.length - 2 && (mode === 'Survival' || mode === 'TimeAttack')) {
        const moreQuestions = await fetchQuiz(topic); // Ideally a specialized fetch for "more"
        setQuestions(prev => [...prev, ...moreQuestions]);
    }

    if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setTypingInput('');
        // Focus input for typing mode
        if (mode === 'Typing') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    } else {
        finishGame();
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[60] bg-academic-bg">
        <LoadingScreen message={`Preparing ${mode} Challenge: ${topic}...`} />
    </div>
  );

  if (questions.length === 0) return null;

  // RESULTS SCREEN (Internal Visuals, Logic Handled by Parent mostly, but we show a summary here)
  if (completed) {
      return (
          <div className="fixed inset-0 z-[60] bg-academic-bg flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-500 text-center">
             <div className="w-32 h-32 bg-academic-gold text-white rounded-full flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white">
                 <Award className="w-16 h-16" />
             </div>
             <h2 className="text-4xl font-serif font-bold text-academic-text mb-2">
                 {mode === 'Survival' ? (lives > 0 ? 'Legendary!' : 'Fallen Hero') : 'Session Complete'}
             </h2>
             <p className="text-stone-500 font-serif mb-8 text-xl">
                 Final Score: <strong className="text-academic-accent text-2xl">{score}</strong>
             </p>
             
             <div className="grid grid-cols-2 gap-4 mb-12 w-full max-w-sm">
                 <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-sm">
                     <span className="block text-[10px] uppercase font-bold text-stone-400">Streak</span>
                     <span className="text-2xl font-bold text-emerald-600">{streak}</span>
                 </div>
                 <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-sm">
                     <span className="block text-[10px] uppercase font-bold text-stone-400">Accuracy</span>
                     <span className="text-2xl font-bold text-indigo-600">{Math.round((score / (currentIndex + 1)) * 100)}%</span>
                 </div>
             </div>

             <div className="flex flex-col gap-3 w-full max-w-xs">
                 <button onClick={onClose} className="w-full py-4 bg-academic-text text-white text-sm font-bold uppercase tracking-widest hover:bg-stone-700 transition-all shadow-lg rounded-xl flex items-center justify-center gap-2">
                     <Check className="w-4 h-4" /> Claim Rewards
                 </button>
             </div>
          </div>
      );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-academic-bg flex flex-col animate-in slide-in-from-right duration-500">
       
       {/* HEADER */}
       <div className="flex items-center justify-between p-4 border-b border-academic-line bg-white shadow-sm">
           <div className="flex items-center gap-4">
               <button onClick={onClose} className="p-2 -ml-2 text-stone-400 hover:text-academic-accent">
                   <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                   <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500">{topic}</h2>
                   <div className="flex items-center gap-2 text-academic-gold font-bold text-sm">
                       {mode === 'Typing' && <Keyboard className="w-4 h-4" />}
                       {mode === 'TimeAttack' && <Clock className="w-4 h-4" />}
                       {mode === 'Survival' && <Heart className="w-4 h-4" />}
                       {mode} Mode
                   </div>
               </div>
           </div>
           
           <div className="flex items-center gap-4">
               <div className="flex flex-col items-end">
                   <span className="text-[10px] uppercase text-stone-400 font-bold">Score</span>
                   <span className="font-mono font-bold text-academic-accent">{score}</span>
               </div>
               
               {mode === 'Survival' && (
                   <div className="flex gap-1">
                       {[...Array(3)].map((_, i) => (
                           <Heart key={i} className={`w-5 h-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-stone-200'}`} />
                       ))}
                   </div>
               )}

               {mode === 'TimeAttack' && (
                   <div className={`flex items-center gap-1 font-mono text-lg font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-academic-text'}`}>
                       <Clock className="w-5 h-5" /> {timeLeft}s
                   </div>
               )}
           </div>
       </div>

       {/* CONTENT */}
       <div className="flex-1 overflow-y-auto p-6 flex flex-col max-w-2xl mx-auto w-full">
           
           {/* PROGRESS BAR */}
           {mode === 'Classic' && (
               <div className="w-full h-1 bg-stone-100 mb-8 rounded-full overflow-hidden">
                   <div className="h-full bg-academic-gold transition-all duration-300" style={{ width: `${((currentIndex) / questions.length) * 100}%` }}></div>
               </div>
           )}

           <div className="flex-1 flex flex-col justify-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 block">Question {currentIndex + 1}</span>
               <h2 className="text-xl md:text-3xl font-serif font-bold text-academic-text leading-tight mb-12">
                   {currentQ.question}
               </h2>

               {/* TYPING MODE INPUT */}
               {mode === 'Typing' ? (
                   <form onSubmit={handleTypingSubmit} className="mb-8">
                       <input 
                           ref={inputRef}
                           type="text" 
                           autoFocus
                           placeholder="Type your answer..."
                           className={`w-full p-4 text-xl font-serif border-b-2 outline-none transition-colors bg-transparent
                           ${isCorrect === null ? 'border-stone-300 focus:border-academic-accent' : 
                             isCorrect ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
                           value={typingInput}
                           onChange={(e) => setTypingInput(e.target.value)}
                           disabled={isCorrect !== null}
                       />
                       {isCorrect !== null && (
                           <div className="mt-4 text-sm font-bold">
                               {isCorrect ? (
                                   <span className="text-green-600 flex items-center gap-2"><Check className="w-4 h-4" /> Correct!</span>
                               ) : (
                                   <span className="text-red-600 flex items-center gap-2"><X className="w-4 h-4" /> Answer: {currentQ.options[currentQ.correctAnswer]}</span>
                               )}
                           </div>
                       )}
                   </form>
               ) : (
                   /* CLASSIC / SURVIVAL / TIME ATTACK OPTIONS */
                   <div className="space-y-3 mb-8">
                       {currentQ.options.map((opt, idx) => {
                           let stateClass = "border-academic-line hover:border-academic-accent bg-white hover:shadow-md";
                           if (isCorrect !== null) {
                               if (idx === currentQ.correctAnswer) stateClass = "border-green-500 bg-green-50 text-green-900 shadow-md";
                               else if (idx === selectedOption) stateClass = "border-red-500 bg-red-50 text-red-900 shadow-md";
                               else stateClass = "border-academic-line opacity-40 grayscale";
                           }

                           return (
                               <button
                                 key={idx}
                                 onClick={() => handleOptionClick(idx)}
                                 disabled={isCorrect !== null}
                                 className={`w-full text-left p-6 border rounded-lg font-serif text-lg transition-all duration-200 ${stateClass} flex items-center justify-between group`}
                               >
                                   <span>{opt}</span>
                                   {isCorrect !== null && idx === currentQ.correctAnswer && <Check className="w-6 h-6 text-green-600" />}
                                   {selectedOption === idx && idx !== currentQ.correctAnswer && <X className="w-6 h-6 text-red-600" />}
                                   {isCorrect === null && <div className="w-3 h-3 rounded-full border-2 border-stone-300 group-hover:border-academic-accent"></div>}
                               </button>
                           );
                       })}
                   </div>
               )}
           </div>

           {/* EXPLANATION & NEXT */}
           {isCorrect !== null && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                   <div className="p-6 bg-stone-100 border-l-4 border-academic-accent mb-6 shadow-inner rounded-r-lg">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-academic-accent mb-2 flex items-center gap-2">
                           <Lightbulb className="w-3 h-3" /> Insight
                       </h4>
                       <p className="text-sm font-serif text-stone-700 leading-relaxed text-justify">{currentQ.explanation}</p>
                   </div>
                   
                   <button 
                     onClick={handleNext}
                     className="w-full py-4 bg-academic-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-stone-800 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg"
                   >
                       {currentIndex === questions.length - 1 && mode === 'Classic' ? 'Finish Quiz' : 'Next Challenge'}
                       <ChevronRight className="w-4 h-4" />
                   </button>
               </div>
           )}

       </div>
    </div>
  );
};

// Simple Icon component for internal use
const Lightbulb = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

export default QuizView;