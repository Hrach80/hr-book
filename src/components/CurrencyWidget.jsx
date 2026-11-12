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
            {/* Ֆիքսված իկոնա ամենաբարձր շերտով (z-[90]) */}
            <div className="fixed left-4 sm:left-8 top-40 sm:top-48 z-[90]">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-white/15 text-emerald-400 hover:border-emerald-500/60 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] group flex items-center justify-center cursor-pointer active:scale-95"
                        title="Բացել փոխարժեքները"
                    >
                        <DollarSign size={22} className="text-emerald-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    </button>
                )}
            </div>

            {/* Բացվող պատուհան՝ բացարձակ ամենաբարձր շերտում (z-[100]) */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-8 bg-black/60 backdrop-blur-md transition-opacity duration-500">
                    <div className="relative w-full max-w-7xl glass-card p-5 sm:p-6 rounded-3xl border border-white/20 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-500 ease-out transform translate-x-0 opacity-100 animate-[slideRight_0.4s_cubic-bezier(0.16,1,0.3,1)]">

                        {/* Հետին ֆոնի նեոնային լույսեր */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Վերնագիրը */}
                        <div className="flex items-center justify-between mb-4 relative z-10 border-b border-white/10 pb-3">
                            <div className="w-6"></div>

                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wider uppercase">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <DollarSign size={14} className="drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                </div>
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                    {t('liveRates') || 'Armenian Market Rates'}
                                </span>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
                                title="Փակել"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Տարադրամների ցանկը */}
                        <div className="space-y-3 relative z-10">
                            {currencies.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/20 group"
                                >
                                    <div className="flex flex-col w-28 sm:w-36">
                                        <span className="font-bold text-sm sm:text-base text-white tracking-wide transition-colors">
                                            {item.code}
                                        </span>
                                        <span className="text-[11px] sm:text-xs text-gray-400 truncate">{item.name}</span>
                                    </div>

                                    <div className="w-24 sm:w-48 h-8 sm:h-10 mx-2">
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

                                    <div className="flex items-center gap-3 text-right">
                                        <span className="font-bold text-sm sm:text-base text-white tracking-wider">
                                            {item.rate} <span className="text-xs text-gray-400 font-normal">֏</span>
                                        </span>

                                        <div
                                            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl border shadow-sm"
                                            style={{
                                                color: item.color,
                                                backgroundColor: `${item.color}15`,
                                                borderColor: `${item.color}40`,
                                                boxShadow: `0 0 12px ${item.color}25`
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
                </div>
            )}
        </>
    );
}