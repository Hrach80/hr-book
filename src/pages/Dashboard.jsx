import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, KeyRound, Plus, Folder, User, Search, Database, HardDrive, RefreshCw, Activity, Car, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


export default function Dashboard() {
    const { t } = useLanguage();

    // Ռեսուրսների օգտագործման վիճակ (Supabase Free Tier մետրիկաներ)
    const [dbUsageMB, setDbUsageMB] = useState(45.2);
    const [storageUsageMB, setStorageUsageMB] = useState(128.5);
    const [isLoading, setIsLoading] = useState(false);

    const dbLimitMB = 500;  // Supabase Free Tier Բազայի լիմիտը (500 ՄԲ)
    const storageLimitMB = 1024; // Supabase Free Tier Պահոցի լիմիտը (1 ԳԲ)

    // Վերլուծական գրաֆիկի տվյալներ
    const chartData = [
        { time: '01', db: 20, storage: 80, limit: 500 },
        { time: '05', db: 35, storage: 95, limit: 500 },
        { time: '10', db: 28, storage: 110, limit: 500 },
        { time: '15', db: 42, storage: 120, limit: 500 },
        { time: '20', db: 38, storage: 115, limit: 500 },
        { time: '25', db: dbUsageMB, storage: storageUsageMB, limit: 500 },
    ];

    // Թարմացման ֆունկցիա
    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setDbUsageMB(Number((45.2 + Math.random() * 2).toFixed(2)));
            setStorageUsageMB(Number((128.5 + Math.random() * 5).toFixed(2)));
            setIsLoading(false);
        }, 600);
    };

    return (
        <div className="font-sans pb-28 max-w-3xl mx-auto px-4 pt-0 -mt-2 sm:-mt-1">

            {/* Հիմնական բաժինների ցանցը */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <Link to="/notes" className="glass-card p-3.5 rounded-2xl flex flex-col items-center justify-center text-center h-22 sm:h-26 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-blue-500/30 bg-gradient-to-br from-blue-600/15 via-blue-900/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/60 group">
                    <Pencil className="text-blue-400 mb-1 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform" size={22} />
                    <span className="font-bold text-xs sm:text-sm text-white tracking-wide">{t('notes') || 'Notes'}</span>
                </Link>

                <Link to="/passwords" className="glass-card p-3.5 rounded-2xl flex flex-col items-center justify-center text-center h-22 sm:h-26 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group">
                    <KeyRound className="text-gray-300 mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform" size={22} />
                    <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide">{t('passwords') || 'Passwords'}</span>
                </Link>

                <Link to="/medical" className="glass-card p-3.5 rounded-2xl flex flex-col items-center justify-center text-center h-22 sm:h-26 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group">
                    <Plus className="text-emerald-400 mb-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform" size={22} />
                    <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide">{t('medical') || 'Medical'}</span>
                </Link>

                <Link to="/docs" className="glass-card p-3.5 rounded-2xl flex flex-col items-center justify-center text-center h-22 sm:h-26 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group">
                    <Folder className="text-amber-400 mb-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform" size={22} />
                    <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide">{t('documents') || 'Documents'}</span>
                </Link>
            </div>

            {/* Supabase Ռեսուրսների Վերլուծական Վահանակ (Մեծացված բարձրությամբ դեպի ներքև) */}
            <div className="p-4 sm:p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#06142e] via-[#0b1f3d] to-[#040914] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.25)] mb-3 relative overflow-hidden">

                <div className="flex items-center justify-between mb-3.5 relative z-10 border-b border-blue-500/20 pb-3">
                    <span className="text-xs font-bold text-blue-200 tracking-wider uppercase flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                            <Activity size={12} />
                        </div>
                        {t('supabaseUsage') || t('analytics') || 'Supabase Analytics & Usage'}
                    </span>
                    <button
                        onClick={handleRefresh}
                        className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-[11px]"
                        title={t('refresh') || 'Refresh'}
                    >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin text-blue-400' : ''} />
                    </button>
                </div>

                {/* Վերլուծական գրաֆիկ (ավելի մեծ բարձրությամբ՝ h-52 / h-60) */}
                <div className="w-full h-52 sm:h-60 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                            <XAxis dataKey="time" stroke="#93c5fd" fontSize={10} tickLine={false} />
                            <YAxis stroke="#93c5fd" fontSize={10} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#06142e', borderColor: 'rgba(59,130,246,0.4)', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}
                                formatter={(value, name) => [`${value} MB`, name === 'db' ? (t('database') || 'Database') : (t('storage') || 'Storage')]}
                            />
                            <Line type="monotone" dataKey="storage" name="Storage" stroke="#facc15" strokeWidth={2.5} dot={{ r: 4, fill: '#facc15', stroke: '#fff', strokeWidth: 1.5 }} />
                            <Line type="monotone" dataKey="db" name="Database" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#38bdf8', stroke: '#fff', strokeWidth: 1.5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Մանրամասն տեքստային ցուցանիշներ */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-blue-500/20 relative z-10 text-xs">
                    <div className="flex items-center gap-2">
                        <Database size={14} className="text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                        <div>
                            <p className="text-blue-300/70 text-[10px]">{t('databaseLimit') || 'Database (Max 500MB)'}</p>
                            <p className="font-bold text-white">{dbUsageMB} MB <span className="text-[10px] text-sky-400">({Math.round((dbUsageMB / dbLimitMB) * 100)}%)</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <HardDrive size={14} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
                        <div>
                            <p className="text-blue-300/70 text-[10px]">{t('storageLimit') || 'Storage (Max 1GB)'}</p>
                            <p className="font-bold text-white">{storageUsageMB} MB <span className="text-[10px] text-yellow-400">({Math.round((storageUsageMB / storageLimitMB) * 100)}%)</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ներքևի նավիգացիոն մենյու (Footer) */}
            <footer className="fixed bottom-2.5 left-0 right-0 mx-auto max-w-md px-4 z-40 box-border">
                <div className="border border-white/10 rounded-3xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-[#070a14]/90 backdrop-blur-2xl box-border">
                    <nav className="grid grid-cols-4 gap-2 text-center">

                        {/* 1. Home */}
                        <Link to="/" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/'
                                ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : ''}>
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span className={`text-[10px] mt-1 ${location.pathname === '/' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('home') || 'Home'}</span>
                        </Link>

                        {/* 2. Search */}
                        <Link to="/search" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/search'
                                ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Search size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all'} />
                            <span className={`text-[10px] mt-1 ${location.pathname === '/search' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('search') || 'Search'}</span>
                        </Link>

                        {/* 3. Medical */}
                        <Link to="/medical" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/medical'
                                ? 'text-red-400 bg-red-600/20 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Activity size={22} className={location.pathname === '/medical' ? 'drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] transition-all'} />
                            <span className={`text-[10px] mt-1 ${location.pathname === '/medical' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('medical') || 'Բժշկական'}</span>
                        </Link>

                        {/* 4. Car (Մեքենա) */}
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
    );
}