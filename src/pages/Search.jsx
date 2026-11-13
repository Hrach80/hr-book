import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Pencil, KeyRound, Plus, Folder, ArrowLeft, User, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

export default function Search() {
    const { t } = useLanguage();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    // Հիշեցումների չանցած քանակը ֆուտերի բեջի համար
    const [upcomingCount, setUpcomingCount] = useState(0);

    // Բազայից կարդում ենք մոտեցող հիշեցումների քանակը ֆուտերի համար
    useEffect(() => {
        const fetchRemindersCount = async () => {
            try {
                const { data, error } = await supabase.from('reminders').select('event_date');
                if (error) throw error;

                if (data) {
                    const now = new Date();
                    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    const count = data.filter(item => {
                        const eventDate = new Date(item.event_date);
                        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                        return eventDateOnly >= nowDateOnly;
                    }).length;

                    setUpcomingCount(count);
                }
            } catch (e) {
                console.error('Error fetching reminders count:', e);
            }
        };

        fetchRemindersCount();
    }, []);

    // Մոդելավորված տվյալներ բոլոր հնարավոր գրառումներից
    const allItems = [
        { id: 1, type: 'notes', title: 'Առաջիկա անելիքներ', preview: 'Գնել նոր պահեստամասեր EV6-ի համար...', date: '2026-06-05', icon: Pencil, color: 'text-blue-400' },
        { id: 2, type: 'passwords', title: 'Gmail հաշիվ', preview: 'hrachyavagarshakyan@gmail.com', date: '2026-05-20', icon: KeyRound, color: 'text-gray-300' },
        { id: 3, type: 'medical', title: 'Անալիզների պատասխաններ', preview: 'Ընդհանուր արյան քննություն նորմալ է...', date: '2026-04-15', icon: Plus, color: 'text-emerald-400' },
        { id: 4, type: 'documents', title: 'Անձնագրի պատճեն', preview: 'PDF ֆայլ, 2.4 ՄԲ', date: '2026-03-10', icon: Folder, color: 'text-amber-400' },
    ];

    // Ֆիլտրում ենք միայն այն դեպքում, երբ որոնման տողը դատարկ չէ
    const filteredItems = searchQuery.trim() ? allItems.filter(item => {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.preview.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];

    return (
        <div className="font-sans pb-28 max-w-3xl mx-auto px-4 pt-2">

            {/* Վերնագիր և Վերադարձ */}
            <div className="flex items-center justify-between mb-4">
                <Link to="/" className="p-2 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition hover:scale-105">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-base font-bold text-white tracking-wide">
                    {t('search') || 'Search'}
                </h1>
                <div className="w-9"></div>
            </div>

            {/* Որոնման տող */}
            <div className="relative mb-6">
                <SearchIcon className="absolute left-4 top-3.5 text-blue-400" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder') || 'Որոնել նշումներ, գաղտնաբառեր...'}
                    className="w-full bg-[#0b0f19]/80 border border-white/15 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-xl transition"
                />
            </div>

            {/* Արդյունքների ցուցադրում միայն որոնում կատարելիս */}
            {searchQuery.trim() !== '' && (
                <div className="space-y-3">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => {
                            const IconComponent = item.icon;
                            return (
                                <div
                                    key={item.id}
                                    className="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition hover:border-white/30 flex items-center gap-3.5 group cursor-pointer"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform`}>
                                        <IconComponent size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                                            <span className="text-[10px] text-gray-400">{item.date}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{item.preview}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            {t('noResults') || 'Ոչինչ չի գտնվել'}
                        </div>
                    )}
                </div>
            )}

            {/* Ներքևի նավիգացիոն մենյու (Ֆուտեր) */}
            <footer className="fixed bottom-4 left-0 right-0 mx-auto max-w-md px-4 z-50">
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

                        {/* 3. Reminders (Հիշեցումներ) + Կարմիր բեջ ֆուտերում */}
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