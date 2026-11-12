import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Activity, FileText, Trash2, Edit3, X, Calendar, Stethoscope, Pill, Paperclip, ExternalLink, Search, User, Sparkles, Upload, CheckCircle2, Share2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function MedicalPage() {
    const { t } = useLanguage();
    const [records, setRecords] = useState([]);

    const [title, setTitle] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [prescription, setPrescription] = useState('');
    const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchMedicalRecords();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('Սխալ բժշկական տվյալները բեռնելիս:', error.message);
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
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('medical-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('medical-files')
                .getPublicUrl(filePath);

            setFileUrl(publicUrl);
            showToast('Ֆայլը հաջողությամբ կցվեց սարքավորումից!');
        } catch (error) {
            showToast('Ֆայլի բեռնման սխալ: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const saveRecord = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const recordData = {
                title,
                diagnosis,
                treatment,
                prescription,
                treatment_date: treatmentDate,
                file_url: fileUrl,
                user_id: user.id
            };

            if (editingId) {
                const { error } = await supabase
                    .from('medical_records')
                    .update(recordData)
                    .eq('id', editingId);

                if (error) throw error;

                setRecords(records.map(r => r.id === editingId ? { ...r, ...recordData } : r));
                setEditingId(null);
                showToast('Գրառումը հաջողությամբ թարմացվեց!');
            } else {
                const { data, error } = await supabase
                    .from('medical_records')
                    .insert([recordData])
                    .select();

                if (error) throw error;

                if (data) {
                    setRecords([data[0], ...records]);
                    showToast('Բժշկական գրառումը հաջողությամբ պահպանվեց!');
                }
            }

            setTitle('');
            setDiagnosis('');
            setTreatment('');
            setPrescription('');
            setTreatmentDate(new Date().toISOString().split('T')[0]);
            setFileUrl('');
            setShowForm(false);
        } catch (error) {
            showToast('Սխալ: ' + error.message, 'error');
        }
    };

    const startEditing = (record, e) => {
        if (e) e.stopPropagation();
        setEditingId(record.id);
        setTitle(record.title || '');
        setDiagnosis(record.diagnosis || '');
        setTreatment(record.treatment || '');
        setPrescription(record.prescription || '');
        setTreatmentDate(record.treatment_date || new Date().toISOString().split('T')[0]);
        setFileUrl(record.file_url || '');
        setShowForm(true);
        setSelectedRecord(null);
    };

    const deleteRecord = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const { error } = await supabase
                .from('medical_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRecords(records.filter(r => r.id !== id));
            setSelectedRecord(null);
            showToast('Գրառումը ջնջվեց', 'info');
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    const handleShare = async (record) => {
        const shareData = {
            title: record.title,
            text: `Բժշկական գրառում: ${record.title}\nԱխտորոշում: ${record.diagnosis || 'Չկա'}\nԲուժում: ${record.treatment || 'Չկա'}`,
            url: record.file_url || window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Կիսվելը չեղարկվեց');
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            showToast('Հղումը պատճենվեց!');
        }
    };

    return (
        <div className="font-sans pb-40 w-full max-w-md mx-auto px-4 pt-4 text-white relative overflow-x-hidden flex flex-col items-center">

            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
                    <div className={`px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border flex items-center gap-3 text-sm font-semibold ${toast.type === 'error'
                            ? 'bg-red-950/90 border-red-500/40 text-red-200'
                            : toast.type === 'info'
                                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                                : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                        }`}>
                        <Sparkles size={18} className="text-red-400" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Վերնագրի հատված */}
            <div className="w-full flex items-center justify-between mb-5">
                <Link to="/" className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition shadow-md">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-base font-bold text-white tracking-wider uppercase">
                    Բժշկական գրառումներ
                </h1>

                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(''); setDiagnosis(''); setTreatment(''); setPrescription(''); setFileUrl(''); }}
                    className="p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer bg-red-600/20 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {/* Մանրամասն դիտման մոդալ (Մեծացված տառերով) */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-sm glass-card p-6 rounded-3xl border border-red-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex-shrink-0">
                                    <Activity size={22} />
                                </div>
                                <h2 className="text-base font-bold text-white truncate">
                                    {selectedRecord.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-xl transition flex-shrink-0"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between text-gray-300 bg-white/5 p-3 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2.5">
                                    <Calendar size={16} className="text-red-400" />
                                    <span>Ամսաթիվ՝ <strong className="text-white">{selectedRecord.treatment_date}</strong></span>
                                </div>
                                <button
                                    onClick={() => handleShare(selectedRecord)}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-500/30 transition flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    <Share2 size={15} />
                                    <span>Կիսվել</span>
                                </button>
                            </div>

                            {selectedRecord.diagnosis && (
                                <div className="bg-[#070a14]/80 p-3.5 rounded-2xl border border-white/10">
                                    <span className="text-xs text-red-400 uppercase tracking-wider block font-bold mb-1.5">Ախտորոշում</span>
                                    <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm">{selectedRecord.diagnosis}</p>
                                </div>
                            )}

                            {selectedRecord.treatment && (
                                <div className="bg-[#070a14]/80 p-3.5 rounded-2xl border border-white/10">
                                    <span className="text-xs text-red-400 uppercase tracking-wider block font-bold mb-1.5">Բուժում</span>
                                    <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm">{selectedRecord.treatment}</p>
                                </div>
                            )}

                            {selectedRecord.prescription && (
                                <div className="bg-[#070a14]/80 p-3.5 rounded-2xl border border-white/10">
                                    <span className="text-xs text-red-400 uppercase tracking-wider block font-bold mb-1.5">Դեղատոմս</span>
                                    <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm">{selectedRecord.prescription}</p>
                                </div>
                            )}

                            {selectedRecord.file_url ? (
                                <div className="bg-[#070a14]/80 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        <Paperclip size={18} className="text-red-400 flex-shrink-0" />
                                        <span className="text-gray-200 truncate text-xs font-medium">Կցված փաստաթուղթ / նկար</span>
                                    </div>
                                    <a
                                        href={selectedRecord.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/40 border border-red-500/30 transition flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
                                    >
                                        <span>Բացել</span>
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            ) : (
                                <div className="bg-white/5 p-3 rounded-2xl text-gray-400 text-xs flex items-center gap-2.5">
                                    <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
                                    <span>Ֆայլ կցված չէ</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                            <button
                                onClick={(e) => startEditing(selectedRecord, e)}
                                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-red-300 bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 transition flex items-center gap-2"
                            >
                                <Edit3 size={16} />
                                <span>Խմբագրել</span>
                            </button>
                            <button
                                onClick={(e) => deleteRecord(selectedRecord.id, e)}
                                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-300 transition flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                <span>Ջնջել</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ավելացման / Խմբագրման ֆորմա */}
            {showForm && (
                <form onSubmit={saveRecord} className="w-full glass-card p-5 rounded-3xl border border-red-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-5 animate-fadeIn">
                    <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3.5">
                        {editingId ? 'Խմբագրել բժշկական գրառումը' : 'Նոր բժշկական գրառում'}
                    </h2>

                    <div className="space-y-3.5">
                        <input
                            type="text"
                            placeholder="Վերնագիր (օր. Ստուգում բժշկի մոտ)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            required
                        />

                        <div>
                            <label className="text-xs text-gray-400 ml-1 mb-1.5 block uppercase font-medium">Բուժման ամսաթիվ</label>
                            <input
                                type="date"
                                value={treatmentDate}
                                onChange={(e) => setTreatmentDate(e.target.value)}
                                className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                                required
                            />
                        </div>

                        <textarea
                            placeholder="Ախտորոշում..."
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            rows="2.5"
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] resize-none"
                        ></textarea>

                        <textarea
                            placeholder="Բուժում..."
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                            rows="2.5"
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] resize-none"
                        ></textarea>

                        <textarea
                            placeholder="Դեղատոմս (դեղեր, չափաբաժիններ)..."
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            rows="2.5"
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] resize-none"
                        ></textarea>

                        <div className="bg-[#070a14]/90 border border-white/15 rounded-2xl p-3.5 flex flex-col gap-2.5">
                            <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 font-medium">
                                <Upload size={16} className="text-red-400" />
                                <span>Կցել նկար կամ PDF սարքավորումից</span>
                            </label>

                            <label className="w-full py-3 px-4 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 transition text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-md">
                                <Upload size={18} />
                                <span>Ընտրել ֆայլ հեռախոսից</span>
                                <input
                                    type="file"
                                    onChange={(e) => handleDeviceFileUpload(e)}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                />
                            </label>

                            {uploading && <span className="text-xs text-amber-400 animate-pulse text-center">Բեռնվում է սարքավորումից...</span>}
                            {fileUrl && !uploading && (
                                <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                                    <span className="flex items-center gap-1.5 truncate">
                                        <CheckCircle2 size={16} />
                                        <span>Ֆայլը հաջողությամբ կցվեց</span>
                                    </span>
                                    <a href={fileUrl} target="_blank" rel="noreferrer" className="underline text-blue-400 ml-2">Ստուգել</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2.5 mt-4">
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingId(null); }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            Չեղարկել
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-600/50 border border-red-500/60 hover:bg-red-600/70 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition cursor-pointer disabled:opacity-50"
                        >
                            {editingId ? 'Թարմացնել' : 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            {/* Գրառումների ցանկը մեծացրած քարտերով */}
            <div className="w-full space-y-3.5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28">
                        <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center animate-[pulse_2s_infinite]">
                            <Activity size={30} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                        </div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm font-medium">
                        Բժշկական գրառումներ դեռևս չկան
                    </div>
                ) : (
                    records.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedRecord(item)}
                            className="w-full glass-card p-4.5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between group transition hover:border-red-500/50 cursor-pointer"
                        >
                            <div className="min-w-0 flex-1 pr-3">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <Activity size={18} className="text-red-400 flex-shrink-0" />
                                    <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-300">
                                    <span className="flex items-center gap-1 font-medium">
                                        <Calendar size={13} className="text-red-400" />
                                        {item.treatment_date}
                                    </span>
                                    {item.diagnosis && (
                                        <span className="truncate text-gray-400">
                                            • {item.diagnosis}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {item.file_url && (
                                    <span className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20" title="Կցված ֆայլ">
                                        <Paperclip size={16} />
                                    </span>
                                )}
                                <button
                                    onClick={(e) => deleteRecord(item.id, e)}
                                    className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/15 transition"
                                    title="Ջնջել"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Ստորին նավիգացիա */}
            <footer className="fixed bottom-2.5 left-0 right-0 mx-auto max-w-md px-4 z-40">
                <div className="border border-white/10 rounded-3xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-[#070a14]/90 backdrop-blur-2xl">
                    <nav className="grid grid-cols-4 gap-2 text-center">
                        <Link to="/" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span className="text-[10px] mt-1 font-medium">{t('home') || 'Home'}</span>
                        </Link>

                        <Link to="/search" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105 group">
                            <Search size={22} className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" />
                            <span className="text-[10px] mt-1 font-medium">{t('search') || 'Search'}</span>
                        </Link>

                        <Link to="/medical" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-red-400 bg-red-600/20 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all duration-300 hover:scale-105">
                            <Activity size={22} className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                            <span className="text-[10px] mt-1 font-semibold tracking-wide">Բժշկական</span>
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