import React, { useState, useEffect } from 'react';
import { Cloud, Thermometer, Wind, Droplets } from 'lucide-react';

interface OpenMeteoWidgetProps {
    locationName: string;
}

export const OpenMeteoWidget: React.FC<OpenMeteoWidgetProps> = ({ locationName }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeteo = async () => {
            try {
                // 1. Geocode
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`;
                const geoRes = await fetch(geoUrl);
                const geoData = await geoRes.json();
                
                if (geoData.results && geoData.results.length > 0) {
                    const loc = geoData.results[0];
                    // 2. Weather
                    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
                    const wRes = await fetch(wUrl);
                    const wData = await wRes.json();

                    if (wData.current) {
                        setData({ loc, current: wData.current });
                    }
                }
            } catch (e) {
                console.warn("Open-Meteo API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMeteo();
    }, [locationName]);

    if (loading || !data) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-8">
             <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-academic-accent" /> Environmental Conditions
            </h3>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Location resolved: {data.loc.name}, {data.loc.country}</p>
            
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-3 rounded-xl flex-1">
                    <Thermometer className="w-6 h-6 text-orange-500" />
                    <div>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Temperature</div>
                        <div className="font-mono text-lg text-stone-800 dark:text-stone-200">{data.current.temperature_2m}°C</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-3 rounded-xl flex-1">
                    <Droplets className="w-6 h-6 text-blue-500" />
                    <div>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Humidity</div>
                        <div className="font-mono text-lg text-stone-800 dark:text-stone-200">{data.current.relative_humidity_2m}%</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-3 rounded-xl flex-1">
                    <Wind className="w-6 h-6 text-stone-400" />
                    <div>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Wind Speed</div>
                        <div className="font-mono text-lg text-stone-800 dark:text-stone-200">{data.current.wind_speed_10m} km/h</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
