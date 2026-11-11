import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [loading, setLoading] = useState(true);

    // Բեռնում ենք նշումները Supabase-ից
    useEffect(() => {
        fetchNotes();
    }, []);

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

    // Նոր նշումի ավելացում
    const addNote = async (e) => {
        e.preventDefault();
        if (!newNoteTitle.trim()) return;

        try {
            // Ստուգում ենք՝ արդյոք օգտատերը մուտք է գործել
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Խնդրում ենք նախ մուտք գործել համակարգ (Auth):');
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
            }
        } catch (error) {
            alert('Սխալ ավելացնելիս: ' + error.message);
        }
    };

    // Կարգավիճակի փոխում (completed)
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

    // Նշումի ջնջում
    const deleteNote = async (id, e) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto pb-20 font-sans text-white">
            {/* Վերնագիր */}
            <div className="flex items-center mb-6">
                <Link to="/" className="p-2 glass-card rounded-full mr-3 hover:bg-white/10 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">Notes & Tasks</h1>
            </div>

            {/* Նոր նշումի մուտքագրման դաշտ */}
            <form onSubmit={addNote} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Նոր նշում կամ անելիք..."
                    className="flex-1 glass-card px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 transition"
                />
                <button type="submit" className="glass-card p-3 rounded-2xl bg-blue-600/30 hover:bg-blue-600/50 transition flex items-center justify-center">
                    <Plus size={20} className="text-blue-400" />
                </button>
            </form>

            {/* Բեռնման վիճակ */}
            {loading ? (
                <p className="text-center text-gray-400 text-sm mt-10">Բեռնվում է...</p>
            ) : notes.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">Նշումներ դեռևս չկան</p>
            ) : (
                <div className="space-y-3">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => toggleNote(note.id, note.completed)}
                            className="glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition shadow-neoDark"
                        >
                            <div className="flex items-center gap-3">
                                {note.completed ? <CheckCircle className="text-green-400 flex-shrink-0" size={20} /> : <Circle className="text-gray-500 flex-shrink-0" size={20} />}
                                <span className={`text-sm ${note.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                    {note.title}
                                </span>
                            </div>
                            <button
                                onClick={(e) => deleteNote(note.id, e)}
                                className="text-gray-500 hover:text-red-400 transition p-1"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}