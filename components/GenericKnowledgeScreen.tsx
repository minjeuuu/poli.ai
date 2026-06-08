
import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Share2, Bookmark, Download, Activity, Globe, Brain, History, Loader2, AlertTriangle, Layers, Zap, TrendingUp, Users, Quote, MessageSquare, Printer } from 'lucide-react';
import { fetchGenericTopic } from '../services/searchService';
import LoadingScreen from './LoadingScreen';
import { IconRenderer } from './IconMap';

import MiniKnowledgeGraph from './MiniKnowledgeGraph';
import { WikipediaWidget } from './external/WikipediaWidget';
import { NasaImageWidget } from './external/NasaImageWidget';
import { SpaceXWidget } from './external/SpaceXWidget';
import { CoinGeckoWidget } from './external/CoinGeckoWidget';
import { HackerNewsWidget } from './external/HackerNewsWidget';
import { DictionaryWidget } from './external/DictionaryWidget';
import { UNSDGWidget } from './external/UNSDGWidget';
import { UKPoliceDataWidget } from './external/UKPoliceDataWidget';
import { ChicagoCrimesWidget } from './external/ChicagoCrimesWidget';
import { APIAggregatorWidget } from './external/APIAggregatorWidget';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface GenericKnowledgeScreenProps {
  query: string;
  onClose: () => void;
  onNavigate: (type: string, payload: any) => void;
}

const GenericKnowledgeScreen: React.FC<GenericKnowledgeScreenProps> = ({ query, onClose, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchGenericTopic(query);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [query]);

  if (loading) return (
      <div className="fixed inset-0 z-[70] bg-academic-bg dark:bg-stone-950">
          <LoadingScreen message={`Compiling Omnopedic Record: ${query}...`} />
      </div>
  );

  if (!data) return (
      <div className="fixed inset-0 z-[70] bg-academic-bg dark:bg-stone-950 flex flex-col items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-stone-400 mb-4" />
          <p className="text-stone-500 font-serif">Topic unavailable.</p>
          <button onClick={onClose} className="mt-4 text-xs font-bold uppercase underline">Return</button>
      </div>
  );

  const handleDownload = () => {
      playSFX('click');
      if (!data) return;
      try {
          const sections = [];
          if (data.summary) sections.push({ title: "Summary", content: data.summary });
          if (data.analysis) sections.push({ title: "Analysis", content: data.analysis });
          if (data.timeline && data.timeline.length > 0) {
              const events = data.timeline.map((e: any) => `${e.date || ''}: ${e.event || ''}`);
              sections.push({ title: "Timeline", content: events });
          }

          generateAestheticPDF(
              data.title || query,
              "Omnopedic Dossier",
              data.summary || "No description provided.",
              sections,
              `${(data.title || query).replace(/\s+/g, '_')}_Dossier.pdf`
          );
      } catch (err) {
          console.error("PDF generation failed:", err);
      }
  };

  const handleLinkClick = (term: string) => {
      onNavigate('Search', term);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-bottom duration-500">
      
      {/* HEADER */}
      <div className="flex-none h-16 bg-academic-paper/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-academic-line dark:border-stone-800 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 -ml-2 text-stone-500 hover:text-academic-accent dark:text-stone-400 dark:hover:text-indigo-400 transition-colors group">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
                <h1 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100 leading-none truncate max-w-[200px]">{data.title}</h1>
                <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest">Omnopedic Dossier</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()} 
                className="p-2 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Print Report"
              >
                  <Printer className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDownload} 
                className="p-2 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Download Report"
              >
                  <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsSaved(!isSaved)} 
                className={`p-2 rounded-full transition-colors ${isSaved ? 'text-academic-gold bg-stone-100 dark:bg-stone-800' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
          </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 pb-32 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-12">
              
              {/* HERO */}
              <section className="text-center space-y-4">
                   <div className="w-24 h-24 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                       <Zap className="w-12 h-12 text-academic-gold" />
                   </div>
                   <h1 className="text-4xl md:text-6xl font-serif font-bold text-academic-text dark:text-stone-100 tracking-tight">{data.title}</h1>
                   <div className="flex justify-center gap-2 flex-wrap">
                       {data.tags?.map((tag: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-500">{tag}</span>
                       ))}
                   </div>
                   <p className="font-serif text-lg md:text-xl text-stone-600 dark:text-stone-300 leading-relaxed text-justify max-w-2xl mx-auto italic">
                       {data.overview}
                   </p>
              </section>

              {/* EXTERNAL DATA INTEGRATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-10">
                  <div className="space-y-6 flex flex-col">
                      <WikipediaWidget title={data.title} />
                      <DictionaryWidget queryText={data.title} />
                      <HackerNewsWidget />
                      <CoinGeckoWidget />
                  </div>
                  <div className="space-y-6 flex flex-col">
                      <NasaImageWidget queryText={data.title} />
                      <SpaceXWidget limit={3} />
                      <ChicagoCrimesWidget />
                      <UKPoliceDataWidget />
                      <UNSDGWidget />
                  </div>
              </div>
              <div className="my-6">
                  <APIAggregatorWidget query={data.title} />
              </div>

              {/* DATA STRIP */}
              {data.statistics && data.statistics.length > 0 && (
                  <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {data.statistics.map((stat: any, i: number) => (
                          <div key={i} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-100 dark:border-stone-800 text-center shadow-sm">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-1">{stat.label}</span>
                              <span className="text-xl font-mono font-bold text-academic-accent dark:text-indigo-400">{stat.value}</span>
                          </div>
                      ))}
                  </section>
              )}

              {/* POLITICAL ANALYSIS */}
              {data.politicalAnalysis && (
                  <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 md:p-10 rounded-2xl shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-academic-gold/5 rounded-bl-full -mr-10 -mt-10"></div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-6 flex items-center gap-2 relative z-10">
                          <Brain className="w-4 h-4" /> Comprehensive Analysis
                      </h3>
                      <div className="font-serif text-lg text-stone-800 dark:text-stone-200 leading-loose text-justify relative z-10 whitespace-pre-line">
                          {data.politicalAnalysis}
                      </div>
                  </section>
              )}

              {/* KEY CONCEPTS */}
              {data.keyPoints && (
                  <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                          <Layers className="w-4 h-4" /> Structural Dimensions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.keyPoints.map((point: any, i: number) => (
                              <div key={i} className="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 transition-colors">
                                  <h4 className="font-bold text-sm text-academic-text dark:text-white mb-2">{point.title}</h4>
                                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed text-justify font-serif">{point.description}</p>
                              </div>
                          ))}
                      </div>
                  </section>
              )}

              {/* HISTORY & FIGURES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {data.historicalContext && (
                      <section className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-xl border-l-4 border-academic-gold">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-4 flex items-center gap-2">
                              <History className="w-4 h-4" /> Historical Context
                          </h3>
                          <p className="font-serif text-sm text-stone-700 dark:text-stone-300 leading-loose text-justify">
                              {data.historicalContext}
                          </p>
                      </section>
                  )}

                  {data.keyFigures && (
                      <section className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-xl border-l-4 border-academic-accent dark:border-indigo-500">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-academic-accent dark:text-indigo-400 mb-4 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Key Figures
                          </h3>
                          <div className="flex flex-wrap gap-2">
                              {data.keyFigures.map((fig: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-xs font-bold text-stone-600 dark:text-stone-300">{fig}</span>
                              ))}
                          </div>
                      </section>
                  )}
              </div>

              {/* OPPOSING VIEWPOINTS */}
              {data.opposingViewpoints && (
                   <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-xl border border-red-100 dark:border-red-900/30">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Critical Perspectives & Debate
                       </h3>
                       <p className="font-serif text-stone-700 dark:text-stone-300 leading-loose text-justify">
                           {data.opposingViewpoints}
                       </p>
                   </section>
              )}

              {/* QUOTE */}
              {data.notableQuote && (
                  <section className="text-center py-8">
                      <Quote className="w-8 h-8 text-academic-gold mx-auto mb-4 opacity-50" />
                      <blockquote className="text-2xl font-serif text-academic-text dark:text-stone-100 leading-normal mb-4">
                          "{data.notableQuote.text}"
                      </blockquote>
                      <cite className="text-xs font-bold uppercase tracking-widest text-stone-400 not-italic">
                          — {data.notableQuote.author}
                      </cite>
                  </section>
              )}

              {/* RELATED ENTITIES (KNOWLEDGE GRAPH) */}
              {data.relatedEntities && (
                  <section>
                       <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-4 flex items-center gap-2">
                          <Globe className="w-4 h-4" /> Interactive Knowledge Graph
                       </h3>
                       <MiniKnowledgeGraph 
                            coreEntity={data.title}
                            relatedEntities={data.relatedEntities}
                            onNodeClick={handleLinkClick}
                       />
                       <div className="flex flex-wrap gap-2 mt-6">
                           {data.relatedEntities.map((entity: string, i: number) => (
                               <button 
                                key={i} 
                                onClick={() => handleLinkClick(entity)}
                                className="px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:border-academic-accent dark:hover:border-indigo-500 hover:text-academic-accent dark:hover:text-indigo-400 transition-all shadow-sm flex items-center gap-2"
                               >
                                   <Globe className="w-3 h-3 opacity-50" /> {entity}
                               </button>
                           ))}
                       </div>
                  </section>
              )}

          </div>
      </div>
    </div>
  );
};

export default GenericKnowledgeScreen;
