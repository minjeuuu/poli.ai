
import React from 'react';
import { Award, Download, X } from 'lucide-react';
import { Certificate } from '../../services/learn/certificationService';
import Logo from '../Logo';

interface CertificateViewProps {
    cert: Certificate;
    onClose: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ cert, onClose }) => {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-500">
            <div className="bg-[#fdfbf7] text-stone-900 w-full max-w-3xl aspect-[1.414/1] p-8 md:p-12 relative rounded shadow-2xl border-8 border-double border-academic-gold overflow-hidden">
                
                {/* Close Button (Screen Only) */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 print:hidden">
                    <X className="w-6 h-6" />
                </button>

                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Logo size="2xl" />
                </div>

                <div className="h-full border-2 border-stone-800 p-8 flex flex-col items-center justify-between text-center relative z-10">
                    <div>
                        <div className="flex justify-center mb-6 text-academic-accent">
                            <Logo size="lg" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-widest mb-2 text-academic-accent">Certificate</h1>
                        <h2 className="text-sm md:text-base font-mono uppercase tracking-[0.4em] text-academic-gold">of Mastery</h2>
                    </div>

                    <div className="space-y-6 max-w-xl">
                        <p className="text-stone-500 font-serif italic text-lg">This document certifies that</p>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 border-b-2 border-stone-300 pb-2">{cert.recipient}</h3>
                        <p className="text-stone-500 font-serif italic text-lg">has successfully completed the module</p>
                        <h4 className="text-2xl font-serif font-bold text-academic-accent">{cert.course}</h4>
                        <p className="text-sm font-serif text-stone-600 leading-relaxed text-justify mt-4">{cert.description}</p>
                    </div>

                    <div className="w-full flex justify-between items-end mt-8">
                        <div className="text-center">
                            <div className="text-lg font-bold font-serif border-t border-stone-400 pt-2 px-8">{cert.date}</div>
                            <div className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Date Awarded</div>
                        </div>
                        <div className="mb-2">
                             <Award className="w-16 h-16 text-academic-gold" />
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold font-serif italic border-t border-stone-400 pt-2 px-8">{cert.signature}</div>
                            <div className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Authorized Signature</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 bg-white text-stone-900 rounded-full font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2 print:hidden" onClick={() => window.print()}>
                <Download className="w-4 h-4" /> Download / Print
            </button>
        </div>
    );
};
