


import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Bookmark, Library, Download, Map, BarChart2, Brain, ChevronRight, BookOpen, Clock, Users, Globe, LayoutGrid, Check, X, FileText, Search, Lightbulb, AlertTriangle, Layers, GitMerge, Zap, Printer, ArrowRightLeft } from 'lucide-react';
import { IdeologyDetail, DisciplineWork } from '../types';
import { fetchIdeologyDetail } from '../services/theoryService';
import LoadingScreen from './LoadingScreen';
import PersonDetailScreen from './PersonDetailScreen';
import ConceptDetailModal from './ConceptDetailModal';
import ReaderView from './ReaderView';
import QuizView from './QuizView';
import FlashcardView from './FlashcardView';
import { IconRenderer } from './IconMap';
import { WikipediaWidget } from './external/WikipediaWidget';
import { OpenLibraryWidget } from './external/OpenLibraryWidget';
import { ArXivWidget } from './external/ArXivWidget';
import { RedditWidget } from './external/RedditWidget';
import { DOAJWidget } from './external/DOAJWidget';
import { SemanticScholarWidget } from './external/SemanticScholarWidget';
import { WikiquoteWidget } from './external/WikiquoteWidget';
import { OpenAlexWidget } from './external/OpenAlexWidget';
import { InternetArchiveWidget } from './external/InternetArchiveWidget';
import { ArtInstituteChicagoWidget } from './external/ArtInstituteChicagoWidget';
import { CrossrefWidget } from './external/CrossrefWidget';
import { GutendexWidget } from './external/GutendexWidget';
import { DictionaryWidget } from './external/DictionaryWidget';
import { GovTrackWidget } from './external/GovTrackWidget';
import { UKPetitionsWidget } from './external/UKPetitionsWidget';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface IdeologyDetailScreenProps {
  ideologyName: string;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onNavigate?: (type: string, payload: any) => void;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'branches', label: 'Branches', icon: GitMerge },
    { id: 'tenets', label: 'Core Tenets', icon: Lightbulb },
    { id: 'thinkers', label: 'Thinkers', icon: Users },
    { id: 'impact', label: 'Impact', icon: Globe },
    { id: 'critique', label: 'Critique', icon: AlertTriangle },
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

const IdeologyDetailScreen: React.FC<IdeologyDetailScreenProps> = ({ ideologyName, onClose, isSaved, onToggleSave, onNavigate }) => {
  const [data, setData] = useState<IdeologyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Interactive State
  const [activeBook, setActiveBook] = useState<DisciplineWork | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchIdeologyDetail(ideologyName);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [ideologyName]);

  const scrollToSection = (id: string) => {
    playSFX('click');
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadDossier = async () => {
      playSFX('click');
      if (!data) return;
      try {
          const sections = [];
          if (data.coreTenets && data.coreTenets.length > 0) {
              sections.push({ title: "Core Tenets", content: data.coreTenets });
          }
          if (data.history && data.history.origins) {
               sections.push({ title: "Historical Origins", content: data.history.origins });
          }
          if (data.impact && data.impact.social) {
               sections.push({ title: "Social Impact", content: data.impact.social });
          }

          generateAestheticPDF(
              data.name || ideologyName,
              "Political Ideology Dossier",
              data.description || "No description provided.",
              sections,
              `${(data.name || ideologyName).replace(/\s+/g, '_')}_Dossier.pdf`
          );
      } catch (err) {
          console.error("PDF generation failed:", err);
      }
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

  if (loading) return <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex items-center justify-center"><LoadingScreen message={`Analyzing ${ideologyName}...`} /></div>;
  if (!data) return <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex items-center justify-center"><p className="text-stone-500">Data unavailable.</p></div>;

  return (
    <>
    <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex-none h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 z-50 shadow-sm print:hidden">
         <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
             <div>
                <h1 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100">{data.name}</h1>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-academic-gold">Political Ideology</span>
             </div>
         </div>
         <div className="flex items-center gap-2">
             <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Print Dossier"><Printer className="w-4 h-4" /></button>
             <button onClick={handleDownloadDossier} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Download Dossier"><Download className="w-4 h-4" /></button>
             <button onClick={onToggleSave} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-academic-gold bg-stone-50 dark:bg-stone-800' : 'text-stone-400 hover:text-academic-accent hover:bg-stone-100 dark:hover:bg-stone-800'}`}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /></button>
         </div>
      </div>

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

      <div className="flex-1 overflow-y-auto scroll-smooth pb-32 bg-stone-50/30 dark:bg-black/20">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-12">

          {/* 1. OVERVIEW */}
          <div id="overview" ref={el => { sectionRefs.current['overview'] = el; }} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-academic-gold/10 rounded-2xl text-academic-gold">
                      <Lightbulb className="w-12 h-12" />
                  </div>
                  <div>
                       <h1 className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 leading-tight">{data.name}</h1>
                  </div>
              </div>
              <div className="mb-8 font-serif text-lg leading-loose text-justify text-stone-700 dark:text-stone-200">{renderProse(data.definition)}</div>
              
              <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border-l-4 border-academic-accent dark:border-indigo-500">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">Historical Origins</h4>
                  <p className="font-serif text-sm text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{data.origins}</p>
              </div>
          </div>

          {/* 2. HISTORY */}
          <div id="history" ref={el => { sectionRefs.current['history'] = el; }}>
              <SectionTitle title="Historical Evolution" icon={Clock} subtitle="Timeline of Thought" />
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8">
                  {renderProse(data.historyNarrative)}
                  
                  <div className="mt-8 border-l-2 border-stone-200 dark:border-stone-700 ml-3 pl-8 space-y-8">
                      {data.timeline?.map((evt, i) => (
                          <div key={i} className="relative group cursor-pointer" onClick={() => onNavigate && onNavigate('Event', evt.event)}>
                              <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-white dark:bg-stone-900 border-2 border-academic-gold rounded-full group-hover:scale-125 transition-transform shadow-sm"></div>
                              <span className="text-xs font-mono font-bold text-academic-gold block mb-1">{evt.year}</span>
                              <h4 className="text-lg font-serif font-bold text-academic-text dark:text-stone-100 mb-1 group-hover:text-academic-accent transition-colors">{evt.event}</h4>
                              <p className="text-sm text-stone-600 dark:text-stone-400 font-serif leading-relaxed text-justify">{evt.impact}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* 3. BRANCHES */}
          <div id="branches" ref={el => { sectionRefs.current['branches'] = el; }}>
              <SectionTitle title="Schools & Branches" icon={GitMerge} subtitle="Variations in Thought" />
              <div className="flex flex-wrap gap-3">
                  {data.branches?.map((branch, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedConcept(branch)}
                        className="px-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl font-serif font-bold text-stone-700 dark:text-stone-200 hover:border-academic-accent dark:hover:border-indigo-500 hover:shadow-md transition-all shadow-sm active:scale-95 text-sm"
                      >
                          {branch}
                      </button>
                  ))}
              </div>
          </div>

          {/* 4. CORE TENETS */}
          <div id="tenets" ref={el => { sectionRefs.current['tenets'] = el; }}>
               <SectionTitle title="Core Tenets" icon={Zap} subtitle="Foundational Principles" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {data.coreTenets?.map((tenet, i) => (
                       <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedConcept(tenet.concept)}>
                           <div className="flex items-start gap-4">
                               <div className="mt-1 p-1.5 bg-academic-gold/10 rounded-full text-academic-gold group-hover:scale-110 transition-transform"><Check className="w-3 h-3" /></div>
                               <div>
                                   <h4 className="font-bold text-academic-text dark:text-stone-100 mb-2 font-serif group-hover:text-academic-accent transition-colors">{tenet.concept}</h4>
                                   <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{tenet.description}</p>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
          </div>

          {/* 5. THINKERS */}
          <div id="thinkers" ref={el => { sectionRefs.current['thinkers'] = el; }}>
               <SectionTitle title="Key Thinkers" icon={Users} subtitle="Intellectual Architects" />
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {data.keyThinkers?.map((thinker, i) => (
                       <button 
                        key={i} 
                        onClick={() => onNavigate && onNavigate('Person', thinker.name)}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-academic-accent dark:hover:border-indigo-500 transition-colors group shadow-sm text-left"
                       >
                           <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 font-serif font-bold group-hover:bg-academic-accent group-hover:text-white dark:group-hover:bg-indigo-600 transition-colors flex-shrink-0">
                               {(thinker.name || '').charAt(0)}
                           </div>
                           <div>
                               <h4 className="font-bold text-academic-text dark:text-stone-100 font-serif group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{thinker.name}</h4>
                               <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-1">{thinker.era}</span>
                               <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 italic">"{thinker.contribution}"</p>
                           </div>
                       </button>
                   ))}
               </div>
          </div>

          {/* 6. IMPACT */}
          <div id="impact" ref={el => { sectionRefs.current['impact'] = el; }}>
               <SectionTitle title="Global Impact" icon={Globe} subtitle="Legacy & Influence" />
               <div className="bg-white dark:bg-stone-900 p-8 rounded-xl border border-stone-200 dark:border-stone-800">
                   {renderProse(data.globalImpact)}
               </div>
          </div>

          {/* 7. CRITIQUE */}
          <div id="critique" ref={el => { sectionRefs.current['critique'] = el; }}>
               <SectionTitle title="Criticism & Debate" icon={AlertTriangle} subtitle="Counter-Arguments" />
               <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-xl border border-red-100 dark:border-red-900/30">
                   <p className="font-serif text-stone-700 dark:text-stone-300 leading-loose text-justify">{data.criticisms}</p>
               </div>
          </div>
          
          {/* 8. RESOURCES */}
          <div id="resources" ref={el => { sectionRefs.current['resources'] = el; }}>
                <SectionTitle title="Library & Tools" icon={Library} subtitle="Further Study" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Foundational Texts</h4>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            {(data.foundationalWorks || []).length > 0 ? (
                                data.foundationalWorks.map((work, i) => (
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
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-stone-400 italic text-xs mb-2">Primary texts are being curated.</p>
                                    <button onClick={() => setActiveBook({ title: data.name, author: "System", year: "N/A", type: "Book" })} className="text-[10px] font-bold uppercase tracking-widest text-academic-accent dark:text-indigo-400 underline">Generate Reading List</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-xl">
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
                    </div>
                </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-academic-gold" /> External Repositories & Data
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <WikipediaWidget title={data.name} description="ideology politics" />
                        <GovTrackWidget />
                        <UKPetitionsWidget />
                        <ArtInstituteChicagoWidget queryText={data.name} />
                    </div>
                    <div className="space-y-6">
                        <WikiquoteWidget queryText={data.name} />
                        <OpenAlexWidget queryText={data.name} />
                        <InternetArchiveWidget queryText={data.name} />
                        <DictionaryWidget queryText={data.name} />
                        <CrossrefWidget queryText={data.name} />
                    </div>
                    <div className="space-y-6">
                        <GutendexWidget queryText={data.name} />
                        <RedditWidget queryText={`${data.name} politics`} />
                        <SemanticScholarWidget queryText={data.name} />
                        <DOAJWidget queryText={data.name} />
                        <ArXivWidget queryText={data.name} />
                        <OpenLibraryWidget queryText={data.name} />
                    </div>
                </div>
            </div>

          </div>
      </div>
    </div>

    {/* OVERLAYS */}
    {selectedConcept && <ConceptDetailModal term={selectedConcept} context={ideologyName} onClose={() => setSelectedConcept(null)} />}
    
    {activeBook && (
        <ReaderView 
           title={activeBook.title}
           author={activeBook.author}
           onClose={() => setActiveBook(null)}
        />
    )}

    {showQuiz && <QuizView topic={ideologyName} onClose={() => setShowQuiz(false)} />}
    {showFlashcards && <FlashcardView topic={ideologyName} onClose={() => setShowFlashcards(false)} />}
    </>
  );
};

export default IdeologyDetailScreen;