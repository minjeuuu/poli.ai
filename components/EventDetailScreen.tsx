import { ImageWithFallback } from './atoms/ImageWithFallback';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, FileText, CheckCircle, Activity, Globe, Scale, Bookmark, Download, Swords, Cloud, UserMinus, History, Clock, Image as ImageIcon, Search } from 'lucide-react';
import { EventDetail } from '../types';
import { fetchEventDetail } from '../services/eventService';
import LoadingScreen from './LoadingScreen';
import PersonDetailScreen from './PersonDetailScreen';
import { WikipediaWidget } from './external/WikipediaWidget';
import { GDELTWidget } from './external/GDELTWidget';
import { RedditWidget } from './external/RedditWidget';
import { CrossrefWidget } from './external/CrossrefWidget';
import { OpenLibraryWidget } from './external/OpenLibraryWidget';
import { DOAJWidget } from './external/DOAJWidget';
import { SemanticScholarWidget } from './external/SemanticScholarWidget';
import { ReliefWebWidget } from './external/ReliefWebWidget';
import { OpenAlexWidget } from './external/OpenAlexWidget';
import { InternetArchiveWidget } from './external/InternetArchiveWidget';
import { LibraryOfCongressWidget } from './external/LibraryOfCongressWidget';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface EventDetailScreenProps {
  eventName: string;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onNavigate?: (type: string, payload: any) => void;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'timeline', label: 'Chronology', icon: Clock },
    { id: 'forces', label: 'Forces', icon: Swords },
    { id: 'actors', label: 'Key Figures', icon: Users },
    { id: 'aftermath', label: 'Aftermath', icon: Globe },
    { id: 'sources', label: 'Archives', icon: FileText },
];

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ eventName, onClose, isSaved, onToggleSave, onNavigate }) => {
  const [data, setData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchEventDetail(eventName);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [eventName]);

  const handleDownload = () => {
      playSFX('click');
      if (!data) return;
      try {
          const sections = [];
          if (data.context) {
              sections.push({ title: "Historical Context", content: data.context });
          }
          if (data.timeline && data.timeline.length > 0) {
              const events = data.timeline.map((e: any) => `${e.date || ''}: ${e.event || ''}`);
              sections.push({ title: "Chronology", content: events });
          }
          if (data.aftermath) {
              sections.push({ title: "Aftermath", content: data.aftermath });
          }

          generateAestheticPDF(
              data.title || eventName,
              "Historical Event Dossier",
              data.summary || "No description provided.",
              sections,
              `${(data.title || eventName).replace(/\s+/g, '_')}_Event.pdf`
          );
      } catch (err) {
          console.error("PDF generation failed:", err);
      }
  };

  const scrollToSection = (id: string) => {
    playSFX('click');
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWebSearch = () => {
      playSFX('click');
      window.open(`https://www.google.com/search?q=${encodeURIComponent(eventName + " historical event")}&tbm=isch`, '_blank');
  };

  const handleActorClick = (actor: string) => {
      if (onNavigate) {
          onNavigate('Person', actor);
      }
  };

  if (loading) return (
      <div className="fixed inset-0 z-[60] bg-academic-bg dark:bg-stone-950">
          <LoadingScreen message={`Reconstructing ${eventName}...`} />
      </div>
  );

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-500 relative">
      
      {/* HEADER */}
      <div className="bg-academic-paper/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-academic-line dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 -ml-2 text-stone-500 hover:text-academic-accent dark:text-stone-400 dark:hover:text-indigo-400 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest block">Historical Dossier</span>
                    <h2 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100 truncate max-w-[200px] sm:max-w-md">{data.title}</h2>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleDownload} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors" title="Download Report"><Download className="w-5 h-5" /></button>
                <button onClick={handleWebSearch} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors" title="Visual Evidence"><ImageIcon className="w-5 h-5" /></button>
                <button onClick={onToggleSave} className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${isSaved ? 'text-academic-gold' : 'text-stone-400 dark:text-stone-500'}`}><Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} /></button>
            </div>
          </div>
          <div className="flex overflow-x-auto no-scrollbar border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 px-4">
              {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => scrollToSection(tab.id)} className={`flex items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? 'border-academic-gold text-academic-gold bg-stone-100 dark:bg-stone-800' : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'}`}><tab.icon className="w-3 h-3" /> {tab.label}</button>
              ))}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth pb-32 bg-stone-50 dark:bg-black">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-12">
            
            {/* HERO VISUAL */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 group bg-stone-200 dark:bg-stone-900">
                 {data.imageUrl ? (
                     <ImageWithFallback src={data.imageUrl} alt={data.title || eventName} className="w-full h-full object-cover" />
                 ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                         <History className="w-20 h-20 mb-4 opacity-50" />
                         <span className="text-xs font-bold uppercase tracking-widest">No Archival Image</span>
                         <button onClick={handleWebSearch} className="mt-4 px-6 py-2 bg-white dark:bg-stone-800 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all">Search Archives</button>
                     </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                     <div>
                         <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-2 text-shadow-lg">{data.title || eventName}</h1>
                         <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-mono font-bold">
                             <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {data.date}</span>
                             <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {data.location}</span>
                         </div>
                     </div>
                 </div>
            </div>
            
            {/* OVERVIEW */}
            <div id="overview" ref={el => { sectionRefs.current['overview'] = el; }} className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 text-academic-muted dark:text-stone-400">
                      <FileText className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Executive Summary</h3>
                  </div>
                  <p className="font-serif text-lg leading-loose text-justify text-stone-800 dark:text-stone-200 whitespace-pre-line">
                      {data.context}
                  </p>
            </div>

            {/* TIMELINE */}
            {(data as any).timeline && (data as any).timeline.length > 0 && (
                <div id="timeline" ref={el => { sectionRefs.current['timeline'] = el; }} className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-3 mb-8 text-academic-gold">
                        <Clock className="w-5 h-5" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Tactical Chronology</h3>
                    </div>
                    <div className="relative border-l-2 border-academic-gold/30 ml-3 pl-8 space-y-8">
                        {(data as any).timeline.map((point: any, i: number) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[39px] top-1 w-3 h-3 bg-academic-gold rounded-full border-2 border-white dark:border-stone-900"></div>
                                <span className="font-mono text-xs font-bold text-academic-gold block mb-1">{point.time || "Phase " + (i+1)}</span>
                                <p className="font-serif text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FORCES & STATS */}
            <div id="forces" ref={el => { sectionRefs.current['forces'] = el; }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-stone-900 text-white rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Swords className="w-32 h-32" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"><Swords className="w-4 h-4" /> Order of Battle</h4>
                    <ul className="space-y-2 relative z-10">
                        {((data as any).forcesInvolved || []).map((force: string, i: number) => (
                            <li key={i} onClick={() => onNavigate && onNavigate('Org', force)} className="cursor-pointer hover:text-academic-gold transition-colors font-serif text-sm border-b border-white/10 pb-2 last:border-0">{force}</li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                        <h4 className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 mb-2 flex items-center gap-2"><UserMinus className="w-4 h-4" /> Casualties</h4>
                        <p className="font-serif font-bold text-xl text-stone-800 dark:text-stone-200">{(data as any).casualties || "Unknown"}</p>
                    </div>
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2"><Cloud className="w-4 h-4" /> Conditions</h4>
                        <p className="font-serif font-bold text-xl text-stone-800 dark:text-stone-200">{(data as any).weather || "N/A"}</p>
                    </div>
                </div>
            </div>

            {/* ACTORS */}
            <div id="actors" ref={el => { sectionRefs.current['actors'] = el; }} className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3 mb-6 text-academic-muted dark:text-stone-400">
                    <Users className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Key Figures</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(data.keyActors || []).map((actor, i) => (
                        <button 
                        key={i} 
                        onClick={() => handleActorClick(actor)}
                        className="p-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm flex items-center gap-3 hover:border-academic-accent dark:hover:border-indigo-500 transition-colors rounded-xl text-left group"
                        >
                            <div className="w-10 h-10 bg-white dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-400 font-serif font-bold group-hover:bg-academic-accent dark:group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {(actor || '').charAt(0)}
                            </div>
                            <span className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{actor}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* AFTERMATH */}
            <div id="aftermath" ref={el => { sectionRefs.current['aftermath'] = el; }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-2xl border border-stone-200 dark:border-stone-800">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Immediate Outcome</h3>
                     <p className="font-serif text-lg text-stone-800 dark:text-stone-200 leading-relaxed text-justify">{data.outcome}</p>
                </div>
                <div className="bg-academic-accent dark:bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Historical Legacy</h3>
                     <p className="font-serif text-lg leading-relaxed text-justify opacity-90">{data.significance}</p>
                </div>
            </div>

            <div id="sources" ref={el => { sectionRefs.current['sources'] = el; }} className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-academic-gold" /> External Repositories & Data
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <WikipediaWidget title={data.title || eventName} description="historical event politics" />
                        <ReliefWebWidget queryText={data.title || eventName} />
                        <LibraryOfCongressWidget queryText={data.title || eventName} />
                    </div>
                    <div className="space-y-6">
                        <OpenAlexWidget queryText={data.title || eventName} />
                        <InternetArchiveWidget queryText={data.title || eventName} />
                        <SemanticScholarWidget queryText={data.title || eventName} />
                        <CrossrefWidget queryText={data.title || eventName} />
                    </div>
                    <div className="space-y-6">
                        <GDELTWidget queryText={data.title || eventName} />
                        <RedditWidget queryText={data.title || eventName} />
                        <DOAJWidget queryText={data.title || eventName} />
                        <OpenLibraryWidget queryText={data.title || eventName} />
                    </div>
                </div>
            </div>

          </div>
      </div>
    </div>
  );
};

export default EventDetailScreen;
