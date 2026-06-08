
import React from 'react';
import { Cpu, Wifi, Shield, Rocket } from 'lucide-react';
import { DetailCard } from '../shared/DetailCard';

export const TechProfile: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return null;
    return (
        <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-500" /> Digital & Tech Landscape</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard label="Internet Access" value={data.internetPenetration || "N/A"} icon={Wifi} subValue="Population Penetration" />
                <DetailCard label="Cyber Capabilities" value={data.cyberRank || "N/A"} icon={Shield} subValue="Global Ranking" />
            </div>

            <div className="bg-stone-900 text-white p-6 rounded-xl border border-stone-800">
                 <div className="flex items-center gap-3 mb-4">
                     <Rocket className="w-5 h-5 text-academic-gold" />
                     <h5 className="font-bold uppercase tracking-wide text-sm">Space & Innovation</h5>
                 </div>
                 <p className="text-sm font-serif leading-relaxed text-justify opacity-80 mb-6">{data.spaceProgram}</p>
                 
                 <div>
                     <h6 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Major Tech Sectors</h6>
                     <div className="flex flex-wrap gap-2">
                         {(data.majorSectors || []).map((sec: string, i: number) => (
                             <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{sec}</span>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    );
};
