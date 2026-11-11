import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Folder, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function DocsPage() {
    const [docs, setDocs] = useState([]);
    const [name, setName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

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

    const addDocument = async (e) => {
        e.preventDefault();
        if (!name.trim() || !fileUrl.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Խնդրում ենք նախ մուտք գործել համակարգ (Auth):');
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
            }
        } catch (error) {
            alert('Սխալ ավելացնելիս: ' + error.message);
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
                    <h1 className="text-xl font-bold">Important Files & Links</h1>
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
                <form onSubmit={addDocument} className="glass-card p-4 rounded-2xl mb-6 space-y-3 border border-white/10 shadow-neoDark">
                    <h3 className="text-sm font-semibold text-purple-400">Նոր փաստաթուղթ կամ հղում</h3>
                    <input
                        type="text"
                        placeholder="Անվանում (օր. GitHub Պրոֆիլ)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10"
                        required
                    />
                    <input
                        type="url"
                        placeholder="Հղում (https://...)"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10"
                        required
                    />
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600/50 hover:bg-blue-600/70 transition text-xs font-medium">
                        Պահպանել Բազայում
                    </button>
                </form>
            )}

            {loading ? (
                <p className="text-center text-gray-400 text-sm mt-10">Բեռնվում է...</p>
            ) : docs.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">Փաստաթղթեր դեռևս չկան</p>
            ) : (
                <div className="space-y-3">
                    {docs.map(item => (
                        <div key={item.id} className="glass-card p-4 rounded-2xl flex items-center justify-between shadow-neoDark">
                            <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 flex-1 hover:opacity-80 transition"
                            >
                                <Folder className="text-purple-400 flex-shrink-0" size={20} />
                                <span className="text-sm text-gray-200 truncate">{item.name}</span>
                                <ExternalLink size={14} className="text-gray-400 ml-auto mr-2" />
                            </a>
                            <button
                                onClick={(e) => deleteDocument(item.id, e)}
                                className="text-gray-500 hover:text-red-400 transition p-1 ml-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}