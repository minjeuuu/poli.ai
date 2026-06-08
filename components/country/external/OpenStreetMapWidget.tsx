import React from 'react';
import { MapPin } from 'lucide-react';

interface OpenStreetMapWidgetProps {
    countryName: string;
}

export const OpenStreetMapWidget: React.FC<OpenStreetMapWidgetProps> = ({ countryName }) => {
    // We use an iframe to OSM. We need bounding box or q. Using q for search.
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&q=${encodeURIComponent(countryName)}`;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-academic-accent" /> Geographic Embed
            </h3>
            <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-inner border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={mapUrl}
                    style={{ border: 0 }}
                    title={`Map of ${countryName}`}
                ></iframe>
            </div>
            <div className="mt-2 text-right">
                <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(countryName)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-academic-accent hover:underline uppercase tracking-widest flex items-center justify-end gap-1">
                    View Larger Map <MapPin className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
};
