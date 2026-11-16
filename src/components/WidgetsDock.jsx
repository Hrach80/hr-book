import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, DollarSign, Maximize2, X, TrendingUp, TrendingDown, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TIMEZONES = [
    { label: 'Yerevan (GMT+4)', short: 'Yerevan', value: 'Asia/Yerevan' },
    { label: 'Antwerp / Brussels', short: 'Antwerp', value: 'Europe/Brussels' },
    { label: 'Los Angeles', short: 'Los Angeles', value: 'America/Los_Angeles' },
    { label: 'Paris', short: 'Paris', value: 'Europe/Paris' },
    { label: 'London', short: 'London', value: 'Europe/London' },
    { label: 'Berlin', short: 'Berlin', value: 'Europe/Berlin' },
    { label: 'New York', short: 'New York', value: 'America/New_York' },
    { label: 'Dubai', short: 'Dubai', value: 'Asia/Dubai' },
    { label: 'Tokyo', short: 'Tokyo', value: 'Asia/Tokyo' },
    { label: 'Moscow', short: 'Moscow', value: 'Europe/Moscow' },
];

export default function WidgetsDock() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isDockOpen, setIsDockOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [time, setTime] = useState(new Date());
    const [selectedZones, setSelectedZones] = useState([
        'Asia/Yerevan',
        'Europe/Brussels',
        'America/Los_Angeles'
    ]);
    const [expandedZoneIndex, setExpandedZoneIndex] = useState(null);

    const [expandedCurrencyCode, setExpandedCurrencyCode] = useState(null);
    const [timeFrame, setTimeFrame] = useState('daily');
    const [convertAmounts, setConvertAmounts] = useState({ 'USD/AMD': 100, 'EUR/AMD': 100, 'RUB/AMD': 1000, 'GEL/AMD': 100 });

    const [currencies, setCurrencies] = useState([
        {
            code: 'USD/AMD',
            name: 'US Dollar (Market)',
            rate: 402.50,
            change: '+0.30%',
            isUp: true,
            color: '#10b981',
            min: 398.0,
            max: 405.2,
            svgPaths: {
                daily: "M 0 30 C 40 10, 80 40, 120 20 C 160 5, 200 35, 240 15",
                quarter: "M 0 40 C 50 5, 100 35, 150 15 C 180 5, 210 25, 240 8",
                yearly: "M 0 45 C 60 5, 120 40, 180 10 C 200 2, 220 20, 240 5"
            }
        },
        {
            code: 'EUR/AMD',
            name: 'Euro (Market)',
            rate: 429.20,
            change: '-0.15%',
            isUp: false,
            color: '#3b82f6',
            min: 425.0,
            max: 433.5,
            svgPaths: {
                daily: "M 0 20 C 40 40, 80 15, 120 35 C 160 20, 200 40, 240 25",
                quarter: "M 0 10 C 50 45, 100 20, 150 35 C 180 15, 210 40, 240 20",
                yearly: "M 0 5 C 60 45, 120 15, 180 40 C 200 30, 220 10, 240 35"
            }
        },
        {
            code: 'RUB/AMD',
            name: 'Russian Ruble',
            rate: 4.18,
            change: '+0.80%',
            isUp: true,
            color: '#f59e0b',
            min: 4.05,
            max: 4.22,
            svgPaths: {
                daily: "M 0 35 C 40 15, 80 30, 120 10 C 160 25, 200 15, 240 5",
                quarter: "M 0 30 C 50 15, 100 40, 150 10 C 180 30, 210 10, 240 12",
                yearly: "M 0 35 C 60 10, 120 45, 180 20 C 200 10, 220 25, 240 8"
            }
        },
        {
            code: 'GEL/AMD',
            name: 'Georgian Lari',
            rate: 148.80,
            change: '+0.20%',
            isUp: true,
            color: '#ec4899',
            min: 146.5,
            max: 150.0,
            svgPaths: {
                daily: "M 0 25 C 40 35, 80 10, 120 30 C 160 15, 200 35, 240 20",
                quarter: "M 0 20 C 50 30, 100 10, 150 40 C 180 20, 210 30, 240 15",
                yearly: "M 0 15 C 60 40, 120 10, 180 35 C 200 20, 220 30, 240 18"
            }
        },
    ]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchRealRates = async () => {
            try {
                const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,RUB');
                const data = await res.json();

                if (data && data.rates) {
                    const eurToUsd = 1 / data.rates.EUR;
                    const baseAmdUSD = 402.5;
                    const usdRate = baseAmdUSD;
                    const eurRate = Number((baseAmdUSD * eurToUsd).toFixed(2));
                    const rubRate = Number((baseAmdUSD / (data.rates.RUB * 21.5)).toFixed(2));
                    const gelRate = 148.8;

                    setCurrencies(prev => [
                        { ...prev[0], rate: usdRate },
                        { ...prev[1], rate: eurRate },
                        { ...prev[2], rate: rubRate },
                        { ...prev[3], rate: gelRate },
                    ]);
                }
            } catch (err) {
                console.error('API Error:', err);
            }
        };

        fetchRealRates();
    }, []);

    const handleZoneChange = (index, newZone) => {
        const updated = [...selectedZones];
        updated[index] = newZone;
        setSelectedZones(updated);
    };

    const getTimeComponents = (timeZone) => {
        try {
            const formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const parts = formatter.formatToParts(time);
            const hours = parseInt(parts.find(p => p.type === 'hour')?.value || 0, 10);
            const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || 0, 10);
            const seconds = parseInt(parts.find(p => p.type === 'second')?.value || 0, 10);

            const dateStr = new Intl.DateTimeFormat('en-GB', {
                timeZone,
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }).format(time);

            return { hours, minutes, seconds, dateStr };
        } catch (e) {
            return { hours: 0, minutes: 0, seconds: 0, dateStr: '' };
        }
    };

    const handleCloseModal = () => {
        setActiveModal(null);
        setExpandedCurrencyCode(null);
        navigate('/');
    };

    return (
        <div className="relative z-[999]">
            {/* Վիդջեթների գլխավոր կոճակ */}
            <div className="fixed left-1/2 -translate-x-1/2 top-[-55px] sm:top-[-55px] flex flex-col items-center z-[999]">
                <button
                    type="button"
                    onClick={() => setIsDockOpen(!isDockOpen)}
                    className="px-6 py-3 rounded-3xl border border-white/30 bg-gradient-to-b from-white/18 via-white/8 to-transparent backdrop-blur-xl shadow-[0_12px_40px_0_rgba(31,38,135,0.45),inset_0_1px_2px_0_rgba(255,255,255,0.5)] text-gray-100 hover:text-white hover:border-blue-400 hover:bg-white/25 transition-all duration-500 flex items-center gap-3 cursor-pointer active:scale-95 group pointer-events-auto"
                    title="Վիդջեթների մենյու"
                >
                    <LayoutGrid size={20} className="text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.95)] group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-gray-100 group-hover:text-white select-none drop-shadow-md">
                        WIDGETS
                    </span>
                    <ChevronDown size={16} className={`text-gray-200 transition-transform duration-500 ${isDockOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDockOpen && (
                    <div className="absolute top-[68px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3.5 p-2.5 rounded-3xl border border-white/25 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] transition-all duration-500 ease-out transform scale-100 opacity-100 pointer-events-auto whitespace-nowrap">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveModal('clock');
                                setIsDockOpen(false);
                            }}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/45 to-indigo-500/35 border border-white/35 text-blue-300 hover:border-blue-400 hover:scale-110 transition-all duration-300 shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)] flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="World Clocks"
                        >
                            <Globe size={22} className="group-hover:rotate-45 transition-transform duration-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.95)]" />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveModal('currency');
                                setIsDockOpen(false);
                            }}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/45 to-teal-500/35 border border-white/35 text-emerald-300 hover:border-emerald-400 hover:scale-110 transition-all duration-300 shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)] flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="Market Rates"
                        >
                            <DollarSign size={22} className="group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.95)]" />
                        </button>
                    </div>
                )}
            </div>

            {isDockOpen && (
                <div className="fixed inset-0 z-[950]" onClick={() => setIsDockOpen(false)} />
            )}

            {/* ԺԱՄԱՑՈՒՅՑՆԵՐԻ ՄՈԴԱԼ */}
            {activeModal === 'clock' && (
                <div
                    className="fixed inset-0 z-[1000] flex items-start justify-center pt-[90px] sm:pt-[110px] p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-500 ease-out overflow-y-auto"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative w-full max-w-lg sm:max-w-2xl glass-card p-4 sm:p-8 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-500 ease-out transform scale-100 opacity-100 my-auto box-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/15 pb-3 sm:pb-4">
                            <div className="w-8 sm:w-10"></div>
                            <div className="flex items-center gap-2 sm:gap-3 text-blue-400 text-sm sm:text-lg font-extrabold tracking-wider uppercase text-center">
                                <Globe size={22} className="shrink-0" />
                                <span>{t('worldClocks') || 'World Clocks'}</span>
                            </div>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/15 transition cursor-pointer shrink-0">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 sm:gap-4 relative z-10 w-full box-border">
                            {selectedZones.map((zone, index) => {
                                const { hours, minutes, seconds, dateStr } = getTimeComponents(zone);
                                const secondDeg = (seconds / 60) * 360;
                                const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
                                const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
                                const currentObj = TIMEZONES.find(item => item.value === zone);

                                return (
                                    <div key={index} onClick={() => setExpandedZoneIndex(index)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl hover:border-blue-500/60 cursor-pointer transition gap-3 sm:gap-4 group w-full box-border">

                                        <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto min-w-0">
                                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/25 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)] shrink-0">
                                                <div className="absolute w-2 h-2 rounded-full bg-blue-400 z-30"></div>
                                                <div className="absolute w-0.5 bg-blue-400 rounded-full origin-bottom z-20" style={{ height: '12px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}></div>
                                                <div className="absolute w-[1.5px] bg-cyan-300 rounded-full origin-bottom z-20" style={{ height: '16px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}></div>
                                                <div className="absolute w-[0.5px] bg-red-400 rounded-full origin-bottom z-20" style={{ height: '19px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}></div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm sm:text-lg font-bold text-white break-words leading-snug">{currentObj ? currentObj.label : zone}</p>
                                                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">{dateStr}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-white/10 box-border">
                                            <span className="text-lg sm:text-2xl font-black text-blue-300 tracking-wider">
                                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                            </span>
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/15 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/50 transition shrink-0">
                                                <Maximize2 size={14} />
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ՏԱՐԱԴՐԱՄՆԵՐԻ ՄՈԴԱԼ (Լիարժեք սիմետրիկ և հարմարեցված) */}
            {activeModal === 'currency' && (
                <div
                    className="fixed inset-0 z-[1000] flex items-start justify-center pt-[90px] sm:pt-[110px] p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-500 ease-out overflow-y-auto"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative w-full max-w-lg sm:max-w-2xl glass-card p-4 sm:p-8 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-500 ease-out transform scale-100 opacity-100 my-auto box-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/15 pb-3 sm:pb-4">
                            <div className="w-8 sm:w-10"></div>
                            <div className="flex items-center gap-2 sm:gap-3 text-emerald-400 text-sm sm:text-lg font-extrabold tracking-wider uppercase text-center">
                                <DollarSign size={22} className="shrink-0" />
                                <span>{t('marketRatesTitle') || 'Տարադրամի փոխարժեք'}</span>
                            </div>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/15 transition cursor-pointer shrink-0">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 sm:space-y-4 w-full box-border">
                            {currencies.map((item, index) => {
                                const isExpanded = expandedCurrencyCode === item.code;
                                const currentPath = item.svgPaths[timeFrame];
                                const currentAmount = convertAmounts[item.code] || 100;
                                const convertedResult = (currentAmount * item.rate).toFixed(2);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setExpandedCurrencyCode(isExpanded ? null : item.code)}
                                        className="p-3.5 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 w-full box-border"
                                    >
                                        <div className="flex items-center justify-between gap-3 w-full box-border">
                                            <div className="flex flex-col min-w-0 flex-1 pr-2">
                                                <span className="font-extrabold text-white text-sm sm:text-lg truncate">{item.code}</span>
                                                <span className="text-xs sm:text-sm text-gray-400 font-medium truncate">{item.name}</span>
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                <span className="font-black text-white text-base sm:text-xl">{item.rate} ֏</span>
                                                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-2 py-1 rounded-xl border shrink-0" style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
                                                    {item.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    <span>{item.change}</span>
                                                </div>
                                                <div className="text-gray-400 hover:text-white shrink-0">
                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-white/10 space-y-4 cursor-default w-full box-border" onClick={(e) => e.stopPropagation()}>

                                                <div className="flex justify-center gap-2 w-full">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTimeFrame('daily')}
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${timeFrame === 'daily' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}
                                                    >
                                                        {t('daily') || 'Օր'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTimeFrame('quarter')}
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${timeFrame === 'quarter' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}
                                                    >
                                                        {t('quarter') || 'Եռամսյակ'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTimeFrame('yearly')}
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${timeFrame === 'yearly' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}
                                                    >
                                                        {t('yearly') || 'Տարի'}
                                                    </button>
                                                </div>

                                                <div className="w-full h-20 relative flex items-center bg-black/30 rounded-xl p-2 border border-white/10 box-border overflow-hidden">
                                                    <svg viewBox="0 0 240 50" className="w-full h-full overflow-visible">
                                                        <defs>
                                                            <linearGradient id={`svg-exp-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={item.color} stopOpacity="0.6" />
                                                                <stop offset="100%" stopColor={item.color} stopOpacity="0.0" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d={`${currentPath} L 240 50 L 0 50 Z`} fill={`url(#svg-exp-grad-${index})`} />
                                                        <path d={currentPath} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" />
                                                        <circle cx="120" cy="20" r="4" fill={item.color} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                                    </svg>
                                                </div>

                                                <div className="flex justify-between text-xs text-gray-400 font-medium px-1 w-full box-border">
                                                    <span>{t('minRate') || 'Նվազագույն'}: <strong className="text-white">{item.min} ֏</strong></span>
                                                    <span>{t('maxRate') || 'Առավելագույն'}: <strong className="text-white">{item.max} ֏</strong></span>
                                                </div>

                                                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 flex flex-col gap-2 w-full box-border">
                                                    <span className="text-xs font-bold text-gray-300">{t('converterTitle') || 'Արժույթի փոխարկիչ'}</span>
                                                    <div className="flex items-center justify-between gap-3 w-full box-border">
                                                        <input
                                                            type="number"
                                                            value={currentAmount}
                                                            onChange={(e) => setConvertAmounts({ ...convertAmounts, [item.code]: e.target.value })}
                                                            className="w-1/2 bg-[#0d1322] text-white text-sm py-2 px-3 rounded-xl border border-white/20 outline-none focus:border-emerald-500 font-bold box-border"
                                                            placeholder={t('enterAmount') || 'Գումարը'}
                                                        />
                                                        <span className="text-sm font-black text-emerald-400 w-1/2 text-right truncate">
                                                            {convertedResult} ֏
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Ժամային գոտու փոփոխման մոդալ */}
            {expandedZoneIndex !== null && (
                <div
                    className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-500 ease-out"
                    onClick={() => setExpandedZoneIndex(null)}
                >
                    <div
                        className="relative w-full max-w-md glass-card p-6 sm:p-8 rounded-3xl bg-[#0b0f19] border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.4)] flex flex-col items-center transition-all duration-500 ease-out transform scale-100 opacity-100 box-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button type="button" onClick={() => setExpandedZoneIndex(null)} className="absolute top-4 right-4 text-gray-300 hover:text-white p-2">
                            <X size={20} />
                        </button>
                        <span className="text-xs sm:text-sm font-bold text-blue-400 tracking-wider uppercase mb-3 text-center">
                            Փոխել ժամային գոտին
                        </span>
                        <div className="w-full mb-6 text-center">
                            <p className="text-sm sm:text-base text-gray-300">Ընտրեք նոր քաղաք կամ գոտի #{expandedZoneIndex + 1}-ի համար</p>
                        </div>
                        <div className="w-full box-border">
                            <select
                                value={selectedZones[expandedZoneIndex]}
                                onChange={(e) => {
                                    handleZoneChange(expandedZoneIndex, e.target.value);
                                    setExpandedZoneIndex(null);
                                }}
                                className="w-full bg-[#0d1322] text-gray-100 text-sm sm:text-base py-3.5 px-4 rounded-2xl border border-white/20 outline-none cursor-pointer hover:border-blue-500 focus:border-blue-500 shadow-inner text-center font-bold box-border"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz.value} value={tz.value} className="bg-[#0b0f19] text-white py-3">
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}