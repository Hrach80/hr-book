import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

export default function Footer() {
    const { t } = useLanguage();
    const location = useLocation();
    const [upcomingCount, setUpcomingCount] = useState(0);

    // Հաշվում ենք ծննդյան օրերի և հիշեցումների ակտիվ քանակը
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

    const fetchUpcomingCount = async () => {
        try {
            const { data, error } = await supabase.from('reminders').select('*');
            if (error) throw error;

            if (data) {
                const now = new Date();
                const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const activeOrUpcoming = data.filter(item => {
                    if (!item.event_date) return false;
                    const eventTime = getEffectiveEventDate(item);
                    const eventDateOnly = new Date(eventTime.getFullYear(), eventTime.getMonth(), eventTime.getDate());
                    return eventDateOnly >= nowDateOnly;
                });

                setUpcomingCount(activeOrUpcoming.length);
            }
        } catch (error) {
            console.error('Error fetching reminders count for footer:', error);
        }
    };

    useEffect(() => {
        // Աշխատում է սկզբնական բեռնման և էջերի փոփոխության (նավարկության) ժամանակ
        fetchUpcomingCount();

        // Լրացուցիչ՝ թարմացնել նաև, երբ հավելվածը նորից ակտիվանում է (focus)
        window.addEventListener('focus', fetchUpcomingCount);
        return () => window.removeEventListener('focus', fetchUpcomingCount);
    }, [location.pathname]); // <-- Ավելացված է location.pathname-ը

    return (
        <footer className="fixed bottom-4 left-0 right-0 mx-auto max-w-md px-4 z-50 pointer-events-auto">
            <div className="border border-white/10 rounded-3xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-[#070a14]/90 backdrop-blur-2xl">
                <nav className="grid grid-cols-4 gap-2 text-center">

                    {/* 1. Home */}
                    <Link to="/" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/' ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span className={`text-[10px] mt-1 ${location.pathname === '/' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('home') || 'Home'}</span>
                    </Link>

                    {/* 2. Search */}
                    <Link to="/search" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/search' ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <SearchIcon size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'transition-all'} />
                        <span className={`text-[10px] mt-1 ${location.pathname === '/search' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('search') || 'Search'}</span>
                    </Link>

                    {/* 3. Reminders (Ծանուցումների կարմիր նշանով և փարոսի անիմացիայով) */}
                    <Link to="/reminders" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group relative ${location.pathname === '/reminders' ? 'text-amber-400 bg-amber-600/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <div className="relative">
                            <Bell size={22} className={location.pathname === '/reminders' ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all'} />
                            {upcomingCount > 0 && (
                                <>
                                    {/* Փարոսի (Radar/Beacon) հետևի թարթող շերտ */}
                                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-red-500/60 animate-ping pointer-events-none"></span>

                                    {/* Հիմնական թվային նշանը */}
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#070a14] shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10">
                                        {upcomingCount}
                                    </span>
                                </>
                            )}
                        </div>
                        <span className={`text-[10px] mt-1 ${location.pathname === '/reminders' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('remindersTab') || 'Հիշեցումներ'}</span>
                    </Link>

                    {/* 4. Car */}
                    <Link to="/car-docs" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/car-docs' ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
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
    );
}