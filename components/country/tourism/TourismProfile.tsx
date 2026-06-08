
import React from 'react';
import { Camera, MapPin, Plane } from 'lucide-react';

export const TourismProfile: React.FC<{ data: any, onNavigate?: (type: string, payload: any) => void }> = ({ data, onNavigate }) => {
    if (!data) return null;
    return (
        <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Plane className="w-4 h-4 text-sky-500" /> Visitor Economy</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.attractions || []).map((site: any, i: number) => (
                    <div key={i} onClick={() => onNavigate && onNavigate('Concept', site.name)} className="cursor-pointer hover:scale-[1.02] transition-transform relative aspect-video rounded-xl overflow-hidden group hover:shadow-md border border-transparent hover:border-academic-gold">
                        <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-stone-400 group-hover:text-academic-gold transition-colors" />
                        </div>
                        {/* If we had images for these specific sites, they'd go here. Using placeholder style. */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <h5 className="text-white font-bold font-serif group-hover:text-academic-gold transition-colors">{site.name}</h5>
                            <span className="text-white/70 text-[10px] uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> {site.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl flex items-start gap-4">
                <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                    <Plane className="w-6 h-6 text-stone-400" />
                </div>
                <div>
                    <h5 className="font-bold text-stone-800 dark:text-stone-200 text-sm mb-1">Visa Policy Overview</h5>
                    <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed text-justify">{data.visaPolicy}</p>
                </div>
            </div>
        </div>
    );
};
