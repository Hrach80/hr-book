import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Folder, ExternalLink, Trash2, X, Upload, CheckCircle2, Sparkles, Search, User, Activity } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function DocsPage() {
    const { t } = useLanguage();
    const [docs, setDocs] = useState([]);
    const [name, setName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocs(data || []);
        } catch (error) {
            console.error('Սխալ փաստաթղթերը բեռնելիս:', error.message);
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
                .from('documents')
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
                .from('documents')
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
                        <Sparkles size={18} className="text-purple-400 flex-shrink-0" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Վերնագրի հատված */}
            <div className="w-full flex items-center justify-between mb-5 px-1 box-border">
                <Link to="/" className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition shadow-md flex items-center justify-center">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-base font-bold text-white tracking-wider uppercase text-center">
                    {t('docsTitle') || 'Փաստաթղթեր և հղումներ'}
                </h1>

                <button
                    onClick={() => { setShowForm(!showForm); setName(''); setFileUrl(''); }}
                    className="p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {/* Ավելացման ֆորմա */}
            {showForm && (
                <form onSubmit={addDocument} className="w-full box-border glass-card p-5 rounded-3xl border border-purple-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-5 animate-fadeIn">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 px-1">
                        {t('newDocument') || 'Նոր փաստաթուղթ կամ հղում'}
                    </h3>

                    <div className="w-full space-y-4 box-border">
                        <input
                            type="text"
                            placeholder={t('docNamePlaceholder') || 'Անվանում (օր. GitHub Պրոֆիլ)'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            required
                        />

                        <div className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl p-4 flex flex-col gap-3">
                            <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 font-medium">
                                <Upload size={16} className="text-purple-400 flex-shrink-0" />
                                <span>{t('uploadFileLabel') || 'Կցել ֆայլ հեռախոսից կամ մուտքագրել հղում'}</span>
                            </label>

                            <label className="w-full box-border py-3 px-4 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-md">
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
                                    className="w-full box-border bg-[#070a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
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
                            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600/50 border border-purple-500/60 hover:bg-purple-600/70 shadow-[0_0_12px_rgba(168,85,247,0.4)] transition cursor-pointer disabled:opacity-50"
                        >
                            {t('save') || 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            {/* Փաստաթղթերի ցանկը */}
            <div className="w-full space-y-3.5 box-border px-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28">
                        <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center animate-[pulse_2s_infinite]">
                            <Folder size={30} className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
                        </div>
                    </div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm font-medium">
                        {t('noDocs') || 'Փաստաթղթեր կամ հղումներ դեռևս չկան'}
                    </div>
                ) : (
                    docs.map(item => (
                        <div key={item.id} className="w-full box-border glass-card px-4 py-3.5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 group transition hover:border-purple-500/50">
                            <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition"
                            >
                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                    <Folder size={16} />
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

            {/* Ստորին նավիգացիա */}
            <footer className="fixed bottom-2.5 left-0 right-0 mx-auto max-w-md px-4 z-40 box-border">
                <div className="border border-white/10 rounded-3xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-[#070a14]/90 backdrop-blur-2xl box-border">
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

                        <Link to="/medical" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105 group">
                            <Activity size={22} className="group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] transition-all" />
                            <span className="text-[10px] mt-1 font-medium">{t('medical') || 'Բժշկական'}</span>
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