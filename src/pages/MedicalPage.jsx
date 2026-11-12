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
            showToast('Հղումը պատճենվեց буфер обмена-ում!');
        }
    };

    return (
        <div className="font-sans pb-36 w-full max-w-md mx-auto px-4 pt-3 text-white relative overflow-x-hidden flex flex-col items-center">

            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
                    <div className={`px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border flex items-center gap-2.5 text-xs font-semibold ${toast.type === 'error'
                            ? 'bg-red-950/80 border-red-500/40 text-red-200'
                            : toast.type === 'info'
                                ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                        }`}>
                        <Sparkles size={16} className="text-red-400" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="w-full flex items-center justify-between mb-4">
                <Link to="/" className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition hover:scale-105 shadow-md">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-sm font-bold text-white tracking-wider uppercase">
                    Բժշկական գրառումներ
                </h1>

                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(''); setDiagnosis(''); setTreatment(''); setPrescription(''); setFileUrl(''); }}
                    className="p-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center cursor-pointer bg-red-600/20 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                </button>
            </div>

            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-sm glass-card p-5 rounded-3xl border border-red-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex-shrink-0">
                                    <Activity size={20} />
                                </div>
                                <h2 className="text-sm font-bold text-white truncate">
                                    {selectedRecord.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg transition flex-shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between text-gray-400 bg-white/5 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-red-400" />
                                    <span>Ամսաթիվ՝ <strong className="text-white">{selectedRecord.treatment_date}</strong></span>
                                </div>
                                <button
                                    onClick={() => handleShare(selectedRecord)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-500/30 transition flex items-center gap-1 text-[11px]"
                                >
                                    <Share2 size={13} />
                                    <span>Կիսվել</span>
                                </button>
                            </div>

                            {selectedRecord.diagnosis && (
                                <div className="bg-[#070a14]/80 p-3 rounded-2xl border border-white/10">
                                    <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold mb-1">Ախտորոշում</span>
                                    <p className="text-gray-200 whitespace-pre-wrap">{selectedRecord.diagnosis}</p>
                                </div>
                            )}

                            {selectedRecord.treatment && (
                                <div className="bg-[#070a14]/80 p-3 rounded-2xl border border-white/10">
                                    <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold mb-1">Բուժում</span>
                                    <p className="text-gray-200 whitespace-pre-wrap">{selectedRecord.treatment}</p>
                                </div>
                            )}

                            {selectedRecord.prescription && (
                                <div className="bg-[#070a14]/80 p-3 rounded-2xl border border-white/10">
                                    <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold mb-1">Դեղատոմս</span>
                                    <p className="text-gray-200 whitespace-pre-wrap">{selectedRecord.prescription}</p>
                                </div>
                            )}

                            {selectedRecord.file_url ? (
                                <div className="bg-[#070a14]/80 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <Paperclip size={16} className="text-red-400 flex-shrink-0" />
                                        <span className="text-gray-300 truncate text-[11px]">Կցված ֆայլ / փաստաթուղթ</span>
                                    </div>
                                    <a
                                        href={selectedRecord.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/40 border border-red-500/30 transition flex items-center gap-1 text-[11px] flex-shrink-0"
                                    >
                                        <span>Բացել</span>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            ) : (
                                <div className="bg-white/5 p-2.5 rounded-xl text-gray-400 text-[11px] flex items-center gap-2">
                                    <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                                    <span>Ֆայլ կցված չէ</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                            <button
                                onClick={(e) => startEditing(selectedRecord, e)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 transition flex items-center gap-1.5"
                            >
                                <Edit3 size={14} />
                                <span>Խմբագրել</span>
                            </button>
                            <button
                                onClick={(e) => deleteRecord(selectedRecord.id, e)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-300 transition flex items-center gap-1.5"
                            >
                                <Trash2 size={14} />
                                <span>Ջնջել</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={saveRecord} className="w-full glass-card p-4 rounded-3xl border border-red-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-4 animate-fadeIn">
                    <h2 className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2.5">
                        {editingId ? 'Խմբագրել բժշկական գրառումը' : 'Նոր բժշկական գրառում'}
                    </h2>

                    <div className="space-y-2.5">
                        <input
                            type="text"
                            placeholder="Վերնագիր (օր. Ստուգում բժշկի մոտ)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            required
                        />

                        <div>
                            <label className="text-[10px] text-gray-400 ml-1 mb-1 block uppercase">Բուժման ամսաթիվ</label>
                            <input
                                type="date"
                                value={treatmentDate}
                                onChange={(e) => setTreatmentDate(e.target.value)}
                                className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                                required
                            />
                        </div>

                        <textarea
                            placeholder="Ախտորոշում..."
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            rows="2"
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-3 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] resize-none"
                        ></textarea>

                        <textarea
                            placeholder="Բուժում..."
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                            rows="2"
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-3 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] resize-none"
                        ></textarea>

                        <textarea
                            placeholder="Դեղատոմս (դեղեր, չափաբաժիններ)..."
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            rows="2"
                            className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-3 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] resize-none"
                        ></textarea>

                        <div className="bg-[#070a14]/90 border border-white/15 rounded-2xl p-3 flex flex-col gap-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Upload size={14} className="text-red-400" />
                                <span>Ներբեռնել նկար կամ PDF սարքավորումից</span>
                            </label>

                            <label className="w-full py-2.5 px-3 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 transition text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
                                <Upload size={16} />
                                <span>Ընտրել ֆայլ հեռախոսից</span>
                                <input
                                    type="file"
                                    onChange={(e) => handleDeviceFileUpload(e)}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                />
                            </label>

                            {uploading && <span className="text-[11px] text-amber-400 animate-pulse text-center">Բեռնվում է սարքավորումից...</span>}
                            {fileUrl && !uploading && (
                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-emerald-500/30 text-emerald-400 text-[11px]">
                                    <span className="flex items-center gap-1 truncate">
                                        <CheckCircle2 size={14} />
                                        <span>Ֆայլը հաջողությամբ կցվեց</span>
                                    </span>
                                    <a href={fileUrl} target="_blank" rel="noreferrer" className="underline text-blue-400 ml-2">Ստուգել</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingId(null); }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            Չեղարկել
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600/50 border border-red-500/60 hover:bg-red-600/70 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition cursor-pointer disabled:opacity-50"
                        >
                            {editingId ? 'Թարմացնել' : 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            <div className="w-full space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                            <Activity size={28} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                        </div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-xs">
                        Բժշկական գրառումներ դեռևս չկան
                    </div>
                ) : (
                    records.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedRecord(item)}
                            className="w-full glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between group transition hover:border-red-500/40 cursor-pointer"
                        >
                            <div className="min-w-0 flex-1 pr-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity size={16} className="text-red-400 flex-shrink-0" />
                                    <h3 className="font-bold text-xs text-white truncate">{item.title}</h3>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} className="text-red-400/80" />
                                        {item.treatment_date}
                                    </span>
                                    {item.diagnosis && (
                                        <span className="truncate text-gray-300">
                                            • {item.diagnosis}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {item.file_url && (
                                    <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400" title="Կցված ֆայլ">
                                        <Paperclip size={14} />
                                    </span>
                                )}
                                <button
                                    onClick={(e) => deleteRecord(item.id, e)}
                                    className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                                    title="Ջնջել"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <footer className="fixed bottom-2 left-0 right-0 mx-auto max-w-md px-4 z-40">
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