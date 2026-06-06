import { ImageWithFallback } from '../atoms/ImageWithFallback';

import React, { useState } from 'react';
import { MEDIA_DATA } from '../../data/homeData';
import { PlayCircle, Video, Mic, Film, X } from 'lucide-react';

const MediaTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'Videos' | 'Lectures' | 'Documentaries' | 'Interviews'>('Videos');
  const [playingVideo, setPlayingVideo] = useState<{id: string, title: string} | null>(null);

  const getFilteredData = () => {
      const typeMap: Record<string, string> = {
          'Videos': 'Video',
          'Lectures': 'Lecture',
          'Documentaries': 'Documentary',
          'Interviews': 'Interview'
      };
      const targetType = typeMap[subTab];
      return MEDIA_DATA.filter(item => item.type === targetType);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-6 px-6 border-b border-academic-line dark:border-stone-800 mb-6 no-scrollbar">
         {['Videos', 'Lectures', 'Documentaries', 'Interviews'].map((tab) => (
            <button 
                key={tab}
                onClick={() => setSubTab(tab as any)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors rounded-full border
                ${subTab === tab ? 'bg-academic-accent text-white border-academic-accent' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border-transparent'}`}
            >
                {tab}
            </button>
         ))}
      </div>

      <div className="space-y-4">
          {getFilteredData().length === 0 && (
             <div className="text-center py-12 text-stone-400 italic font-serif">
                 No {subTab.toLowerCase()} available at the moment.
             </div>
          )}

          {getFilteredData().map((item, i) => (
              <div 
                key={i} 
                onClick={() => setPlayingVideo({ id: (item as any).videoId, title: item.title })}
                className="flex gap-4 p-4 border border-academic-line dark:border-stone-800 bg-academic-paper dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer group active:scale-[0.99] transition-transform rounded-xl shadow-sm"
              >
                  <div className="w-32 h-20 bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-academic-accent transition-colors relative overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
                      {/* Thumbnail Placeholder using YouTube's high quality thumb */}
                      <ImageWithFallback 
                        src={`https://img.youtube.com/vi/${(item as any).videoId}/mqdefault.jpg`} 
                        alt="Thumbnail" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => (e.currentTarget.style.display = 'none')} 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        <PlayCircle className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                      <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-academic-gold uppercase tracking-widest mb-1">{item.type}</span>
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">{item.duration}</span>
                      </div>
                      <h3 className="font-serif text-sm font-bold text-academic-text dark:text-stone-100 mb-1 leading-tight group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{item.title}</h3>
                  </div>
              </div>
          ))}
      </div>

      {/* Video Player Overlay */}
      {playingVideo && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center animate-in fade-in duration-300 p-4 backdrop-blur-sm">
              <button 
                  onClick={() => setPlayingVideo(null)}
                  className="absolute top-6 right-6 p-3 bg-stone-800/80 text-white rounded-full hover:bg-stone-700 transition-colors border border-white/10 z-50"
              >
                  <X className="w-6 h-6" />
              </button>
              
              <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-white/10">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`} 
                    title={playingVideo.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
              </div>
              
              <h3 className="mt-8 text-white font-serif text-xl font-bold text-center px-4 max-w-2xl">{playingVideo.title}</h3>
          </div>
      )}
    </div>
  );
};

export default MediaTab;
