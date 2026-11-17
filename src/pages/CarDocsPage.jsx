import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, ExternalLink, Trash2, X, Upload, CheckCircle2, Sparkles, Car, Shield, Cpu, Search, Bell, Layers, Edit3 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function CarDocsPage() {
    const { t } = useLanguage();
    const location = useLocation();

    const [docs, setDocs] = useState([]);
    const [name, setName] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Հիշեցումների չանցած քանակը ֆուտերի բեջի համար
    const [upcomingCount, setUpcomingCount] = useState(0);

    // VIN կոդ և տեխնիկական տվյալներ (Սկզբում դատարկ կամ դեֆոլտ)
    const [vinData, setVinData] = useState({
        vin: '',
        model: '',
        battery: '',
        customs: ''
    });
    const [isEditingVin, setIsEditingVin] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        checkSessionAndLoadData();
    }, [location.pathname]);

    // Ստուգում ենք սեսիան և ըստ այդմ կարդում տվյալները
    const checkSessionAndLoadData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Եթե օգտատերը դուրս է եկել՝ ԱՆՄԻՋԱՊԵՍ մաքրում ենք ամեն ինչ
                setDocs([]);
                setVinData({ vin: '', model: '', battery: '', customs: '' });
                setUpcomingCount(0);
                setLoading(false);
                return;
            }

            // Եթե սեսիա կա, բեռնում ենք փաստաթղթերը և հիշեցումները
            fetchCarDocuments();
            fetchRemindersCount(session.user.id);

            // Կարդում ենք VIN տվյալները LocalStorage-ից տվյալ օգտատիրոջ համար
            const savedVin = localStorage.getItem(`user_car_vin_${session.user.id}`);
            if (savedVin) {
                try {
                    setVinData(JSON.parse(savedVin));
                } catch (e) {
                    setVinData({
                        vin: 'KNDRC3DLXR5******',
                        model: '2024 Kia EV6 Light Long Range RWD',
                        battery: '77.4 kWh',
                        customs: 'Գյումրի մաքսատուն'
                    });
                }
            } else {
                setVinData({
                    vin: 'KNDRC3DLXR5******',
                    model: '2024 Kia EV6 Light Long Range RWD',
                    battery: '77.4 kWh',
                    customs: 'Գյումրի մաքսատուն'
                });
            }
        } catch (e) {
            console.error('Error checking session:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchRemindersCount = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('event_date')
                .eq('user_id', userId);
            if (error) throw error;

            if (data) {
                const now = new Date();
                const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const count = data.filter(item => {
                    if (!item.event_date) return false;
                    const eventDate = new Date(item.event_date);
                    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                    return eventDateOnly >= nowDateOnly;
                }).length;

                setUpcomingCount(count);
            }
        } catch (e) {
            console.error('Error fetching reminders count:', e);
            setUpcomingCount(0);
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
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setDocs([]);
                return;
            }

            const { data, error } = await supabase
                .from('car_documents')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocs(data || []);
        } catch (error) {
            console.error('Սխալ մեքենայի փաստաթղթերը բեռնելիս:', error.message);
            setDocs([]);
        }
    };

    // VIN տվյալների պահպանում ըստ օգտատիրոջ ID-ի
    const handleSaveVin = async (e) => {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            localStorage.setItem(`user_car_vin_${session.user.id}`, JSON.stringify(vinData));
        }
        setIsEditingVin(false);
        showToast('Տեխնիկական տվյալները հաջողությամբ պահպանվեցին!');
    };

    // Բազմակի ֆայլերի բեռնում մեքենայի համար
    const handleDeviceFileUpload = async (e) => {
        try {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            setUploading(true);
            const newUrls = [...attachedFiles];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
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

                newUrls.push({ name: file.name, url: publicUrl });
            }

            setAttachedFiles(newUrls);
            if (!name.trim() && files.length > 0) {
                setName(files[0].name);
            }
            showToast('Ֆայլերը հաջողությամբ կցվեցին!');
        } catch (error) {
            showToast('Ֆայլի բեռնման սխալ: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const removeAttachedFile = (index) => {
        setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    };

    const addDocument = async (e) => {
        e.preventDefault();
        if (!name.trim() || attachedFiles.length === 0) {
            showToast('Խնդրում ենք լրացնել անվանումը և կցել առնվազն մեկ ֆայլ', 'error');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const fileUrlsString = JSON.stringify(attachedFiles);

            const { data, error } = await supabase
                .from('car_documents')
                .insert([{ name, file_url: fileUrlsString, user_id: user.id }])
                .select();

            if (error) throw error;

            if (data) {
                setDocs([data[0], ...docs]);
                setName('');
                setAttachedFiles([]);
                setShowForm(false);
                showToast('Փաստաթուղթը հաջողությամբ պահպանվեց!');
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
            showToast('Փաստաթուղթը ջնջվեց', 'info');
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    const parseRecordFiles = (fileUrl) => {
        if (!fileUrl) return [];
        try {
            const parsed = JSON.parse(fileUrl);
            if (Array.isArray(parsed)) return parsed;
        } catch { }
        return [{ name: 'Կցված փաստաթուղթ', url: fileUrl }];
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
                    onClick={() => { setShowForm(!showForm); setName(''); setAttachedFiles([]); }}
                    className="p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {/* 1. VIN կոդ և Տեխնիկական տվյալներ */}
            <div className="w-full box-border glass-card p-5 rounded-3xl border border-blue-500/30 bg-[#0b0f19]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] mb-5">
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                        <Cpu size={16} />
                        <span>{t('vinAndSpecs') || 'VIN և Տեխնիկական տվյալներ'}</span>
                    </span>
                    <button
                        onClick={() => setIsEditingVin(!isEditingVin)}
                        className="text-xs text-gray-400 hover:text-white underline cursor-pointer flex items-center gap-1"
                    >
                        <Edit3 size={14} />
                        <span>{isEditingVin ? (t('close') || 'Փակել') : (t('edit') || 'Խմբագրել')}</span>
                    </button>
                </div>

                {isEditingVin ? (
                    <form onSubmit={handleSaveVin} className="space-y-3.5 pt-1">
                        <div>
                            <label className="text-[11px] text-gray-400 block mb-1">VIN Կոդ</label>
                            <input
                                type="text"
                                value={vinData.vin}
                                onChange={(e) => setVinData({ ...vinData, vin: e.target.value })}
                                placeholder="VIN Կոդ"
                                className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-400 block mb-1">Մոդել</label>
                            <input
                                type="text"
                                value={vinData.model}
                                onChange={(e) => setVinData({ ...vinData, model: e.target.value })}
                                placeholder="Մոդել"
                                className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-400 block mb-1">Մարտկոց</label>
                            <input
                                type="text"
                                value={vinData.battery}
                                onChange={(e) => setVinData({ ...vinData, battery: e.target.value })}
                                placeholder="Մարտկոց"
                                className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-400 block mb-1">Մաքսատուն</label>
                            <input
                                type="text"
                                value={vinData.customs}
                                onChange={(e) => setVinData({ ...vinData, customs: e.target.value })}
                                placeholder="Մաքսատուն"
                                className="w-full bg-[#070a14] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600/50 border border-blue-500/60 hover:bg-blue-600/70 shadow-md transition cursor-pointer"
                            >
                                Պահպանել տվյալները
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div>
                            <span className="text-gray-500 block mb-0.5">VIN Կոդ:</span>
                            <span className="font-mono font-semibold text-blue-300 tracking-wide">{vinData.vin || '—'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-0.5">{t('battery') || 'Մարտկոց'}:</span>
                            <span className="font-semibold text-emerald-400">{vinData.battery || '—'}</span>
                        </div>
                        <div className="col-span-2 pt-2.5 border-t border-white/10">
                            <span className="text-gray-500 block mb-0.5">{t('model') || 'Մոդել'}:</span>
                            <span className="font-medium text-white text-sm">{vinData.model || '—'}</span>
                        </div>
                        <div className="col-span-2 pt-1">
                            <span className="text-gray-500 block mb-0.5">Մաքսային ձևակերպում:</span>
                            <span className="font-medium text-gray-300">{vinData.customs || '—'}</span>
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
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 font-medium">
                                    <Upload size={16} className="text-blue-400 flex-shrink-0" />
                                    <span>Կցել ֆայլեր (Կարող եք ընտրել մի քանիսը)</span>
                                </label>
                                {attachedFiles.length > 0 && (
                                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                                        Կցված է՝ {attachedFiles.length}
                                    </span>
                                )}
                            </div>

                            <label className="w-full box-border py-3.5 px-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-md">
                                <Upload size={18} className="flex-shrink-0" />
                                <span>{t('selectFileButton') || 'Ընտրել ֆայլեր կամ նկարներ հեռախոսից'}</span>
                                <input
                                    type="file"
                                    onChange={(e) => handleDeviceFileUpload(e)}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx"
                                    multiple
                                />
                            </label>

                            {uploading && <span className="text-xs text-amber-400 animate-pulse text-center">Բեռնվում է սարքավորումից...</span>}

                            {attachedFiles.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <span className="text-xs text-gray-400 font-medium block">Կցված ֆայլերի հերթականությունը.</span>
                                    {attachedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2.5 rounded-xl border border-white/10 text-xs">
                                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-gray-200 truncate font-medium">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachedFile(idx)}
                                                className="text-gray-400 hover:text-red-400 p-1 rounded-lg transition"
                                                title="Հեռացնել"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-end gap-3.5 mt-5 px-2.5 box-border">
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setName(''); setAttachedFiles([]); }}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || attachedFiles.length === 0}
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
                    docs.map(item => {
                        const filesList = parseRecordFiles(item.file_url);
                        return (
                            <div key={item.id} className="w-full box-border glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-3 group transition hover:border-blue-500/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                            <FileText size={16} />
                                        </div>
                                        <h3 className="text-sm text-gray-100 truncate font-bold">{item.name}</h3>
                                    </div>
                                    <button
                                        onClick={(e) => deleteDocument(item.id, e)}
                                        className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/15 transition cursor-pointer flex items-center justify-center flex-shrink-0"
                                        title={t('delete') || 'Ջնջել'}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-white/5">
                                    {filesList.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition text-xs border border-white/5"
                                        >
                                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-gray-300 truncate">{file.name || `Ֆայլ №${idx + 1}`}</span>
                                            </div>
                                            <ExternalLink size={13} className="text-blue-400 flex-shrink-0 ml-1" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}