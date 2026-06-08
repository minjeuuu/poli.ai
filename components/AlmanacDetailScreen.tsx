
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Globe, BookOpen, Layers, Download } from 'lucide-react';
import { fetchPoliticalRecord } from '../services/searchService';
import LoadingScreen from './LoadingScreen';
import Timeline from './Timeline';
import { WikipediaWidget } from './external/WikipediaWidget';
import { GDELTWidget } from './external/GDELTWidget';
import { RedditWidget } from './external/RedditWidget';
import { OpenAlexWidget } from './external/OpenAlexWidget';
import { InternetArchiveWidget } from './external/InternetArchiveWidget';
import { LibraryOfCongressWidget } from './external/LibraryOfCongressWidget';
import { CrossrefWidget } from './external/CrossrefWidget';
import { DOAJWidget } from './external/DOAJWidget';

import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface AlmanacDetailScreenProps {
  mode: 'Year' | 'Era' | 'Date';
  title: string;
  onClose: () => void;
}

const AlmanacDetailScreen: React.FC<AlmanacDetailScreenProps> = ({ mode, title, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      // Reusing the generic record fetcher which handles historical contexts well
      const result = await fetchPoliticalRecord(title);
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [title]);

  const handleDownload = () => {
      playSFX('click');
      if (!data) return;
      try {
          const sections = [];
          if (data.historicalContext || (data.entity && data.entity.description)) {
              sections.push({ title: "Historical Context", content: data.historicalContext || data.entity.description });
          }
          if (data.timeline && data.timeline.length > 0) {
              const events = data.timeline.map((e: any) => `${e.date || ''}: ${e.event || ''}`);
              sections.push({ title: "Timeline", content: events });
          }

          generateAestheticPDF(
              title,
              `${mode} Record Almanac`,
              "",
              sections,
              `${title.replace(/\s+/g, '_')}_Almanac.pdf`
          );
      } catch (err) {
          console.error("PDF generation failed:", err);
      }
  };

  if (loading) return (
      <div className="fixed inset-0 z-[80] bg-academic-bg dark:bg-stone-950">
          <LoadingScreen message={`Retrieving Archives for ${title}...`} />
      </div>
  );

  return (
    <div className="fixed inset-0 z-[80] bg-academic-bg dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* HEADER */}
        <div className="flex-none h-16 border-b border-academic-line dark:border-stone-800 bg-academic-paper dark:bg-stone-900 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-500">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-academic-gold">{mode} Record</span>
                    <h1 className="text-xl font-serif font-bold text-academic-text dark:text-stone-100">{title}</h1>
                </div>
            </div>
            {data && (
                <button onClick={handleDownload} className="p-2 rounded-full text-stone-400 hover:text-academic-accent hover:bg-stone-100 dark:hover:bg-stone-800 transition-all" title="Download Report">
                    <Download className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-32">
            {data ? (
                <div className="space-y-12">
                    <section>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Historical Context</h3>
                         <div className="prose prose-stone dark:prose-invert font-serif leading-loose text-justify">
                             <p>{data.historicalContext || data.entity?.description}</p>
                         </div>
                    </section>
                    
                    {data.timeline && (
                        <Timeline events={data.timeline} />
                    )}

                    <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                        <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-academic-gold" /> External Repositories & Data
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <WikipediaWidget title={title} description="historical record" />
                                <LibraryOfCongressWidget queryText={title} />
                            </div>
                            <div className="space-y-6">
                                <OpenAlexWidget queryText={title} />
                                <InternetArchiveWidget queryText={title} />
                                <CrossrefWidget queryText={title} />
                            </div>
                            <div className="space-y-6">
                                <GDELTWidget queryText={title} />
                                <RedditWidget queryText={title} />
                                <DOAJWidget queryText={title} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-stone-400">Record not found.</div>
            )}
        </div>
    </div>
  );
};

export default AlmanacDetailScreen;
