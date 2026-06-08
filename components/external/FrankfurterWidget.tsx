import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowRightLeft } from 'lucide-react';

interface FrankfurterWidgetProps {
    baseCurrency?: string; // e.g., 'USD'
}

export const FrankfurterWidget: React.FC<FrankfurterWidgetProps> = ({ baseCurrency = 'USD' }) => {
    const [rates, setRates] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.rates) {
                        setRates({
                            date: data.date,
                            base: data.base,
                            // Pick top currencies
                            list: {
                                EUR: data.rates.EUR,
                                GBP: data.rates.GBP,
                                JPY: data.rates.JPY,
                                CAD: data.rates.CAD,
                                AUD: data.rates.AUD,
                                CHF: data.rates.CHF
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn("Frankfurter API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [baseCurrency]);

    if (loading || !rates) return null;

    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" /> Forex Markets
                </h3>
                <span className="text-[10px] font-mono text-stone-400">Base: 1 {rates.base} • Updated: {rates.date}</span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {Object.entries(rates.list).map(([currency, rate]) => (
                    rate !== undefined ? (
                        <div key={currency} className="p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1">
                                {currency} <ArrowRightLeft className="w-2 h-2" />
                            </span>
                            <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{Number(rate).toFixed(3)}</span>
                        </div>
                    ) : null
                ))}
            </div>
        </div>
    );
};
