import React, { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface ReliefWebWidgetProps {
    queryText: string;
}

export const ReliefWebWidget: React.FC<ReliefWebWidgetProps> = ({ queryText }) => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://api.reliefweb.int/v1/reports?appname=apidoc&query[value]=${encodeURIComponent(queryText)}&limit=5&sort[]=date:desc`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.data) {
                        setReports(data.data);
                    }
                }
            } catch (e) {
                console.warn("ReliefWeb API failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryText]);

    if (loading || reports.length === 0) return null;

    return (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-500 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Humanitarian Reports
            </h3>
            <div className="space-y-3">
                {reports.map((report, idx) => (
                    <a 
                        key={idx}
                        href={report.fields?.url || `https://reliefweb.int/node/${report.id}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="block p-3 rounded-lg bg-white dark:bg-stone-900 border border-red-100 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                    >
                        <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">{report.fields?.title || report.title || 'Report'}</h4>
                    </a>
                ))}
            </div>
        </div>
    );
};
