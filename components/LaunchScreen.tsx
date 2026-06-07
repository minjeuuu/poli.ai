
import React, { useEffect } from 'react';
import Logo from './Logo';
import { motion } from 'framer-motion';
import { playSFX } from '../services/soundService';

interface LaunchScreenProps {
  onComplete: () => void;
}

const LaunchScreen: React.FC<LaunchScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    playSFX('success');
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-academic-bg selection:bg-transparent"
    >
      <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-center"
      >
        <Logo size="lg" className="mb-6" />
        <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            className="text-5xl font-serif font-bold tracking-[0.3em] text-academic-accent ml-3 drop-shadow-sm"
        >
          POLI
        </motion.h1>
        <motion.div
           initial={{ scaleX: 0 }}
           animate={{ scaleX: 1 }}
           transition={{ delay: 1.0, duration: 1, ease: "anticipate" }}
           className="h-[1px] w-12 bg-academic-gold mt-6"
        />
      </motion.div>
    </motion.div>
  );
};

export default LaunchScreen;
