import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Circle, Trash2, Edit3, X, Check, Search, User, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function NotesPage() {
    const { t } = useLanguage();
    const [notes, setNotes] = useState([]);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [loading, setLoading] = useState(true);

    const [isAddingOpen, setIsAddingOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchNotes();
    }, []);

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
        <div className="font-sans pb-32 max-w-md mx-auto px-4 pt-3 text-white relative min-h-screen flex flex-col items-center">

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

            <div className="w-full flex items-center justify-between mb-5">
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

            {isAddingOpen && (
                <form onSubmit={addNote} className="w-full glass-card p-4 rounded-3xl border border-emerald-500/30 bg-[#0b0f19]/95 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-5 animate-fadeIn">
                    <h2 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-2.5">
                        {t('addNewNote') || 'Նոր նշում կամ անելիք'}
                    </h2>
                    <textarea
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder={t('notePlaceholder') || 'Գրեք ձեր նշումը այստեղ...'}
                        rows="3"
                        className="w-full bg-[#070a14]/80 border border-white/15 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-xl transition resize-none mb-3"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAddingOpen(false)}
                            className="px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl text-[11px] font-semibold text-white bg-emerald-600/40 border border-emerald-500/50 hover:bg-emerald-600/60 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition cursor-pointer"
                        >
                            {t('save') || 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            <div className="w-full space-y-3">
                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-xs">
                        {t('loading') || 'Բեռնվում է...'}
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
                                                    className="w-full bg-[#070a14] border border-blue-500/50 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
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

                        <Link to="/notes" className="flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-emerald-400 bg-emerald-600/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-300 hover:scale-105">
                            <Plus size={22} className="drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] mt-1 font-semibold tracking-wide">{t('add') || 'Add'}</span>
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