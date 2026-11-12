import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Pencil, KeyRound, Plus, Folder, ArrowLeft, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Search() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

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
                        <Link to="/" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span className="text-[10px] mt-1 font-medium">{t('home') || 'Home'}</span>
                        </Link>

                        <Link to="/search" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all duration-300 hover:scale-105">
                            <SearchIcon size={22} className="drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                            <span className="text-[10px] mt-1 font-semibold tracking-wide">{t('search') || 'Search'}</span>
                        </Link>

                        <Link to="/notes" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105 group">
                            <Plus size={22} className="group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all" />
                            <span className="text-[10px] mt-1 font-medium">{t('add') || 'Add'}</span>
                        </Link>

                        <Link to="/auth" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105 group">
                            <User size={22} className="group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all" />
                            <span className="text-[10px] mt-1 font-medium">{t('profile') || 'Profile'}</span>
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}