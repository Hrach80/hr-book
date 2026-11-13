import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Circle, Trash2, Edit3, X, Check, Search, User, Sparkles, Clock, Bell } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function NotesPage() {
    const { t } = useLanguage();
    const location = useLocation();
    const [notes, setNotes] = useState([]);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [loading, setLoading] = useState(true);

    // Հիշեցումների չանցած քանակը ֆուտերի բեջի համար
    const [upcomingCount, setUpcomingCount] = useState(0);

    const [isAddingOpen, setIsAddingOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchNotes();
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

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Սխալ նշումները բեռնելիս:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (e) => {
        e.preventDefault();
        if (!newNoteTitle.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const { data, error } = await supabase
                .from('notes')
                .insert([{ title: newNoteTitle, user_id: user.id, completed: false }])
                .select();

            if (error) throw error;

            if (data) {
                setNotes([data[0], ...notes]);
                setNewNoteTitle('');
                setIsAddingOpen(false);
                showToast(t('noteSaved') || 'Նշումը հաջողությամբ պահպանվեց!');
            }
        } catch (error) {
            showToast('Սխալ ավելացնելիս: ' + error.message, 'error');
        }
    };

    const saveEdit = async (id) => {
        if (!editText.trim()) return;
        try {
            const { error } = await supabase
                .from('notes')
                .update({ title: editText })
                .eq('id', id);

            if (error) throw error;

            setNotes(notes.map(n => n.id === id ? { ...n, title: editText } : n));
            setEditingId(null);
            setEditText('');
            showToast(t('noteEdited') || 'Նշումը հաջողությամբ խմբագրվեց!');
        } catch (error) {
            showToast('Սխալ խմբագրելիս: ' + error.message, 'error');
        }
    };

    const toggleNote = async (id, currentCompleted) => {
        try {
            const { error } = await supabase
                .from('notes')
                .update({ completed: !currentCompleted })
                .eq('id', id);

            if (error) throw error;

            setNotes(notes.map(n => n.id === id ? { ...n, completed: !currentCompleted } : n));
        } catch (error) {
            console.error('Սխալ թարմացնելիս:', error.message);
        }
    };

    const deleteNote = async (id, e) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNotes(notes.filter(n => n.id !== id));
            showToast(t('noteDeleted') || 'Նշումը ջնջվեց', 'info');
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    const toggleExpand = (id) => {
        if (editingId) return;
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
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
                        <Sparkles size={16} className="text-emerald-400" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="w-full flex items-center justify-between mb-4">
                <Link to="/" className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition hover:scale-105 shadow-md">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-sm font-bold text-white tracking-wider uppercase">
                    {t('notesTitle') || 'Notes & Tasks'}
                </h1>

                <button
                    onClick={() => setIsAddingOpen(!isAddingOpen)}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center cursor-pointer ${isAddingOpen
                            ? 'bg-red-600/20 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                >
                    {isAddingOpen ? <X size={18} /> : <Plus size={18} />}
                </button>
            </div>

            {/* Նոր նշում հավելելու սահուն բացվող վահանակ (Inline Slide-down Panel) */}
            {isAddingOpen && (
                <form onSubmit={addNote} className="w-full glass-card p-4 rounded-3xl border border-emerald-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-4 animate-fadeIn">
                    <h2 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-2">
                        {t('addNewNote') || 'Նոր նշում կամ անելիք'}
                    </h2>

                    {/* text-base-ը (16px) կանխում է Այֆոնի ավտոմատ մեծացումն ու էջի շեղումը */}
                    <textarea
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder={t('notePlaceholder') || 'Գրեք ձեր նշումը այստեղ...'}
                        rows="3"
                        className="w-full bg-[#070a14]/90 border border-white/15 rounded-2xl p-3 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-xl transition resize-none mb-3"
                        autoFocus
                    ></textarea>

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
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600/50 border border-emerald-500/60 hover:bg-emerald-600/70 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition cursor-pointer"
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
                            <Clock size={28} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-spin" style={{ animationDuration: '4s' }} />
                        </div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-xs">
                        {t('noNotes') || 'Նշումներ դեռևս չկան'}
                    </div>
                ) : (
                    notes.map(note => {
                        const isExpanded = !!expandedIds[note.id];
                        const isEditing = editingId === note.id;

                        return (
                            <div
                                key={note.id}
                                onClick={() => toggleExpand(note.id)}
                                className="w-full glass-card p-3.5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition hover:border-white/30 cursor-pointer group flex flex-col gap-2"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleNote(note.id, note.completed); }}
                                            className="mt-0.5 text-gray-400 hover:text-emerald-400 transition"
                                        >
                                            {note.completed ? (
                                                <CheckCircle className="text-emerald-400 flex-shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" size={18} />
                                            ) : (
                                                <Circle className="text-gray-500 flex-shrink-0 group-hover:text-gray-300 transition" size={18} />
                                            )}
                                        </button>

                                        {isEditing ? (
                                            <div className="flex-1 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full bg-[#070a14] border border-blue-500/50 rounded-xl px-2.5 py-1.5 text-base sm:text-xs text-white outline-none"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => saveEdit(note.id)}
                                                    className="p-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50 transition"
                                                    title={t('save') || 'Պահպանել'}
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1.5 rounded-lg bg-gray-600/30 border border-gray-500/40 text-gray-300 hover:bg-gray-600/50 transition"
                                                    title={t('cancel') || 'Չեղարկել'}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`text-xs ${note.completed ? 'line-through text-gray-500' : 'text-gray-200'} ${isExpanded ? 'whitespace-pre-wrap' : 'truncate'}`}>
                                                {note.title}
                                            </div>
                                        )}
                                    </div>

                                    {!isEditing && (
                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setEditingId(note.id); setEditText(note.title); }}
                                                className="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition"
                                                title={t('edit') || 'Խմբագրել'}
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            <button
                                                onClick={(e) => deleteNote(note.id, e)}
                                                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                                                title={t('delete') || 'Ջնջել'}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
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