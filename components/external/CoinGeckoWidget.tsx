import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

export const CoinGeckoWidget: React.FC = () => {
    const [cryptoData, setCryptoData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get top 6 cryptos
                const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setCryptoData(data);
                    }
                }
            } catch (e) {
                console.warn("CoinGecko API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || cryptoData.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> Digital Assets Market
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cryptoData.map((coin, idx) => {
                     const isPositive = coin.price_change_percentage_24h >= 0;
                     return (
                         <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-xl flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                              <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 truncate">{coin.name}</h4>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{coin.symbol}</span>
                                   </div>
                                   <p className="font-mono font-bold text-stone-800 dark:text-stone-300">
                                       ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                   </p>
                              </div>
                              <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                   {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                   {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                              </div>
                         </div>
                     );
                })}
            </div>
        </div>
    );
};
