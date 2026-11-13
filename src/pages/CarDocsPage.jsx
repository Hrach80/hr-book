import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, ExternalLink, Trash2, X, Upload, CheckCircle2, Sparkles, Car, Shield, Cpu, Search, Bell } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function CarDocsPage() {
    const { t } = useLanguage();
    const location = useLocation();

    const [docs, setDocs] = useState([]);
    const [name, setName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    // Հիշեցումների չանցած քանակը ֆուտերի բեջի համար
    const [upcomingCount, setUpcomingCount] = useState(0);

    // VIN կոդ և տեխնիկական տվյալներ (2024 Kia EV6 Light Long Range RWD)
    const [vinData, setVinData] = useState({
        vin: 'KNDRC3DLXR5******',
        model: '2024 Kia EV6 Light Long Range RWD',
        battery: '77.4 kWh',
        customs: 'Գյումրի մաքսատուն'
    });
    const [isEditingVin, setIsEditingVin] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchCarDocuments();
        fetchRemindersCount();
    }, []);

    // Բազայից կարդում ենք մոտեցող հիշեցումների քանակը ֆուտերի համար
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

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const fetchCarDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('car_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocs(data || []);
        } catch (error) {
            console.error('Սխալ մեքենայի փաստաթղթերը բեռնելիս:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeviceFileUpload = async (e) => {
        try {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const file = files[0];

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `car_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('medical-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('medical-files')
                .getPublicUrl(filePath);

            setFileUrl(publicUrl);
            if (!name.trim()) {
                setName(file.name);
            }
            showToast(t('fileAttachedSuccess') || 'Ֆայլը հաջողությամբ կցվեց սարքավորումից!');
        } catch (error) {
            showToast('Ֆայլի բեռնման սխալ: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const addDocument = async (e) => {
        e.preventDefault();
        if (!name.trim() || !fileUrl.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const { data, error } = await supabase
                .from('car_documents')
                .insert([{ name, file_url: fileUrl, user_id: user.id }])
                .select();

            if (error) throw error;

            if (data) {
                setDocs([data[0], ...docs]);
                setName('');
                setFileUrl('');
                setShowForm(false);
                showToast(t('recordSaved') || 'Փաստաթուղթը հաջողությամբ պահպանվեց!');
            }
        } catch (error) {
            showToast('Սխալ ավելացնելիս: ' + error.message, 'error');
        }
    };

    const deleteDocument = async (id, e) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('car_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setDocs(docs.filter(d => d.id !== id));
            showToast(t('recordDeleted') || 'Փաստաթուղթը ջնջվեց', 'info');
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    return (
        <div className="font-sans pb-40 w-full max-w-md mx-auto px-4 pt-4 text-white relative box-border overflow-x-hidden flex flex-col items-center">

            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
                    <div className={`px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border flex items-center gap-3 text-sm font-semibold ${toast.type === 'error'
                            ? 'bg-red-950/90 border-red-500/40 text-red-200'
                            : toast.type === 'info'
                                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                                : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                        }`}>
                        <Sparkles size={18} className="text-blue-400 flex-shrink-0" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Վերնագրի հատված */}
            <div className="w-full flex items-center justify-between mb-5 px-1 box-border">
                <Link to="/" className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition shadow-md flex items-center justify-center">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-base font-bold text-white tracking-wider uppercase text-center flex items-center gap-2">
                    <Car size={20} className="text-blue-400" />
                    <span>{t('carDocsTitle') || 'Իմ Մեքենան (EV6)'}</span>
                </h1>

                <button
                    onClick={() => { setShowForm(!showForm); setName(''); setFileUrl(''); }}
                    className="p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {/* 1. VIN կոդ և Տեխնիկական տվյալներ */}
            <div className="w-full box-border glass-card p-4 rounded-3xl border border-blue-500/30 bg-[#0b0f19]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] mb-5">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                        <Cpu size={16} />
                        <span>{t('vinAndSpecs') || 'VIN և Տեխնիկական տվյալներ'}</span>
                    </span>
                    <button
                        onClick={() => setIsEditingVin(!isEditingVin)}
                        className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                    >
                        {isEditingVin ? (t('close') || 'Փակել') : (t('edit') || 'Խմբագրել')}
                    </button>
                </div>

                {isEditingVin ? (
                    <div className="space-y-3 pt-2">
                        <input
                            type="text"
                            value={vinData.vin}
                            onChange={(e) => setVinData({ ...vinData, vin: e.target.value })}
                            placeholder="VIN Կոդ"
                            className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                            type="text"
                            value={vinData.model}
                            onChange={(e) => setVinData({ ...vinData, model: e.target.value })}
                            placeholder="Մոդել"
                            className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                            type="text"
                            value={vinData.battery}
                            onChange={(e) => setVinData({ ...vinData, battery: e.target.value })}
                            placeholder="Մարտկոց"
                            className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div>
                            <span className="text-gray-500 block">VIN Կոդ:</span>
                            <span className="font-mono font-semibold text-blue-300">{vinData.vin}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">{t('battery') || 'Մարտկոց'}:</span>
                            <span className="font-semibold text-emerald-400">{vinData.battery}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-white/5">
                            <span className="text-gray-500 block">{t('model') || 'Մոդել'}:</span>
                            <span className="font-medium text-white">{vinData.model}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Ավելացման ֆորմա (Փաստաթղթեր և պայմանագրեր) */}
            {showForm && (
                <form onSubmit={addDocument} className="w-full box-border glass-card p-5 rounded-3xl border border-blue-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-5 animate-fadeIn">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                        <Shield size={16} />
                        <span>{t('newCarDoc') || 'Նոր պայմանագիր կամ փաստաթուղթ'}</span>
                    </h3>

                    <div className="w-full space-y-4 box-border">
                        <input
                            type="text"
                            placeholder={t('docNamePlaceholder') || 'Անվանում (օր. Ապահովագրություն, Մաքսային թերթիկ)'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            required
                        />

                        <div className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl p-4 flex flex-col gap-3">
                            <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 font-medium">
                                <Upload size={16} className="text-blue-400 flex-shrink-0" />
                                <span>{t('uploadFileLabel') || 'Կցել ֆայլ հեռախոսից կամ հղում'}</span>
                            </label>

                            <label className="w-full box-border py-3 px-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-md">
                                <Upload size={18} className="flex-shrink-0" />
                                <span>{t('selectFileButton') || 'Ընտրել ֆայլ կամ նկար հեռախոսից'}</span>
                                <input
                                    type="file"
                                    onChange={(e) => handleDeviceFileUpload(e)}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                            </label>

                            {uploading && <span className="text-xs text-amber-400 animate-pulse text-center">{t('uploadingFile') || 'Բեռնվում է սարքավորումից...'}</span>}

                            <div className="w-full pt-1">
                                <input
                                    type="url"
                                    placeholder={t('urlPlaceholder') || 'Կամ մուտքագրել հղում (https://...)'}
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    className="w-full box-border bg-[#070a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60"
                                    required
                                />
                            </div>

                            {fileUrl && !uploading && (
                                <div className="w-full box-border flex items-center justify-between bg-white/5 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                                    <span className="flex items-center gap-2 truncate">
                                        <CheckCircle2 size={16} className="flex-shrink-0" />
                                        <span>{t('fileAttachedSuccessShort') || 'Ֆայլը պատրաստ է պահպանման'}</span>
                                    </span>
                                    <a href={fileUrl} target="_blank" rel="noreferrer" className="underline text-blue-400 ml-2 flex-shrink-0">{t('verify') || 'Ստուգել'}</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-end gap-3.5 mt-5 px-2.5 box-border">
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setName(''); setFileUrl(''); }}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600/50 border border-blue-500/60 hover:bg-blue-600/70 shadow-[0_0_12px_rgba(59,130,246,0.4)] transition cursor-pointer disabled:opacity-50"
                        >
                            {t('save') || 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            {/* 2. Պայմանագրերի և փաստաթղթերի բաժին */}
            <div className="w-full px-1 mb-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} className="text-blue-400" />
                    <span>{t('contractsAndDocs') || 'Պայմանագրեր և փաստաթղթեր'}</span>
                </h2>
            </div>

            <div className="w-full space-y-3.5 box-border px-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center animate-[pulse_2s_infinite]">
                            <Car size={26} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                        </div>
                    </div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-medium bg-white/5 rounded-2xl border border-white/5">
                        {t('noCarDocs') || 'Պայմանագրեր կամ փաստաթղթեր դեռևս չկան'}
                    </div>
                ) : (
                    docs.map(item => (
                        <div key={item.id} className="w-full box-border glass-card px-4 py-3.5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 group transition hover:border-blue-500/50">
                            <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition"
                            >
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                    <FileText size={16} />
                                </div>
                                <span className="text-sm text-gray-200 truncate font-medium">{item.name}</span>
                                <ExternalLink size={14} className="text-gray-400 ml-auto flex-shrink-0 mr-1" />
                            </a>
                            <button
                                onClick={(e) => deleteDocument(item.id, e)}
                                className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/15 transition cursor-pointer flex items-center justify-center flex-shrink-0"
                                title={t('delete') || 'Ջնջել'}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
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
                            <Search size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'transition-all'} />
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