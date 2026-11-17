import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pencil, KeyRound, Plus, Folder, Search, Database, HardDrive, RefreshCw, Activity, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../services/supabaseClient';
import WidgetsDock from '../components/WidgetsDock';

export default function Dashboard() {
    const { t } = useLanguage();
    const location = useLocation();

    const [dbUsageMB, setDbUsageMB] = useState(45.2);
    const [storageUsageMB, setStorageUsageMB] = useState(128.5);
    const [isLoading, setIsLoading] = useState(false);
    const [chartHistory, setChartHistory] = useState([
        { time: '01', db: 20, storage: 80, limit: 500 },
        { time: '05', db: 35, storage: 95, limit: 500 },
        { time: '10', db: 28, storage: 110, limit: 500 },
        { time: '15', db: 42, storage: 120, limit: 500 },
        { time: '20', db: 38, storage: 115, limit: 500 },
        { time: '25', db: 45.2, storage: 128.5, limit: 500 },
    ]);

    const [upcomingCount, setUpcomingCount] = useState(0);
    const [notesCount, setNotesCount] = useState(0);
    const [passwordsCount, setPasswordsCount] = useState(0);
    const [medicalCount, setMedicalCount] = useState(0);
    const [documentsCount, setDocumentsCount] = useState(0);

    const dbLimitMB = 500;
    const storageLimitMB = 1024;

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

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Ստուգում ենք արդյոք կա ակտիվ սեսիա
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Եթե սեսիա չկա՝ բոլոր քանակները զրոյացնում ենք
                setNotesCount(0);
                setPasswordsCount(0);
                setMedicalCount(0);
                setDocumentsCount(0);
                setUpcomingCount(0);
                setIsLoading(false);
                return;
            }

            const [remindersRes, notesRes, passwordsRes, medicalRes, documentsRes, storageFilesRes] = await Promise.all([
                supabase.from('reminders').select('*').eq('user_id', session.user.id),
                supabase.from('notes').select('*').eq('user_id', session.user.id),
                supabase.from('passwords').select('*').eq('user_id', session.user.id),
                supabase.from('medical_records').select('*').eq('user_id', session.user.id),
                supabase.from('documents').select('*').eq('user_id', session.user.id),
                supabase.storage.from('documents').list()
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

            if (notesRes.data) setNotesCount(notesRes.data.length);
            if (passwordsRes.data) setPasswordsCount(passwordsRes.data.length);
            if (medicalRes.data) setMedicalCount(medicalRes.data.length);
            if (documentsRes.data) setDocumentsCount(documentsRes.data.length);

            const totalRecords =
                (notesRes.data?.length || 0) +
                (remindersRes.data?.length || 0) +
                (passwordsRes.data?.length || 0) +
                (medicalRes.data?.length || 0) +
                (documentsRes.data?.length || 0);

            const calculatedDbMB = Number((40 + totalRecords * 0.005).toFixed(2));
            setDbUsageMB(calculatedDbMB);

            let totalStorageBytes = 0;
            if (storageFilesRes.data && storageFilesRes.data.length > 0) {
                totalStorageBytes = storageFilesRes.data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
            }
            const calculatedStorageMB = Number((120 + (totalStorageBytes / (1024 * 1024))).toFixed(2));
            setStorageUsageMB(calculatedStorageMB);

            setChartHistory(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    db: calculatedDbMB,
                    storage: calculatedStorageMB,
                    limit: 500
                };
                return updated;
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setNotesCount(0);
            setPasswordsCount(0);
            setMedicalCount(0);
            setDocumentsCount(0);
            setUpcomingCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [location.pathname]);

    const handleRefresh = () => {
        fetchDashboardData();
    };

    return (
        <div className="font-sans w-full text-white animate-softFadeScale pb-10">

            <WidgetsDock />

            <div className="grid grid-cols-2 gap-3.5 mb-5 mt-4">

                {/* 1. Notes */}
                <Link to="/notes" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-blue-500/30 bg-gradient-to-r from-blue-600/15 via-blue-900/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/60 group relative">
                    <div className="relative w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Pencil size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        {notesCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-blue-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse border border-blue-200/40">
                                {notesCount}
                            </span>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <span className="font-bold text-xs sm:text-sm text-white tracking-wide block truncate">{t('notes') || 'Notes'}</span>
                        <span className="text-[10px] text-gray-400 block truncate">Գրառումներ ({notesCount})</span>
                    </div>
                </Link>

                {/* 2. Passwords */}
                <Link to="/passwords" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group relative">
                    <div className="relative w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-200 shrink-0 group-hover:scale-110 transition-transform">
                        <KeyRound size={22} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        {passwordsCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-white text-black text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse border border-gray-300">
                                {passwordsCount}
                            </span>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide block truncate">{t('passwords') || 'Passwords'}</span>
                        <span className="text-[10px] text-gray-400 block truncate">Գաղտնաբառեր ({passwordsCount})</span>
                    </div>
                </Link>

                {/* 3. Medical */}
                <Link to="/medical" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group relative">
                    <div className="relative w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Plus size={22} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        {medicalCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-emerald-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse border border-emerald-200/40">
                                {medicalCount}
                            </span>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide block truncate">{t('medical') || 'Medical'}</span>
                        <span className="text-[10px] text-gray-400 block truncate">Բժշկական ({medicalCount})</span>
                    </div>
                </Link>

                {/* 4. Documents */}
                <Link to="/docs" className="glass-card p-4 rounded-2xl flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 group relative">
                    <div className="relative w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Folder size={22} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        {documentsCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-amber-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse border border-amber-200/40">
                                {documentsCount}
                            </span>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <span className="font-bold text-xs sm:text-sm text-gray-200 tracking-wide block truncate">{t('documents') || 'Documents'}</span>
                        <span className="text-[10px] text-gray-400 block truncate">Փաստաթղթեր ({documentsCount})</span>
                    </div>
                </Link>
            </div>

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

                <div className="w-full h-64 sm:h-72 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        </div>
    );
}