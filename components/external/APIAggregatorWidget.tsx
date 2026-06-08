import React, { useState, useEffect } from 'react';
import { Database, Server, Cpu, Globe, Network, Activity } from 'lucide-react';

export const APIAggregatorWidget: React.FC<{ query?: string }> = ({ query = "general" }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAggregatedData = async () => {
            try {
                const res = await fetch(`/api/open-data?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (e) {
                console.error("Failed to fetch full-stack aggregated API response", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAggregatedData();
    }, [query]);

    if (loading) return <div className="p-4 border animate-pulse bg-stone-100 dark:bg-stone-800 rounded-2xl h-24"></div>;
    if (!data) return null;

    return (
        <div className="bg-gradient-to-br from-stone-900 to-black border border-stone-800 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Network className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <Server className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="font-serif text-2xl font-bold">Full-Stack Data Aggregator</h2>
                        <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Backend Proxy • 1000+ Global Data Sources Accessible
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Academic */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> Crossref Research
                        </h3>
                        <div className="space-y-2">
                            {data.academicResearch?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title?.[0]}</p>
                            ))}
                        </div>
                    </div>

                    {/* Campaign Finance */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-[#4198c0] mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> OpenFEC Finance
                        </h3>
                        <div className="space-y-2">
                            {data.fecData?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.name}</p>
                            ))}
                        </div>
                    </div>

                    {/* ReliefWeb */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> ReliefWeb Reports
                        </h3>
                        <div className="space-y-2">
                            {data.reliefWebReports?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.fields?.title}</p>
                            ))}
                        </div>
                    </div>
                    
                    {/* UK Parliament */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> UK Parliament
                        </h3>
                        <div className="space-y-2">
                            {data.ukParliament?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.value?.nameDisplayAs}</p>
                            ))}
                        </div>
                    </div>

                    {/* US Spending */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> US Spending (Top Agencies)
                        </h3>
                        <div className="space-y-2 flex flex-wrap gap-2">
                             {data.usaSpending?.slice(0, 4).map((item: any, i: number) => (
                                <span key={i} className="px-2 py-1 bg-stone-900 rounded text-[10px] text-stone-300">
                                     {item.agency_name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* OpenAlex */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-violet-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> OpenAlex Research
                        </h3>
                        <div className="space-y-2">
                             {data.openAlex?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title}</p>
                            ))}
                        </div>
                    </div>

                    {/* Spaceflight News */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-orange-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> Spaceflight News
                        </h3>
                        <div className="space-y-2">
                             {data.spaceflight?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title}</p>
                            ))}
                        </div>
                    </div>

                    {/* Library of Congress */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> Library of Congress
                        </h3>
                        <div className="space-y-2">
                             {data.loc?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title}</p>
                            ))}
                        </div>
                    </div>

                    {/* Art Institute */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-pink-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> Art Institute Chicago
                        </h3>
                        <div className="space-y-2">
                             {data.artInstitute?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title}</p>
                            ))}
                        </div>
                    </div>

                    {/* Open Meteo */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-sky-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> Weather (Berlin)
                        </h3>
                        <div className="space-y-2">
                             {data.openMeteo?.map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">Temp: {item.temperature}°C, Wind: {item.windspeed}km/h</p>
                            ))}
                        </div>
                    </div>

                    {/* FBI Wanted */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> FBI Wanted List
                        </h3>
                        <div className="space-y-2">
                             {data.fbiWanted?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title}</p>
                            ))}
                        </div>
                    </div>

                    {/* TVMaze */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-yellow-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> TV Maze
                        </h3>
                        <div className="space-y-2">
                             {data.tvMaze?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.show?.name}</p>
                            ))}
                        </div>
                    </div>

                    {/* OpenLibrary */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md">
                        <h3 className="text-xs uppercase tracking-widest text-fuchsia-400 mb-3 flex items-center gap-2">
                            <Database className="w-3 h-3" /> OpenLibrary
                        </h3>
                        <div className="space-y-2">
                             {data.openLibrary?.slice(0, 3).map((item: any, i: number) => (
                                <p key={i} className="text-sm font-serif line-clamp-1">{item.title}</p>
                            ))}
                        </div>
                    </div>

                    {/* Server Stats */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-md flex flex-col justify-center items-center text-center">
                         <Globe className="w-8 h-8 text-indigo-400 mb-2" />
                         <span className="text-lg font-bold text-white">Express Backend</span>
                         <span className="text-[10px] text-stone-400">Successfully proxied multiple external data sources</span>
                    </div>

                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-stone-800 pt-4">
                 <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                      Routing through <span className="text-emerald-500 font-bold">Node.js Express Server</span> internally
                 </p>
                 <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">DB</div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">DS</div>
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">BE</div>
                 </div>
            </div>
        </div>
    );
};
