import { ImageWithFallback } from './atoms/ImageWithFallback';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Globe, Building2, Users, FileText, History, X, Flag, Scale, Brain, Search, BookOpen, Bookmark, Download, ChevronRight, Target, Zap, LayoutGrid, Award, Printer, ArrowRightLeft, Crown, Coins, AlertCircle } from 'lucide-react';
import { OrganizationDetail } from '../types';
import { fetchOrganizationDetail } from '../services/orgService';
import LoadingScreen from './LoadingScreen';
import CountryDetailScreen from './country/CountryDetailScreen';
import ReaderView from './ReaderView';
import ConceptDetailModal from './ConceptDetailModal';
import { WikidataWidget } from './external/WikidataWidget';
import { GDELTWidget } from './external/GDELTWidget';
import { RedditWidget } from './external/RedditWidget';
import jsPDF from 'jspdf';
import { playSFX } from '../services/soundService';

interface OrgDetailScreenProps {
  orgName: string;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
}

const TABS = [
    { id: 'identity', label: 'Identity', icon: Flag },
    { id: 'structure', label: 'Structure', icon: LayoutGrid },
    { id: 'leadership', label: 'Leadership', icon: Crown },
    { id: 'politics', label: 'Politics', icon: Brain },
    { id: 'finances', label: 'Finances', icon: Coins },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'documents', label: 'Treaties', icon: FileText },
    { id: 'controversies', label: 'Controversies', icon: AlertCircle },
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

const OrgDetailScreen: React.FC<OrgDetailScreenProps> = ({ orgName, onClose, isSaved, onToggleSave, onNavigate, onAddToCompare }) => {
  const [data, setData] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('identity');
  const [memberSearch, setMemberSearch] = useState('');
  
  // Drill Down State
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [readingDoc, setReadingDoc] = useState<{title: string} | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchOrganizationDetail(orgName);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [orgName]);

  const scrollToSection = (id: string) => {
    playSFX('click');
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadDossier = async () => {
      playSFX('click');
      if (!data) return;
      try {
          const doc = new jsPDF();
          let y = 20;
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text("POLI ACADEMIC DOSSIER", 20, y);
          y += 10;
          doc.setFontSize(24);
          doc.setTextColor(40, 40, 40);
          const safeName = data.name || "Unknown Org";
          doc.text(safeName, 20, y);
          y += 15;
          doc.setFontSize(12);
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(data.description || "", 170);
          doc.text(descLines, 20, y);
          y += descLines.length * 7 + 10;
          
          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text("Key Activities", 20, y);
          y += 10;
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          data.keyActivities?.forEach((act: string, i: number) => {
              const textLines = doc.splitTextToSize(`${i+1}. ${act}`, 170);
              doc.text(textLines, 20, y);
              y += textLines.length * 6 + 4;
              if (y > 270) {
                  doc.addPage();
                  y = 20;
              }
          });
          
          doc.save(`${safeName.replace(/\s+/g, '_')}_Dossier.pdf`);
      } catch (err) {
          console.error("PDF generation failed:", err);
      }
  };

  const getFlagUrl = (isoCode?: string) => {
      if (!isoCode) return null;
      return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  // Helper to normalize member data since it might be string or object depending on API version
  const getMembers = () => {
      if (!data?.members || !Array.isArray(data.members)) return [];
      return data.members.map(m => {
          if (typeof m === 'string') return { name: m, role: 'Member', isoCode: '' };
          return m;
      });
  };

  if (loading) return <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex items-center justify-center"><LoadingScreen message={`Accessing ${orgName} Archives...`} /></div>;
  if (!data) return <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex items-center justify-center"><p className="text-stone-500">Archives Unavailable</p></div>;

  const memberList = getMembers();
  const filteredMembers = memberList.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  return (
    <>
    <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      
      {/* ACTION BAR */}
      <div className="flex-none h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 z-50 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
             <div>
                <h1 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100">{data.abbr || data.name}</h1>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-academic-gold">Organization</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => { playSFX('click'); onAddToCompare(orgName, 'Org'); }} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Compare"><ArrowRightLeft className="w-4 h-4" /></button>
             <button onClick={handleDownloadDossier} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors" title="Download Dossier"><Download className="w-4 h-4" /></button>
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

      <div className="flex-1 overflow-y-auto scroll-smooth pb-32 bg-stone-50/30 dark:bg-black/20">
          <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-12">
          
          <WikidataWidget queryText={data.name} />

          {/* 1. IDENTITY */}
          <div id="identity" ref={el => { sectionRefs.current['identity'] = el; }} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-start animate-in fade-in duration-500">
                      <div className="w-32 h-32 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center p-4 relative overflow-hidden rounded-xl shadow-inner flex-shrink-0">
                           {data.logoUrl ? (
                               <ImageWithFallback src={data.logoUrl} alt={data.name} className="w-full h-full object-contain" />
                           ) : (
                               <Building2 className="w-16 h-16 text-stone-300 dark:text-stone-600" />
                           )}
                      </div>
                      <div className="flex-1">
                          <h1 className="text-3xl md:text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-3 leading-tight">{data.name}</h1>
                          {data.nativeName && <h2 className="text-lg font-serif text-stone-500 dark:text-stone-400 italic mb-6">{data.nativeName}</h2>}
                          
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-6 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-100 dark:border-stone-800">
                               <div><span className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[10px] tracking-widest block">Founded</span> <span className="font-serif text-stone-800 dark:text-stone-200">{data.founded}</span></div>
                               <div><span className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[10px] tracking-widest block">Headquarters</span> <span onClick={() => onNavigate && onNavigate('Concept', data.headquarters)} className="cursor-pointer hover:text-academic-accent transition-colors font-serif text-stone-800 dark:text-stone-200">{data.headquarters}</span></div>
                               <div className="col-span-2"><span className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[10px] tracking-widest block">Leadership</span> <span onClick={() => onNavigate && onNavigate('Person', data.secretaryGeneral)} className="cursor-pointer hover:text-academic-accent transition-colors font-serif text-stone-800 dark:text-stone-200 font-bold text-lg">{data.secretaryGeneral}</span></div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-academic-bg dark:bg-stone-800/30 border-l-4 border-academic-gold rounded-r-lg">
                      <span className="text-[9px] font-bold uppercase text-academic-gold block mb-2 flex items-center gap-2"><Target className="w-3 h-3" /> Mission Mandate</span>
                      <p className="font-serif text-lg leading-relaxed text-academic-text dark:text-stone-200 italic">"{data.mission}"</p>
                  </div>
          </div>

          {/* 2. STRUCTURE */}
          <div id="structure" ref={el => { sectionRefs.current['structure'] = el; }}>
               <SectionTitle title="Administrative Structure" icon={LayoutGrid} subtitle="Key Organs & Bodies" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                  {Array.isArray(data.keyOrgans) && data.keyOrgans.map((organ, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedConcept(organ.name)}
                        className="p-6 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-academic-gold dark:hover:border-indigo-500 transition-colors shadow-sm cursor-pointer group text-left rounded-xl"
                      >
                          <h4 className="font-serif font-bold text-academic-text dark:text-stone-100 mb-2 text-base group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{organ.name}</h4>
                          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif">{organ.function}</p>
                      </button>
                  ))}
              </div>
              {data.satelliteOffices && Array.isArray(data.satelliteOffices) && data.satelliteOffices.length > 0 && (
                  <div className="mt-8">
                      <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block mb-3 flex items-center gap-2"><Globe className="w-3 h-3" /> Regional Presence</span>
                      <div className="flex flex-wrap gap-2">
                          {data.satelliteOffices.map((off, i) => (
                              <span key={i} onClick={() => onNavigate && onNavigate('Regional', off)} className="cursor-pointer hover:border-academic-accent hover:text-academic-accent transition-colors px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-600 dark:text-stone-300 rounded-md shadow-sm">{off}</span>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* 3. LEADERSHIP */}
          {data.leadership && data.leadership.length > 0 && (
              <div id="leadership" ref={el => { sectionRefs.current['leadership'] = el; }}>
                  <SectionTitle title="Executive Leadership" icon={Crown} subtitle="Key Figures" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.leadership.map((leader, i) => (
                          <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-sm">
                              <div className="flex items-center gap-4 mb-3">
                                  <div className="w-12 h-12 bg-academic-gold/10 rounded-full flex items-center justify-center text-academic-gold font-bold text-xl">
                                      {leader.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h4 onClick={() => onNavigate && onNavigate('Person', leader.name)} className="cursor-pointer hover:text-academic-accent transition-colors font-serif font-bold text-lg text-academic-text dark:text-stone-100">{leader.name}</h4>
                                      <span className="text-xs uppercase tracking-widest text-stone-500">{leader.role}</span>
                                  </div>
                              </div>
                              <p className="text-sm font-serif text-stone-600 dark:text-stone-400 leading-relaxed">{leader.bio}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* 4. POLITICS */}
          <div id="politics" ref={el => { sectionRefs.current['politics'] = el; }}>
              <SectionTitle title="Political Economy" icon={Brain} subtitle="Paradigm & Governance" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                  <div onClick={() => setSelectedConcept(data.ideologicalParadigm || "Internationalism")} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 text-center cursor-pointer hover:shadow-md hover:border-academic-accent dark:hover:border-indigo-500 transition-all rounded-xl group shadow-sm">
                      <Scale className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-3 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors" />
                      <span className="block text-[9px] uppercase text-stone-400 dark:text-stone-500 mb-1 tracking-widest">Paradigm</span>
                      <p className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200">{data.ideologicalParadigm || "Internationalism"}</p>
                  </div>
                  <div onClick={() => setSelectedConcept(data.governanceModel || "Assembly")} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 text-center cursor-pointer hover:shadow-md hover:border-academic-accent dark:hover:border-indigo-500 transition-all rounded-xl group shadow-sm">
                      <Users className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-3 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors" />
                      <span className="block text-[9px] uppercase text-stone-400 dark:text-stone-500 mb-1 tracking-widest">Governance</span>
                      <p className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200">{data.governanceModel || "Assembly"}</p>
                  </div>
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 text-center rounded-xl shadow-sm">
                      <Zap className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
                      <span className="block text-[9px] uppercase text-stone-400 dark:text-stone-500 mb-1 tracking-widest">Budget</span>
                      <p className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200">{data.budget || "Undisclosed"}</p>
                  </div>
              </div>
          </div>

          {/* 5. FINANCES */}
          {data.finances && data.finances.length > 0 && (
              <div id="finances" ref={el => { sectionRefs.current['finances'] = el; }}>
                  <SectionTitle title="Financial Overview" icon={Coins} subtitle="Funding & Budget" />
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                              <tr>
                                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-stone-500">Source / Category</th>
                                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Amount</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                              {data.finances.map((item, i) => (
                                  <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                      <td className="px-6 py-4 font-serif text-stone-800 dark:text-stone-200">{item.source}</td>
                                      <td className="px-6 py-4 font-mono text-stone-600 dark:text-stone-400 text-right">{item.amount}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* 6. PROJECTS */}
          {data.projects && data.projects.length > 0 && (
              <div id="projects" ref={el => { sectionRefs.current['projects'] = el; }}>
                  <SectionTitle title="Strategic Initiatives" icon={Target} subtitle="Current Projects" />
                  <div className="space-y-4">
                      {data.projects.map((project, i) => (
                          <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-sm hover:border-academic-accent dark:hover:border-indigo-500 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-serif font-bold text-lg text-academic-text dark:text-stone-100">{project.name}</h4>
                                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                                      project.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                      'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                  }`}>{project.status}</span>
                              </div>
                              <p className="text-sm font-serif text-stone-600 dark:text-stone-400 leading-relaxed">{project.description}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* 7. MEMBERS */}
          <div id="members" ref={el => { sectionRefs.current['members'] = el; }}>
               <SectionTitle title="Member States" icon={Users} subtitle="Composition & Roster" />
               <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                       <span className="text-xs font-mono bg-stone-100 dark:bg-stone-800 px-3 py-1 border border-stone-200 dark:border-stone-700 rounded-full text-stone-600 dark:text-stone-300">{memberList.length} Members</span>
                       <div className="relative w-64">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                           <input 
                            type="text" 
                            placeholder="Find member..." 
                            className="w-full pl-10 pr-4 py-2 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-serif focus:border-academic-accent dark:focus:border-indigo-500 outline-none rounded-md text-stone-800 dark:text-stone-200 placeholder-stone-400"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                           />
                       </div>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                       {filteredMembers.map((member, i) => (
                           <button 
                             key={i} 
                             onClick={() => setSelectedMember(member.name)}
                             className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 border border-transparent hover:border-academic-accent dark:hover:border-indigo-500 rounded-xl transition-all group shadow-sm hover:shadow-md text-left"
                           >
                               <div className="w-8 h-6 bg-stone-200 dark:bg-stone-700 rounded overflow-hidden flex-shrink-0 shadow-sm border border-stone-300 dark:border-stone-600">
                                   {member.isoCode ? (
                                       <ImageWithFallback src={getFlagUrl(member.isoCode) || ''} alt={member.name} className="w-full h-full object-cover" />
                                   ) : (
                                       <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-stone-400">?</div>
                                   )}
                               </div>
                               <div className="min-w-0">
                                   <span className="block text-xs font-serif font-bold text-stone-800 dark:text-stone-200 truncate group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{member.name}</span>
                                   <span className="block text-[9px] uppercase text-stone-400 dark:text-stone-500 tracking-wide truncate">{member.role || 'Member'}</span>
                               </div>
                           </button>
                       ))}
                   </div>
               </div>
          </div>

          {/* 5. HISTORY */}
          <div id="history" ref={el => { sectionRefs.current['history'] = el; }}>
              <SectionTitle title="Historical Context" icon={History} subtitle="Evolution" />
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
                  <div className="prose prose-stone dark:prose-invert prose-sm max-w-none font-serif leading-loose text-stone-700 dark:text-stone-300">
                      <p className="whitespace-pre-line">{data.history}</p>
                  </div>
              </div>
          </div>

          {/* 10. DOCUMENTS */}
          <div id="documents" ref={el => { sectionRefs.current['documents'] = el; }}>
               <SectionTitle title="Legal Frameworks" icon={FileText} subtitle="Treaties & Charters" />
               <div className="space-y-3">
                    {Array.isArray(data.majorTreaties) && data.majorTreaties.map((doc, i) => (
                        <div key={i} onClick={() => setReadingDoc({title: doc})} className="flex items-center justify-between p-5 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-academic-accent dark:hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all group rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:text-academic-accent dark:group-hover:text-indigo-400 rounded-lg transition-colors"><FileText className="w-5 h-5" /></div>
                                <span className="font-serif text-sm font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">{doc}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-300 dark:text-stone-600 group-hover:text-academic-gold transition-colors opacity-0 group-hover:opacity-100">
                                Read <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
          </div>

          {/* 11. CONTROVERSIES */}
          {data.controversies && data.controversies.length > 0 && (
              <div id="controversies" ref={el => { sectionRefs.current['controversies'] = el; }}>
                  <SectionTitle title="Controversies" icon={AlertCircle} subtitle="Criticisms & Issues" />
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-8">
                      <ul className="space-y-4">
                          {data.controversies.map((item, i) => (
                              <li key={i} className="flex gap-3">
                                  <span className="text-red-400 font-bold">•</span>
                                  <span className="font-serif text-stone-800 dark:text-stone-200 leading-relaxed">{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          )}

            <div className="mt-12 space-y-8">
                <GDELTWidget queryText={data.name} />
                <RedditWidget queryText={data.name} />
            </div>

          </div>
      </div>
    </div>

    {selectedMember && (
          <CountryDetailScreen 
            countryName={selectedMember} 
            onClose={() => setSelectedMember(null)} 
            onNavigate={onNavigate}
            onAddToCompare={onAddToCompare}
            isSaved={false}
            onToggleSave={() => {}}
          />
      )}

      {readingDoc && (
          <ReaderView 
            title={readingDoc.title}
            author={data.name}
            onClose={() => setReadingDoc(null)}
          />
      )}

      {selectedConcept && (
          <ConceptDetailModal 
            term={selectedConcept}
            context={orgName}
            onClose={() => setSelectedConcept(null)}
          />
      )}
    </>
  );
};

export default OrgDetailScreen;
