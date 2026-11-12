import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, KeyRound, Plus, Folder, User, Search, Database, HardDrive, RefreshCw, Activity } from 'lucide-react';
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

            {/* Ներքևի նավիգացիոն մենյու */}
            <footer className="fixed bottom-0 left-0 right-0 glass-card-light border-t border-gray-800 mx-auto max-w-md rounded-t-3xl p-3.5 shadow-2xl z-50 bg-[#0b0f19]/90 backdrop-blur-md">
                <nav className="grid grid-cols-4 gap-4 text-center">
                    <Link to="/" className="flex flex-col items-center text-blue-400">
                        <div className="p-1.5 bg-blue-500/10 rounded-xl">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 10.1183C3 9.23167 3 8.78835 3.17964 8.38673C3.35928 7.98512 3.69548 7.66755 4.36789 7.03242L9.36789 2.29909C10.5129 1.20417 11.0854 0.656709 11.7473 0.451981C12.4092 0.247253 13.1134 0.430393 14.5219 0.796673L19.5219 2.12999C20.2547 2.32417 20.6212 2.42125 20.8106 2.69887C21 2.97648 21 3.34915 21 4.09449V17.0183C21 19.2291 21 20.3345 20.6651 21.1794C20.3303 22.0243 19.433 22.6202 17.6385 22.812L13.6385 23.2453C12.5192 23.3653 11.9596 23.4253 11.4818 23.2378C11.004 23.0503 10.6827 22.6344 10.0401 21.8025L5.04007 15.3025C4.28177 14.3321 3.90263 13.8469 3.45132 13.2856C3 12.7243 3 12.0036 3 10.5623V10.1183Z" fill="currentColor" />
                                <path d="M16.5 12.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-[11px] mt-0.5 font-medium">{t('home') || 'Home'}</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                        <Search size={22} />
                        <span className="text-[11px] mt-0.5">{t('search') || 'Search'}</span>
                    </Link>
                    <Link to="/notes" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                        <Plus size={22} />
                        <span className="text-[11px] mt-0.5">{t('add') || 'Add'}</span>
                    </Link>
                    <Link to="/auth" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                        <User size={22} />
                        <span className="text-[11px] mt-0.5">{t('profile') || 'Profile'}</span>
                    </Link>
                </nav>
            </footer>
        </div>
    );
}