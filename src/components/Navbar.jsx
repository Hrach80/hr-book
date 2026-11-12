import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <header className="w-full px-4 sm:px-8 py-3.5 mb-6">
            <div className="max-w-7xl mx-auto glass-card px-5 sm:px-6 py-4 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between">

                {/* Ձախ անկյուն՝ Հավելվածի լոգո (սեղմելիս գնում է գլխավոր էջ՝ Home) */}
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center group cursor-pointer p-1"
                    title="Գլխավոր էջ"
                >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/15 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:border-blue-500/60 group-hover:scale-105 transition-all duration-300">
                        <Sparkles size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    </div>
                </div>

                {/* Աջ անկյուն՝ Մուտքի և Կարգավորումների ֆունկցիոնալ կոճակներ */}
                <div className="flex items-center gap-3 sm:gap-4">

                    {/* Մուտքի կոճակ -> Գնում է /auth */}
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 text-gray-100 text-xs sm:text-sm font-semibold hover:bg-white/[0.09] hover:border-blue-500/50 hover:text-white transition-all duration-300 shadow-md cursor-pointer group active:scale-95"
                    >
                        <LogIn size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span>{t('login') || 'Մուտք'}</span>
                    </button>

                    {/* Կարգավորումների կոճակ -> Գնում է /settings */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 text-gray-200 hover:bg-white/[0.09] hover:border-blue-500/50 hover:text-white transition-all duration-300 shadow-md cursor-pointer group active:scale-95"
                        title="Կարգավորումներ"
                    >
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>

                </div>

            </div>
        </header>
    );
}