import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Activity, FileText, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function MedicalPage() {
    const [records, setRecords] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicalRecords();
    }, []);

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

    const addRecord = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Խնդրում ենք նախ մուտք գործել համակարգ (Auth):');
                return;
            }

            const { data, error } = await supabase
                .from('medical_records')
                .insert([{ title, description, user_id: user.id }])
                .select();

            if (error) throw error;

            if (data) {
                setRecords([data[0], ...records]);
                setTitle('');
                setDescription('');
                setShowForm(false);
            }
        } catch (error) {
            alert('Սխալ ավելացնելիս: ' + error.message);
        }
    };

    const deleteRecord = async (id, e) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('medical_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRecords(records.filter(r => r.id !== id));
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto pb-20 font-sans text-white">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link to="/" className="p-2 glass-card rounded-full mr-3 hover:bg-white/10 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold">Medical Records</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="glass-card p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 transition flex items-center gap-1 text-xs font-medium"
                >
                    <Plus size={18} />
                    <span>Ավելացնել</span>
                </button>
            </div>

            {showForm && (
                <form onSubmit={addRecord} className="glass-card p-4 rounded-2xl mb-6 space-y-3 border border-white/10 shadow-neoDark">
                    <h3 className="text-sm font-semibold text-red-400">Նոր բժշկական գրառում</h3>
                    <input
                        type="text"
                        placeholder="Վերնագիր (օր. Անալիզների արդյունքներ)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10"
                        required
                    />
                    <textarea
                        placeholder="Նկարագրություն կամ նշումներ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10 resize-none h-20"
                    />
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600/50 hover:bg-blue-600/70 transition text-xs font-medium">
                        Պահպանել Բազայում
                    </button>
                </form>
            )}

            {loading ? (
                <p className="text-center text-gray-400 text-sm mt-10">Բեռնվում է...</p>
            ) : records.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">Բժշկական գրառումներ չկան</p>
            ) : (
                <div className="space-y-3">
                    {records.map(item => (
                        <div key={item.id} className="glass-card p-4 rounded-2xl shadow-neoDark">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="text-red-400 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                                        {item.description && <p className="text-xs text-gray-300 mt-1">{item.description}</p>}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteRecord(item.id, e)}
                                    className="text-gray-500 hover:text-red-400 transition p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}