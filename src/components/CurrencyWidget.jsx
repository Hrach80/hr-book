import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, X } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export default function CurrencyWidget() {
    const { t } = useLanguage();

    const [currencies, setCurrencies] = useState([
        {
            code: 'USD/AMD',
            name: 'US Dollar (Market)',
            rate: '402.50',
            change: '+0.30%',
            isUp: true,
            color: '#10b981',
            data: [{ v: 400 }, { v: 401.5 }, { v: 400.8 }, { v: 402.2 }, { v: 401.3 }, { v: 402.5 }]
        },
        {
            code: 'EUR/AMD',
            name: 'Euro (Market)',
            rate: '429.20',
            change: '-0.15%',
            isUp: false,
            color: '#3b82f6',
            data: [{ v: 431.5 }, { v: 430 }, { v: 430.8 }, { v: 429.5 }, { v: 429.8 }, { v: 429.2 }]
        },
        {
            code: 'RUB/AMD',
            name: 'Russian Ruble',
            rate: '4.18',
            change: '+0.80%',
            isUp: true,
            color: '#f59e0b',
            data: [{ v: 4.10 }, { v: 4.15 }, { v: 4.12 }, { v: 4.17 }, { v: 4.14 }, { v: 4.18 }]
        },
        {
            code: 'GEL/AMD',
            name: 'Georgian Lari',
            rate: '148.80',
            change: '+0.20%',
            isUp: true,
            color: '#ec4899',
            data: [{ v: 147.9 }, { v: 148.4 }, { v: 148.1 }, { v: 148.6 }, { v: 148.3 }, { v: 148.8 }]
        },
    ]);

    const [isOpen, setIsOpen] = useState(false);

    const fetchRates = async () => {
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
            }
        } catch (error) {
            console.error('Network error');
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    return (
        <>
            {/* Ֆիքսված դիրք ժամացույցի իկոնայի տակ՝ նավիգացիայից ներքև (top-32) */}
            {!isOpen && (
                <div className="fixed left-4 top-32 z-40">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 text-emerald-400 hover:bg-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] group flex items-center justify-center cursor-pointer"
                        title="Բացել փոխարժեքները"
                    >
                        <DollarSign size={18} className="text-emerald-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    </button>
                </div>
            )}

            {/* Բացվող պատուհանը (Modal) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-sm sm:max-w-md glass-card p-4 sm:p-5 rounded-3xl bg-[#0b0f19]/95 border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">

                        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-3.5 relative z-10 border-b border-white/10 pb-2">
                            <div className="w-6"></div>

                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <DollarSign size={14} className="drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                </div>
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                    {t('liveRates') || 'Armenian Market Rates'}
                                </span>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                                title="Փակել"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {currencies.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/20 group"
                                >
                                    <div className="flex flex-col w-24">
                                        <span className="font-bold text-xs sm:text-sm text-white tracking-wide transition-colors">
                                            {item.code}
                                        </span>
                                        <span className="text-[10px] text-gray-400 truncate">{item.name}</span>
                                    </div>

                                    <div className="hidden sm:block w-28 h-8">
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
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill={`url(#curr-grad-${index})`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-right">
                                        <span className="font-semibold text-xs sm:text-sm text-white tracking-wider">
                                            {item.rate} <span className="text-[10px] text-gray-400 font-normal">֏</span>
                                        </span>

                                        <div
                                            className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-lg border shadow-sm"
                                            style={{
                                                color: item.color,
                                                backgroundColor: `${item.color}15`,
                                                borderColor: `${item.color}40`,
                                                boxShadow: `0 0 10px ${item.color}25`
                                            }}
                                        >
                                            {item.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            <span>{item.change}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}