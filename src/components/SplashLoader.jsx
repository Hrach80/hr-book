import React from 'react';

export default function SplashLoader() {
    return (
        <div className="fixed inset-0 z-[9999] bg-[#070a12] flex flex-col items-center justify-center font-sans animate-softFadeScale">
            <div className="relative flex flex-col items-center">
                {/* Ֆանտաստիկ շնչող նեոնային քարտ */}
                <div className="w-28 h-28 rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-cyan-600/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(59,130,246,0.4)] flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite]">
                    <span
                        className="text-4xl font-bold tracking-wide text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]"
                        style={{ fontFamily: "'Caveat', cursive" }}
                    >
                        H<span className="text-cyan-400">V</span>
                    </span>
                </div>

                {/* Ներքևի փափուկ բեռնման կետիկներ */}
                <div className="mt-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
            </div>
        </div>
    );
}