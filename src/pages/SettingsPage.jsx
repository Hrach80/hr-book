import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Shield, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
    const { lang, setLang, t } = useLanguage();

    return (
        <div className="p-4 max-w-md mx-auto pb-20 font-sans text-white">
            {/* Վերնագիր */}
            <div className="flex items-center mb-6">
                <Link to="/" className="p-2 glass-card rounded-full mr-3 hover:bg-white/10 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">{t('settings')}</h1>
            </div>

            {/* Լեզվի ընտրության բաժին */}
            <div className="glass-card p-5 rounded-3xl mb-6 shadow-neoDark space-y-4">
                <div className="flex items-center gap-3 text-blue-400 font-semibold text-sm">
                    <Globe size={20} />
                    <span>{t('language')} / Language / Язык</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setLang('am')}
                        className={`py-3 rounded-2xl text-xs font-semibold transition ${lang === 'am' ? 'bg-blue-600/50 text-white shadow-neoDark border border-blue-500' : 'glass-card text-gray-400 hover:text-white'
                            }`}
                    >
                        Հայերեն
                    </button>
                    <button
                        onClick={() => setLang('ru')}
                        className={`py-3 rounded-2xl text-xs font-semibold transition ${lang === 'ru' ? 'bg-blue-600/50 text-white shadow-neoDark border border-blue-500' : 'glass-card text-gray-400 hover:text-white'
                            }`}
                    >
                        Русский
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        className={`py-3 rounded-2xl text-xs font-semibold transition ${lang === 'en' ? 'bg-blue-600/50 text-white shadow-neoDark border border-blue-500' : 'glass-card text-gray-400 hover:text-white'
                            }`}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* Հաշվի կառավարում */}
            <div className="glass-card p-5 rounded-3xl space-y-3 shadow-neoDark">
                <Link to="/auth" className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                        <User size={18} className="text-blue-400" />
                        <span>Անձնական հաշիվ (Auth)</span>
                    </div>
                    <span className="text-xs text-blue-400">Կարգավորել</span>
                </Link>
            </div>
        </div>
    );
}