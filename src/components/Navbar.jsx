import React from 'react';
import { Sparkles, LogIn, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { t } = useLanguage();

    return (
        <header className="w-full px-4 sm:px-8 py-2 mb-4">
            <div className="max-w-7xl mx-auto glass-card px-4 sm:px-6 py-2 rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-r from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.4)] flex items-center justify-between">

                {/* Ձախ անկյուն՝ Ավելի փոքր և կոմպակտ լոգո-իկոնա */}
                <div className="flex items-center group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/15 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)] group-hover:border-blue-500/50 transition-all duration-300">
                        <Sparkles size={16} className="drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                    </div>
                </div>

                {/* Աջ անկյուն՝ Ավելի կոմպակտ մուտքի և կարգավորումների կոճակներ */}
                <div className="flex items-center gap-2">

                    {/* Մուտքի կոճակ */}
                    <button
                        onClick={() => console.log('Login clicked')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/[0.08] hover:border-blue-500/40 hover:text-white transition-all duration-300 shadow-sm cursor-pointer group"
                    >
                        <LogIn size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">{t('login') || 'Մուտք'}</span>
                    </button>

                    {/* Կարգավորումների կոճակ */}
                    <button
                        onClick={() => console.log('Settings clicked')}
                        className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-300 hover:bg-white/[0.08] hover:border-blue-500/40 hover:text-white transition-all duration-300 shadow-sm cursor-pointer group"
                        title="Կարգավորումներ"
                    >
                        <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>

                </div>

            </div>
        </header>
    );
}