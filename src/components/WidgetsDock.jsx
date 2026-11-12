import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, Maximize2, X, TrendingUp, TrendingDown, LayoutGrid, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

// ==========================================
// 1. ՀԱՍՏԱՏՈՒՆՆԵՐ ԵՎ ՏՎՅԱԼՆԵՐԻ ԲԱԶԱ (TIMEZONES)
// ==========================================
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

    // ==========================================
    // 2. ԸՆԴՀԱՆՈՒՐ STATE-ԵՐ ԵՎ ՎԻՃԱԿՆԵՐ
    // ==========================================
    const [isDockOpen, setIsDockOpen] = useState(false); // Ձախ վահանակի բաց/փակ վիճակը
    const [activeModal, setActiveModal] = useState(null);   // Բացված մեծ պատուհանը ('clock' | 'currency' | null)

    // Ժամացույցների հետ կապված state-եր
    const [time, setTime] = useState(new Date());
    const [selectedZones, setSelectedZones] = useState([
        'Asia/Yerevan',
        'Europe/Brussels',
        'America/Los_Angeles'
    ]);
    const [expandedZoneIndex, setExpandedZoneIndex] = useState(null); // Որ ժամային գոտին ենք խմբագրում

    // Տարադրամների հետ կապված state-եր (Իրական ժամանակի տվյալներ)
    const [currencies, setCurrencies] = useState([
        { code: 'USD/AMD', name: 'US Dollar (Market)', rate: '402.50', change: '+0.30%', isUp: true, color: '#10b981', data: [{ v: 400 }, { v: 401.5 }, { v: 400.8 }, { v: 402.2 }, { v: 401.3 }, { v: 402.5 }] },
        { code: 'EUR/AMD', name: 'Euro (Market)', rate: '429.20', change: '-0.15%', isUp: false, color: '#3b82f6', data: [{ v: 431.5 }, { v: 430 }, { v: 430.8 }, { v: 429.5 }, { v: 429.8 }, { v: 429.2 }] },
        { code: 'RUB/AMD', name: 'Russian Ruble', rate: '4.18', change: '+0.80%', isUp: true, color: '#f59e0b', data: [{ v: 4.10 }, { v: 4.15 }, { v: 4.12 }, { v: 4.17 }, { v: 4.14 }, { v: 4.18 }] },
        { code: 'GEL/AMD', name: 'Georgian Lari', rate: '148.80', change: '+0.20%', isUp: true, color: '#ec4899', data: [{ v: 147.9 }, { v: 148.4 }, { v: 148.1 }, { v: 148.6 }, { v: 148.3 }, { v: 148.8 }] },
    ]);

    // ==========================================
    // 3. ՖՈՒՆԿՑԻԱՆԵՐ ԵՎ API ՀՐԱՎԵՐՆԵՐ
    // ==========================================
    // Ժամանակի թարմացման թայմեր
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Իրական ժամանակի փոխարժեքների բեռնում API-ից
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

    // Ժամային գոտու փոփոխման ֆունկցիա
    const handleZoneChange = (index, newZone) => {
        const updated = [...selectedZones];
        updated[index] = newZone;
        setSelectedZones(updated);
    };

    // Կոնկրետ ժամային գոտու ժամերի, րոպեների և ամսաթվի ֆորմատավորում
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
        <div className="relative z-[90]">

            {/* ==========================================
          4. ՁԱԽ ԱՆԿՅՈՒՆԻ ՈՒՂՂԱՀԱՅԱՑ ՎԱՀԱՆԱԿ (DOCK)
         ========================================== */}
            <div className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 flex flex-col items-start">

                {/* Գլխավոր երկարավուն և բարակ կոճակ */}
                <button
                    type="button"
                    onClick={() => setIsDockOpen(!isDockOpen)}
                    className={`w-9 sm:w-10 py-5 rounded-2xl glass-card border border-white/15 bg-[#0b0f19]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-gray-300 hover:text-white hover:border-blue-500/50 transition-all duration-300 flex flex-col items-center justify-between gap-3 cursor-pointer active:scale-95 group`}
                    title="Վիդջեթների մենյու"
                >
                    <LayoutGrid size={18} className="text-blue-400 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-[9px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] text-gray-400 group-hover:text-white select-none">
                        WIDGETS
                    </span>
                    <ChevronRight size={14} className={`text-gray-400 transition-transform duration-300 ${isDockOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Բացվող իկոնաների ցանկ (Վերևից ներքև) */}
                {isDockOpen && (
                    <div className="absolute left-12 sm:left-14 top-0 flex flex-col gap-2 p-2 rounded-2xl glass-card border border-white/15 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-[fadeIn_0.3s_ease-out]">

                        {/* Ժամացույցի իկոնա */}
                        <button
                            type="button"
                            onClick={() => {
                                setActiveModal('clock');
                                setIsDockOpen(false);
                            }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/15 text-blue-400 hover:border-blue-500/60 hover:scale-105 transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="World Clocks"
                        >
                            <Globe size={18} className="group-hover:rotate-45 transition-transform duration-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                        </button>

                        {/* Տարադրամի իկոնա */}
                        <button
                            type="button"
                            onClick={() => {
                                setActiveModal('currency');
                                setIsDockOpen(false);
                            }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/15 text-emerald-400 hover:border-emerald-500/60 hover:scale-105 transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="Market Rates"
                        >
                            <DollarSign size={18} className="group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                        </button>

                        {/* ========================================================
                [ՀԱՏՈՒԿ ՏԵՂԱՄԱՍ ՀԵՏԱԳԱՅԻ ՀԱՄԱՐ]
                Այստեղ կարող եք ավելացնել ՆՈՐ ՎԻԴՋԵԹՆԵՐԻ ԻԿՈՆԱՆԵՐ (օրինակ՝ Եղանակ, Նշումներ և այլն)
                Օրինակ՝
                <button
                  type="button"
                  onClick={() => { setActiveModal('weather'); setIsDockOpen(false); }}
                  className="..."
                >
                  <WeatherIcon size={18} />
                </button>
               ======================================================== */}

                    </div>
                )}

            </div>


            {/* ==========================================
          5. ԺԱՄԱՑՈՒՅՑՆԵՐԻ ՄԵԾ ՊԱՏՈՒՀԱՆ
         ========================================== */}
            {activeModal === 'clock' && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-8 bg-black/70 backdrop-blur-md"
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        className="relative w-full max-w-7xl glass-card p-5 sm:p-6 rounded-3xl border border-white/20 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-[slideRight_0.4s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Վերնագիր և փակելու կոճակ */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                            <div className="w-6"></div>
                            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wider uppercase">
                                <Globe size={18} />
                                <span>{t('worldClocks') || 'World Clocks'}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Ժամացույցների ցանկը՝ իրար տակ դասավորված ուղղահայաց շարքերով */}
                        <div className="flex flex-col gap-3 relative z-10">
                            {selectedZones.map((zone, index) => {
                                const { hours, minutes, seconds, dateStr } = getTimeComponents(zone);
                                const secondDeg = (seconds / 60) * 360;
                                const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
                                const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
                                const currentObj = TIMEZONES.find(item => item.value === zone);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setExpandedZoneIndex(index)}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-blue-500/50 cursor-pointer transition group"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Նրբագեղ անալոգային կլոր ժամացույց */}
                                            <div className="relative w-12 h-12 rounded-full border border-white/20 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
                                                <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 z-30"></div>
                                                <div className="absolute w-0.5 bg-blue-400 rounded-full origin-bottom z-20" style={{ height: '12px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}></div>
                                                <div className="absolute w-[1px] bg-cyan-300 rounded-full origin-bottom z-20" style={{ height: '16px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}></div>
                                                <div className="absolute w-[0.5px] bg-red-400 rounded-full origin-bottom z-20" style={{ height: '18px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}></div>
                                            </div>

                                            <div>
                                                <p className="text-sm sm:text-base font-bold text-white">
                                                    {currentObj ? currentObj.label : zone}
                                                </p>
                                                <p className="text-xs text-gray-400">{dateStr}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-lg sm:text-xl font-extrabold text-blue-300 tracking-wider">
                                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                            </span>
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/40 transition">
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


            {/* ==========================================
          6. ՏԱՐԱԴՐԱՄՆԵՐԻ ՄԵԾ ՊԱՏՈՒՀԱՆ
         ========================================== */}
            {activeModal === 'currency' && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-8 bg-black/70 backdrop-blur-md"
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        className="relative w-full max-w-7xl glass-card p-5 sm:p-6 rounded-3xl border border-white/20 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-[slideRight_0.4s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Վերնագիր և փակելու կոճակ */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                            <div className="w-6"></div>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wider uppercase">
                                <DollarSign size={18} />
                                <span>{t('liveRates') || 'Armenian Market Rates'}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Տարադրամների ցանկը և նեոնային գրաֆիկները */}
                        <div className="space-y-3">
                            {currencies.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
                                >
                                    <div className="flex flex-col w-32">
                                        <span className="font-bold text-white text-sm">{item.code}</span>
                                        <span className="text-xs text-gray-400">{item.name}</span>
                                    </div>

                                    <div className="w-28 sm:w-48 h-8 mx-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={item.data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                                                <defs>
                                                    <linearGradient id={`curr-dock-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={item.color} stopOpacity={0.5} />
                                                        <stop offset="95%" stopColor={item.color} stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="natural" dataKey="v" stroke={item.color} strokeWidth={2} fill={`url(#curr-dock-grad-${index})`} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex items-center gap-3 text-right">
                                        <span className="font-bold text-white text-sm">{item.rate} ֏</span>
                                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl border" style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
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


            {/* ==========================================
          7. ԺԱՄԱՅԻՆ ԳՈՏՈՒ ՓՈՓՈԽՄԱՆ ԵՆԹԱՊԱՏՈՒՀԱՆ (Modal)
         ========================================== */}
            {expandedZoneIndex !== null && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
                    onClick={() => setExpandedZoneIndex(null)}
                >
                    <div
                        className="relative w-full max-w-sm glass-card p-6 rounded-3xl bg-[#0b0f19] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setExpandedZoneIndex(null)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-white p-1"
                        >
                            <X size={18} />
                        </button>

                        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
                            Փոխել ժամային գոտին
                        </span>

                        <div className="w-full mb-6 text-center">
                            <p className="text-sm text-gray-300 mb-2">Ընտրեք նոր քաղաք կամ գոտի գոտի #{expandedZoneIndex + 1}-ի համար</p>
                        </div>

                        <div className="w-full">
                            <select
                                value={selectedZones[expandedZoneIndex]}
                                onChange={(e) => {
                                    handleZoneChange(expandedZoneIndex, e.target.value);
                                    setExpandedZoneIndex(null);
                                }}
                                className="w-full bg-[#0d1322] text-gray-200 text-xs py-3 px-4 rounded-xl border border-white/15 outline-none cursor-pointer hover:border-blue-500 focus:border-blue-500 shadow-inner text-center"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz.value} value={tz.value} className="bg-[#0b0f19] text-white py-1">
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          [ՀԱՏՈՒԿ ՏԵՂԱՄԱՍ ՀԵՏԱԳԱՅԻ ՀԱՄԱՐ]
          Այստեղ կարող եք ավելացնել ՆՈՐ ՄԵԾ ՊԱՏՈՒՀԱՆՆԵՐԻ JSX ԿՈԴԵՐԸ
          (օրինակ՝ {activeModal === 'weather' && ( <div ...> ... </div> )} )
         ======================================================== */}

        </div>
    );
}