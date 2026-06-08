
import React, { useEffect, useState } from 'react';
import { POLITICAL_QUOTES, getRandomQuote } from '../data/quotes';
import { Quote } from '../types';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Consulting structured archives..." }) => {
  const [currentQuote, setCurrentQuote] = useState<Quote>(
    (POLITICAL_QUOTES && POLITICAL_QUOTES.length > 0) 
      ? POLITICAL_QUOTES[0] 
      : { text: "Politics is the art of the possible.", author: "Otto von Bismarck", year: "1867", region: "Prussia" }
  );
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); 
      setTimeout(() => {
        if (POLITICAL_QUOTES && POLITICAL_QUOTES.length > 0) {
            const { quote, index } = getRandomQuote([quoteIndex]);
            setCurrentQuote(quote);
            setQuoteIndex(index);
        }
        setFade(true); 
      }, 300);
    }, 2500); // Faster rotation

    return () => clearInterval(interval);
  }, [quoteIndex]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-8 bg-academic-bg dark:bg-stone-950 transition-colors duration-300">
       
       {/* HIGH CONTRAST SVG SPINNER */}
       <div className="mb-12 relative">
           <Loader2 className="w-16 h-16 text-academic-gold dark:text-indigo-400 animate-spin" />
       </div>
       
       <div className={`transition-opacity duration-500 ease-in-out max-w-xl min-h-[120px] flex flex-col justify-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
         <h3 className="text-xl md:text-2xl font-serif text-academic-text dark:text-stone-200 leading-relaxed mb-4 text-center">
           “{currentQuote?.text}”
         </h3>
         <div className="flex flex-col items-center gap-1 font-sans text-xs uppercase tracking-widest text-academic-muted dark:text-stone-500">
           <span className="font-bold text-academic-gold dark:text-indigo-400">{currentQuote?.author}</span>
           <span className="opacity-60">{currentQuote?.region}, {currentQuote?.year}</span>
         </div>
       </div>

       <div className="mt-12 text-[10px] font-mono text-stone-400 dark:text-stone-600 uppercase tracking-[0.3em] animate-pulse">
          {message}
       </div>
    </div>
  );
};

export default LoadingScreen;
