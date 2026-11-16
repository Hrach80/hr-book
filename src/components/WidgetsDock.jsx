import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, Maximize2, X, TrendingUp, TrendingDown, LayoutGrid, ChevronDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
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
    const [isDockOpen, setIsDockOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [time, setTime] = useState(new Date());
    const [selectedZones, setSelectedZones] = useState([
        'Asia/Yerevan',
        'Europe/Brussels',
        'America/Los_Angeles'
    ]);
    const [expandedZoneIndex, setExpandedZoneIndex] = useState(null);

    const [currencies, setCurrencies] = useState([
        { code: 'USD/AMD', name: 'US Dollar (Market)', rate: '402.50', change: '+0.30%', isUp: true, color: '#10b981', data: [{ v: 400 }, { v: 401.5 }, { v: 400.8 }, { v: 402.2 }, { v: 401.3 }, { v: 402.5 }] },
        { code: 'EUR/AMD', name: 'Euro (Market)', rate: '429.20', change: '-0.15%', isUp: false, color: '#3b82f6', data: [{ v: 431.5 }, { v: 430 }, { v: 430.8 }, { v: 429.5 }, { v: 429.8 }, { v: 429.2 }] },
        { code: 'RUB/AMD', name: 'Russian Ruble', rate: '4.18', change: '+0.80%', isUp: true, color: '#f59e0b', data: [{ v: 4.10 }, { v: 4.15 }, { v: 4.12 }, { v: 4.17 }, { v: 4.14 }, { v: 4.18 }] },
        { code: 'GEL/AMD', name: 'Georgian Lari', rate: '148.80', change: '+0.20%', isUp: true, color: '#ec4899', data: [{ v: 147.9 }, { v: 148.4 }, { v: 148.1 }, { v: 148.6 }, { v: 148.3 }, { v: 148.8 }] },
    ]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
            console.error('Currency API error');
        }
    };

    useEffect(() => {
        fetchRates();
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

    return (
        <div className="relative z-[999]">
            {/* Ձեր նշсծ իրական չափսերով՝ բարձրացված վերև */}
            <div className="fixed left-1/2 -translate-x-1/2 top-[10px] sm:top-[-55px] flex flex-col items-center z-[999]">

                {/* Մեծացված և հարմարեցված գլխավոր կոճակ */}
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

                {/* Բացվող հորիզոնական իկոնաների ցանկ */}
                {isDockOpen && (
                    <div className="absolute top-16 z-[1000] flex items-center gap-3.5 p-2.5 rounded-3xl border border-white/25 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] transition-all duration-500 ease-out transform scale-100 opacity-100 pointer-events-auto">

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

            {/* Ֆոնային թափանցիկ շերտ՝ մենյուի բացված ժամանակ այլ տեղ սեղմելիս փակելու համար */}
            {isDockOpen && (
                <div
                    className="fixed inset-0 z-[950]"
                    onClick={() => setIsDockOpen(false)}
                />
            )}

            {/* Ժամացույցների Մոդալ (Հեռախոսի ողջ էկրանով, գեղեցիկ անիմացիայով) */}
            {activeModal === 'clock' && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-all duration-500 ease-out"
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        className="relative w-full max-w-md sm:max-w-lg glass-card p-5 sm:p-6 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-500 ease-out transform scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-white/15 pb-3">
                            <div className="w-8"></div>
                            <div className="flex items-center gap-2.5 text-blue-400 text-sm sm:text-base font-bold tracking-wider uppercase">
                                <Globe size={22} />
                                <span>{t('worldClocks') || 'World Clocks'}</span>
                            </div>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 relative z-10">
                            {selectedZones.map((zone, index) => {
                                const { hours, minutes, seconds, dateStr } = getTimeComponents(zone);
                                const secondDeg = (seconds / 60) * 360;
                                const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
                                const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
                                const currentObj = TIMEZONES.find(item => item.value === zone);

                                return (
                                    <div key={index} onClick={() => setExpandedZoneIndex(index)} className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-xl hover:border-blue-500/60 cursor-pointer transition group">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)] shrink-0">
                                                <div className="absolute w-2 h-2 rounded-full bg-blue-400 z-30"></div>
                                                <div className="absolute w-0.5 bg-blue-400 rounded-full origin-bottom z-20" style={{ height: '11px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}></div>
                                                <div className="absolute w-[1.5px] bg-cyan-300 rounded-full origin-bottom z-20" style={{ height: '15px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}></div>
                                                <div className="absolute w-[0.5px] bg-red-400 rounded-full origin-bottom z-20" style={{ height: '17px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}></div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs sm:text-base font-bold text-white truncate">{currentObj ? currentObj.label : zone}</p>
                                                <p className="text-[11px] sm:text-xs text-gray-400">{dateStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                            <span className="text-sm sm:text-lg font-extrabold text-blue-300 tracking-wider">
                                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                            </span>
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/15 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/50 transition">
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

            {/* Տարադրամների Մոդալ (Հեռախոսի ողջ էկրանով, գեղեցիկ անիմացիայով) */}
            {activeModal === 'currency' && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-all duration-500 ease-out"
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        className="relative w-full max-w-md sm:max-w-lg glass-card p-5 sm:p-6 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-500 ease-out transform scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-white/15 pb-3">
                            <div className="w-8"></div>
                            <div className="flex items-center gap-2.5 text-emerald-400 text-sm sm:text-base font-bold tracking-wider uppercase">
                                <DollarSign size={22} />
                                <span>{t('liveRates') || 'Armenian Market Rates'}</span>
                            </div>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {currencies.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/15">
                                    <div className="flex flex-col w-28 sm:w-32 shrink-0">
                                        <span className="font-bold text-white text-xs sm:text-base truncate">{item.code}</span>
                                        <span className="text-[10px] sm:text-xs text-gray-400 truncate">{item.name}</span>
                                    </div>
                                    <div className="w-20 sm:w-36 h-8 sm:h-9 mx-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={item.data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                                                <defs>
                                                    <linearGradient id={`curr-dock-grad-lg-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={item.color} stopOpacity={0.6} />
                                                        <stop offset="95%" stopColor={item.color} stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="natural" dataKey="v" stroke={item.color} strokeWidth={2.5} fill={`url(#curr-dock-grad-lg-${index})`} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
                                        <span className="font-bold text-white text-xs sm:text-base">{item.rate} ֏</span>
                                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-xl border" style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
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

            {/* Ժամային գոտու փոփոխման մոդալ */}
            {expandedZoneIndex !== null && (
                <div
                    className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-500 ease-out"
                    onClick={() => setExpandedZoneIndex(null)}
                >
                    <div
                        className="relative w-full max-w-sm glass-card p-6 rounded-3xl bg-[#0b0f19] border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.4)] flex flex-col items-center transition-all duration-500 ease-out transform scale-100 opacity-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button type="button" onClick={() => setExpandedZoneIndex(null)} className="absolute top-4 right-4 text-gray-300 hover:text-white p-1.5">
                            <X size={18} />
                        </button>
                        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase mb-3">
                            Փոխել ժամային գոտին
                        </span>
                        <div className="w-full mb-5 text-center">
                            <p className="text-sm text-gray-300">Ընտրեք նոր քաղաք կամ գոտի #{expandedZoneIndex + 1}-ի համար</p>
                        </div>
                        <div className="w-full">
                            <select
                                value={selectedZones[expandedZoneIndex]}
                                onChange={(e) => {
                                    handleZoneChange(expandedZoneIndex, e.target.value);
                                    setExpandedZoneIndex(null);
                                }}
                                className="w-full bg-[#0d1322] text-gray-100 text-sm py-3 px-4 rounded-2xl border border-white/20 outline-none cursor-pointer hover:border-blue-500 focus:border-blue-500 shadow-inner text-center font-medium"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz.value} value={tz.value} className="bg-[#0b0f19] text-white py-2">
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