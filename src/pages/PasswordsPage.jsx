import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Lock, Eye, EyeOff, Trash2, KeyRound, X, Check, Search, User, Sparkles, Edit3, Copy, Bell } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function PasswordsPage() {
    const { t } = useLanguage();
    const location = useLocation();

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [savedPin, setSavedPin] = useState(localStorage.getItem('app_vault_pin') || '');
    const [settingNewPin, setSettingNewPin] = useState(!localStorage.getItem('app_vault_pin'));
    const [passwords, setPasswords] = useState([]);
    const [siteName, setSiteName] = useState('');
    const [username, setUsername] = useState('');
    const [passwordVal, setPasswordVal] = useState('');
    const [isAddingOpen, setIsAddingOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editSiteName, setEditSiteName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editPasswordVal, setEditPasswordVal] = useState('');
    const [selectedPassword, setSelectedPassword] = useState(null);
    const [showDetailPassword, setShowDetailPassword] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Հիշեցումների չանցած քանակը ֆուտերի բեջի համար
    const [upcomingCount, setUpcomingCount] = useState(0);

    useEffect(() => {
        if (isUnlocked) {
            fetchPasswords();
        }
        fetchRemindersCount();
    }, [isUnlocked]);

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

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput.length !== 4) {
            showToast(t('enterPinError') || 'Խնդրում ենք մուտքագրել 4-անիշ պին կոդ', 'error');
            return;
        }

        if (settingNewPin) {
            localStorage.setItem('app_vault_pin', pinInput);
            setSavedPin(pinInput);
            setSettingNewPin(false);
            setIsUnlocked(true);
            showToast(t('pinSetSuccess') || 'Պին կոդը հաջողությամբ սահմանվեց!');
        } else {
            if (pinInput === savedPin) {
                setIsUnlocked(true);
                setPinInput('');
            } else {
                showToast(t('wrongPinError') || 'Սխալ պին կոդ', 'error');
                setPinInput('');
            }
        }
    };

    const fetchPasswords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('passwords')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPasswords(data || []);
        } catch (error) {
            console.error('Սխալ գաղտնաբառերը բեռնելիս:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addPassword = async (e) => {
        e.preventDefault();
        if (!siteName.trim() || !username.trim() || !passwordVal.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const { data, error } = await supabase
                .from('passwords')
                .insert([{
                    site_name: siteName,
                    username: username,
                    encrypted_password: passwordVal,
                    user_id: user.id
                }])
                .select();

            if (error) throw error;

            if (data) {
                setPasswords([data[0], ...passwords]);
                setSiteName('');
                setUsername('');
                setPasswordVal('');
                setIsAddingOpen(false);
                showToast(t('passwordSaved') || 'Գաղտնաբառը հաջողությամբ պահպանվեց!');
            }
        } catch (error) {
            showToast('Սխալ ավելացնելիս: ' + error.message, 'error');
        }
    };

    const startEditing = (item, e) => {
        e.stopPropagation();
        setEditingId(item.id);
        setEditSiteName(item.site_name);
        setEditUsername(item.username);
        setEditPasswordVal(item.encrypted_password);
        setIsAddingOpen(false);
        setSelectedPassword(null);
    };

    const saveEdit = async (id, e) => {
        e.preventDefault();
        if (!editSiteName.trim() || !editUsername.trim() || !editPasswordVal.trim()) return;

        try {
            const { error } = await supabase
                .from('passwords')
                .update({
                    site_name: editSiteName,
                    username: editUsername,
                    encrypted_password: editPasswordVal
                })
                .eq('id', id);

            if (error) throw error;

            setPasswords(passwords.map(p => p.id === id ? {
                ...p,
                site_name: editSiteName,
                username: editUsername,
                encrypted_password: editPasswordVal
            } : p));

            setEditingId(null);
            showToast(t('passwordEdited') || 'Գաղտնաբառը հաջողությամբ խմբագրվեց!');
        } catch (error) {
            showToast('Սխալ խմբագրելիս: ' + error.message, 'error');
        }
    };

    const deletePassword = async (id, e) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('passwords')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPasswords(passwords.filter(p => p.id !== id));
            setSelectedPassword(null);
            showToast(t('passwordDeleted') || 'Գաղտնաբառը ջնջվեց', 'info');
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    const toggleVisibility = (id) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        const msg = type === 'username'
            ? (t('usernameCopied') || 'Օգտանունը պատճենվեց')
            : (t('passwordCopied') || 'Գաղտնաբառը պատճենվեց');
        showToast(msg);
    };

    if (!isUnlocked) {
        return (
            <div className="font-sans pb-36 w-full max-w-md mx-auto px-4 pt-12 text-white relative overflow-x-hidden flex flex-col items-center min-h-screen">
                <div className="w-full flex items-center justify-between mb-8">
                    <Link to="/" className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition shadow-md">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-sm font-bold text-white tracking-wider uppercase">
                        {settingNewPin ? (t('createNewPin') || 'Ստեղծել Պին Կոդ') : (t('passwordsTitle') || 'Գաղտնաբառերի պահոց')}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="w-full glass-card p-6 rounded-3xl border border-blue-500/30 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center mt-10 animate-fadeIn">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-[pulse_2s_infinite]">
                        <Lock size={32} />
                    </div>

                    <h2 className="text-sm font-bold text-white mb-2">
                        {settingNewPin ? (t('createNewPin') || 'Մուտքագրեք նոր 4-անիշ PIN կոդ') : (t('vaultLocked') || 'Պահոցը կողպված է')}
                    </h2>
                    <p className="text-xs text-gray-400 mb-6">
                        {settingNewPin ? (t('pinDescription') || 'Այս կոդը կպաշտպանի ձեր գաղտնաբառերը') : (t('pinPrompt') || 'Մուտքագրեք ձեր 4-անիշ PIN կոդը շարունակելու համար')}
                    </p>

                    <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
                        <input
                            type="password"
                            maxLength="4"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="••••"
                            className="w-full bg-[#070a14] border border-blue-500/50 rounded-2xl py-3 text-center text-xl tracking-[1em] text-white outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 rounded-2xl bg-blue-600/40 border border-blue-500/50 hover:bg-blue-600/60 text-xs font-semibold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition cursor-pointer hover:scale-[1.02]"
                        >
                            {settingNewPin ? (t('createAndEnter') || 'Ստեղծել և Մուտք գործել') : (t('unlockVault') || 'Բացել Պահոցը')}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

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
                        <Sparkles size={16} className="text-blue-400" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="w-full flex items-center justify-between mb-4">
                <Link to="/" className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition hover:scale-105 shadow-md">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-sm font-bold text-white tracking-wider uppercase">
                    {t('passwordsTitle') || 'Գաղտնաբառեր'}
                </h1>

                <button
                    onClick={() => { setIsAddingOpen(!isAddingOpen); setEditingId(null); setSelectedPassword(null); }}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center cursor-pointer ${isAddingOpen
                            ? 'bg-red-600/20 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        }`}
                >
                    {isAddingOpen ? <X size={18} /> : <Plus size={18} />}
                </button>
            </div>

            {/* ՄԱՆՐԱՄԱՍՆ ԴԻՏՄԱՆ ՄՈԴԱԼ ՊԱՏՈՒՀԱՆ */}
            {selectedPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-sm glass-card p-5 rounded-3xl border border-blue-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                                    <KeyRound size={20} />
                                </div>
                                <h2 className="text-sm font-bold text-white">
                                    {selectedPassword.site_name}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedPassword(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 pt-1">
                            <div className="bg-[#070a14]/80 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{t('usernamePlaceholder') || 'Օգտանուն / Էլ. փոստ'}</span>
                                    <span className="text-xs text-white font-medium truncate block mt-0.5">{selectedPassword.username}</span>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(selectedPassword.username, 'username')}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 border border-white/10 transition flex items-center gap-1 text-[11px]"
                                >
                                    <Copy size={14} />
                                    <span>{t('copy') || 'Պատճենել'}</span>
                                </button>
                            </div>

                            <div className="bg-[#070a14]/80 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{t('passwordPlaceholder') || 'Գաղտնաբառ'}</span>
                                    <span className="text-xs text-white font-mono font-medium truncate block mt-0.5">
                                        {showDetailPassword ? selectedPassword.encrypted_password : '••••••••••••'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setShowDetailPassword(!showDetailPassword)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition"
                                    >
                                        {showDetailPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(selectedPassword.encrypted_password, 'password')}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 border border-white/10 transition flex items-center gap-1 text-[11px]"
                                    >
                                        <Copy size={14} />
                                        <span>{t('copy') || 'Պատճենել'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                            <button
                                onClick={(e) => startEditing(selectedPassword, e)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 transition flex items-center gap-1.5"
                            >
                                <Edit3 size={14} />
                                <span>{t('editPasswordTitle') || 'Խմբագրել'}</span>
                            </button>
                            <button
                                onClick={(e) => deletePassword(selectedPassword.id, e)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 transition flex items-center gap-1.5"
                            >
                                <Trash2 size={14} />
                                <span>{t('delete') || 'Ջնջել'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ՆՈՐ ԳԱՂՏՆԱԲԱՌԻ ԱՎԵԼԱՑՄԱՆ ՎԱՀԱՆԱԿ */}
            {isAddingOpen && (
                <form onSubmit={addPassword} className="w-full glass-card p-4 rounded-3xl border border-blue-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-4 animate-fadeIn">
                    <h2 className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-2.5">
                        {t('newPasswordTitle') || 'Նոր գաղտնաբառ'}
                    </h2>
                    <input
                        type="text"
                        placeholder={t('siteNamePlaceholder') || 'Կայքի անուն (օր. GitHub)'}
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] mb-2.5"
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('usernamePlaceholder') || 'Օգտանուն / Էլ. փոստ'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] mb-2.5"
                        required
                    />
                    <input
                        type="password"
                        placeholder={t('passwordPlaceholder') || 'Գաղտնաբառ'}
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] mb-3"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAddingOpen(false)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600/50 border border-blue-500/60 hover:bg-blue-600/70 shadow-[0_0_12px_rgba(59,130,246,0.4)] transition cursor-pointer"
                        >
                            {t('save') || 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            <div className="w-full space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                            <Lock size={28} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-bounce" />
                        </div>
                    </div>
                ) : passwords.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-xs">
                        {t('noPasswords') || 'Պահպանված գաղտնաբառեր չկան'}
                    </div>
                ) : (
                    passwords.map(item => {
                        const isEditing = editingId === item.id;

                        if (isEditing) {
                            return (
                                <form key={item.id} onSubmit={(e) => saveEdit(item.id, e)} className="w-full glass-card p-4 rounded-3xl border border-amber-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] animate-fadeIn">
                                    <h2 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2.5">
                                        {t('editPasswordTitle') || 'Խմբագրել գաղտնաբառը'}
                                    </h2>
                                    <input
                                        type="text"
                                        value={editSiteName}
                                        onChange={(e) => setEditSiteName(e.target.value)}
                                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-amber-500/60 mb-2.5"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-amber-500/60 mb-2.5"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={editPasswordVal}
                                        onChange={(e) => setEditPasswordVal(e.target.value)}
                                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-amber-500/60 mb-3"
                                        required
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition"
                                        >
                                            {t('cancel') || 'Չեղարկել'}
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-amber-600/50 border border-amber-500/60 hover:bg-amber-600/70 shadow-[0_0_12px_rgba(217,119,6,0.4)] transition"
                                        >
                                            {t('update') || 'Թարմացնել'}
                                        </button>
                                    </div>
                                </form>
                            );
                        }

                        return (
                            <div
                                key={item.id}
                                onClick={() => { setSelectedPassword(item); setShowDetailPassword(false); }}
                                className="w-full glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between group transition hover:border-blue-500/40 cursor-pointer"
                            >
                                <div className="min-w-0 flex-1 pr-2">
                                    <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2 truncate">
                                        <KeyRound size={16} className="flex-shrink-0 text-blue-400" />
                                        <span className="truncate">{item.site_name}</span>
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{item.username}</p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs font-mono tracking-widest bg-black/40 px-2.5 py-1.5 rounded-xl text-gray-300 border border-white/5">
                                        {visiblePasswords[item.id] ? item.encrypted_password : '••••••••'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleVisibility(item.id); }}
                                        className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
                                    >
                                        {visiblePasswords[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Ներքևի նավիգացիոն մենյու (Ֆուտեր) */}
            <footer className="fixed bottom-2 left-0 right-0 mx-auto max-w-md px-4 z-40">
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
                        <Link to="/search" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/search'
                            ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Search size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all'} />
                            <span className={`text-[10px] mt-1 ${location.pathname === '/search' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('search') || 'Search'}</span>
                        </Link>

                        {/* 3. Reminders (Հիշեցումներ) + Կարմիր բեջ */}
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