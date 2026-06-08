
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Menu, Minus, Plus, ChevronLeft, ChevronRight, Wand2, X, List, Highlighter, PenTool, StickyNote, AlertCircle, Bot, Sparkles, Languages, FileText, Search, Loader2, BookOpen, Share2, Type, Palette, MousePointerClick, Music, Volume2, Quote, Copy, Check, Settings, Grid, AlignLeft, AlignCenter, AlignJustify, Eye } from 'lucide-react';
import { fetchBookStructure, streamChapterContent, askReaderQuestion } from '../services/libraryService';
import { BookStructure } from '../types';
import LoadingScreen from './LoadingScreen';
import { playSFX } from '../services/soundService';
import { playTextAsSpeech } from '../services/audioService';

interface ReaderViewProps {
  title: string;
  author: string;
  onClose: () => void;
  onNavigate?: (type: string, payload: any) => void;
  type?: string; 
}

// --- MASSIVE DATASETS ---

const THEMES = [
    // --- CLASSIC ---
    { id: 'light', name: 'Academic White', bg: 'bg-white', text: 'text-stone-900', selection: 'selection:bg-blue-200', ui: 'border-stone-200', category: 'Classic' },
    { id: 'sepia', name: 'Old Library', bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', selection: 'selection:bg-[#d6c6b2]', ui: 'border-[#d6c6b2]', category: 'Classic' },
    { id: 'paper', name: 'Parchment', bg: 'bg-[#e3d0b9]', text: 'text-[#3e2723]', selection: 'selection:bg-[#bcaaa4]', ui: 'border-[#a1887f]', category: 'Classic' },
    { id: 'cream', name: 'Cream', bg: 'bg-[#fdfbf7]', text: 'text-[#333333]', selection: 'selection:bg-[#e0e0e0]', ui: 'border-[#e0e0e0]', category: 'Classic' },
    { id: 'newsprint', name: 'Newsprint', bg: 'bg-[#f3f3f3]', text: 'text-[#111111]', selection: 'selection:bg-[#cccccc]', ui: 'border-[#dddddd]', category: 'Classic' },
    { id: 'ivory', name: 'Ivory', bg: 'bg-[#fffff0]', text: 'text-[#000000]', selection: 'selection:bg-[#f0f0d0]', ui: 'border-[#e0e0c0]', category: 'Classic' },
    { id: 'beige', name: 'Beige', bg: 'bg-[#f5f5dc]', text: 'text-[#4b3621]', selection: 'selection:bg-[#e0e0b0]', ui: 'border-[#d0d0a0]', category: 'Classic' },

    // --- DARK & OLED ---
    { id: 'dark', name: 'Midnight Study', bg: 'bg-[#1a1a1a]', text: 'text-[#cecece]', selection: 'selection:bg-[#3e3e3e]', ui: 'border-[#333]', category: 'Dark' },
    { id: 'black', name: 'OLED Void', bg: 'bg-black', text: 'text-stone-300', selection: 'selection:bg-stone-800', ui: 'border-[#222]', category: 'Dark' },
    { id: 'charcoal', name: 'Charcoal', bg: 'bg-[#36454f]', text: 'text-[#f5f5f5]', selection: 'selection:bg-[#506070]', ui: 'border-[#2f3f4f]', category: 'Dark' },
    { id: 'slate', name: 'Slate', bg: 'bg-[#2f4f4f]', text: 'text-[#ffffff]', selection: 'selection:bg-[#406060]', ui: 'border-[#1f3f3f]', category: 'Dark' },
    { id: 'navy', name: 'Deep Navy', bg: 'bg-[#000080]', text: 'text-[#e6e6fa]', selection: 'selection:bg-[#0000a0]', ui: 'border-[#000060]', category: 'Dark' },
    { id: 'vampire', name: 'Nosferatu', bg: 'bg-[#0a0a0a]', text: 'text-[#a0a0a0]', selection: 'selection:bg-[#330000]', ui: 'border-[#330000]', category: 'Dark' },
    { id: 'space', name: 'Deep Space', bg: 'bg-[#050510]', text: 'text-[#c0c0ff]', selection: 'selection:bg-[#202040]', ui: 'border-[#101020]', category: 'Dark' },
    
    // --- NATURE ---
    { id: 'forest', name: 'Deep Forest', bg: 'bg-[#1b281e]', text: 'text-[#a9c5a0]', selection: 'selection:bg-[#2c4031]', ui: 'border-[#2c4031]', category: 'Nature' },
    { id: 'ocean', name: 'Atlantic', bg: 'bg-[#0f172a]', text: 'text-[#94a3b8]', selection: 'selection:bg-[#1e293b]', ui: 'border-[#1e293b]', category: 'Nature' },
    { id: 'sand', name: 'Dune', bg: 'bg-[#eaddcf]', text: 'text-[#5d4037]', selection: 'selection:bg-[#d7ccc8]', ui: 'border-[#d7ccc8]', category: 'Nature' },
    { id: 'sage', name: 'Sage', bg: 'bg-[#dbe7e4]', text: 'text-[#2f4f4f]', selection: 'selection:bg-[#b2dfdb]', ui: 'border-[#b2dfdb]', category: 'Nature' },
    { id: 'clay', name: 'Terracotta', bg: 'bg-[#3e2723]', text: 'text-[#d7ccc8]', selection: 'selection:bg-[#5d4037]', ui: 'border-[#5d4037]', category: 'Nature' },
    { id: 'moss', name: 'Moss', bg: 'bg-[#8a9a5b]', text: 'text-[#355e3b]', selection: 'selection:bg-[#aabf7c]', ui: 'border-[#6e7e4a]', category: 'Nature' },
    { id: 'sky', name: 'Sky', bg: 'bg-[#87ceeb]', text: 'text-[#191970]', selection: 'selection:bg-[#b0e0e6]', ui: 'border-[#4682b4]', category: 'Nature' },

    // --- MODERN / TECH ---
    { id: 'solarized-light', name: 'Solarized Light', bg: 'bg-[#fdf6e3]', text: 'text-[#657b83]', selection: 'selection:bg-[#eee8d5]', ui: 'border-[#93a1a1]', category: 'Tech' },
    { id: 'solarized-dark', name: 'Solarized Dark', bg: 'bg-[#002b36]', text: 'text-[#839496]', selection: 'selection:bg-[#073642]', ui: 'border-[#586e75]', category: 'Tech' },
    { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]', selection: 'selection:bg-[#44475a]', ui: 'border-[#6272a4]', category: 'Tech' },
    { id: 'nord', name: 'Nordic', bg: 'bg-[#2e3440]', text: 'text-[#d8dee9]', selection: 'selection:bg-[#4c566a]', ui: 'border-[#434c5e]', category: 'Tech' },
    { id: 'gruvbox-light', name: 'Gruvbox Light', bg: 'bg-[#fbf1c7]', text: 'text-[#3c3836]', selection: 'selection:bg-[#ebdbb2]', ui: 'border-[#d5c4a1]', category: 'Tech' },
    { id: 'gruvbox-dark', name: 'Gruvbox Dark', bg: 'bg-[#282828]', text: 'text-[#ebdbb2]', selection: 'selection:bg-[#3c3836]', ui: 'border-[#504945]', category: 'Tech' },
    { id: 'matrix', name: 'The Matrix', bg: 'bg-black', text: 'text-[#00ff41]', selection: 'selection:bg-[#003b00]', ui: 'border-[#008f11]', category: 'Tech' },
    { id: 'cyber', name: 'Cyberpunk', bg: 'bg-[#0b0c15]', text: 'text-[#00f3ff]', selection: 'selection:bg-[#ff003c]', ui: 'border-[#2d2d44]', category: 'Tech' },
    { id: 'terminal', name: 'Terminal', bg: 'bg-[#0c0c0c]', text: 'text-[#cccccc]', selection: 'selection:bg-[#333333]', ui: 'border-[#333]', category: 'Tech' },
    { id: 'synthwave', name: 'Synthwave', bg: 'bg-[#2b213a]', text: 'text-[#ff7edb]', selection: 'selection:bg-[#4a3966]', ui: 'border-[#6c5396]', category: 'Tech' },

    // --- ACCESSIBILITY ---
    { id: 'high-contrast-white', name: 'HC White', bg: 'bg-white', text: 'text-black', selection: 'selection:bg-black selection:text-white', ui: 'border-black', category: 'Accessibility' },
    { id: 'high-contrast-black', name: 'HC Black', bg: 'bg-black', text: 'text-white', selection: 'selection:bg-white selection:text-black', ui: 'border-white', category: 'Accessibility' },
    { id: 'yellow-black', name: 'Low Vision Y/B', bg: 'bg-black', text: 'text-yellow-400', selection: 'selection:bg-yellow-900', ui: 'border-yellow-700', category: 'Accessibility' },
    { id: 'white-blue', name: 'Focus Blue', bg: 'bg-[#003366]', text: 'text-white', selection: 'selection:bg-[#004080]', ui: 'border-[#005090]', category: 'Accessibility' },
    { id: 'cream-black', name: 'Soft Contrast', bg: 'bg-[#ffffdd]', text: 'text-black', selection: 'selection:bg-[#e0e0bb]', ui: 'border-[#cfcf99]', category: 'Accessibility' },
    { id: 'tint-rose', name: 'Irlen Rose', bg: 'bg-[#ffe4e1]', text: 'text-black', selection: 'selection:bg-[#ffb6c1]', ui: 'border-[#ffc0cb]', category: 'Accessibility' },
    { id: 'tint-blue', name: 'Irlen Blue', bg: 'bg-[#e0ffff]', text: 'text-black', selection: 'selection:bg-[#afeeee]', ui: 'border-[#b0e0e6]', category: 'Accessibility' },
    { id: 'tint-green', name: 'Irlen Green', bg: 'bg-[#f0fff0]', text: 'text-black', selection: 'selection:bg-[#98fb98]', ui: 'border-[#90ee90]', category: 'Accessibility' },
    
    // --- ACADEMIC SPECIAL ---
    { id: 'blueprint', name: 'Blueprint', bg: 'bg-[#124068]', text: 'text-[#e6f1ff]', selection: 'selection:bg-[#2b6cb0]', ui: 'border-[#4299e1]', category: 'Special' },
    { id: 'graph', name: 'Graph Paper', bg: 'bg-[#fdfdfd]', text: 'text-[#333]', selection: 'selection:bg-[#eee]', ui: 'border-[#ddd]', category: 'Special' },
    { id: 'red-shift', name: 'Red Shift', bg: 'bg-[#2b0a0a]', text: 'text-[#ffcccc]', selection: 'selection:bg-[#5c1e1e]', ui: 'border-[#8b0000]', category: 'Special' },
    { id: 'gold-leaf', name: 'Gold Leaf', bg: 'bg-[#2b2b2b]', text: 'text-[#d4af37]', selection: 'selection:bg-[#5c4d1f]', ui: 'border-[#b8860b]', category: 'Special' },
    { id: 'legal-pad', name: 'Legal Pad', bg: 'bg-[#fffacd]', text: 'text-[#0000cd]', selection: 'selection:bg-[#eee8aa]', ui: 'border-[#f0e68c]', category: 'Special' },
    { id: 'chalkboard', name: 'Chalkboard', bg: 'bg-[#2f4f2f]', text: 'text-[#ffffff]', selection: 'selection:bg-[#406040]', ui: 'border-[#507050]', category: 'Special' },
];

const FONTS = [
    // --- ACCESSIBILITY & DYSLEXIA ---
    { id: 'opendyslexic', name: 'OpenDyslexic', class: "font-['OpenDyslexic',sans-serif]", category: 'Accessibility' },
    { id: 'dyslexie', name: 'Dyslexie', class: "font-['Dyslexie',sans-serif]", category: 'Accessibility' },
    { id: 'lexend', name: 'Lexend', class: "font-['Lexend',sans-serif]", category: 'Accessibility' },
    { id: 'atkinson', name: 'Atkinson Hyperlegible', class: "font-['Atkinson_Hyperlegible',sans-serif]", category: 'Accessibility' },
    { id: 'comic-sans', name: 'Comic Sans MS', class: "font-['Comic_Sans_MS',cursive]", category: 'Accessibility' },
    { id: 'arial-rounded', name: 'Arial Rounded', class: "font-['Arial_Rounded_MT_Bold',sans-serif]", category: 'Accessibility' },
    { id: 'trebuchet', name: 'Trebuchet MS', class: "font-['Trebuchet_MS',sans-serif]", category: 'Accessibility' },
    { id: 'verdana', name: 'Verdana', class: "font-['Verdana',sans-serif]", category: 'Accessibility' },
    { id: 'tahoma', name: 'Tahoma', class: "font-['Tahoma',sans-serif]", category: 'Accessibility' },
    { id: 'century-gothic', name: 'Century Gothic', class: "font-['Century_Gothic',sans-serif]", category: 'Accessibility' },

    // --- SERIF (ACADEMIC) ---
    { id: 'merriweather', name: 'Merriweather', class: "font-['Merriweather',serif]", category: 'Serif' },
    { id: 'times', name: 'Times New Roman', class: "font-['Times_New_Roman',serif]", category: 'Serif' },
    { id: 'georgia', name: 'Georgia', class: "font-['Georgia',serif]", category: 'Serif' },
    { id: 'garamond', name: 'Garamond', class: "font-['Garamond',serif]", category: 'Serif' },
    { id: 'baskerville', name: 'Baskerville', class: "font-['Baskerville',serif]", category: 'Serif' },
    { id: 'palatino', name: 'Palatino', class: "font-['Palatino',serif]", category: 'Serif' },
    { id: 'playfair', name: 'Playfair Display', class: "font-['Playfair_Display',serif]", category: 'Serif' },
    { id: 'lora', name: 'Lora', class: "font-['Lora',serif]", category: 'Serif' },
    { id: 'pt-serif', name: 'PT Serif', class: "font-['PT_Serif',serif]", category: 'Serif' },
    { id: 'crimson', name: 'Crimson Text', class: "font-['Crimson_Text',serif]", category: 'Serif' },
    { id: 'libre-baskerville', name: 'Libre Baskerville', class: "font-['Libre_Baskerville',serif]", category: 'Serif' },
    { id: 'eb-garamond', name: 'EB Garamond', class: "font-['EB_Garamond',serif]", category: 'Serif' },
    { id: 'source-serif', name: 'Source Serif Pro', class: "font-['Source_Serif_Pro',serif]", category: 'Serif' },
    { id: 'bitter', name: 'Bitter', class: "font-['Bitter',serif]", category: 'Serif' },
    { id: 'domine', name: 'Domine', class: "font-['Domine',serif]", category: 'Serif' },
    { id: 'spectral', name: 'Spectral', class: "font-['Spectral',serif]", category: 'Serif' },
    { id: 'noto-serif', name: 'Noto Serif', class: "font-['Noto_Serif',serif]", category: 'Serif' },
    { id: 'charter', name: 'Charter', class: "font-['Charter',serif]", category: 'Serif' },
    { id: 'bookman', name: 'Bookman', class: "font-['Bookman',serif]", category: 'Serif' },
    { id: 'didot', name: 'Didot', class: "font-['Didot',serif]", category: 'Serif' },
    { id: 'bodoni', name: 'Bodoni', class: "font-['Bodoni_MT',serif]", category: 'Serif' },

    // --- SANS (MODERN) ---
    { id: 'inter', name: 'Inter', class: "font-['Inter',sans-serif]", category: 'Sans' },
    { id: 'helvetica', name: 'Helvetica', class: "font-['Helvetica',sans-serif]", category: 'Sans' },
    { id: 'arial', name: 'Arial', class: "font-['Arial',sans-serif]", category: 'Sans' },
    { id: 'roboto', name: 'Roboto', class: "font-['Roboto',sans-serif]", category: 'Sans' },
    { id: 'open-sans', name: 'Open Sans', class: "font-['Open_Sans',sans-serif]", category: 'Sans' },
    { id: 'lato', name: 'Lato', class: "font-['Lato',sans-serif]", category: 'Sans' },
    { id: 'montserrat', name: 'Montserrat', class: "font-['Montserrat',sans-serif]", category: 'Sans' },
    { id: 'gill-sans', name: 'Gill Sans', class: "font-['Gill_Sans',sans-serif]", category: 'Sans' },
    { id: 'futura', name: 'Futura', class: "font-['Futura',sans-serif]", category: 'Sans' },
    { id: 'poppins', name: 'Poppins', class: "font-['Poppins',sans-serif]", category: 'Sans' },
    { id: 'raleway', name: 'Raleway', class: "font-['Raleway',sans-serif]", category: 'Sans' },
    { id: 'nunito', name: 'Nunito', class: "font-['Nunito',sans-serif]", category: 'Sans' },
    { id: 'rubik', name: 'Rubik', class: "font-['Rubik',sans-serif]", category: 'Sans' },
    { id: 'work-sans', name: 'Work Sans', class: "font-['Work_Sans',sans-serif]", category: 'Sans' },
    { id: 'quicksand', name: 'Quicksand', class: "font-['Quicksand',sans-serif]", category: 'Sans' },
    { id: 'fira-sans', name: 'Fira Sans', class: "font-['Fira_Sans',sans-serif]", category: 'Sans' },
    { id: 'pt-sans', name: 'PT Sans', class: "font-['PT_Sans',sans-serif]", category: 'Sans' },
    { id: 'source-sans', name: 'Source Sans Pro', class: "font-['Source_Sans_Pro',sans-serif]", category: 'Sans' },
    { id: 'ubuntu', name: 'Ubuntu', class: "font-['Ubuntu',sans-serif]", category: 'Sans' },
    { id: 'cabin', name: 'Cabin', class: "font-['Cabin',sans-serif]", category: 'Sans' },
    { id: 'dosis', name: 'Dosis', class: "font-['Dosis',sans-serif]", category: 'Sans' },

    // --- MONO (TECHNICAL) ---
    { id: 'jetbrains', name: 'JetBrains Mono', class: "font-['JetBrains_Mono',monospace]", category: 'Mono' },
    { id: 'fira-code', name: 'Fira Code', class: "font-['Fira_Code',monospace]", category: 'Mono' },
    { id: 'courier', name: 'Courier New', class: "font-['Courier_New',monospace]", category: 'Mono' },
    { id: 'consolas', name: 'Consolas', class: "font-['Consolas',monospace]", category: 'Mono' },
    { id: 'source-code', name: 'Source Code Pro', class: "font-['Source_Code_Pro',monospace]", category: 'Mono' },
    { id: 'ubuntu-mono', name: 'Ubuntu Mono', class: "font-['Ubuntu_Mono',monospace]", category: 'Mono' },
    { id: 'roboto-mono', name: 'Roboto Mono', class: "font-['Roboto_Mono',monospace]", category: 'Mono' },
    { id: 'space-mono', name: 'Space Mono', class: "font-['Space_Mono',monospace]", category: 'Mono' },
    { id: 'inconsolata', name: 'Inconsolata', class: "font-['Inconsolata',monospace]", category: 'Mono' },
    { id: 'anonymous', name: 'Anonymous Pro', class: "font-['Anonymous_Pro',monospace]", category: 'Mono' },
    { id: 'ibm-plex', name: 'IBM Plex Mono', class: "font-['IBM_Plex_Mono',monospace]", category: 'Mono' },
    { id: 'pt-mono', name: 'PT Mono', class: "font-['PT_Mono',monospace]", category: 'Mono' },
    { id: 'droid-sans', name: 'Droid Sans Mono', class: "font-['Droid_Sans_Mono',monospace]", category: 'Mono' },
    { id: 'monaco', name: 'Monaco', class: "font-['Monaco',monospace]", category: 'Mono' },
    { id: 'menlo', name: 'Menlo', class: "font-['Menlo',monospace]", category: 'Mono' },

    // --- DISPLAY & HISTORICAL ---
    { id: 'typewriter', name: 'Typewriter', class: "font-['American_Typewriter',monospace]", category: 'Display' },
    { id: 'cinzel', name: 'Cinzel (Roman)', class: "font-['Cinzel',serif]", category: 'Display' },
    { id: 'old-english', name: 'Old English', class: "font-['UnifrakturMaguntia',serif]", category: 'Display' },
    { id: 'blackletter', name: 'Blackletter', class: "font-['Chomsky',serif]", category: 'Display' },
    { id: 'fraktur', name: 'Fraktur', class: "font-['Fraktur',serif]", category: 'Display' },
    { id: 'im-fell', name: 'IM Fell', class: "font-['IM_Fell_English',serif]", category: 'Display' },
    { id: 'medieval', name: 'MedievalSharp', class: "font-['MedievalSharp',serif]", category: 'Display' },
    { id: 'pirata', name: 'Pirata One', class: "font-['Pirata_One',serif]", category: 'Display' },
    { id: 'rye', name: 'Rye (Western)', class: "font-['Rye',serif]", category: 'Display' },
    { id: 'vt323', name: 'VT323 (Retro)', class: "font-['VT323',monospace]", category: 'Display' },
    { id: 'press-start', name: 'Press Start 2P', class: "font-['Press_Start_2P',monospace]", category: 'Display' },
    { id: 'special-elite', name: 'Special Elite', class: "font-['Special_Elite',cursive]", category: 'Display' },
    { id: 'amatic', name: 'Amatic SC', class: "font-['Amatic_SC',cursive]", category: 'Display' },
    { id: 'caveat', name: 'Caveat', class: "font-['Caveat',cursive]", category: 'Display' },
    { id: 'shadows', name: 'Shadows Into Light', class: "font-['Shadows_Into_Light',cursive]", category: 'Display' },
];

const CITATION_FORMATS = [
    // --- STANDARD ACADEMIC ---
    { id: 'APA', name: 'APA (7th Ed.)', category: 'Standard' },
    { id: 'APA6', name: 'APA (6th Ed.)', category: 'Standard' },
    { id: 'MLA', name: 'MLA (9th Ed.)', category: 'Standard' },
    { id: 'MLA8', name: 'MLA (8th Ed.)', category: 'Standard' },
    { id: 'Chicago', name: 'Chicago (Notes)', category: 'Standard' },
    { id: 'ChicagoAD', name: 'Chicago (Author-Date)', category: 'Standard' },
    { id: 'Harvard', name: 'Harvard', category: 'Standard' },
    { id: 'Turabian', name: 'Turabian', category: 'Standard' },
    
    // --- SCIENCE & MEDICINE ---
    { id: 'IEEE', name: 'IEEE', category: 'Science' },
    { id: 'AMA', name: 'AMA', category: 'Science' },
    { id: 'Vancouver', name: 'Vancouver', category: 'Science' },
    { id: 'ACS', name: 'ACS (Chemistry)', category: 'Science' },
    { id: 'CSE', name: 'CSE (Science Editor)', category: 'Science' },
    { id: 'NLM', name: 'NLM (Medicine)', category: 'Science' },
    { id: 'AIP', name: 'AIP (Physics)', category: 'Science' },
    { id: 'ASCE', name: 'ASCE (Civil Eng)', category: 'Science' },
    { id: 'ASME', name: 'ASME (Mechanical Eng)', category: 'Science' },
    { id: 'Nature', name: 'Nature Journal', category: 'Science' },
    { id: 'Science', name: 'Science Magazine', category: 'Science' },
    { id: 'Lancet', name: 'The Lancet', category: 'Science' },
    { id: 'PLOS', name: 'PLOS', category: 'Science' },
    { id: 'BioMed', name: 'BioMed Central', category: 'Science' },
    { id: 'Cell', name: 'Cell Press', category: 'Science' },
    
    // --- LAW & POLITICAL SCIENCE ---
    { id: 'Bluebook', name: 'Bluebook (Law)', category: 'Legal' },
    { id: 'ALWD', name: 'ALWD (Law)', category: 'Legal' },
    { id: 'OSCOLA', name: 'OSCOLA (UK Law)', category: 'Legal' },
    { id: 'APSA', name: 'APSA (Political Sci)', category: 'Political' },
    { id: 'McGill', name: 'McGill Guide', category: 'Legal' },
    { id: 'AGLC', name: 'AGLC (Australia)', category: 'Legal' },
    { id: 'Greenbook', name: 'Greenbook (Texas)', category: 'Legal' },
    { id: 'Indigo', name: 'Indigo Book', category: 'Legal' },
    { id: 'Maroon', name: 'Maroonbook (Chicago)', category: 'Legal' },
    
    // --- HUMANITIES ---
    { id: 'ASA', name: 'ASA (Sociology)', category: 'Social' },
    { id: 'AAA', name: 'AAA (Anthropology)', category: 'Social' },
    { id: 'MHRA', name: 'MHRA', category: 'Humanities' },
    { id: 'LSA', name: 'LSA (Linguistics)', category: 'Humanities' },
    { id: 'SBL', name: 'SBL (Biblical)', category: 'Humanities' },
    { id: 'Oxford', name: 'Oxford Standard', category: 'Humanities' },
    { id: 'Cambridge', name: 'Cambridge', category: 'Humanities' },
    
    // --- INTERNATIONAL / REGIONAL ---
    { id: 'ABNT', name: 'ABNT (Brazil)', category: 'International' },
    { id: 'DIN', name: 'DIN 1505 (Germany)', category: 'International' },
    { id: 'GOST', name: 'GOST (Russia)', category: 'International' },
    { id: 'ISO690', name: 'ISO 690', category: 'International' },
    { id: 'GB7714', name: 'GB/T 7714 (China)', category: 'International' },
    { id: 'SIST', name: 'SIST 02 (Japan)', category: 'International' },
    { id: 'JIS', name: 'JIS (Japan)', category: 'International' },
    { id: 'KS', name: 'KS (Korea)', category: 'International' },
    { id: 'NBN', name: 'NBN (Belgium)', category: 'International' },
    { id: 'NP', name: 'NP 405 (Portugal)', category: 'International' },
    { id: 'UNE', name: 'UNE (Spain)', category: 'International' },
    { id: 'UNI', name: 'UNI (Italy)', category: 'International' },
    
    // --- DATA & WEB ---
    { id: 'BibTeX', name: 'BibTeX', category: 'Data' },
    { id: 'RIS', name: 'RIS', category: 'Data' },
    { id: 'EndNote', name: 'EndNote XML', category: 'Data' },
    { id: 'JSON', name: 'CSL JSON', category: 'Data' },
    { id: 'Wikipedia', name: 'Wikipedia Citation', category: 'Web' },
    { id: 'Reddit', name: 'Reddit Markdown', category: 'Web' },
    { id: 'X', name: 'X (Twitter) Link', category: 'Web' }
];

const ReaderView: React.FC<ReaderViewProps> = ({ title, author, onClose, onNavigate, type = 'Book' }) => {
  // State
  const [structure, setStructure] = useState<BookStructure | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState('');
  const [loadingChapter, setLoadingChapter] = useState(false);
  
  // Appearance
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [currentFont, setCurrentFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [textAlign, setTextAlign] = useState<'left' | 'justify' | 'center'>('justify');
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'Theme' | 'Type'>('Theme');

  // Interaction
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  
  // Citation
  const [showCitation, setShowCitation] = useState(false);
  const [citationSearch, setCitationSearch] = useState('');
  const [citationFormat, setCitationFormat] = useState('APA');
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [citationCopied, setCitationCopied] = useState(false);

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Load Structure
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingStructure(true);
      const struct = await fetchBookStructure(title, author);
      if (mounted) {
        setStructure(struct);
        setLoadingStructure(false);
        // Load first chapter automatically
        if (struct.chapters.length > 0) {
            loadChapter(0, struct.chapters[0]);
        } else {
            // Fallback for short docs
            loadChapter(0, "Full Text");
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, [title, author]);

  // Update Citation
  useEffect(() => {
      const year = new Date().getFullYear();
      let text = '';
      const t = title || 'Untitled';
      const a = author || 'Unknown';
      const d = new Date().toLocaleDateString();
      
      // Extensive format logic (Simulated for brevity of regex)
      switch (citationFormat) {
          case 'APA': text = `${a}. (${year}). *${t}*. POLI Archives.`; break;
          case 'MLA': text = `${a}. *${t}*. POLI Archives, ${year}.`; break;
          case 'Chicago': text = `${a}. "${t}." POLI Archives. Last modified ${year}.`; break;
          case 'Harvard': text = `${a} (${year}) *${t}*. POLI Archives.`; break;
          case 'IEEE': text = `[1] ${a}, *${t}*. POLI Archives, ${year}.`; break;
          case 'Bluebook': text = `${t}, by ${a} (POLI Archives ${year}).`; break;
          case 'OSCOLA': text = `${a}, *${t}* (POLI Archives ${year})`; break;
          case 'BibTeX': text = `@misc{poli_${year},\n  author = {${a}},\n  title = {${t}},\n  year = {${year}},\n  publisher = {POLI Archives}\n}`; break;
          case 'RIS': text = `TY  - BOOK\nAU  - ${a}\nTI  - ${t}\nPY  - ${year}\nPB  - POLI Archives\nER  -`; break;
          case 'Wikipedia': text = `{{cite web |title=${t} |author=${a} |url=poli://archive |accessdate=${d}}}`; break;
          case 'Nature': text = `${a}. ${t}. *POLI Arch.* (2024).`; break;
          case 'Science': text = `${a}, ${t} (POLI Archives, ${year}).`; break;
          default: text = `${a}. ${t}. POLI Archives (${year}). [Format: ${citationFormat}]`;
      }
      setGeneratedCitation(text);
      setCitationCopied(false);
  }, [citationFormat, title, author]);

  const loadChapter = async (index: number, chapterTitle: string) => {
      setLoadingChapter(true);
      setChapterContent('');
      setCurrentChapterIndex(index);
      playSFX('type');
      setIsPlaying(false);
      
      try {
          const generator = streamChapterContent(title, author, chapterTitle);
          let fullText = '';
          for await (const chunk of generator) {
              fullText += chunk;
              setChapterContent(prev => prev + chunk);
          }
      } catch (e) {
          setChapterContent("Error loading content. Please try again.");
      } finally {
          setLoadingChapter(false);
      }
  };

  const handleNextChapter = () => {
      if (!structure || currentChapterIndex >= structure.chapters.length - 1) return;
      loadChapter(currentChapterIndex + 1, structure.chapters[currentChapterIndex + 1]);
      contentRef.current?.scrollTo(0, 0);
  };

  const handlePrevChapter = () => {
      if (!structure || currentChapterIndex <= 0) return;
      loadChapter(currentChapterIndex - 1, structure.chapters[currentChapterIndex - 1]);
      contentRef.current?.scrollTo(0, 0);
  };

  const handleMouseUp = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelection(sel.toString());
          setSelectionRect(rect);
      } else {
          setSelection(null);
          setSelectionRect(null);
      }
  };

  const handleAiAsk = async () => {
      if (!selection && !aiQuery) return;
      setIsAiThinking(true);
      setAiResponse('');
      setShowAI(true);
      
      const context = selection || chapterContent.substring(0, 2000); 
      const response = await askReaderQuestion(context, aiQuery, selection ? "Explain this text" : "Answer question about text");
      
      setAiResponse(response);
      setIsAiThinking(false);
      setAiQuery('');
  };

  const handlePlayAudio = async () => {
      if (!chapterContent) return;
      setIsPlaying(true);
      playSFX('open');
      await playTextAsSpeech(chapterContent, 'Puck'); 
      setTimeout(() => setIsPlaying(false), 5000); 
  };

  const handleCopyCitation = () => {
      navigator.clipboard.writeText(generatedCitation.replace(/\*/g, ''));
      setCitationCopied(true);
      playSFX('success');
      setTimeout(() => setCitationCopied(false), 2000);
  };

  const renderFormattedText = (text: string) => {
    // 1. Basic cleaning of common AI artifacts and headers
    const clean = text
        .replace(/^#+\s*/gm, '') // Remove Markdown headers (# Header)
        .replace(/\[\d+\]/g, '') // Remove citation numbers [1]
        .replace(/^\s*[-*]\s+/gm, '') // Remove bullet points if any exist at start of lines (standardize to prose)
        .trim();

    // 2. Split into paragraphs by double newline
    const paragraphs = clean.split(/\n\s*\n/);

    return (
        <div className={`font-serif leading-loose text-lg space-y-6 break-words ${textAlign === 'justify' ? 'text-justify' : textAlign === 'center' ? 'text-center' : 'text-left'}`}>
            {paragraphs.map((para, pIdx) => {
                if (!para.trim()) return null;

                // Regex to capture markdown tokens: ***bolditalic***, **bold**, *italic*, `code`
                // We split by these tokens to interleave React nodes
                const tokens = para.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

                return (
                    <p key={pIdx} className={`${pIdx > 0 ? 'indent-8' : ''} mb-0`}>
                        {tokens.map((token, tIdx) => {
                            // Bold + Italic
                            if (token.startsWith('***') && token.endsWith('***') && token.length > 6) {
                                return <strong key={tIdx} className="font-bold italic">{token.slice(3, -3)}</strong>;
                            }
                            // Bold
                            if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
                                return <strong key={tIdx} className="font-bold">{token.slice(2, -2)}</strong>;
                            }
                            // Italic
                            if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
                                return <em key={tIdx} className="italic">{token.slice(1, -1)}</em>;
                            }
                            // Code (unlikely in books but good for safety)
                             if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
                                return <code key={tIdx} className="bg-black/10 dark:bg-white/10 px-1 rounded text-sm font-mono">{token.slice(1, -1)}</code>;
                            }
                            
                            // Clean artifacts from plain text segments just in case
                            // e.g., orphan # or *
                            const cleanToken = token.replace(/^#+\s/, ''); 
                            
                            return <span key={tIdx}>{cleanToken}</span>;
                        })}
                    </p>
                )
            })}
        </div>
    )
  };

  // Filtered Lists
  const filteredCitations = CITATION_FORMATS.filter(c => c.name.toLowerCase().includes(citationSearch.toLowerCase()) || c.id.toLowerCase().includes(citationSearch.toLowerCase()));

  // Categorize Themes & Fonts for UI
  const themeCategories = [...new Set(THEMES.map(t => t.category))];
  const fontCategories = [...new Set(FONTS.map(f => f.category))];

  if (loadingStructure) return (
    <div className="fixed inset-0 top-16 z-[60] bg-academic-bg flex items-center justify-center">
      <LoadingScreen message={`Retrieving ${title} from Archives...`} />
    </div>
  );

  return (
    <div className={`fixed inset-0 top-16 z-[60] flex flex-col animate-in slide-in-from-right duration-500 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.selection} transition-colors duration-500`}>
       
       {/* READER ACTION BAR */}
       <div className={`flex items-center justify-between px-4 h-14 border-b ${currentTheme.ui} backdrop-blur-md bg-opacity-90 ${currentTheme.bg} transition-colors`}>
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                   <ArrowLeft className="w-5 h-5" />
               </button>
               {structure && structure.chapters.length > 1 && (
                   <button onClick={() => setShowTOC(!showTOC)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                       <List className="w-5 h-5" />
                   </button>
               )}
               <h2 className="text-sm font-bold font-serif truncate opacity-80">
                   {structure?.chapters[currentChapterIndex] || title}
               </h2>
           </div>

           <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
               <button 
                onClick={() => setShowCitation(!showCitation)}
                className={`p-2 rounded-full transition-colors ${showCitation ? 'bg-academic-accent text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                title="Cite This"
               >
                   <Quote className="w-4 h-4 md:w-5 md:h-5" />
               </button>
               <button 
                onClick={handlePlayAudio}
                className={`p-2 rounded-full transition-colors ${isPlaying ? 'text-academic-accent animate-pulse' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                title="Read Aloud"
               >
                   <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
               </button>
               <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-academic-accent text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
               >
                   <Settings className="w-4 h-4 md:w-5 md:h-5" />
               </button>
               <button 
                onClick={() => setShowAI(!showAI)}
                className={`p-2 rounded-full transition-colors ${showAI ? 'bg-academic-accent text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
               >
                   <Bot className="w-4 h-4 md:w-5 md:h-5" />
               </button>
           </div>
       </div>

       {/* SETTINGS CONTROL PANEL */}
       {showSettings && (
           <div className={`absolute top-16 right-4 w-80 md:w-96 ${currentTheme.bg} border ${currentTheme.ui} rounded-2xl shadow-2xl z-50 p-0 animate-in zoom-in-95 origin-top-right overflow-hidden flex flex-col max-h-[80vh]`}>
               <div className={`flex border-b ${currentTheme.ui}`}>
                   <button onClick={() => setSettingsTab('Theme')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${settingsTab === 'Theme' ? 'bg-black/5 dark:bg-white/10' : ''}`}>Theme</button>
                   <button onClick={() => setSettingsTab('Type')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${settingsTab === 'Type' ? 'bg-black/5 dark:bg-white/10' : ''}`}>Typography</button>
               </div>
               
               <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                   {settingsTab === 'Theme' && (
                       <div className="space-y-6">
                           {themeCategories.map(cat => (
                               <div key={cat}>
                                   <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">{cat}</h4>
                                   <div className="grid grid-cols-4 gap-2">
                                       {THEMES.filter(t => t.category === cat).map(t => (
                                           <button 
                                            key={t.id}
                                            onClick={() => setCurrentTheme(t)}
                                            className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${t.bg} ${t.text} ${currentTheme.id === t.id ? 'border-academic-accent scale-95 ring-2 ring-academic-accent/20' : 'border-transparent hover:scale-105'}`}
                                            title={t.name}
                                           >
                                               <div className="w-3 h-3 rounded-full border border-current opacity-50"></div>
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                   
                   {settingsTab === 'Type' && (
                       <div className="space-y-8">
                           {/* Font Family Categories */}
                           {fontCategories.map(cat => (
                               <div key={cat} className="space-y-2">
                                   <h4 className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${cat === 'Accessibility' ? 'text-academic-accent font-black' : ''}`}>{cat}</h4>
                                   <div className="grid grid-cols-2 gap-2">
                                       {FONTS.filter(f => f.category === cat).map(f => (
                                           <button 
                                            key={f.id}
                                            onClick={() => setCurrentFont(f)}
                                            className={`px-3 py-2 text-sm border rounded-lg transition-all text-left truncate ${f.class} ${currentFont.id === f.id ? `bg-black/10 dark:bg-white/10 ${currentTheme.ui}` : `border-transparent hover:bg-black/5 dark:hover:bg-white/5`}`}
                                           >
                                               {f.name}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           ))}

                           <div className={`h-px ${currentTheme.ui} w-full my-4`}></div>

                           {/* Font Size */}
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Size: {fontSize}px</label>
                               <input 
                                type="range" min="12" max="48" step="1" 
                                value={fontSize} 
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full accent-academic-accent"
                               />
                           </div>

                           {/* Line Height */}
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Line Height: {lineHeight}</label>
                               <input 
                                type="range" min="1.0" max="3.0" step="0.1" 
                                value={lineHeight} 
                                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                                className="w-full accent-academic-accent"
                               />
                           </div>

                           {/* Alignment */}
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Alignment</label>
                               <div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-1">
                                   <button onClick={() => setTextAlign('left')} className={`flex-1 p-2 rounded flex justify-center ${textAlign === 'left' ? 'bg-white dark:bg-stone-800 shadow-sm' : ''}`}><AlignLeft className="w-4 h-4" /></button>
                                   <button onClick={() => setTextAlign('center')} className={`flex-1 p-2 rounded flex justify-center ${textAlign === 'center' ? 'bg-white dark:bg-stone-800 shadow-sm' : ''}`}><AlignCenter className="w-4 h-4" /></button>
                                   <button onClick={() => setTextAlign('justify')} className={`flex-1 p-2 rounded flex justify-center ${textAlign === 'justify' ? 'bg-white dark:bg-stone-800 shadow-sm' : ''}`}><AlignJustify className="w-4 h-4" /></button>
                               </div>
                           </div>
                       </div>
                   )}
               </div>
           </div>
       )}

       {/* CITATION MODAL */}
       {showCitation && (
           <div className={`absolute top-16 right-4 md:right-16 w-full max-w-sm bg-stone-900 text-white border border-stone-700 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[80vh] animate-in zoom-in-95 origin-top-right`}>
               <div className="flex justify-between items-center p-4 border-b border-white/10">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold flex items-center gap-2">
                       <Quote className="w-3 h-3" /> Citation Generator
                   </h3>
                   <button onClick={() => setShowCitation(false)}><X className="w-4 h-4 text-stone-400 hover:text-white" /></button>
               </div>
               
               <div className="p-4 border-b border-white/10">
                   <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-500" />
                       <input 
                        type="text" 
                        placeholder="Search format (e.g. IEEE, Harvard)..."
                        className="w-full bg-black/30 border border-stone-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-academic-gold outline-none"
                        value={citationSearch}
                        onChange={(e) => setCitationSearch(e.target.value)}
                       />
                   </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                   <div className="grid grid-cols-2 gap-2">
                       {filteredCitations.map(fmt => (
                           <button
                               key={fmt.id}
                               onClick={() => setCitationFormat(fmt.id)}
                               className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors border text-left flex flex-col ${citationFormat === fmt.id ? 'bg-white text-black border-white' : 'bg-transparent text-stone-400 border-stone-800 hover:border-stone-600 hover:bg-white/5'}`}
                           >
                               <span>{fmt.id}</span>
                               <span className="opacity-50 text-[8px]">{fmt.name}</span>
                           </button>
                       ))}
                   </div>
               </div>

               <div className="p-4 bg-black/50 border-t border-white/10">
                   <div className="p-3 bg-stone-800/50 rounded-lg border border-white/5 mb-3 font-mono text-[10px] text-stone-300 break-words leading-relaxed text-justify">
                       {generatedCitation}
                   </div>
                   <button 
                       onClick={handleCopyCitation}
                       className="w-full py-3 bg-academic-accent text-white font-bold uppercase text-xs tracking-widest rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                   >
                       {citationCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       {citationCopied ? 'Copied to Clipboard' : 'Copy Citation'}
                   </button>
               </div>
           </div>
       )}

       {/* TOC DRAWER */}
       {showTOC && structure && (
           <div className={`absolute top-14 left-0 bottom-0 w-72 ${currentTheme.bg} border-r ${currentTheme.ui} z-30 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300`}>
               <div className={`p-4 border-b ${currentTheme.ui} font-bold text-xs uppercase tracking-widest opacity-50 ${currentTheme.bg}`}>Table of Contents</div>
               {structure.chapters.map((chap, i) => (
                   <button 
                    key={i}
                    onClick={() => { loadChapter(i, chap); setShowTOC(false); }}
                    className={`w-full text-left p-4 text-sm border-b ${currentTheme.ui} hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${i === currentChapterIndex ? 'font-bold bg-black/5 dark:bg-white/5 border-l-4 border-l-academic-accent' : 'opacity-80'}`}
                   >
                       {chap}
                   </button>
               ))}
           </div>
       )}

       {/* AI ASSISTANT PANEL */}
       {showAI && (
           <div className={`absolute top-14 right-0 bottom-0 w-80 md:w-96 ${currentTheme.bg} border-l ${currentTheme.ui} z-30 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col`}>
               <div className="p-4 border-b border-current/10 flex justify-between items-center bg-academic-accent text-white">
                   <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Assistant</span>
                   <button onClick={() => setShowAI(false)}><X className="w-4 h-4" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {selection && (
                       <div className="p-3 bg-academic-accent/10 border-l-2 border-academic-accent text-xs italic opacity-80 rounded-r">
                           "{selection.substring(0, 150)}..."
                       </div>
                   )}
                   
                   {aiResponse ? (
                       <div className="prose prose-sm prose-p:leading-relaxed text-justify max-w-none">
                           <p>{aiResponse}</p>
                       </div>
                   ) : (
                       <div className="text-center py-20 opacity-50 text-xs flex flex-col items-center gap-2">
                           <Bot className="w-8 h-8 opacity-50" />
                           <p>Select text to explain, or ask a question below.</p>
                       </div>
                   )}

                   {isAiThinking && (
                       <div className="flex justify-center py-4">
                           <Loader2 className="w-6 h-6 animate-spin opacity-50 text-academic-accent" />
                       </div>
                   )}
               </div>

               <div className={`p-4 border-t ${currentTheme.ui}`}>
                   <div className="relative">
                       <input 
                        type="text" 
                        placeholder="Ask about this text..."
                        className={`w-full pl-4 pr-10 py-3 rounded-full text-sm bg-black/5 dark:bg-white/5 border ${currentTheme.ui} focus:outline-none focus:ring-1 focus:ring-academic-accent transition-all`}
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                       />
                       <button 
                        onClick={handleAiAsk}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-academic-accent text-white rounded-full hover:bg-opacity-90 transition-transform active:scale-90"
                       >
                           <ArrowLeft className="w-4 h-4 rotate-180" />
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* SELECTION MENU (Floating) */}
       {selectionRect && !showAI && (
           <div 
            className="absolute z-50 flex gap-1 p-1 bg-stone-900 text-white rounded-lg shadow-xl animate-in zoom-in-95 duration-200"
            style={{ 
                top: selectionRect.top + 60, 
                left: Math.min(window.innerWidth - 200, Math.max(10, selectionRect.left + selectionRect.width / 2 - 100))
            }}
           >
               <button onClick={handleAiAsk} className="px-3 py-1.5 text-xs font-bold hover:bg-white/20 rounded flex items-center gap-1">
                   <Sparkles className="w-3 h-3 text-academic-gold" /> Explain
               </button>
               <div className="w-px bg-white/20 my-1"></div>
               <button onClick={() => { navigator.clipboard.writeText(selection || ''); setSelection(null); }} className="px-3 py-1.5 text-xs font-bold hover:bg-white/20 rounded">
                   Copy
               </button>
           </div>
       )}

       {/* CONTENT SCROLL */}
       <div 
        className="flex-1 overflow-y-auto px-4 md:px-0 py-8 scroll-smooth custom-scrollbar"
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        ref={contentRef}
       >
           <div 
            className={`max-w-3xl mx-auto pb-32 min-h-[60vh] ${currentFont.class} transition-all duration-300`} 
            style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
           >
                <div className={`mb-12 text-center border-b ${currentTheme.ui} pb-8`}>
                    <h1 className="text-5xl font-bold mb-4 leading-tight tracking-tight">{structure?.chapters[currentChapterIndex] || title}</h1>
                    <p className="opacity-60 text-lg">{author}</p>
                </div>

                {loadingChapter ? (
                    <div className="space-y-6 animate-pulse opacity-50">
                        <div className="h-4 bg-current rounded w-full"></div>
                        <div className="h-4 bg-current rounded w-5/6"></div>
                        <div className="h-4 bg-current rounded w-4/6"></div>
                        <div className="h-4 bg-current rounded w-full"></div>
                        <div className="h-4 bg-current rounded w-3/4"></div>
                        <div className="h-4 bg-current rounded w-5/6"></div>
                    </div>
                ) : (
                    renderFormattedText(chapterContent || "Content unavailable.")
                )}
           </div>
       </div>

       {/* BOTTOM NAV */}
       <div className={`flex-none h-16 border-t ${currentTheme.ui} flex items-center justify-between px-6 z-20 backdrop-blur-md bg-opacity-90 ${currentTheme.bg}`}>
           <button 
            onClick={handlePrevChapter}
            disabled={currentChapterIndex === 0}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity"
           >
               <ChevronLeft className="w-4 h-4" /> Prev
           </button>
           
           <span className="text-[10px] font-mono opacity-40">
               {currentChapterIndex + 1} / {structure?.chapters.length || 1}
           </span>

           <button 
            onClick={handleNextChapter}
            disabled={!structure || currentChapterIndex === structure.chapters.length - 1}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity"
           >
               Next <ChevronRight className="w-4 h-4" />
           </button>
       </div>

    </div>
  );
};

export default ReaderView;
