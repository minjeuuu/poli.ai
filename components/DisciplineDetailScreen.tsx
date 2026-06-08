


import React, { useEffect, useState, useRef } from 'react';
import { DisciplineDetail, DisciplineWork } from '../types';
import { fetchDisciplineDetail } from '../services/geminiService';
import { IconRenderer } from './IconMap';
import { 
  ArrowLeft, Bookmark, Share2, Library, Download, Map, 
  BarChart2, Brain, ChevronRight, BookOpen, Clock, Users, Globe, LayoutGrid, Check, X, FileText, Search, Printer, Activity 
} from 'lucide-react';
import LoadingScreen from './LoadingScreen';
import ReaderView from './ReaderView';
import QuizView from './QuizView';
import FlashcardView from './FlashcardView';
import RegionalDetailScreen from './RegionalDetailScreen';
import ConceptDetailModal from './ConceptDetailModal';
import PersonDetailScreen from './PersonDetailScreen';
import { WikipediaWidget } from './external/WikipediaWidget';
import { OpenLibraryWidget } from './external/OpenLibraryWidget';
import { ArXivWidget } from './external/ArXivWidget';
import { RedditWidget } from './external/RedditWidget';
import { CrossrefWidget } from './external/CrossrefWidget';
import { OpenAlexWidget } from './external/OpenAlexWidget';
import { InternetArchiveWidget } from './external/InternetArchiveWidget';
import { DictionaryWidget } from './external/DictionaryWidget';
import { SemanticScholarWidget } from './external/SemanticScholarWidget';
import { DOAJWidget } from './external/DOAJWidget';
import { LibraryOfCongressWidget } from './external/LibraryOfCongressWidget';
import { PubMedWidget } from './external/PubMedWidget';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface DisciplineDetailScreenProps {
  disciplineName: string;
  iconName?: string;
  onBack: () => void;
  onNavigate: (discipline: string, iconName?: string) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'subfields', label: 'Subfields', icon: LayoutGrid },
    { id: 'theories', label: 'Theories', icon: Brain },
    { id: 'methods', label: 'Methods', icon: BarChart2 },
    { id: 'scholars', label: 'Scholars', icon: Users },
    { id: 'regions', label: 'Regions', icon: Map },
    { id: 'resources', label: 'Library', icon: Library },
];

const SectionTitle: React.FC<{ title: string, icon: any, subtitle?: string }> = ({ title, icon: Icon, subtitle }) => (
    <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-stone-100 dark:border-stone-800 pt-12">
        <div className="p-3 bg-academic-bg dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-academic-gold shadow-sm">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-xl font-bold uppercase tracking-[0.25em] text-academic-text dark:text-stone-100">{title}</h3>
            {subtitle && <p className="text-xs text-stone-400 font-mono uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
    </div>
);

const DisciplineDetailScreen: React.FC<DisciplineDetailScreenProps> = ({ 
  disciplineName, 
  iconName = "BookOpen", 
  onBack, 
  onNavigate,
  isSaved,
  onToggleSave
}) => {
  const [data, setData] = useState<DisciplineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Interactive State
  const [activeBook, setActiveBook] = useState<DisciplineWork | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null); 
  const [selectedScholar, setSelectedScholar] = useState<string | null>(null); 
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchDisciplineDetail(disciplineName);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [disciplineName]);

  const scrollToSection = (id: string) => {
    playSFX('click');
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrint = () => {
    playSFX('click');
    window.print();
  };

  const renderProse = (text: string) => {
      if (!text) return null;
      return text.split('\n\n').map((para, i) => {
          if (!para.trim()) return null;
          return (
              <p key={i} className="mb-6 leading-loose text-justify text-stone-700 dark:text-stone-300 font-serif text-base md:text-lg">
                  {para.trim()}
              </p>
          );
      });
  };

  const handleDownloadSyllabus = async () => {
      playSFX('success');
      if (!data) return;
      
      const safeName = (data.name || disciplineName || "Discipline").toUpperCase();
      try {
          const sections = [];
          
          if (data.overview) {
               sections.push({ 
                   title: "1. OVERVIEW", 
                   content: [
                       `Definition: ${data.overview.definition || 'N/A'}`,
                       `Scope: ${data.overview.scope || 'N/A'}`,
                       `Importance: ${data.overview.importance || 'N/A'}`,
                       "",
                       "Key Questions:",
                       ...(data.overview.keyQuestions || []).map((q: string) => `  - ${q}`)
                   ].join('\n')
               });
          }

          if (data.coreTheories && data.coreTheories.length > 0) {
               sections.push({ 
                   title: "2. CORE THEORIES", 
                   content: data.coreTheories.map((t: any) => `${t.name} (${t.year}): ${t.summary}`)
               });
          }

          if (data.methods && data.methods.length > 0) {
               sections.push({ 
                   title: "3. RESEARCH METHODS", 
                   content: data.methods.map((m: any) => `${m.name}: ${m.description}`)
               });
          }

          if (data.scholars && data.scholars.length > 0) {
               sections.push({ 
                   title: "4. KEY SCHOLARS", 
                   content: data.scholars.map((s: any) => `${s.name} (${s.period}): ${s.contribution}`)
               });
          }

          if (data.foundationalWorks && data.foundationalWorks.length > 0) {
               sections.push({ 
                   title: "5. FOUNDATIONAL READINGS", 
                   content: data.foundationalWorks.map((w: any) => `"${w.title}" by ${w.author} (${w.year})`)
               });
          }

          generateAestheticPDF(
              "POLI ACADEMIC SYLLABUS",
              `DISCIPLINE: ${safeName}`,
              data.overview?.definition || "No description provided.",
              sections,
              `${safeName.replace(/\s+/g, '_')}_Syllabus.pdf`
          );
      } catch (e) {
          console.error("Failed to generate PDF", e);
      }
  };

  if (loading) return <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex items-center justify-center"><LoadingScreen message={`Structuring ${disciplineName}...`} /></div>;
  if (!data) return null;

  const currentIconName = data.iconName || iconName;

  return (
    <>
    <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex-none h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 z-50 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
             <div>
                <h1 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100">{data.name}</h1>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-academic-gold">Academic Discipline</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={handlePrint} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Print Dossier"><Printer className="w-4 h-4" /></button>
             <button onClick={onToggleSave} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-academic-gold bg-stone-50 dark:bg-stone-800' : 'text-stone-400 hover:text-academic-accent hover:bg-stone-100 dark:hover:bg-stone-800'}`}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /></button>
          </div>
      </div>

      {/* TABS */}
      <div className="flex-none bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 px-6 py-2 overflow-x-auto no-scrollbar flex gap-4">
          {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => scrollToSection(t.id)}
                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all whitespace-nowrap flex items-center gap-2
                ${activeTab === t.id ? 'bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-sm' : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-700 hover:border-academic-accent'}`}
              >
                  <t.icon className="w-3 h-3" /> {t.label}
              </button>
          ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-32 bg-stone-50/30 dark:bg-black/20">
         <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-12">
            
            {/* 1. OVERVIEW */}
            <div id="overview" ref={el => { sectionRefs.current['overview'] = el; }} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-academic-gold rounded-xl shadow-inner flex-shrink-0">
                        <IconRenderer name={currentIconName} className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-4 leading-tight">{data.name}</h1>
                        <p className="text-lg font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-justify mb-6">
                            {data.overview?.definition || "Definition currently unavailable."}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-l-4 border-academic-accent dark:border-indigo-500 rounded-r-lg">
                                <span className="text-[9px] font-bold uppercase text-stone-400 dark:text-stone-500 block mb-1">Scope</span>
                                <p className="text-sm font-serif dark:text-stone-300">{data.overview?.scope || "Scope unavailable."}</p>
                            </div>
                            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-l-4 border-academic-gold rounded-r-lg">
                                <span className="text-[9px] font-bold uppercase text-stone-400 dark:text-stone-500 block mb-1">Importance</span>
                                <p className="text-sm font-serif dark:text-stone-300">{data.overview?.importance || "Importance unavailable."}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 mb-2">Key Questions</h3>
                            <ul className="space-y-1">
                                {(data.overview?.keyQuestions || []).map((q, i) => (
                                    <li key={i} className="text-sm font-serif italic text-stone-700 dark:text-stone-300 flex gap-2">
                                        <span className="text-academic-accent dark:text-indigo-400 font-bold">?</span> {q}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. HISTORY */}
            <div id="history" ref={el => { sectionRefs.current['history'] = el; }}>
                <SectionTitle title="Historical Evolution" icon={Clock} subtitle="Academic Timeline" />
                
                {/* TIMELINE */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8">
                    <div className="border-l-2 border-stone-200 dark:border-stone-700 ml-4 pl-8 space-y-8 py-2 mb-12">
                        {data.history?.map((h, i) => (
                            <button key={i} className="relative group cursor-pointer hover:opacity-80 transition-opacity text-left w-full" onClick={() => setSelectedConcept(h.event)}>
                                <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-600 rounded-full group-hover:border-academic-gold transition-colors"></div>
                                <span className="text-xs font-mono font-bold text-academic-gold block mb-1">{h.year}</span>
                                <h3 className="text-base font-serif font-bold text-academic-text dark:text-stone-100 mb-1">{h.event}</h3>
                                <p className="text-sm font-serif text-stone-600 dark:text-stone-400">{h.impact}</p>
                            </button>
                        ))}
                    </div>

                    {/* PROSE HISTORY */}
                    {data.historyNarrative && (
                        <div className="bg-stone-50 dark:bg-stone-800/30 p-6 rounded-xl border border-stone-100 dark:border-stone-800">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">Comprehensive History</h4>
                            {renderProse(data.historyNarrative)}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. SUBFIELDS */}
            <div id="subfields" ref={el => { sectionRefs.current['subfields'] = el; }}>
                <SectionTitle title="Sub-Disciplines" icon={LayoutGrid} subtitle="Fields of Study" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.subDisciplines?.map((sub, i) => (
                        <button 
                            key={i} 
                            onClick={() => onNavigate(sub, "Brain")}
                            className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-left hover:border-academic-accent dark:hover:border-indigo-500 transition-colors group shadow-sm hover:shadow-md"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-serif font-bold text-stone-700 dark:text-stone-200 text-sm group-hover:text-academic-accent dark:group-hover:text-indigo-400">{sub}</span>
                                <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. THEORIES */}
            <div id="theories" ref={el => { sectionRefs.current['theories'] = el; }}>
                <SectionTitle title="Core Theories" icon={Brain} subtitle="Theoretical Frameworks" />
                <div className="space-y-4">
                    {data.coreTheories?.map((theory, i) => (
                        <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-academic-gold dark:hover:border-indigo-500" onClick={() => setSelectedConcept(theory.name)}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-academic-text dark:text-stone-100 font-serif text-lg">{theory.name}</h4>
                                <span className="text-xs font-mono text-stone-400">{theory.year}</span>
                            </div>
                            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{theory.summary}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. METHODS */}
            <div id="methods" ref={el => { sectionRefs.current['methods'] = el; }}>
                <SectionTitle title="Research Methods" icon={BarChart2} subtitle="Analysis Tools" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.methods?.map((method, i) => (
                        <div key={i} className="border-l-4 border-academic-accent dark:border-indigo-500 pl-4 py-2 bg-white dark:bg-stone-900 rounded-r-xl shadow-sm pr-4">
                            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 mb-1">{method.name}</h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 leading-relaxed text-justify">{method.description}</p>
                            <div className="bg-stone-100 dark:bg-stone-800 p-2 rounded text-[10px] font-mono text-stone-600 dark:text-stone-300">
                                Ex: {method.example}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. SCHOLARS */}
            <div id="scholars" ref={el => { sectionRefs.current['scholars'] = el; }}>
                <SectionTitle title="Key Scholars" icon={Users} subtitle="Intellectual Giants" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.scholars?.map((scholar, i) => (
                        <button key={i} onClick={() => setSelectedScholar(scholar.name)} className="flex items-center gap-3 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-academic-accent dark:hover:border-indigo-500 transition-colors text-left group shadow-sm hover:shadow-md hover:-translate-y-1">
                            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 font-serif font-bold group-hover:bg-academic-accent dark:group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {(scholar.name || '').charAt(0)}
                            </div>
                            <div>
                                <span className="block font-bold text-sm text-stone-800 dark:text-stone-200">{scholar.name}</span>
                                <span className="text-[10px] text-stone-400 uppercase tracking-wider">{scholar.period}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 7. REGIONS */}
            <div id="regions" ref={el => { sectionRefs.current['regions'] = el; }}>
                <SectionTitle title="Regional Focus" icon={Map} subtitle="Geographic Application" />
                <div className="flex flex-wrap gap-3 mb-6">
                    {data.regionalFocus?.map((reg, i) => (
                        <button key={i} onClick={() => setActiveRegion(reg.region)} className={`px-4 py-2 border rounded-full text-xs font-bold transition-all shadow-sm
                        ${activeRegion === reg.region ? 'bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 border-transparent' : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-academic-accent'}`}>
                            {reg.region}
                        </button>
                    ))}
                </div>
                {activeRegion && (
                    <div className="p-6 bg-stone-100 dark:bg-stone-800 rounded-xl animate-in fade-in slide-in-from-top-2 border border-stone-200 dark:border-stone-700">
                        <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 mb-2">{activeRegion}</h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{data.regionalFocus?.find(r => r.region === activeRegion)?.description}</p>
                    </div>
                )}
            </div>

            {/* 8. RESOURCES */}
            <div id="resources" ref={el => { sectionRefs.current['resources'] = el; }}>
                <SectionTitle title="Library & Tools" icon={Library} subtitle="Further Study" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Foundational Texts</h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                            {data.foundationalWorks?.map((work, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => setActiveBook({...work, type: 'Book'})}
                                  className="flex items-center justify-between p-3 border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer group w-full text-left rounded-lg transition-colors"
                                >
                                    <div>
                                        <h3 className="font-serif text-sm font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400">{work.title}</h3>
                                        <p className="text-xs text-stone-500">{work.author}, {work.year}</p>
                                    </div>
                                    <BookOpen className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-academic-gold" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-academic-accent dark:text-indigo-400 mb-4">Interactive Learning</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setShowQuiz(true)}
                                    className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-academic-gold hover:text-academic-gold transition-colors text-center bg-stone-50 dark:bg-stone-800/50"
                                >
                                    <Check className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-xs font-bold uppercase">Quiz</span>
                                </button>
                                <button 
                                    onClick={() => setShowFlashcards(true)}
                                    className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-academic-gold hover:text-academic-gold transition-colors text-center bg-stone-50 dark:bg-stone-800/50"
                                >
                                    <LayoutGrid className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-xs font-bold uppercase">Cards</span>
                                </button>
                            </div>
                        </div>
                        
                        <button onClick={handleDownloadSyllabus} className="w-full p-4 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <Download className="w-4 h-4" /> Download Syllabus
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-academic-gold" /> External Repositories & Data
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <WikipediaWidget title={disciplineName} description="academic discipline" />
                        <PubMedWidget queryText={disciplineName} />
                        <LibraryOfCongressWidget queryText={disciplineName} />
                    </div>
                    <div className="space-y-6">
                        <OpenAlexWidget queryText={disciplineName} />
                        <InternetArchiveWidget queryText={disciplineName} />
                        <DictionaryWidget queryText={disciplineName} />
                        <CrossrefWidget queryText={disciplineName} />
                    </div>
                    <div className="space-y-6">
                        <RedditWidget queryText={`${disciplineName} study`} />
                        <SemanticScholarWidget queryText={disciplineName} />
                        <DOAJWidget queryText={disciplineName} />
                        <ArXivWidget queryText={disciplineName} />
                        <OpenLibraryWidget queryText={disciplineName} />
                    </div>
                </div>
            </div>

         </div>
      </div>

      {/* OVERLAYS */}
      {activeBook && (
          <ReaderView 
             title={activeBook.title}
             author={activeBook.author}
             onClose={() => setActiveBook(null)}
          />
      )}

      {showQuiz && <QuizView topic={disciplineName} onClose={() => setShowQuiz(false)} />}
      {showFlashcards && <FlashcardView topic={disciplineName} onClose={() => setShowFlashcards(false)} />}
      
      {activeRegion && (
          <RegionalDetailScreen 
            region={activeRegion} 
            disciplineContext={disciplineName} 
            onClose={() => setActiveRegion(null)} 
            onNavigate={(type, payload) => onNavigate(type, payload)}
          />
      )}

      {selectedConcept && (
          <ConceptDetailModal term={selectedConcept} context={disciplineName} onClose={() => setSelectedConcept(null)} />
      )}

      {selectedScholar && (
          <PersonDetailScreen 
            personName={selectedScholar} 
            onClose={() => setSelectedScholar(null)} 
            onNavigate={onNavigate}
          />
      )}

    </div>
    </>
  );
};

export default DisciplineDetailScreen;