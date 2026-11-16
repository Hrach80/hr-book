import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Globe, DollarSign, Maximize2, X, TrendingUp, TrendingDown,
    LayoutGrid, ChevronDown, ChevronUp, CloudSun, Wind, Droplets, Sun, CloudRain, Waves, Cloud, Search
} from 'lucide-react';
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

const WEATHER_REGIONS = {
    armenia: [
        { name: 'Yerevan', temp: '+18°C', condition: 'Արևային', humidity: '45%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Gyumri', temp: '+13°C', condition: 'Փոփոխական', humidity: '55%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Vanadzor', temp: '+15°C', condition: 'Արևային', humidity: '50%', wind: '2 մ/վ', type: 'sun' },
        { name: 'Kapan', temp: '+19°C', condition: 'Տաք', humidity: '42%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Gavar', temp: '+12°C', condition: 'Ամպամած', humidity: '62%', wind: '5 մ/վ', type: 'cloud' },
        { name: 'Hrazdan', temp: '+11°C', condition: 'Զով', humidity: '60%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Artashat', temp: '+20°C', condition: 'Արևային', humidity: '40%', wind: '2 մ/վ', type: 'sun' },
        { name: 'Armavir', temp: '+19°C', condition: 'Արևային', humidity: '41%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Ashtarak', temp: '+18°C', condition: 'Արևային', humidity: '43%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Ijevan', temp: '+17°C', condition: 'Անձրևային', humidity: '68%', wind: '3 մ/վ', type: 'rain' },
        { name: 'Dilijan', temp: '+16°C', condition: 'Խոնավ', humidity: '65%', wind: '2 մ/վ', type: 'cloud' },
        { name: 'Spitak', temp: '+13°C', condition: 'Փոփոխական', humidity: '58%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Tashir', temp: '+12°C', condition: 'Ամպամած', humidity: '63%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Sisian', temp: '+10°C', condition: 'Զով', humidity: '55%', wind: '6 մ/վ', type: 'cloud' },
        { name: 'Goris', temp: '+15°C', condition: 'Արևային', humidity: '48%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Kajaran', temp: '+14°C', condition: 'Լեռնային', humidity: '52%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Megri', temp: '+23°C', condition: 'Շոգ', humidity: '35%', wind: '2 մ/վ', type: 'sun' },
        { name: 'Charentsavan', temp: '+13°C', condition: 'Ամպամած', humidity: '59%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Abovyan', temp: '+15°C', condition: 'Արևային', humidity: '46%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Vedi', temp: '+19°C', condition: 'Արևային', humidity: '42%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Ararat', temp: '+20°C', condition: 'Արևային', humidity: '39%', wind: '2 մ/վ', type: 'sun' },
        { name: 'Alaverdi', temp: '+16°C', condition: 'Ամպամած', humidity: '60%', wind: '3 մ/վ', type: 'cloud' },
        { name: 'Stepanavan', temp: '+12°C', condition: 'Զով', humidity: '64%', wind: '4 մ/վ', type: 'cloud' },
        { name: 'Jermuk', temp: '+9°C', condition: 'Լեռնային', humidity: '70%', wind: '5 մ/վ', type: 'cloud' },
        { name: 'Vayk', temp: '+17°C', condition: 'Արևային', humidity: '48%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Tsaghkadzor', temp: '+10°C', condition: 'Ամպամած', humidity: '66%', wind: '5 մ/վ', type: 'cloud' },
        { name: 'Sevan', temp: '+11°C', condition: 'Քամոտ', humidity: '65%', wind: '7 մ/վ', type: 'cloud' }
    ],
    georgia: [
        { name: 'Kobuleti', temp: '+21°C', condition: 'Ծովային', humidity: '70%', wind: '4 մ/վ', type: 'waves' },
        { name: 'Tbilisi', temp: '+19°C', condition: 'Արևային', humidity: '40%', wind: '3 մ/վ', type: 'sun' },
        { name: 'Batumi', temp: '+20°C', condition: 'Խոնավ', humidity: '75%', wind: '5 մ/վ', type: 'rain' }
    ],
    europe: [
        { name: 'Antwerp', temp: '+15°C', condition: 'Անձրևային', humidity: '80%', wind: '6 մ/վ', type: 'rain' },
        { name: 'Brussels', temp: '+14°C', condition: 'Ամպամած', humidity: '72%', wind: '5 մ/վ', type: 'cloud' },
        { name: 'Paris', temp: '+17°C', condition: 'Արևային', humidity: '50%', wind: '4 մ/վ', type: 'sun' },
        { name: 'London', temp: '+13°C', condition: 'Ցող', humidity: '78%', wind: '6 մ/վ', type: 'rain' },
        { name: 'Amsterdam', temp: '+14°C', condition: 'Քամոտ', humidity: '70%', wind: '7 մ/վ', type: 'cloud' }
    ]
};

const WORLD_AIR_QUALITY = [
    { city: 'Yerevan', country: 'Armenia', aqi: 38, status: 'Լավ / Good', color: '#10b981' },
    { city: 'Kobuleti', country: 'Georgia', aqi: 22, status: 'Գերազանց / Excellent', color: '#3b82f6' },
    { city: 'Antwerp', country: 'Belgium', aqi: 45, status: 'Լավ / Good', color: '#10b981' },
    { city: 'Tbilisi', country: 'Georgia', aqi: 58, status: 'Միջին / Moderate', color: '#f59e0b' },
    { city: 'Paris', country: 'France', aqi: 62, status: 'Միջին / Moderate', color: '#f59e0b' },
    { city: 'New York', country: 'USA', aqi: 42, status: 'Լավ / Good', color: '#10b981' },
    { city: 'London', country: 'UK', aqi: 50, status: 'Լավ / Good', color: '#10b981' },
    { city: 'Tokyo', country: 'Japan', aqi: 28, status: 'Գերազանց / Excellent', color: '#3b82f6' },
    { city: 'Dubai', country: 'UAE', aqi: 75, status: 'Միջին / Moderate', color: '#f59e0b' },
    { city: 'Moscow', country: 'Russia', aqi: 65, status: 'Միջին / Moderate', color: '#f59e0b' },
    { city: 'Berlin', country: 'Germany', aqi: 35, status: 'Լավ / Good', color: '#10b981' },
    { city: 'Rome', country: 'Italy', aqi: 68, status: 'Միջին / Moderate', color: '#f59e0b' },
    { city: 'Beijing', country: 'China', aqi: 110, status: 'Վնասակար / Unhealthy', color: '#ef4444' },
    { city: 'Los Angeles', country: 'USA', aqi: 82, status: 'Միջին / Moderate', color: '#f59e0b' }
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

    const [weatherTab, setWeatherTab] = useState('georgia');
    const [selectedWeatherCity, setSelectedWeatherCity] = useState({
        armenia: 'Yerevan',
        georgia: 'Kobuleti',
        europe: 'Antwerp'
    });

    const [aqiSearchQuery, setAqiSearchQuery] = useState('');
    const [selectedAqiCity, setSelectedAqiCity] = useState('Yerevan');
    const [isAqiDropdownOpen, setIsAqiDropdownOpen] = useState(false);

    const [expandedCurrencyCode, setExpandedCurrencyCode] = useState(null);
    const [timeFrame, setTimeFrame] = useState('daily');
    const [convertAmounts, setConvertAmounts] = useState({ 'USD/AMD': 100, 'EUR/AMD': 100, 'RUB/AMD': 1000, 'GEL/AMD': 100 });

    // ՀՀ շուկայական և բանկային իրական գներին համապատասխանեցված տվյալներ
    const [currencies] = useState([
        {
            code: 'USD/AMD',
            name: 'US Dollar (Market)',
            rate: 391.50,
            change: '+0.25%',
            isUp: true,
            color: '#10b981',
            min: 389.0,
            max: 393.5,
            svgPaths: {
                daily: "M 0 30 C 40 10, 80 40, 120 20 C 160 5, 200 35, 240 15",
                quarter: "M 0 40 C 50 5, 100 35, 150 15 C 180 5, 210 25, 240 8",
                yearly: "M 0 45 C 60 5, 120 40, 180 10 C 200 2, 220 20, 240 5"
            }
        },
        {
            code: 'EUR/AMD',
            name: 'Euro (Market)',
            rate: 412.30,
            change: '-0.10%',
            isUp: false,
            color: '#3b82f6',
            min: 409.0,
            max: 415.0,
            svgPaths: {
                daily: "M 0 20 C 40 40, 80 15, 120 35 C 160 20, 200 40, 240 25",
                quarter: "M 0 10 C 50 45, 100 20, 150 35 C 180 15, 210 40, 240 20",
                yearly: "M 0 5 C 60 45, 120 15, 180 40 C 200 30, 220 10, 240 35"
            }
        },
        {
            code: 'RUB/AMD',
            name: 'Russian Ruble',
            rate: 4.35,
            change: '+0.60%',
            isUp: true,
            color: '#f59e0b',
            min: 4.25,
            max: 4.42,
            svgPaths: {
                daily: "M 0 35 C 40 15, 80 30, 120 10 C 160 25, 200 15, 240 5",
                quarter: "M 0 30 C 50 15, 100 40, 150 10 C 180 30, 210 10, 240 12",
                yearly: "M 0 35 C 60 10, 120 45, 180 20 C 200 10, 220 25, 240 8"
            }
        },
        {
            code: 'GEL/AMD',
            name: 'Georgian Lari',
            rate: 144.20,
            change: '+0.15%',
            isUp: true,
            color: '#ec4899',
            min: 142.5,
            max: 146.0,
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
        setIsAqiDropdownOpen(false);
        navigate('/');
    };

    const renderAnimatedWeatherIcon = (type) => {
        switch (type) {
            case 'sun':
                return <Sun size={42} className="text-amber-400 animate-[spin_10s_linear_infinite]" />;
            case 'rain':
                return <CloudRain size={42} className="text-sky-300 animate-bounce" />;
            case 'waves':
                return <Waves size={42} className="text-cyan-400 animate-pulse" />;
            case 'cloud':
            default:
                return <Cloud size={42} className="text-slate-300 animate-pulse" />;
        }
    };

    const filteredAqiList = WORLD_AIR_QUALITY.filter(item =>
        item.city.toLowerCase().includes(aqiSearchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(aqiSearchQuery.toLowerCase())
    );

    const activeAqiData = WORLD_AIR_QUALITY.find(item => item.city === selectedAqiCity) || WORLD_AIR_QUALITY[0];

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
                    <span className="text-xs sm:text-sm font-normal tracking-widest uppercase text-gray-100 group-hover:text-white select-none drop-shadow-md">
                        WIDGETS
                    </span>
                    <ChevronDown size={16} className={`text-gray-200 transition-transform duration-500 ${isDockOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDockOpen && (
                    <div className="absolute top-[68px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 p-2.5 rounded-3xl border border-white/25 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] transition-all duration-500 ease-out transform scale-100 opacity-100 pointer-events-auto whitespace-nowrap">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveModal('clock'); setIsDockOpen(false); }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/45 to-indigo-500/35 border border-white/35 text-blue-300 hover:border-blue-400 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="World Clocks"
                        >
                            <Globe size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveModal('currency'); setIsDockOpen(false); }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/45 to-teal-500/35 border border-white/35 text-emerald-300 hover:border-emerald-400 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="Market Rates"
                        >
                            <DollarSign size={20} className="group-hover:scale-110 transition-transform duration-500" />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveModal('weather'); setIsDockOpen(false); }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/45 to-cyan-500/35 border border-white/35 text-sky-300 hover:border-sky-400 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="Weather"
                        >
                            <CloudSun size={20} className="group-hover:scale-110 transition-transform duration-500" />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveModal('aqi'); setIsDockOpen(false); }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/45 to-orange-500/35 border border-white/35 text-amber-300 hover:border-amber-400 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group"
                            title="Air Quality"
                        >
                            <Wind size={20} className="group-hover:scale-110 transition-transform duration-500" />
                        </button>
                    </div>
                )}
            </div>

            {isDockOpen && (
                <div className="fixed inset-0 z-[950]" onClick={() => setIsDockOpen(false)} />
            )}

            {/* ԺԱՄԱՑՈՒՅՑՆԵՐԻ ՄՈԴԱԼ */}
            {activeModal === 'clock' && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[90px] sm:pt-[110px] p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto" onClick={handleCloseModal}>
                    <div className="relative w-full max-w-lg sm:max-w-2xl glass-card p-4 sm:p-8 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] my-auto box-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/15 pb-3 sm:pb-4">
                            <div className="w-8 sm:w-10"></div>
                            <div className="flex items-center gap-2 sm:gap-3 text-blue-400 text-sm sm:text-lg font-normal tracking-wider uppercase text-center">
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
                                    <div key={index} onClick={() => setExpandedZoneIndex(index)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-blue-500/60 cursor-pointer transition gap-3 sm:gap-4 group w-full box-border">
                                        <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto min-w-0">
                                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/25 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)] shrink-0">
                                                <div className="absolute w-2 h-2 rounded-full bg-blue-400 z-30"></div>
                                                <div className="absolute w-0.5 bg-blue-400 rounded-full origin-bottom z-20" style={{ height: '12px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}></div>
                                                <div className="absolute w-[1.5px] bg-cyan-300 rounded-full origin-bottom z-20" style={{ height: '16px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}></div>
                                                <div className="absolute w-[0.5px] bg-red-400 rounded-full origin-bottom z-20" style={{ height: '19px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}></div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm sm:text-base font-normal text-white break-words leading-snug">{currentObj ? currentObj.label : zone}</p>
                                                <p className="text-xs text-gray-400 font-light mt-0.5">{dateStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-white/10 box-border">
                                            <span className="text-lg sm:text-xl font-normal text-blue-300 tracking-wider">
                                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                            </span>
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/15 text-gray-400 group-hover:text-blue-400 transition shrink-0">
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

            {/* ՏԱՐԱԴՐԱՄՆԵՐԻ ՄՈԴԱԼ (ՀՀ շուկայական իրական փոխարժեքներով) */}
            {activeModal === 'currency' && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[90px] sm:pt-[110px] p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto" onClick={handleCloseModal}>
                    <div className="relative w-full max-w-lg sm:max-w-2xl glass-card p-4 sm:p-8 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] my-auto box-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/15 pb-3 sm:pb-4">
                            <div className="w-8 sm:w-10"></div>
                            <div className="flex items-center gap-2 sm:gap-3 text-emerald-400 text-sm sm:text-lg font-normal tracking-wider uppercase text-center">
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
                                    <div key={index} onClick={() => setExpandedCurrencyCode(isExpanded ? null : item.code)} className="p-3.5 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 w-full box-border">
                                        <div className="flex items-center justify-between gap-3 w-full box-border">
                                            <div className="flex flex-col min-w-0 flex-1 pr-2">
                                                <span className="font-normal text-white text-sm sm:text-base truncate">{item.code}</span>
                                                <span className="text-xs text-gray-400 font-light truncate">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                <span className="font-medium text-white text-base sm:text-lg">{item.rate} ֏</span>
                                                <div className="flex items-center gap-1.5 text-xs font-light px-2 py-1 rounded-xl border shrink-0" style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
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
                                                    <button type="button" onClick={() => setTimeFrame('daily')} className={`px-3 py-1 rounded-xl text-xs font-light transition-all ${timeFrame === 'daily' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}>{t('daily') || 'Օր'}</button>
                                                    <button type="button" onClick={() => setTimeFrame('quarter')} className={`px-3 py-1 rounded-xl text-xs font-light transition-all ${timeFrame === 'quarter' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}>{t('quarter') || 'Եռամսյակ'}</button>
                                                    <button type="button" onClick={() => setTimeFrame('yearly')} className={`px-3 py-1 rounded-xl text-xs font-light transition-all ${timeFrame === 'yearly' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}>{t('yearly') || 'Տարի'}</button>
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
                                                        <path d={currentPath} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" />
                                                        <circle cx="120" cy="20" r="3.5" fill={item.color} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                                    </svg>
                                                </div>

                                                <div className="flex justify-between text-xs text-gray-400 font-light px-1 w-full box-border">
                                                    <span>{t('minRate') || 'Նվազագույն'}: <strong className="text-white font-normal">{item.min} ֏</strong></span>
                                                    <span>{t('maxRate') || 'Առավելագույն'}: <strong className="text-white font-normal">{item.max} ֏</strong></span>
                                                </div>

                                                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 flex flex-col gap-2 w-full box-border">
                                                    <span className="text-xs font-normal text-gray-300">{t('converterTitle') || 'Արժույթի փոխարկիչ'}</span>
                                                    <div className="flex items-center justify-between gap-3 w-full box-border">
                                                        <input type="number" value={currentAmount} onChange={(e) => setConvertAmounts({ ...convertAmounts, [item.code]: e.target.value })} className="w-1/2 bg-[#0d1322] text-white text-base py-2 px-3 rounded-xl border border-white/20 outline-none focus:border-emerald-500 font-light box-border" placeholder={t('enterAmount') || 'Գումարը'} />
                                                        <span className="text-sm font-normal text-emerald-400 w-1/2 text-right truncate">{convertedResult} ֏</span>
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

            {/* ԵՂԱՆԱԿԻ ՎԻՋԵԹԻ ՄՈԴԱԼ */}
            {activeModal === 'weather' && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[90px] sm:pt-[110px] p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto" onClick={handleCloseModal}>
                    <div className="relative w-full max-w-lg sm:max-w-2xl glass-card p-4 sm:p-8 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] my-auto box-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/15 pb-3 sm:pb-4">
                            <div className="w-8 sm:w-10"></div>
                            <div className="flex items-center gap-2 sm:gap-3 text-sky-400 text-sm sm:text-lg font-normal tracking-wider uppercase text-center">
                                <CloudSun size={24} className="shrink-0" />
                                <span>{t('weatherTitle') || 'Եղանակային պայմաններ'}</span>
                            </div>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/15 transition cursor-pointer shrink-0">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex justify-center gap-2 mb-6 w-full">
                            <button type="button" onClick={() => setWeatherTab('georgia')} className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-light transition-all ${weatherTab === 'georgia' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                                {t('regionGeorgia') || 'Վրաստան'}
                            </button>
                            <button type="button" onClick={() => setWeatherTab('armenia')} className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-light transition-all ${weatherTab === 'armenia' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                                {t('regionArmenia') || 'Հայաստան'}
                            </button>
                            <button type="button" onClick={() => setWeatherTab('europe')} className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-light transition-all ${weatherTab === 'europe' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                                {t('regionEurope') || 'Եվրոպա'}
                            </button>
                        </div>

                        <div className="space-y-4 w-full box-border">
                            {(() => {
                                const currentCityList = WEATHER_REGIONS[weatherTab];
                                const activeCityName = selectedWeatherCity[weatherTab] || currentCityList[0].name;
                                const cityData = currentCityList.find(c => c.name === activeCityName) || currentCityList[0];

                                return (
                                    <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-500/20 via-sky-900/10 to-transparent border border-sky-500/40 flex flex-col items-center text-center shadow-inner">
                                        <div className="my-2">{renderAnimatedWeatherIcon(cityData.type)}</div>
                                        <h3 className="text-xl sm:text-2xl font-normal text-white mt-2">{cityData.name}</h3>
                                        <p className="text-3xl sm:text-4xl font-light text-sky-300 my-1">{cityData.temp}</p>
                                        <p className="text-xs sm:text-sm font-light text-gray-300 mb-4">{cityData.condition}</p>

                                        <div className="flex items-center gap-6 text-xs text-gray-300 border-t border-white/10 pt-3 w-full justify-center">
                                            <div className="flex items-center gap-1.5">
                                                <Droplets size={14} className="text-sky-400" />
                                                <span>{t('humidity') || 'Խոնավություն'}: <strong className="font-normal">{cityData.humidity}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Wind size={14} className="text-sky-400" />
                                                <span>{t('wind') || 'Քամի'}: <strong className="font-normal">{cityData.wind}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 justify-items-center">
                                {WEATHER_REGIONS[weatherTab].map((city, idx, arr) => {
                                    const isLastSingle = arr.length % 2 !== 0 && idx === arr.length - 1;

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedWeatherCity({ ...selectedWeatherCity, [weatherTab]: city.name })}
                                            className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between w-full box-border ${selectedWeatherCity[weatherTab] === city.name ? 'bg-sky-500/30 border-sky-400 text-white' : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'} ${isLastSingle ? 'col-span-2 sm:col-span-1 justify-self-center max-w-[50%] sm:max-w-none' : ''}`}
                                        >
                                            <span className="text-xs font-light truncate">{city.name}</span>
                                            <span className="text-xs font-normal text-sky-300 ml-1">{city.temp}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ՕԴԻ ՈՐԱԿԻ ՎԻՋԵԹԻ ՄՈԴԱԼ (AQI) */}
            {activeModal === 'aqi' && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[90px] sm:pt-[110px] p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto" onClick={handleCloseModal}>
                    <div className="relative w-full max-w-lg sm:max-w-2xl glass-card p-4 sm:p-8 rounded-3xl border border-white/25 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_25px_70px_rgba(0,0,0,0.95)] my-auto box-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/15 pb-3 sm:pb-4">
                            <div className="w-8 sm:w-10"></div>
                            <div className="flex items-center gap-2 sm:gap-3 text-amber-400 text-sm sm:text-lg font-normal tracking-wider uppercase text-center">
                                <Wind size={24} className="shrink-0" />
                                <span>{t('airQualityTitle') || 'Օդի որակը (AQI)'}</span>
                            </div>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/15 transition cursor-pointer shrink-0">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 relative w-full box-border">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                value={aqiSearchQuery}
                                onChange={(e) => {
                                    setAqiSearchQuery(e.target.value);
                                    setIsAqiDropdownOpen(true);
                                }}
                                onFocus={() => setIsAqiDropdownOpen(true)}
                                placeholder={t('searchCityPlaceholder') || 'Որոնել քաղաք աշխարհում...'}
                                className="w-full bg-[#0d1322] text-white text-base py-2.5 pl-10 pr-4 rounded-2xl border border-white/20 outline-none focus:border-amber-500 font-light box-border shadow-inner"
                            />

                            {isAqiDropdownOpen && filteredAqiList.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d1322] border border-white/20 rounded-2xl shadow-2xl max-h-52 overflow-y-auto z-50 box-border">
                                    {filteredAqiList.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setSelectedAqiCity(item.city);
                                                setAqiSearchQuery('');
                                                setIsAqiDropdownOpen(false);
                                            }}
                                            className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center justify-between transition border-b border-white/5 last:border-0"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-sm text-white font-light">{item.city}</span>
                                                <span className="text-xs text-gray-400 font-light">({item.country})</span>
                                            </div>
                                            <span className="text-xs font-light px-2.5 py-0.5 rounded-lg border" style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
                                                AQI: {item.aqi}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-900/5 to-transparent border border-amber-500/40 flex items-center justify-between shadow-inner w-full box-border">
                            <div className="flex items-center gap-4 min-w-0 flex-1 pr-2">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-normal text-white text-lg shadow-md shrink-0" style={{ backgroundColor: activeAqiData.color }}>
                                    {activeAqiData.aqi}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-normal text-white text-base sm:text-lg truncate">{activeAqiData.city}</h3>
                                    <p className="text-xs text-gray-400 font-light truncate">{activeAqiData.country} • {activeAqiData.status}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-xs font-light px-3.5 py-1.5 rounded-xl border inline-block" style={{ color: activeAqiData.color, backgroundColor: `${activeAqiData.color}15`, borderColor: `${activeAqiData.color}40` }}>
                                    Live AQI
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 w-full box-border">
                            {WORLD_AIR_QUALITY.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedAqiCity(item.city)}
                                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all w-full box-border ${selectedAqiCity === item.city ? 'bg-amber-500/20 border-amber-400/60 shadow-md' : 'bg-white/[0.04] border-white/15 hover:border-white/30'}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-light text-white text-xs shadow-sm shrink-0" style={{ backgroundColor: item.color }}>
                                            {item.aqi}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-normal text-white text-xs sm:text-sm truncate">{item.city}</h4>
                                            <p className="text-[11px] text-gray-400 font-light truncate">{item.country} • {item.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[11px] font-light px-2.5 py-1 rounded-lg border inline-block" style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
                                            {item.status.split('/')[0]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Ժամային գոտու փոփոխման մոդալ */}
            {expandedZoneIndex !== null && (
                <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setExpandedZoneIndex(null)}>
                    <div className="relative w-full max-w-md glass-card p-6 sm:p-8 rounded-3xl bg-[#0b0f19] border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.4)] flex flex-col items-center box-border" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => setExpandedZoneIndex(null)} className="absolute top-4 right-4 text-gray-300 hover:text-white p-2">
                            <X size={20} />
                        </button>
                        <span className="text-xs sm:text-sm font-normal text-blue-400 tracking-wider uppercase mb-3 text-center">
                            Փոխել ժամային գոտին
                        </span>
                        <div className="w-full mb-6 text-center">
                            <p className="text-sm text-gray-300 font-light">Ընտրեք նոր քաղաք կամ գոտի #{expandedZoneIndex + 1}-ի համար</p>
                        </div>
                        <div className="w-full box-border">
                            <select
                                value={selectedZones[expandedZoneIndex]}
                                onChange={(e) => {
                                    handleZoneChange(expandedZoneIndex, e.target.value);
                                    setExpandedZoneIndex(null);
                                }}
                                className="w-full bg-[#0d1322] text-gray-100 text-sm sm:text-base py-3.5 px-4 rounded-2xl border border-white/20 outline-none cursor-pointer hover:border-blue-500 focus:border-blue-500 shadow-inner text-center font-normal box-border"
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