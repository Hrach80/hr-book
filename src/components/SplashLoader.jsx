import React from 'react';

export default function SplashLoader() {
    return (
        <div className="fixed inset-0 z-[9999] bg-[#070a12] flex flex-col items-center justify-center font-sans animate-softFadeScale overflow-hidden select-none">
            {/* Ֆոնային խորը տիեզերական լույսի բծեր */}
            <div className="absolute w-80 h-80 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute w-64 h-64 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none animate-[pulse_4s_ease-in-out_infinite]"></div>

            {/* Կենտրոնական բլոկ (ավելի կոմպակտ մասշտաբով) */}
            <div className="relative flex flex-col items-center z-10 scale-75">

                {/* Կոնտեյներ, որտեղ պտտվող ատամնանիվն ու շնչող լոգոն հավասարեցված են կենտրոնում */}
                <div className="relative w-48 h-48 flex items-center justify-center">

                    {/* Հարմարեցված չափով պտտվող մեխանիկական ատամնանիվ */}
                    <svg
                        className="absolute inset-0 w-full h-full text-cyan-400/50 animate-[spin_25s_linear_infinite] drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        {/* Արտաքին շրջանակ և ատամիկներ */}
                        <circle cx="50" cy="50" r="44" strokeDasharray="3 3" strokeWidth="4.5" />
                        <circle cx="50" cy="50" r="40" strokeWidth="1.5" />

                        {/* Ներքին 6 ճառագայթները */}
                        <line x1="50" y1="50" x2="50" y2="10" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="50" x2="84.6" y2="30" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="50" x2="84.6" y2="70" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="50" x2="50" y2="90" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="50" x2="15.4" y2="70" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="50" x2="15.4" y2="30" strokeWidth="3" strokeLinecap="round" />

                        {/* Կենտրոնական կիսաթափանցիկ մուգ հիմք */}
                        <circle cx="50" cy="50" r="22" strokeWidth="2" fill="#070a12" fillOpacity="0.85" />
                    </svg>

                    {/* Կենտրոնական ապակե քարտ լոգոյի համար՝ շնչող անիմացիայով */}
                    <div className="relative z-10 w-24 h-24 rounded-[22px] border border-white/20 bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center p-2 animate-[pulse_3s_ease-in-out_infinite]">
                        <span
                            className="text-3xl font-bold tracking-wide text-white drop-shadow-[0_0_15px_rgba(56,189,248,1)]"
                            style={{ fontFamily: "'Caveat', cursive" }}
                        >
                            H<span className="text-cyan-400">V</span>
                        </span>
                        <span className="text-[8px] tracking-[0.2em] text-cyan-200/80 font-light mt-0.5 uppercase">
                            NOTEBOOK
                        </span>
                    </div>
                </div>

                {/* Ներքևի լողացող կետիկներ */}
                <div className="mt-8 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
                </div>
            </div>
        </div>
    );
}