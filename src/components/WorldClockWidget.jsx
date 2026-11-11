import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TIMEZONES = [
    { label: 'Yerevan (GMT+4)', value: 'Asia/Yerevan' },
    { label: 'Antwerp / Brussels (GMT+1/2)', value: 'Europe/Brussels' },
    { label: 'Los Angeles (GMT-8/-7)', value: 'America/Los_Angeles' },
    { label: 'Paris (GMT+1/2)', value: 'Europe/Paris' },
    { label: 'London (GMT+0/1)', value: 'Europe/London' },
    { label: 'Berlin (GMT+1/2)', value: 'Europe/Berlin' },
    { label: 'New York (GMT-5/-4)', value: 'America/New_York' },
    { label: 'Dubai (GMT+4)', value: 'Asia/Dubai' },
    { label: 'Tokyo (GMT+9)', value: 'Asia/Tokyo' },
    { label: 'Moscow (GMT+3)', value: 'Europe/Moscow' },
];

export default function WorldClockWidget() {
    const { t } = useLanguage();
    const [time, setTime] = useState(new Date());

    const [selectedZones, setSelectedZones] = useState([
        'Asia/Yerevan',
        'Europe/Brussels',
        'America/Los_Angeles'
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

            return { hours, minutes, seconds };
        } catch (e) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
    };

    return (
        <div className="glass-card p-6 rounded-3xl mb-6 relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

            {/* Հետին ֆոնի շարժվող նեոնային լույսեր (Glow Gradients) */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold tracking-wider uppercase">
                    <Globe size={16} className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{t('worldClocks')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {selectedZones.map((zone, index) => {
                    const { hours, minutes, seconds } = getTimeComponents(zone);

                    const secondDeg = (seconds / 60) * 360;
                    const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
                    const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] group relative overflow-hidden"
                        >
                            {/* Նրբագեղ պտտվող լույսի շերտ քարտի հետևում (Hover effect) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {/* Անալոգային Ժամացույց */}
                            <div className="relative w-20 h-20 rounded-full border border-white/15 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center mb-3 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_0_20px_rgba(59,130,246,0.25)] transition-all duration-500">

                                {/* Կենտրոնական փայլող կետ */}
                                <div className="absolute w-2 h-2 rounded-full bg-blue-400 z-30 shadow-[0_0_10px_#60a5fa,0_0_20px_#3b82f6]"></div>

                                {/* Ժամացույցի սլաքներ */}
                                <div
                                    className="absolute w-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full origin-bottom z-20 shadow-[0_0_4px_rgba(59,130,246,0.5)] transition-transform duration-100"
                                    style={{ height: '22px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}
                                ></div>

                                <div
                                    className="absolute w-0.5 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full origin-bottom z-20 shadow-[0_0_4px_rgba(6,182,212,0.5)] transition-transform duration-100"
                                    style={{ height: '28px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}
                                ></div>

                                <div
                                    className="absolute w-[1px] bg-red-400 rounded-full origin-bottom z-20 shadow-[0_0_6px_rgba(248,113,113,0.9)]"
                                    style={{ height: '32px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}
                                ></div>

                                {/* Նեոնային ներքին օղակ */}
                                <div className="absolute inset-1 rounded-full border border-blue-500/15 pointer-events-none"></div>
                            </div>

                            {/* Թվային ժամանակ */}
                            <p className="text-lg font-bold tracking-wider mb-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </p>

                            {/* Ոճավորված Ժամային գոտու ընտրության ցանկ (Dropdown) */}
                            <div className="relative w-full">
                                <select
                                    value={zone}
                                    onChange={(e) => handleZoneChange(index, e.target.value)}
                                    className="w-full bg-[#0d1322] text-gray-200 text-xs py-2 px-3 rounded-xl border border-white/10 outline-none cursor-pointer hover:border-blue-500/60 focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all text-center appearance-none shadow-inner"
                                >
                                    {TIMEZONES.map((tz) => (
                                        <option key={tz.value} value={tz.value} className="bg-[#0b0f19] text-white py-1">
                                            {tz.label}
                                        </option>
                                    ))}
                                </select>
                                {/* Փոքրիկ սլաքի ինդիկատոր */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}