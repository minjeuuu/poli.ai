import { ImageWithFallback } from './atoms/ImageWithFallback';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Flag, Users, FileText, History, X, Target, Bookmark, Download, Printer, Palette, Globe } from 'lucide-react';
import { PoliticalPartyDetail } from '../types';
import { fetchPartyDetail } from '../services/partyService';
import { WikipediaWidget } from './external/WikipediaWidget';
import { GDELTWidget } from './external/GDELTWidget';
import { RedditWidget } from './external/RedditWidget';
import LoadingScreen from './LoadingScreen';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface PartyDetailScreenProps {
  partyName: string;
  country: string;
  onClose: () => void;
  onNavigate?: (type: string, payload: any) => void;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: Flag },
    { id: 'history', label: 'History', icon: History },
    { id: 'platform', label: 'Platform', icon: Target },
    { id: 'members', label: 'Figures', icon: Users },
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

const PartyDetailScreen: React.FC<PartyDetailScreenProps> = ({ partyName, country, onClose, onNavigate }) => {
  const [data, setData] = useState<PoliticalPartyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchPartyDetail(partyName, country);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [partyName, country]);

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
        if (data.keyPolicies && data.keyPolicies.length > 0) {
            sections.push({ title: "Key Policies", content: data.keyPolicies });
        }
        if (data.analysis && data.analysis.electoralStrategy) {
             sections.push({ title: "Electoral Strategy", content: data.analysis.electoralStrategy });
        }
        if (data.history && data.history.origins) {
             sections.push({ title: "Historical Origins", content: data.history.origins });
        }

        generateAestheticPDF(
            data.name || "Political Party",
            `${country} Political Party Dossier`,
            data.description || "No description provided.",
            sections,
            `${(data.name || "Party").replace(/\s+/g, '_')}_Dossier.pdf`
        );
    } catch (err) {
        console.error("PDF generation failed:", err);
    }
  };

  if (loading) return (
      <div className="fixed inset-0 top-16 z-[70] bg-academic-bg dark:bg-stone-950">
          <LoadingScreen message={`Analyzing ${partyName}...`} />
      </div>
  );

  if (!data || Object.keys(data).length === 0) return (
      <div className="fixed inset-0 top-16 z-[70] bg-academic-bg dark:bg-stone-950 flex items-center justify-center">
          <div className="text-center">
              <Flag className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-stone-500 font-serif">Party archives unavailable.</p>
              <button onClick={onClose} className="mt-4 text-xs font-bold uppercase tracking-widest underline text-academic-accent dark:text-indigo-400">Close</button>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 top-16 z-[70] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex-none h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 z-50 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => { playSFX('close'); onClose(); }} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100">{data.abbr || data.name}</h1>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-academic-gold">{country}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Print Dossier"><Printer className="w-4 h-4" /></button>
             <button onClick={handleDownloadDossier} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Download Dossier"><Download className="w-4 h-4" /></button>
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

      <div className="flex-1 overflow-y-auto scroll-smooth pb-32 bg-stone-50/30 dark:bg-black/20">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-12">
          
          {/* HERO */}
          <div id="overview" ref={el => { sectionRefs.current['overview'] = el; }} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center p-4 rounded-xl flex-shrink-0">
                   {data.logoUrl ? (
                       <ImageWithFallback src={data.logoUrl} alt={data.name} className="w-full h-full object-contain" />
                   ) : (
                       <Flag className="w-12 h-12 text-stone-300 dark:text-stone-600" />
                   )}
              </div>
              <div className="flex-1">
                  <h1 className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-4 leading-tight">{data.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 rounded-full">{data.politicalPosition}</span>
                      <span onClick={() => onNavigate && onNavigate('Ideology', data.ideology)} className="cursor-pointer hover:bg-indigo-700 transition-colors px-3 py-1 bg-academic-accent dark:bg-indigo-600 text-[10px] font-bold uppercase tracking-widest text-white rounded-full shadow-sm">{data.ideology}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                       <div><span className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[10px] tracking-widest block mb-1">Founded</span> <span className="font-serif text-stone-800 dark:text-stone-200 text-lg">{data.founded}</span></div>
                       <div><span className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[10px] tracking-widest block mb-1">Leader</span> <span onClick={() => onNavigate && onNavigate('Person', data.currentLeader)} className="cursor-pointer hover:text-academic-accent transition-colors font-serif text-stone-800 dark:text-stone-200 font-bold text-lg">{data.currentLeader}</span></div>
                       <div className="col-span-1 sm:col-span-2"><span className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[10px] tracking-widest block mb-1">Headquarters</span> <span onClick={() => onNavigate && onNavigate('Concept', data.headquarters)} className="cursor-pointer hover:text-academic-accent transition-colors font-serif text-stone-800 dark:text-stone-200">{data.headquarters}</span></div>
                  </div>

                  {/* COLORS */}
                  {(data.colors || []).length > 0 && (
                      <div className="mt-6 flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 tracking-widest">Party Colors</span>
                          <div className="flex gap-2">
                              {data.colors.map((color, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full border border-stone-200 dark:border-stone-700 shadow-sm" style={{ backgroundColor: color.toLowerCase() }} title={color}></div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* HISTORY */}
          <div id="history" ref={el => { sectionRefs.current['history'] = el; }}>
              <SectionTitle title="Political History" icon={History} subtitle="Evolution & Milestones" />
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
                  <p className="font-serif text-stone-700 dark:text-stone-300 leading-loose text-justify whitespace-pre-line text-lg">
                      {data.history}
                  </p>
              </div>
          </div>

          {/* PLATFORM */}
          <div id="platform" ref={el => { sectionRefs.current['platform'] = el; }}>
              <SectionTitle title="Platform & Agenda" icon={Target} subtitle="Policy Positions" />
              <div className="p-8 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-inner">
                 <p className="font-serif text-academic-text dark:text-stone-200 leading-loose text-justify text-lg">
                    {data.platform}
                 </p>
              </div>
          </div>

          {/* MEMBERS */}
          <div id="members" ref={el => { sectionRefs.current['members'] = el; }}>
              {(data.keyMembers || []).length > 0 && (
                  <>
                    <SectionTitle title="Key Figures" icon={Users} subtitle="Prominent Members" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {data.keyMembers.map((member, i) => (
                            <div key={i} onClick={() => onNavigate && onNavigate('Person', member)} className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-academic-accent dark:hover:border-indigo-500 shadow-sm transition-all text-center group cursor-pointer hover:-translate-y-1">
                                <div className="w-12 h-12 mx-auto bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-400 font-serif font-bold text-lg mb-3 group-hover:bg-academic-accent group-hover:text-white dark:group-hover:bg-indigo-600 transition-colors">
                                    {member.charAt(0)}
                                </div>
                                <span className="block font-serif font-bold text-stone-800 dark:text-stone-200 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{member}</span>
                            </div>
                        ))}
                    </div>
                  </>
              )}
          </div>
          
             <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-academic-gold" /> External Repositories & Data
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                    <WikipediaWidget title={data.name} description={country} />
                    <GDELTWidget queryText={`${data.name} ${country}`} />
                    <RedditWidget queryText={`${data.name} ${country}`} />
                </div>
            </div>

          </div>
      </div>
    </div>
  );
};

export default PartyDetailScreen;
