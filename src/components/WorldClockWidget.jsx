import React, { useState, useEffect } from 'react';
import { Globe, Maximize2, X } from 'lucide-react';
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

export default function WorldClockWidget() {
    const { t } = useLanguage();
    const [time, setTime] = useState(new Date());

    const [selectedZones, setSelectedZones] = useState([
        'Asia/Yerevan',
        'Europe/Brussels',
        'America/Los_Angeles'
    ]);

    const [isOpen, setIsOpen] = useState(false);
    const [expandedZone, setExpandedZone] = useState(null);

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

    return (
        <>
            {/* Ֆիքսված իկոնա ամենաբարձր շերտով (z-[90]) */}
            <div className="fixed left-4 sm:left-8 top-28 sm:top-32 z-[90]">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-white/15 text-blue-400 hover:border-blue-500/60 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.25)] group flex items-center justify-center cursor-pointer active:scale-95"
                        title="Բացել ժամացույցները"
                    >
                        <Globe size={22} className="text-blue-400 group-hover:rotate-45 transition-transform duration-700 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    </button>
                )}
            </div>

            {/* Բացվող պատուհան՝ բացարձակ ամենաբարձր շերտում (z-[100]) */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-8 bg-black/60 backdrop-blur-md transition-opacity duration-500">
                    <div className="relative w-full max-w-7xl glass-card p-5 sm:p-6 rounded-3xl border border-white/20 bg-gradient-to-br from-[#0b0f19]/95 via-[#101726]/90 to-[#070a12]/98 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-500 ease-out transform translate-x-0 opacity-100 animate-[slideRight_0.4s_cubic-bezier(0.16,1,0.3,1)]">

                        {/* Հետին ֆոնի նեոնային լույսեր */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Վերնագիրը */}
                        <div className="flex items-center justify-between mb-4 relative z-10 border-b border-white/10 pb-3">
                            <div className="w-6"></div>

                            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wider uppercase">
                                <Globe size={18} className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                                    {t('worldClocks') || 'World Clocks'}
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

                        {/* Ժամացույցների բովանդակություն */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10">
                            {selectedZones.map((zone, index) => {
                                const { hours, minutes, seconds } = getTimeComponents(zone);

                                const secondDeg = (seconds / 60) * 360;
                                const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
                                const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

                                const currentObj = TIMEZONES.find(item => item.value === zone);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setExpandedZone(zone)}
                                        className="flex flex-col items-center p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 right-2 text-gray-500 group-hover:text-blue-400 transition-colors">
                                            <Maximize2 size={12} />
                                        </div>

                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/15 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center mb-2.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]">
                                            <div className="absolute w-2 h-2 rounded-full bg-blue-400 z-30"></div>

                                            <div
                                                className="absolute w-1 bg-blue-400 rounded-full origin-bottom z-20"
                                                style={{ height: '18px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}
                                            ></div>
                                            <div
                                                className="absolute w-[1.5px] bg-cyan-300 rounded-full origin-bottom z-20"
                                                style={{ height: '26px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}
                                            ></div>
                                            <div
                                                className="absolute w-[1px] bg-red-400 rounded-full origin-bottom z-20"
                                                style={{ height: '30px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}
                                            ></div>
                                        </div>

                                        <p className="text-sm sm:text-base font-extrabold tracking-wider text-white mb-1">
                                            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                                        </p>

                                        <span className="text-xs text-gray-300 font-medium truncate w-full text-center">
                                            {currentObj ? currentObj.short : zone.split('/')[1]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Մեծացված մանրամասների պատուհան (Modal) */}
            {expandedZone && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-sm glass-card p-6 rounded-3xl bg-[#0b0f19] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] flex flex-col items-center">

                        <button
                            onClick={() => setExpandedZone(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
                            Ժամային գոտու մանրամասներ
                        </span>

                        <div className="relative w-36 h-36 rounded-full border-2 border-blue-500/30 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center mb-5 shadow-[inset_0_6px_20px_rgba(0,0,0,0.9),0_0_25px_rgba(59,130,246,0.2)]">
                            <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-400 z-30 shadow-[0_0_10px_#60a5fa]"></div>

                            {(() => {
                                const { hours, minutes, seconds } = getTimeComponents(expandedZone);
                                const secondDeg = (seconds / 60) * 360;
                                const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
                                const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

                                return (
                                    <>
                                        <div
                                            className="absolute w-1.5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full origin-bottom z-20"
                                            style={{ height: '42px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}
                                        ></div>
                                        <div
                                            className="absolute w-1 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full origin-bottom z-20"
                                            style={{ height: '54px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}
                                        ></div>
                                        <div
                                            className="absolute w-0.5 bg-red-400 rounded-full origin-bottom z-20 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
                                            style={{ height: '60px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}
                                        ></div>
                                    </>
                                );
                            })()}
                        </div>

                        {(() => {
                            const { hours, minutes, seconds, dateStr } = getTimeComponents(expandedZone);
                            return (
                                <div className="text-center mb-6">
                                    <p className="text-3xl font-extrabold text-white tracking-widest mb-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                                        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                    </p>
                                    <p className="text-xs text-blue-300 font-medium mb-3">{dateStr}</p>
                                </div>
                            );
                        })()}

                        <div className="w-full">
                            <label className="text-[10px] text-gray-400 mb-1 block text-center">Փոխել քաղաքը / գոտին</label>
                            <select
                                value={expandedZone}
                                onChange={(e) => {
                                    const newZ = e.target.value;
                                    setExpandedZone(newZ);
                                    const idx = selectedZones.findIndex(z => z === expandedZone);
                                    if (idx !== -1) {
                                        handleZoneChange(idx, newZ);
                                    }
                                }}
                                className="w-full bg-[#0d1322] text-gray-200 text-xs py-2.5 px-3 rounded-xl border border-white/15 outline-none cursor-pointer hover:border-blue-500 focus:border-blue-500 shadow-inner text-center"
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
        </>
    );
}