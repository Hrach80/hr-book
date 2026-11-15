import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
    const { lang, setLang, t } = useLanguage();

    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinMessage, setPinMessage] = useState({ text: '', type: '' });

    const handlePinChange = (e) => {
        e.preventDefault();

        const savedPin = localStorage.getItem('app_vault_pin') || '1234';

        if (oldPin !== savedPin) {
            setPinMessage({ text: t('wrongOldPin') || 'Հին PIN կոդը սխալ է:', type: 'error' });
            return;
        }

        if (newPin.length !== 4) {
            setPinMessage({ text: t('pinLengthError') || 'Նոր PIN-ը պետք է լինի ճիշտ 4 նիշ:', type: 'error' });
            return;
        }

        if (newPin !== confirmPin) {
            setPinMessage({ text: t('pinMismatch') || 'Նոր PIN կոդերը չեն համընկնում:', type: 'error' });
            return;
        }

        localStorage.setItem('app_vault_pin', newPin);

        setPinMessage({ text: t('pinSuccess') || 'PIN կոդը հաջողությամբ փոխվեց!', type: 'success' });
        setOldPin('');
        setNewPin('');
        setConfirmPin('');

        setTimeout(() => {
            setPinMessage({ text: '', type: '' });
        }, 3000);
    };

    return (
        <div className="p-4 sm:p-6 max-w-xl mx-auto pb-24 font-sans text-white">

            {/* Վերնագիր և Հետ գնալու կոճակ */}
            <div className="flex items-center mb-8">
                <Link
                    to="/"
                    className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-cyan-500/50 transition-all duration-300 shadow-md mr-4 group flex items-center justify-center"
                    title="Home"
                >
                    <ArrowLeft size={20} className="text-gray-300 group-hover:text-cyan-400 group-hover:-translate-x-0.5 transition-all" />
                </Link>
                <h1 className="text-2xl font-bold tracking-wide text-white">
                    {t('settings') || 'Կարգավորումներ'}
                </h1>
            </div>

            <div className="space-y-6">

                {/* 1. Լեզվի ընտրության բաժին */}
                <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
                    <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                        <Globe size={20} className="drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                        <span>{t('languageSelection') || 'Լեզու / Language / Язык'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {['am', 'ru', 'en'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                className={`py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${lang === l
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                                        : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06]'
                                    }`}
                            >
                                {l === 'am' ? 'Հայերեն' : l === 'ru' ? 'Русский' : 'English'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. PIN կոդի փոփոխության բաժին */}
                <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
                    <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                        <Lock size={20} className="drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                        <span>{t('changePinTitle') || 'PIN կոդի փոփոխություն'}</span>
                    </div>

                    <form onSubmit={handlePinChange} className="space-y-3">
                        <div>
                            <input
                                type="password"
                                placeholder={t('oldPinPlaceholder') || 'Հին PIN կոդը'}
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value)}
                                maxLength={4}
                                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 transition-all text-center tracking-widest font-mono"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder={t('newPinPlaceholder') || 'Նոր PIN կոդը (4 նիշ)'}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                maxLength={4}
                                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 transition-all text-center tracking-widest font-mono"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder={t('confirmPinPlaceholder') || 'Հաստատեք նոր PIN կոդը'}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                maxLength={4}
                                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 transition-all text-center tracking-widest font-mono"
                            />
                        </div>

                        {pinMessage.text && (
                            <div className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${pinMessage.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                }`}>
                                {pinMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                <span>{pinMessage.text}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold text-xs sm:text-sm hover:bg-cyan-500/30 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-95"
                        >
                            {t('updatePinBtn') || 'Թարմացնել PIN կոդը'}
                        </button>
                    </form>
                </div>

                {/* 3. Անձնական հաշվի կառավարում */}
                <div className="glass-card p-4 sm:p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 via-[#101726]/80 to-[#070a12]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <Link
                        to="/auth"
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-cyan-500/40 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-3.5 text-gray-200">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                                    {t('accountManagement') || 'Անձնական հաշիվ & Մուտք'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {t('accountSubtitle') || 'Կառավարեք ձեր պրոֆիլը և տվյալները'}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                            {t('openBtn') || 'Բացել'}
                        </span>
                    </Link>
                </div>

            </div>
        </div>
    );
}