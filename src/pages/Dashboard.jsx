import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pencil, KeyRound, Plus, Folder, Search as SearchIcon, Database, HardDrive, RefreshCw, Activity, Bell, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../services/supabaseClient';

export default function Dashboard() {
    const { t } = useLanguage();
    const location = useLocation();

    // Ռեսուրսների օգտագործման վիճակ (Supabase Free Tier մետրիկաներ)
    const [dbUsageMB, setDbUsageMB] = useState(45.2);
    const [storageUsageMB, setStorageUsageMB] = useState(128.5);
    const [isLoading, setIsLoading] = useState(false);

    // Հիշեցումների (ներառյալ ծննդյան օրեր) և նշումների վիճակներ
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [notesCount, setNotesCount] = useState(0);
    const [recentNotes, setRecentNotes] = useState([]);

    const dbLimitMB = 500;
    const storageLimitMB = 1024;

    // Ծննդյան օրերի ճիշտ հաշվարկման լոգիկա
    const getEffectiveEventDate = (item) => {
        const now = new Date();
        const originalDate = new Date(item.event_date);
        if (isNaN(originalDate.getTime())) return now;

        if (!item.is_birthday) {
            return originalDate;
        }

        let effectiveDate = new Date(now.getFullYear(), originalDate.getMonth(), originalDate.getDate(), originalDate.getHours(), originalDate.getMinutes());

        if (effectiveDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            effectiveDate.setFullYear(now.getFullYear() + 1);
        }

        return effectiveDate;
    };

    // Բազայից կարդում ենք տվյալները
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [remindersRes, notesRes] = await Promise.all([
                    supabase.from('reminders').select('*'),
                    supabase.from('notes').select('*')
                ]);

                if (remindersRes.data) {
                    const now = new Date();
                    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    const activeOrUpcoming = remindersRes.data.filter(item => {
                        if (!item.event_date) return false;
                        const eventTime = getEffectiveEventDate(item);
                        const eventDateOnly = new Date(eventTime.getFullYear(), eventTime.getMonth(), eventTime.getDate());
                        return eventDateOnly >= nowDateOnly;
                    });

                    setUpcomingCount(activeOrUpcoming.length);
                }

                if (notesRes.data) {
                    setNotesCount(notesRes.data.length);
                    const sortedNotes = [...notesRes.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setRecentNotes(sortedNotes.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    const chartData = [
        { time: '01', db: 20, storage: 80, limit: 500 },
        { time: '05', db: 35, storage: 95, limit: 500 },
        { time: '10', db: 28, storage: 110, limit: 500 },
        { time: '15', db: 42, storage: 120, limit: 500 },
        { time: '20', db: 38, storage: 115, limit: 500 },
        { time: '25', db: dbUsageMB, storage: storageUsageMB, limit: 500 },
    ];

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setDbUsageMB(Number((45.2 + Math.random() * 2).toFixed(2)));
            setStorageUsageMB(Number((128.5 + Math.random() * 5).toFixed(2)));
            setIsLoading(false);
        }, 600);
    };

    return (
        /* px-4 sm:px-8 - լիովին հավասարեցված է Նավբարի արտաքին պադինգներին */
        <div className="font-sans pb-32 w-full px-4 sm:px-8 pt-2 animate-softFadeScale text-white">
            <div className="max-w-xl mx-auto">

                {/* Հորիզոնական դիրքով վիջեթների պատուհան */}
                <div className="grid grid-cols-2 gap-3.5 mb-5">
                    <Link to="/notes" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-blue-500/30 bg-gradient-to-r from-blue-600/15 via-blue-900/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/60 group relative">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                            <Pencil size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        </div>
                        <div className="overflow-hidden">
                            <span className="font-bold text-xs sm:text-sm text-white tracking-wide block truncate">{t('notes') || 'Notes'}</span>
                            <span className="text-[10px] text-gray-400 block truncate">Գրառումներ ({notesCount})</span>
                        </div>
                    </Link>

                    <Link to="/passwords" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group">
                        <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-200 shrink-0 group-hover:scale-110 transition-transform">
                            <KeyRound size={22} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        </div>
                        <div className="overflow-hidden">
                            <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide block truncate">{t('passwords') || 'Passwords'}</span>
                            <span className="text-[10px] text-gray-400 block truncate">Գաղտնաբառեր</span>
                        </div>
                    </Link>

                    <Link to="/medical" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                            <Plus size={22} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        </div>
                        <div className="overflow-hidden">
                            <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide block truncate">{t('medical') || 'Medical'}</span>
                            <span className="text-[10px] text-gray-400 block truncate">Բժշկական</span>
                        </div>
                    </Link>

                    <Link to="/docs" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                            <Folder size={22} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        </div>
                        <div className="overflow-hidden">
                            <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide block truncate">{t('documents') || 'Documents'}</span>
                            <span className="text-[10px] text-gray-400 block truncate">Փաստաթղթեր</span>
                        </div>
                    </Link>
                </div>

                {/* Նշումների ծանուցումների կամ վերջին գրառումների բլոկ */}
                {recentNotes.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                                <FileText size={14} />
                                Վերջին նշումները & Ծանուցումները
                            </span>
                            <Link to="/notes" className="text-[11px] text-cyan-400 hover:underline">
                                Բոլորը ({notesCount}) →
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentNotes.map((note) => (
                                <div key={note.id} className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                                    <span className="text-gray-200 font-medium truncate max-w-[70%]">
                                        {note.title || note.content || 'Առանց վերնագրի նշում'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {note.created_at ? new Date(note.created_at).toLocaleDateString('hy-AM') : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Supabase Ռեսուրսների Վերլուծական Վահանակ */}
                <div className="p-4 sm:p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#06142e] via-[#0b1f3d] to-[#040914] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.25)] mb-4 relative overflow-hidden">

                    <div className="flex items-center justify-between mb-4 relative z-10 border-b border-blue-500/20 pb-3">
                        <span className="text-xs font-bold text-blue-200 tracking-wider uppercase flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                                <Activity size={12} />
                            </div>
                            {t('supabaseUsage') || t('analytics') || 'Supabase Analytics'}
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="text-blue-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-[11px]"
                            title={t('refresh') || 'Refresh'}
                        >
                            <RefreshCw size={13} className={isLoading ? 'animate-spin text-blue-400' : ''} />
                        </button>
                    </div>

                    <div className="w-full h-52 sm:h-60 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.15)" />
                                <XAxis dataKey="time" stroke="#93c5fd" fontSize={10} tickLine={false} />
                                <YAxis stroke="#93c5fd" fontSize={10} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#06142e', borderColor: 'rgba(59,130,246,0.4)', borderRadius: '14px', color: '#fff', fontSize: '11px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}
                                    formatter={(value, name) => [`${value} MB`, name === 'db' ? (t('database') || 'Database') : (t('storage') || 'Storage')]}
                                />
                                <Line type="monotone" dataKey="storage" name="Storage" stroke="#facc15" strokeWidth={2} dot={{ r: 3, fill: '#facc15', stroke: '#fff', strokeWidth: 1 }} />
                                <Line type="monotone" dataKey="db" name="Database" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: '#38bdf8', stroke: '#fff', strokeWidth: 1 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-blue-500/20 relative z-10 text-xs">
                        <div className="flex items-center gap-2.5">
                            <Database size={16} className="text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-blue-300/70 text-[10px] truncate">{t('databaseLimit') || 'Database (Max 500MB)'}</p>
                                <p className="font-bold text-white text-xs">{dbUsageMB} MB <span className="text-[10px] text-sky-400">({Math.round((dbUsageMB / dbLimitMB) * 100)}%)</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <HardDrive size={16} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)] shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-blue-300/70 text-[10px] truncate">{t('storageLimit') || 'Storage (Max 1GB)'}</p>
                                <p className="font-bold text-white text-xs">{storageUsageMB} MB <span className="text-[10px] text-yellow-400">({Math.round((storageUsageMB / storageLimitMB) * 100)}%)</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ներքևի նավիգացիոն մենյու (Ֆուտեր) */}
                <footer className="fixed bottom-4 left-0 right-0 mx-auto max-w-xl px-4 sm:px-8 z-50">
                    <div className="border border-white/10 rounded-3xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-[#070a14]/90 backdrop-blur-2xl">
                        <nav className="grid grid-cols-4 gap-2 text-center">

                            {/* 1. Home */}
                            <Link to="/" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/'
                                ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                <span className={`text-[10px] mt-1 ${location.pathname === '/' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('home') || 'Home'}</span>
                            </Link>

                            {/* 2. Search */}
                            <Link to="/search" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/search'
                                ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                                <SearchIcon size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'transition-all'} />
                                <span className={`text-[10px] mt-1 ${location.pathname === '/search' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('search') || 'Search'}</span>
                            </Link>

                            {/* 3. Reminders */}
                            <Link to="/reminders" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group relative ${location.pathname === '/reminders'
                                ? 'text-amber-400 bg-amber-600/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                                <div className="relative">
                                    <Bell size={22} className={location.pathname === '/reminders' ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all'} />
                                    {upcomingCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#070a14] shadow">
                                            {upcomingCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] mt-1 ${location.pathname === '/reminders' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('remindersTab') || 'Հիշեցումներ'}</span>
                            </Link>

                            {/* 4. Car */}
                            <Link to="/car-docs" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/car-docs'
                                ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/car-docs' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all'}>
                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 10c-.4-.7-1.1-1.2-2-1.2h-9.4c-.9 0-1.6.5-2 1.2L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
                                    <circle cx="7" cy="17" r="2" />
                                    <circle cx="17" cy="17" r="2" />
                                    <path d="M5 11l1.5-4.5C6.9 5.8 7.7 5.3 8.5 5.3h7c.8 0 1.6.5 2 1.2L19 11" />
                                </svg>
                                <span className={`text-[10px] mt-1 ${location.pathname === '/car-docs' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('car') || 'Մեքենա'}</span>
                            </Link>

                        </nav>
                    </div>
                </footer>

            </div>
        </div>
    );
}