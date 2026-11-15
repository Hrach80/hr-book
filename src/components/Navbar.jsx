import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function Navbar() {
    const useNavigateInstance = useNavigate();

    return (
        <header className="w-full px-4 sm:px-6 py-3.5 mb-4">
            {/* max-w-xl - հավասարեցված է Դաշբորդի և մյուս էջերի լայնությանը */}
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between">

                {/* Ձախ անկյուն՝ Մեծացված ձեռագիր HV notebook գրառումը (Գլխավոր էջ) */}
                <div
                    onClick={() => useNavigateInstance('/')}
                    className="flex items-center gap-3 group cursor-pointer p-1"
                    title="Գլխավոր էջ"
                >
                    <span
                        className="text-2xl sm:text-3xl font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] group-hover:scale-105 transition-transform duration-300"
                        style={{ fontFamily: "'Caveat', cursive" }}
                    >
                        H<span className="text-cyan-400">V</span>
                        <span className="text-sm tracking-normal text-gray-300 ml-2 font-sans font-normal opacity-80 uppercase">notebook</span>
                    </span>
                </div>

                {/* Աջ անկյուն՝ Կարգավորումների կոճակ */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => useNavigateInstance('/settings')}
                        className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 text-gray-200 hover:bg-white/[0.09] hover:border-cyan-500/50 hover:text-white transition-all duration-300 shadow-md cursor-pointer group active:scale-95"
                        title="Կարգավորումներ"
                    >
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500 text-cyan-400" />
                    </button>
                </div>

            </div>
        </header>
    );
}