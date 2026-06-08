
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCw, Check, X, Layers, Plus } from 'lucide-react';
import { Flashcard } from '../types';
import { fetchFlashcards } from '../services/geminiService';
import LoadingScreen from './LoadingScreen';

interface FlashcardViewProps {
  topic: string;
  onClose: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ topic, onClose }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchFlashcards(topic);
      if (mounted) {
        setCards(data);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [topic]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = async () => {
    setIsFlipped(false);
    setDirection(1);
    
    // Check if we need more cards (Endless Mode)
    if (currentIndex >= cards.length - 2 && !fetchingMore) {
        setFetchingMore(true);
        const newCards = await fetchFlashcards(topic);
        // Filter duplicates if any
        const existingIds = new Set(cards.map(c => c.front));
        const uniqueNew = newCards.filter(c => !existingIds.has(c.front));
        if (uniqueNew.length > 0) {
            setCards(prev => [...prev, ...uniqueNew]);
        }
        setFetchingMore(false);
    }

    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setDirection(0);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setDirection(-1);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        setDirection(0);
    }, 200);
  };

  if (loading) return (
    <div className="fixed inset-0 z-[60] bg-academic-bg">
        <LoadingScreen message={`Building Deck: ${topic}...`} />
    </div>
  );

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900 flex flex-col text-white animate-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6">
          <button onClick={onClose} className="p-2 -ml-2 text-stone-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  {topic}
              </span>
              <span className="text-xs font-mono text-academic-gold">
                  {currentIndex + 1} / {cards.length}
              </span>
          </div>
          <div className="w-8">
              {fetchingMore && <div className="w-4 h-4 border-2 border-stone-600 border-t-white rounded-full animate-spin"></div>}
          </div>
      </div>

      {/* CARD AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
          <div 
             onClick={handleFlip}
             className={`relative w-full max-w-md aspect-[3/4] md:aspect-video cursor-pointer transition-all duration-500 transform-style-3d 
             ${isFlipped ? 'rotate-y-180' : ''}
             ${direction === 1 ? 'translate-x-full opacity-0' : direction === -1 ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
             `}
             style={{ transformStyle: 'preserve-3d' }}
          >
              {/* FRONT */}
              <div className="absolute inset-0 bg-academic-bg text-academic-text border-2 border-academic-gold rounded-xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Term</span>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-center leading-tight">{currentCard.front}</h2>
                  <div className="absolute bottom-6 text-stone-400 text-xs flex items-center gap-2 animate-pulse">
                      <RotateCw className="w-3 h-3" /> Tap to reveal
                  </div>
              </div>

              {/* BACK */}
              <div 
                className="absolute inset-0 bg-academic-gold text-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180"
              >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-6">Definition</span>
                  <p className="text-lg md:text-xl font-serif text-center leading-relaxed text-justify">{currentCard.back}</p>
                  {currentCard.category && <span className="absolute bottom-6 text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded">{currentCard.category}</span>}
              </div>
          </div>
      </div>

      {/* CONTROLS */}
      <div className="p-8 pb-12 flex justify-center gap-8 items-center">
          <button 
             onClick={handlePrev}
             className="w-14 h-14 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 transition-all"
          >
              <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-xs font-bold uppercase tracking-widest text-stone-500">
              {isFlipped ? 'Swipe / Click' : 'Flip Card'}
          </div>

          <button 
             onClick={handleNext}
             className="w-14 h-14 rounded-full bg-white text-stone-900 flex items-center justify-center hover:bg-stone-200 transition-all shadow-lg hover:scale-105"
          >
              <Plus className="w-6 h-6" />
          </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardView;