import { ImageWithFallback } from './atoms/ImageWithFallback';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Globe, Flag, AlertTriangle, Lightbulb, Download } from 'lucide-react';
import { RegionalDetail } from '../types';
import { fetchRegionalDetail } from '../services/geminiService';
import { WikipediaWidget } from './external/WikipediaWidget';
import { GDELTWidget } from './external/GDELTWidget';
import { RedditWidget } from './external/RedditWidget';
import { OpenAlexWidget } from './external/OpenAlexWidget';
import { InternetArchiveWidget } from './external/InternetArchiveWidget';
import { ReliefWebWidget } from './external/ReliefWebWidget';
import { LibraryOfCongressWidget } from './external/LibraryOfCongressWidget';
import { CrossrefWidget } from './external/CrossrefWidget';
import { DOAJWidget } from './external/DOAJWidget';
import LoadingScreen from './LoadingScreen';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface RegionalDetailScreenProps {
  region: string;
  disciplineContext: string;
  onClose: () => void;
  onNavigate: (type: string, payload: any) => void;
}

const RegionalDetailScreen: React.FC<RegionalDetailScreenProps> = ({ region, disciplineContext, onClose, onNavigate }) => {
  const [data, setData] = useState<RegionalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchRegionalDetail(region, disciplineContext);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [region, disciplineContext]);

  const handleDownload = () => {
    playSFX('click');
    if (!data) return;
    try {
        const sections = [];
        if (data.context) sections.push({ title: "Regional Context", content: data.context });
        if (data.characteristics && data.characteristics.length > 0) sections.push({ title: "Characteristics", content: data.characteristics });
        if (data.challenges && data.challenges.length > 0) sections.push({ title: "Challenges", content: data.challenges });
        if (data.futureOutlook) sections.push({ title: "Future Outlook", content: data.futureOutlook });

        generateAestheticPDF(
            region,
            `Regional Analysis: ${disciplineContext}`,
            "",
            sections,
            `${region.replace(/\s+/g, '_')}_Analysis.pdf`
        );
    } catch (err) {
        console.error("PDF generation failed:", err);
    }
  };

  if (loading) return (
      <div className="fixed inset-0 z-[60] bg-academic-bg">
          <LoadingScreen message={`Analyzing ${region} Context...`} />
      </div>
  );

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-academic-bg flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto">
      
      {/* HEADER */}
      <div className="bg-academic-paper/95 backdrop-blur-md border-b border-academic-line p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 -ml-2 text-stone-500 hover:text-academic-accent transition-colors">
                  <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                  <h2 className="font-serif font-bold text-lg text-academic-text">{region}</h2>
                  <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest">{disciplineContext}</span>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={handleDownload} className="p-2 rounded-full text-stone-400 hover:text-academic-accent hover:bg-stone-100 transition-all" title="Download Report">
                  <Download className="w-5 h-5" />
              </button>
              {data.imageUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 shadow-sm flex-shrink-0">
                      <ImageWithFallback src={data.imageUrl} alt={region} className="w-full h-full object-cover" />
                  </div>
              )}
          </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-12 pb-24">
          
          {/* SUMMARY */}
          <section className="animate-in fade-in duration-700 delay-100">
              <div className="flex items-center gap-3 mb-4 text-academic-muted">
                  <Globe className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Regional Overview</h3>
              </div>
              <p className="font-serif text-lg leading-relaxed text-justify text-academic-text">
                  {data.summary}
              </p>
          </section>

          {/* KEY COUNTRIES */}
          <section className="animate-in fade-in duration-700 delay-200">
             <div className="flex items-center gap-3 mb-6 text-academic-muted">
                  <Flag className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Focal Points</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                  {data.keyCountries.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => onNavigate('Country', c)}
                        className="px-4 py-2 bg-white border border-stone-200 shadow-sm rounded-sm font-serif font-bold text-stone-700 hover:bg-academic-accent hover:text-white transition-colors"
                      >
                          {c}
                      </button>
                  ))}
              </div>
          </section>

          {/* THEMES */}
          <section className="animate-in fade-in duration-700 delay-300">
              <div className="flex items-center gap-3 mb-6 text-academic-muted">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Dominant Themes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.politicalThemes.map((theme, i) => (
                      <div key={i} onClick={() => onNavigate('Concept', theme)} className="cursor-pointer hover:bg-stone-100 transition-colors p-4 bg-academic-paper border-l-4 border-academic-accent">
                          <span className="font-serif text-sm font-medium">{theme}</span>
                      </div>
                  ))}
              </div>
          </section>

           {/* CHALLENGES */}
           <section className="animate-in fade-in duration-700 delay-400">
              <div className="flex items-center gap-3 mb-6 text-academic-muted">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Core Challenges</h3>
              </div>
              <ul className="space-y-3">
                  {data.challenges.map((chal, i) => (
                      <li key={i} onClick={() => onNavigate('Concept', chal)} className="cursor-pointer hover:text-academic-accent transition-colors flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                          <span className="font-serif text-stone-600">{chal}</span>
                      </li>
                  ))}
              </ul>
          </section>
          
          <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-academic-gold" /> External Repositories & Data
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                      <WikipediaWidget title={region} description={disciplineContext || "politics geography"} />
                      <ReliefWebWidget queryText={region} />
                      <LibraryOfCongressWidget queryText={region} />
                  </div>
                  <div className="space-y-6">
                      <OpenAlexWidget queryText={region} />
                      <InternetArchiveWidget queryText={region} />
                      <CrossrefWidget queryText={region} />
                  </div>
                  <div className="space-y-6">
                      <GDELTWidget queryText={region} />
                      <RedditWidget queryText={region} />
                      <DOAJWidget queryText={region} />
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default RegionalDetailScreen;
