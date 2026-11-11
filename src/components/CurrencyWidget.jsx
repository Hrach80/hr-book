import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export default function CurrencyWidget() {
    const { t } = useLanguage();

    // Արժույթները՝ իրենց խորհրդանշող գույներով և դինամիկ կետերով
    const [currencies, setCurrencies] = useState([
        {
            code: 'USD/AMD',
            name: 'US Dollar (Market)',
            rate: '402.50',
            change: '+0.30%',
            isUp: true,
            color: '#10b981', // Կանաչ (Դոլարային)
            data: [{ v: 400 }, { v: 401.5 }, { v: 400.8 }, { v: 402.2 }, { v: 401.3 }, { v: 402.5 }]
        },
        {
            code: 'EUR/AMD',
            name: 'Euro (Market)',
            rate: '429.20',
            change: '-0.15%',
            isUp: false,
            color: '#3b82f6', // Եվրոյի Կապույտ
            data: [{ v: 431.5 }, { v: 430 }, { v: 430.8 }, { v: 429.5 }, { v: 429.8 }, { v: 429.2 }]
        },
        {
            code: 'RUB/AMD',
            name: 'Russian Ruble',
            rate: '4.18',
            change: '+0.80%',
            isUp: true,
            color: '#f59e0b', // Ոսկեգույն / Ռուսական տաք երանգ
            data: [{ v: 4.10 }, { v: 4.15 }, { v: 4.12 }, { v: 4.17 }, { v: 4.14 }, { v: 4.18 }]
        },
        {
            code: 'GEL/AMD',
            name: 'Georgian Lari',
            rate: '148.80',
            change: '+0.20%',
            isUp: true,
            color: '#ec4899', // Վրացական վառ շեշտադրում (Մանուշակագույն/Վարդագույն)
            data: [{ v: 147.9 }, { v: 148.4 }, { v: 148.1 }, { v: 148.6 }, { v: 148.3 }, { v: 148.8 }]
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('Հայկական շուկա');

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();

            if (data && data.rates && data.rates.AMD) {
                const baseAmd = data.rates.AMD;
                const marketUsd = Number((baseAmd * 1.004).toFixed(2));
                const marketEur = Number((baseAmd / (data.rates.EUR || 0.92) * 1.005).toFixed(2));
                const marketRub = Number((baseAmd / (data.rates.RUB || 90) * 1.01).toFixed(2));
                const marketGel = Number((baseAmd / (data.rates.GEL || 2.7) * 1.008).toFixed(2));

                setCurrencies(prev => [
                    { ...prev[0], rate: marketUsd.toString(), data: [{ v: marketUsd - 1.2 }, { v: marketUsd - 0.2 }, { v: marketUsd - 0.8 }, { v: marketUsd }] },
                    { ...prev[1], rate: marketEur.toString(), data: [{ v: marketEur - 1.5 }, { v: marketEur - 0.5 }, { v: marketEur - 1.0 }, { v: marketEur }] },
                    { ...prev[2], rate: marketRub.toString(), data: [{ v: marketRub + 0.05 }, { v: marketRub + 0.01 }, { v: marketRub + 0.03 }, { v: marketRub }] },
                    { ...prev[3], rate: marketGel.toString(), data: [{ v: marketGel - 0.6 }, { v: marketGel - 0.2 }, { v: marketGel - 0.4 }, { v: marketGel }] },
                ]);
                setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
        } catch (error) {
            console.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleRefresh();
    }, []);

    return (
        <div className="glass-card p-6 rounded-3xl mb-6 relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

            {/* Հետին ֆոնի նեոնային լույսեր */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

            {/* Վերնագիր */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <DollarSign size={16} className="drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                        {t('liveRates') || 'Armenian Market Rates'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {lastUpdated}
                    </span>
                    <button
                        onClick={handleRefresh}
                        title="Թարմացնել"
                        className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-emerald-500/40 transition"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {currencies.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] group"
                    >
                        {/* Արժույթի անվանում */}
                        <div className="flex flex-col w-28">
                            <span className="font-bold text-sm text-white tracking-wide transition-colors">
                                {item.code}
                            </span>
                            <span className="text-[11px] text-gray-400 truncate">{item.name}</span>
                        </div>

                        {/* Recharts գրաֆիկ՝ յուրաքանչյուր արժույթի խորհրդանշական գույնով */}
                        <div className="hidden sm:block w-32 h-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={item.data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                                    <defs>
                                        <linearGradient id={`curr-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={item.color} stopOpacity={0.5} />
                                            <stop offset="95%" stopColor={item.color} stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="natural"
                                        dataKey="v"
                                        stroke={item.color}
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill={`url(#curr-grad-${index})`}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Արժեքը և ազգային արժույթի գույնով ոճավորված փոփոխության բլոկը */}
                        <div className="flex items-center gap-3 text-right">
                            <span className="font-semibold text-sm text-white tracking-wider">
                                {item.rate} <span className="text-xs text-gray-400 font-normal">֏</span>
                            </span>

                            <div
                                className="flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded-lg border shadow-sm"
                                style={{
                                    color: item.color,
                                    backgroundColor: `${item.color}15`,
                                    borderColor: `${item.color}40`,
                                    boxShadow: `0 0 10px ${item.color}25`
                                }}
                            >
                                {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{item.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}