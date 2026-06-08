
import React, { useEffect, useState, useRef } from 'react';
import { 
    Globe, MessageCircle, Flag, Map as MapIcon, Users, Crown, Vote, Gavel, Coins, Truck, 
    Shield, History, Brain, Image as ImageIcon, BookOpen, Layers, GraduationCap,
    Leaf, Cpu, Music, Plane, Palette, Heart, Newspaper, Building2
} from 'lucide-react';
import { fetchCountryDeepDive } from '../../services/countryService';
import { CountryDeepDive, CountryMapData, DetailedTimelineEvent } from '../../types';
import LoadingScreen from '../LoadingScreen';
import { playSFX } from '../../services/soundService';

// Layout & Shared
import { SectionWrapper } from './shared/SectionWrapper';
import { NavButton } from './shared/NavButton';
import { DetailCard } from './shared/DetailCard';

// Section Components
import { CountryHero } from './overview/CountryHero';
import { NewsFeed } from './news/NewsFeed';
import { IdentityNames } from './identity/IdentityNames';
import { AnthemCard } from './identity/AnthemCard';
import { InteractiveMapGallery } from './geography/InteractiveMapGallery';
import { HeadOfStateCard } from './government/HeadOfStateCard';
import { CabinetRoster } from './government/CabinetRoster';
import { TimelineVertical } from './history/TimelineVertical';
import { ImageArchiveGrid } from './visuals/ImageArchiveGrid';
import { InfrastructureGrid } from './infra/InfrastructureGrid';
import { AcademicProfileView } from './academic/AcademicProfile';
import { LegalCodeViewer } from './legal/LegalCodeViewer';

// New Sub-Components
import { TradePartners } from './economy/TradePartners';
import { ReligiousBreakdown } from './demographics/ReligiousBreakdown';
import { EnvironmentProfile } from './environment/EnvironmentProfile';
import { TechProfile } from './technology/TechProfile';
import { SocietyProfile } from './society/SocietyProfile';
import { TourismProfile } from './tourism/TourismProfile';
import { CultureProfile } from './culture/CultureProfile';
import { HealthProfile } from './health/HealthProfile';
import { EducationProfile } from './education/EducationProfile';
import { WorldBankWidget } from './economy/WorldBankWidget';
import { RestCountriesWidget } from './external/RestCountriesWidget';
import { OpenStreetMapWidget } from './external/OpenStreetMapWidget';
import { OpenMeteoWidget } from '../external/OpenMeteoWidget';
import { UniversitiesWidget } from '../external/UniversitiesWidget';
import { PublicHolidaysWidget } from '../external/PublicHolidaysWidget';
import { WikipediaWidget } from '../external/WikipediaWidget';
import { FrankfurterWidget } from '../external/FrankfurterWidget';
import { MetMuseumWidget } from '../external/MetMuseumWidget';
import { OpenAlexWidget } from '../external/OpenAlexWidget';
import { ReliefWebWidget } from '../external/ReliefWebWidget';
import { WikiquoteWidget } from '../external/WikiquoteWidget';
import { InternetArchiveWidget } from '../external/InternetArchiveWidget';
import { OpenAQWidget } from '../external/OpenAQWidget';
import { HackerNewsWidget } from '../external/HackerNewsWidget';
import { WorldBankIndicatorsWidget } from '../external/WorldBankIndicatorsWidget';
import { USASpendingWidget } from '../external/USASpendingWidget';
import { GDELTWidget } from '../external/GDELTWidget';
import { ArtInstituteChicagoWidget } from '../external/ArtInstituteChicagoWidget';
import { DOAJWidget } from '../external/DOAJWidget';
import { SemanticScholarWidget } from '../external/SemanticScholarWidget';
import { LibraryOfCongressWidget } from '../external/LibraryOfCongressWidget';

import { generateAestheticPDF } from '../../utils/pdfGenerator';

interface CountryDetailScreenProps {
  countryName: string;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
}

const CountryDetailScreen: React.FC<CountryDetailScreenProps> = ({ countryName, onClose, isSaved, onToggleSave, onNavigate, onAddToCompare }) => {
  const [data, setData] = useState<CountryDeepDive & { environment?: any, technology?: any, society?: any, tourism?: any, culture?: any, health?: any, education?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('Overview');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchCountryDeepDive(countryName);
        if (mounted) {
            setData(result);
            setLoading(false);
        }
      } catch (e) {
          if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [countryName]);

  const handleDownload = () => {
    playSFX('click');
    if (!data) return;
    try {
        const sections = [];
        if (data.overview) sections.push({ title: "Overview", content: data.overview });
        if (data.headOfState) sections.push({ title: "Head of State", content: `${data.headOfState.name} (${data.headOfState.title})` });

        generateAestheticPDF(
            countryName,
            "National Dossier",
            data.overview || "No description provided.",
            sections,
            `${countryName.replace(/\s+/g, '_')}_Dossier.pdf`
        );
    } catch (err) {
        console.error("PDF generation failed:", err);
    }
  };

  const scrollTo = (id: string) => {
      playSFX('click');
      setActiveSection(id);
      sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SECTIONS = [
      { id: 'Overview', icon: Globe },
      { id: 'Live News', icon: MessageCircle },
      { id: 'Identity', icon: Flag },
      { id: 'Geography', icon: MapIcon },
      { id: 'Environment', icon: Leaf },
      { id: 'Demographics', icon: Users },
      { id: 'Government', icon: Crown },
      { id: 'Politics', icon: Vote },
      { id: 'Legal', icon: Gavel },
      { id: 'Economy', icon: Coins },
      { id: 'Technology', icon: Cpu },
      { id: 'Infrastructure', icon: Truck },
      { id: 'Society', icon: Music },
      { id: 'Culture', icon: Palette },
      { id: 'Health', icon: Heart },
      { id: 'Education', icon: GraduationCap },
      { id: 'Tourism', icon: Plane },
      { id: 'Military', icon: Shield },
      { id: 'History', icon: History },
      { id: 'Academic', icon: GraduationCap },
      { id: 'Analysis', icon: Brain },
      { id: 'Visuals', icon: ImageIcon },
  ];

  if (loading) return (
      <div className="fixed inset-0 top-16 z-[60] bg-academic-bg dark:bg-stone-950 flex items-center justify-center">
          <LoadingScreen message={`Reconstructing ${countryName} via Poli Archive V1...`} />
      </div>
  );

  if (!data) return null;

  const setRef = (id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; };

  return (
    <div className="fixed inset-0 top-0 z-[60] bg-academic-bg dark:bg-stone-950 flex animate-in fade-in duration-500 overflow-hidden">
      
      {/* LEFT NAVIGATION RAIL */}
      <nav className="w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex-none hidden lg:flex flex-col h-full z-20 pt-16">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800">
             <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Section Index</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {SECTIONS.map(s => (
                  <NavButton 
                    key={s.id} 
                    id={s.id} 
                    label={s.id} 
                    icon={s.icon} 
                    active={activeSection === s.id} 
                    onClick={() => scrollTo(s.id)} 
                  />
              ))}
          </div>
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex flex-col gap-2">
              <button onClick={() => { playSFX('click'); onAddToCompare(countryName, 'Country'); }} className="w-full py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-academic-accent dark:hover:border-indigo-500 transition-colors">Compare</button>
              <button onClick={handleDownload} className="w-full py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-academic-accent dark:hover:border-indigo-500 transition-colors">Download</button>
              <button onClick={onToggleSave} className={`w-full py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isSaved ? 'bg-academic-gold text-white border-academic-gold' : 'bg-transparent border-stone-200 dark:border-stone-700 text-stone-500 hover:border-academic-gold'}`}>{isSaved ? 'Saved' : 'Save Dossier'}</button>
          </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-stone-50/30 dark:bg-black/20 relative w-full">
          
          {/* MOBILE NAV */}
          <div className="lg:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar flex items-center gap-2 p-2 shadow-sm">
              <button onClick={handleDownload} className="flex-none px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-stone-100 dark:bg-stone-800 text-stone-500">Download</button>
              {SECTIONS.map(s => (
                  <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`flex-none px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeSection === s.id ? 'bg-academic-accent text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}
                  >
                      {s.id}
                  </button>
              ))}
          </div>

          <CountryHero data={data} onBack={onClose} />

          <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 pb-32">

              {/* OVERVIEW */}
              <SectionWrapper id="Overview" title="Overview" icon={Globe} setRef={setRef('Overview')}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                       <DetailCard label="Population" value={data.demographics.population?.total} icon={Users} subValue={data.demographics.population?.growthRate + " Growth"} />
                       <DetailCard label="GDP (Nominal)" value={data.economy.gdpNominal} icon={Coins} subValue={data.economy.growthRate + " Growth"} />
                       <DetailCard label="Capital" value={data.geography.capitals[0]?.name} icon={MapIcon} subValue={data.geography.capitals[0]?.coordinates} />
                       <DetailCard label="Regime" value={data.government.form} icon={Crown} subValue={data.politicalScience?.regimeType} />
                  </div>
                  
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 mb-12 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-academic-gold mb-6 flex items-center gap-2"><Brain className="w-4 h-4" /> Strategic Synthesis</h3>
                      <div className="prose prose-stone dark:prose-invert font-serif leading-loose text-base md:text-lg max-w-none text-justify">
                          <p>{data.politicalScience.detailedAnalysis?.politicalCulture || data.history.politicalHistory[0]}</p>
                      </div>
                  </div>
              </SectionWrapper>

              {/* LIVE NEWS */}
              <SectionWrapper id="Live News" title="Live Political Wire" icon={MessageCircle} subtitle="Real-time Developments" setRef={setRef('Live News')}>
                  <NewsFeed news={data.today.news || []} />
              </SectionWrapper>

              {/* IDENTITY */}
              <SectionWrapper id="Identity" title="National Identity" icon={Flag} subtitle="Symbols & Etymology" setRef={setRef('Identity')}>
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <IdentityNames native={data.identity.nativeName} demonym={data.identity.demonym} motto={data.identity.motto} />
                          <div>
                            <AnthemCard 
                                name={data.symbols?.anthem?.native || data.identity?.nationalAnthem?.name} 
                                lyrics={data.symbols?.anthem?.translation || data.identity?.nationalAnthem?.lyrics} 
                            />
                            <div className="mt-4 p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
                                <h5 className="text-[10px] font-bold uppercase text-stone-400 mb-2">Coat of Arms</h5>
                                <p className="text-sm font-serif">{data.symbols.coatOfArms?.description}</p>
                            </div>
                          </div>
                      </div>
                  </div>
              </SectionWrapper>

              {/* GEOGRAPHY */}
              <SectionWrapper id="Geography" title="Geographic Profile" icon={MapIcon} subtitle="Territory & Borders" setRef={setRef('Geography')}>
                  <InteractiveMapGallery maps={data.geography.maps || []} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <DetailCard label="Climate Zones" value={data.geography.climateZones?.[0]} icon={MapIcon} subValue={data.geography.climateZones?.slice(1).join(', ')} />
                      <DetailCard label="Terrain" value={data.geography.terrain?.[0]} icon={MapIcon} subValue={data.geography.terrain?.slice(1).join(', ')} />
                      <DetailCard label="Resources" value={data.geography.naturalResources?.[0]} icon={Coins} subValue={data.geography.naturalResources?.length + " Total"} />
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Administrative Divisions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                          {data.geography.adminDivisions?.level1?.map((div, i) => (
                              <div key={i} className="p-2 border border-stone-100 dark:border-stone-800 rounded text-sm font-serif truncate">
                                  {div.name} <span className="text-xs text-stone-400">({div.type})</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </SectionWrapper>

              {/* ENVIRONMENT (NEW) */}
              <SectionWrapper id="Environment" title="Ecological Profile" icon={Leaf} subtitle="Climate & Sustainability" setRef={setRef('Environment')}>
                  <EnvironmentProfile data={data.environment} />
              </SectionWrapper>

              {/* DEMOGRAPHICS */}
              <SectionWrapper id="Demographics" title="Demographics" icon={Users} subtitle="Population Structure" setRef={setRef('Demographics')}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Ethnic Groups</h4>
                          <div className="space-y-2">
                              {Array.isArray(data.demographics.ethnicGroups) && data.demographics.ethnicGroups.map((grp, i) => (
                                  <div key={i} className="flex justify-between text-sm cursor-pointer hover:text-academic-accent transition-colors group" onClick={() => onNavigate('Concept', grp.name)}>
                                      <span>{grp.name}</span>
                                      <span className="font-bold text-academic-accent">{grp.percentage}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      <ReligiousBreakdown data={data.demographics} onNavigate={onNavigate} />

                      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Languages</h4>
                          <div className="space-y-2">
                              {Array.isArray(data.demographics.languages) && data.demographics.languages.map((lang, i) => (
                                  <div key={i} className="flex justify-between text-sm cursor-pointer hover:text-academic-accent transition-colors group" onClick={() => onNavigate('Concept', `${lang.name} Language`)}>
                                      <span>{lang.name}</span>
                                      <span className="text-xs text-stone-500 group-hover:text-academic-accent transition-colors">{lang.status} ({lang.percentage})</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </SectionWrapper>

              {/* GOVERNMENT */}
              <SectionWrapper id="Government" title="Government Roster" icon={Crown} subtitle="Executive, Legislative, Judicial" setRef={setRef('Government')}>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                       <HeadOfStateCard data={data.government.headOfState} onNavigate={onNavigate} />
                       <HeadOfStateCard data={data.government.headOfGov} onNavigate={onNavigate} />
                   </div>
                   <CabinetRoster members={data.government.cabinet} onNavigate={onNavigate} />
              </SectionWrapper>

              {/* POLITICS */}
              <SectionWrapper id="Politics" title="Political Landscape" icon={Vote} subtitle="Parties & Elections" setRef={setRef('Politics')}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Parties</h4>
                          <div className="space-y-3">
                              {data.politics.parties?.map((party, i) => (
                                  <div key={i} className="p-3 border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer" onClick={() => onNavigate('Party', { name: party.name, country: countryName })}>
                                      <div className="font-bold text-sm text-academic-accent">{party.name}</div>
                                      <div className="text-xs text-stone-500">{party.ideology} • {party.leader}</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-6">
                          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Electoral History</h4>
                              {data.politics.electoralHistory?.map((elec, i) => (
                                  <div key={i} className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0 text-sm">
                                      <span className="font-mono text-stone-500">{elec.year} {elec.type}</span>
                                      <span className="font-bold">{elec.winner}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </SectionWrapper>

              {/* LEGAL */}
              <SectionWrapper id="Legal" title="Legal Code" icon={Gavel} subtitle="Constitution & Judiciary" setRef={setRef('Legal')}>
                   <LegalCodeViewer data={data.legal} countryName={countryName} />
              </SectionWrapper>

              {/* ECONOMY */}
              <SectionWrapper id="Economy" title="Economic Profile" icon={Coins} subtitle="Trade & Finance" setRef={setRef('Economy')}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                           <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Key Exports</h4>
                           <div className="flex flex-wrap gap-2">
                               {data.economy.majorExports?.map((ex, i) => (
                                   <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs">{ex.commodity} ({ex.value})</span>
                               ))}
                           </div>
                       </div>
                       <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                           <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Key Imports</h4>
                           <div className="flex flex-wrap gap-2">
                               {data.economy.majorImports?.map((im, i) => (
                                   <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded text-xs">{im.commodity} ({im.value})</span>
                               ))}
                           </div>
                       </div>
                   </div>
                   <TradePartners data={data.economy} onNavigate={onNavigate} />
                   
              </SectionWrapper>

              

              

              {/* TECHNOLOGY (NEW) */}
              <SectionWrapper id="Technology" title="Innovation & Tech" icon={Cpu} subtitle="Digital Infrastructure" setRef={setRef('Technology')}>
                  <TechProfile data={data.technology} />
              </SectionWrapper>

              {/* INFRASTRUCTURE */}
              <SectionWrapper id="Infrastructure" title="National Infrastructure" icon={Truck} subtitle="Transport, Energy, Digital" setRef={setRef('Infrastructure')}>
                  <InfrastructureGrid data={data.infrastructure} />
              </SectionWrapper>

              {/* SOCIETY (NEW) */}
              <SectionWrapper id="Society" title="Society & Demographics" icon={Users} subtitle="Social Structure" setRef={setRef('Society')}>
                  <SocietyProfile data={data.society} onNavigate={onNavigate} />
              </SectionWrapper>

              {/* CULTURE (NEW) */}
              <SectionWrapper id="Culture" title="Cultural Heritage" icon={Palette} subtitle="Arts, Cuisine, Traditions" setRef={setRef('Culture')}>
                  <CultureProfile data={data.culture} onNavigate={onNavigate} />
                  
                  
              </SectionWrapper>

              {/* HEALTH (NEW) */}
              <SectionWrapper id="Health" title="Public Health" icon={Heart} subtitle="Wellness & Systems" setRef={setRef('Health')}>
                  <HealthProfile data={data.health} onNavigate={onNavigate} />
              </SectionWrapper>

              {/* EDUCATION (NEW) */}
              <SectionWrapper id="Education" title="Education System" icon={GraduationCap} subtitle="Literacy & Institutions" setRef={setRef('Education')}>
                  <EducationProfile data={data.education} onNavigate={onNavigate} />
                  
              </SectionWrapper>

              {/* TOURISM (NEW) */}
              <SectionWrapper id="Tourism" title="Tourism & Visitation" icon={Plane} subtitle="Attractions & Visa" setRef={setRef('Tourism')}>
                  <TourismProfile data={data.tourism} onNavigate={onNavigate} />
              </SectionWrapper>

              {/* MILITARY */}
              <SectionWrapper id="Military" title="Defense Apparatus" icon={Shield} subtitle="Forces & Security" setRef={setRef('Military')}>
                  {/* Reuse or new component, sticking to text for now as specific components not in prompt */}
                  <div className="bg-stone-900 text-white p-6 rounded-xl">
                       <div className="flex justify-between items-center mb-4">
                           <h4 className="font-bold uppercase tracking-widest text-sm">Active Personnel</h4>
                           <span className="font-mono text-xl">{data.militaryComplex?.totalActive || "N/A"}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-xs font-mono text-stone-400">
                           <div>Budget: {data.militaryComplex?.budget}</div>
                           <div>% GDP: {data.militaryComplex?.percentGDP}</div>
                       </div>
                  </div>
              </SectionWrapper>

              {/* HISTORY */}
              <SectionWrapper id="History" title="Historical Record" icon={History} subtitle="Chronology of State" setRef={setRef('History')}>
                  <TimelineVertical events={data.history.timeline || []} onNavigate={onNavigate} />
              </SectionWrapper>

              {/* ACADEMIC */}
              <SectionWrapper id="Academic" title="Academic Profile" icon={BookOpen} subtitle="Intellectual History" setRef={setRef('Academic')}>
                  <AcademicProfileView data={data.academic} />
              </SectionWrapper>

              {/* ANALYSIS */}
              <SectionWrapper id="Analysis" title="Strategic Analysis" icon={Brain} subtitle="Deep State Assessment" setRef={setRef('Analysis')}>
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 space-y-8">
                      <div className="prose prose-stone dark:prose-invert max-w-none font-serif leading-loose text-justify">
                          <p>{data.analysis.strategicAnalysis}</p>
                      </div>
                  </div>
              </SectionWrapper>

              {/* VISUALS */}
               <SectionWrapper id="Visuals" title="Visual Archive" icon={ImageIcon} subtitle="Historical & Cultural Imagery" setRef={setRef('Visuals')}>
                   <ImageArchiveGrid images={data.imageArchive || []} />
               </SectionWrapper>

               {/* EXTERNAL NEWS & RESOURCES MULTI-GRID */}
               <SectionWrapper id="news" title="External Repositories & Data" icon={Globe} isVisible={true}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <FrankfurterWidget />
                            <RestCountriesWidget countryName={countryName} />
                            <WorldBankWidget countryName={countryName} />
                            <OpenStreetMapWidget countryName={countryName} />
                            <OpenMeteoWidget locationName={data.capital || countryName} />
                            <MetMuseumWidget queryText={countryName} />
                        </div>
                        <div className="space-y-6">
                            <WorldBankIndicatorsWidget countryName={countryName} />
                            <OpenAQWidget countryName={countryName} />
                            <ReliefWebWidget queryText={countryName} />
                            <OpenAlexWidget queryText={countryName} />
                            <WikipediaWidget title={countryName} description="country nation politics" />
                            <UniversitiesWidget countryName={countryName} />
                        </div>
                        <div className="space-y-6">
                            <GDELTWidget queryText={countryName} />
                            <LibraryOfCongressWidget queryText={countryName} />
                            <SemanticScholarWidget queryText={countryName} />
                            <DOAJWidget queryText={countryName} />
                            <ArtInstituteChicagoWidget queryText={countryName} />
                            <PublicHolidaysWidget countryName={countryName} />
                        </div>
                    </div>
               </SectionWrapper>

          </div>
      </div>
    </div>
  );
};

export default CountryDetailScreen;
