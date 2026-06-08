
import React, { useEffect, useState } from 'react';
import { HighlightedEntity, HighlightDetail } from '../types';
import { fetchHighlightDetail } from '../services/homeService';
import { ArrowLeft, BookOpen, Link as LinkIcon, Share2, Bookmark, Check, Download } from 'lucide-react';
import { generateAestheticPDF } from '../utils/pdfGenerator';
import { playSFX } from '../services/soundService';

interface HighlightDetailScreenProps {
  highlight: HighlightedEntity;
  onBack: () => void;
  dateString: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const HighlightDetailScreen: React.FC<HighlightDetailScreenProps> = ({ highlight, onBack, dateString, isSaved, onToggleSave }) => {
  const [detail, setDetail] = useState<HighlightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  useEffect(() => {
    let mounted = true;
    const loadDetail = async () => {
      setLoading(true);
      const data = await fetchHighlightDetail(highlight);
      if (mounted) {
        setDetail(data);
        setLoading(false);
      }
    };
    loadDetail();
    return () => { mounted = false; };
  }, [highlight]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2500);
  };

  const handleDownload = () => {
    playSFX('click');
    if (!detail) return;
    try {
        const sections = [];
        if (detail.content) {
            sections.push({ title: "Content", content: detail.content });
        }
        if (detail.analysis) {
            sections.push({ title: "Analysis", content: detail.analysis });
        }
        if (detail.keyTakeaways && detail.keyTakeaways.length > 0) {
            sections.push({ title: "Key Takeaways", content: detail.keyTakeaways });
        }
        generateAestheticPDF(
            highlight.title,
            highlight.subtitle,
            "",
            sections,
            `${highlight.title.replace(/\s+/g, '_')}_Highlight.pdf`
        );
    } catch (err) {
        console.error("PDF generation failed:", err);
    }
  };

  const handleShare = async () => {
    const textToShare = `POLI Highlight: ${highlight.title} — ${highlight.subtitle}`;
    const urlToShare = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'POLI',
          text: textToShare,
          url: urlToShare,
        });
      } catch (error) {
        console.debug('Share dismissed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${textToShare}\n${urlToShare}`);
        showToast("Copied to Clipboard");
      } catch (error) {
        showToast("Unable to Share");
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-academic-bg flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* TOAST NOTIFICATION */}
      <div 
        className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3 bg-academic-accent text-white rounded-full shadow-xl transition-all duration-500 ease-out pointer-events-none
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="bg-white/20 rounded-full p-1">
            <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      {/* HEADER */}
      <div className="flex-none h-16 border-b border-academic-line flex items-center justify-between px-4 bg-academic-paper/95 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-academic-accent transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
        <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest">
          {dateString}
        </span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-12 pb-24">
          
          {/* TITLE BLOCK */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3">
                 <span className="px-2 py-1 bg-academic-gold text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">
                   {highlight.category}
                 </span>
                 <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                   {highlight.meta}
                 </span>
             </div>
             <h1 className="text-4xl font-serif font-bold text-academic-text leading-tight">
               {highlight.title}
             </h1>
             <p className="text-lg font-serif text-stone-500 italic">
               {highlight.subtitle}
             </p>
          </div>

          {loading ? (
             /* LOADING SKELETON */
             <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-stone-200 rounded w-full"></div>
                <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                <div className="h-4 bg-stone-200 rounded w-4/6"></div>
                <div className="pt-8 grid grid-cols-2 gap-4">
                    <div className="h-24 bg-stone-100 rounded"></div>
                    <div className="h-24 bg-stone-100 rounded"></div>
                </div>
             </div>
          ) : detail ? (
             /* CONTENT */
             <div className="animate-in fade-in duration-700 space-y-12">
                
                {/* SUMMARY */}
                <section>
                   <h3 className="text-xs font-bold text-academic-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Summary
                   </h3>
                   <p className="font-serif text-academic-text leading-loose text-justify text-base md:text-lg">
                      {detail.summary}
                   </p>
                </section>

                {/* HISTORICAL BACKGROUND */}
                <section className="pl-6 border-l-2 border-stone-200">
                    <h3 className="text-[10px] font-bold text-academic-muted uppercase tracking-widest mb-3">
                      Historical Background
                    </h3>
                    <p className="font-serif text-stone-600 leading-relaxed text-justify text-sm">
                       {detail.historicalBackground}
                    </p>
                </section>

                {/* KEY CONCEPTS - GRID */}
                <section>
                   <h3 className="text-[10px] font-bold text-academic-muted uppercase tracking-widest mb-4">
                     Key Concepts
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail.keyConcepts?.map((concept, i) => {
                          if (!concept) return null;
                          return (
                              <div key={i} className="p-4 bg-academic-paper border border-academic-line">
                                  <h4 className="font-bold text-academic-text text-sm mb-2">{concept.concept}</h4>
                                  <p className="text-xs text-stone-500 leading-relaxed text-justify">{concept.definition}</p>
                              </div>
                          );
                      })}
                   </div>
                </section>

                {/* SIGNIFICANCE */}
                <section className="bg-stone-50 p-6 border border-stone-100">
                   <h3 className="text-[10px] font-bold text-academic-gold uppercase tracking-widest mb-3">
                      Why It Matters Today
                   </h3>
                   <p className="font-serif text-academic-text leading-relaxed text-justify text-sm">
                       {detail.significance}
                   </p>
                </section>

                {/* MODERN CONNECTIONS */}
                {detail.modernConnections && detail.modernConnections.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-bold text-academic-muted uppercase tracking-widest mb-4">
                      Modern Connections
                    </h3>
                    <ul className="space-y-2">
                        {detail.modernConnections.map((conn, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-academic-accent rounded-full"></div>
                                <span className="text-sm font-serif text-stone-600">{conn}</span>
                            </li>
                        ))}
                    </ul>
                  </section>
                )}

                {/* SOURCES */}
                {detail.sources && detail.sources.length > 0 && (
                   <section className="pt-8 border-t border-academic-line">
                      <h3 className="text-[10px] font-bold text-academic-muted uppercase tracking-widest mb-4">
                        Primary & Secondary Sources
                      </h3>
                      <div className="flex flex-wrap gap-2">
                          {detail.sources.map((source, i) => (
                              <a 
                                key={i}
                                href={(source.url && source.url.startsWith('http')) ? source.url : `https://www.google.com/search?q=${encodeURIComponent(source.title)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-academic-accent hover:border-academic-accent transition-colors rounded-sm"
                              >
                                  <LinkIcon className="w-3 h-3" />
                                  {source.title}
                              </a>
                          ))}
                      </div>
                   </section>
                )}

             </div>
          ) : (
             <div className="text-center py-12">
               <p className="text-stone-400 font-serif italic">Unable to load details.</p>
             </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex-none h-16 border-t border-academic-line bg-academic-paper flex items-center justify-between px-6 z-10">
         <button 
           onClick={onToggleSave}
           className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300
           ${isSaved ? 'text-academic-gold' : 'text-stone-400 hover:text-academic-accent'}`}
         >
             <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-academic-gold' : ''}`} />
             {isSaved ? 'Saved' : 'Save Highlight'}
         </button>
         <div className="flex items-center gap-4">
           <button 
             onClick={handleDownload}
             className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-academic-accent transition-colors"
           >
               <Download className="w-4 h-4" /> Download
           </button>
           <button 
             onClick={handleShare}
             className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-academic-accent transition-colors"
           >
               <Share2 className="w-4 h-4" /> Share
           </button>
         </div>
      </div>
    </div>
  );
};

export default HighlightDetailScreen;
