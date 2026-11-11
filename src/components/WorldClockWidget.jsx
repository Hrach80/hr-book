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
            {/* Ֆիքսված դիրք նավիգացիայից փոքր-ինչ ներքև (top-20) */}
            {!isOpen && (
                <div className="fixed left-4 top-20 z-40">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 text-blue-400 hover:bg-white/[0.08] hover:border-blue-500/40 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] group flex items-center justify-center cursor-pointer"
                        title="Բացել ժամացույցները"
                    >
                        <Globe size={18} className="text-blue-400 group-hover:rotate-45 transition-transform duration-700 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                    </button>
                </div>
            )}

            {/* Բացվող պատուհանը (Modal) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-sm sm:max-w-md glass-card p-4 sm:p-5 rounded-3xl bg-[#0b0f19]/95 border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">

                        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-3.5 relative z-10 border-b border-white/10 pb-2">
                            <div className="w-6"></div>

                            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold tracking-wider uppercase">
                                <Globe size={16} className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                                    {t('worldClocks')}
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

                        <div className="grid grid-cols-3 gap-2.5 relative z-10">
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
                                        className="flex flex-col items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-1.5 right-1.5 text-gray-500 group-hover:text-blue-400 transition-colors">
                                            <Maximize2 size={10} />
                                        </div>

                                        <div className="relative w-12 h-12 rounded-full border border-white/15 bg-gradient-to-b from-[#060911] to-[#0b101d] flex items-center justify-center mb-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]">
                                            <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 z-30"></div>

                                            <div
                                                className="absolute w-0.5 bg-blue-400 rounded-full origin-bottom z-20"
                                                style={{ height: '14px', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}
                                            ></div>
                                            <div
                                                className="absolute w-[1px] bg-cyan-300 rounded-full origin-bottom z-20"
                                                style={{ height: '18px', bottom: '50%', transform: `rotate(${minuteDeg}deg)` }}
                                            ></div>
                                            <div
                                                className="absolute w-[1px] bg-red-400 rounded-full origin-bottom z-20"
                                                style={{ height: '20px', bottom: '50%', transform: `rotate(${secondDeg}deg)` }}
                                            ></div>
                                        </div>

                                        <p className="text-xs font-bold tracking-wider text-white mb-1">
                                            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                                        </p>

                                        <span className="text-[10px] text-gray-300 font-medium truncate w-full text-center">
                                            {currentObj ? currentObj.short : zone.split('/')[1]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Մեծացված պատուհան (Modal) */}
            {expandedZone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
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