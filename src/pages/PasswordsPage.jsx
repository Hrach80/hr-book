import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Lock, Eye, EyeOff, Trash2, KeyRound } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function PasswordsPage() {
    const [passwords, setPasswords] = useState([]);
    const [siteName, setSiteName] = useState('');
    const [username, setUsername] = useState('');
    const [passwordVal, setPasswordVal] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPasswords();
    }, []);

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
                alert('Խնդրում ենք նախ մուտք գործել համակարգ (Auth):');
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
                setShowForm(false);
            }
        } catch (error) {
            alert('Սխալ ավելացնելիս: ' + error.message);
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
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    const toggleVisibility = (id) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-4 max-w-md mx-auto pb-20 font-sans text-white">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link to="/" className="p-2 glass-card rounded-full mr-3 hover:bg-white/10 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold">Passwords</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="glass-card p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 transition flex items-center gap-1 text-xs font-medium"
                >
                    <Plus size={18} />
                    <span>Ավելացնել</span>
                </button>
            </div>

            {/* Ավելացման ֆորմա (Բացվող/Փակվող) */}
            {showForm && (
                <form onSubmit={addPassword} className="glass-card p-4 rounded-2xl mb-6 space-y-3 border border-white/10 shadow-neoDark">
                    <h3 className="text-sm font-semibold text-blue-400">Նոր գաղտնաբառի ավելացում</h3>
                    <input
                        type="text"
                        placeholder="Կայքի անուն (օր. GitHub)"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Օգտանուն / Էլ. փոստ"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Գաղտնաբառ"
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        className="w-full glass-card px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-gray-400 border border-white/10"
                        required
                    />
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600/50 hover:bg-blue-600/70 transition text-xs font-medium">
                        Պահպանել Բազայում
                    </button>
                </form>
            )}

            {/* Ցանկի ցուցադրում */}
            {loading ? (
                <p className="text-center text-gray-400 text-sm mt-10">Բեռնվում է...</p>
            ) : passwords.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">Պահպանված գաղտնաբառեր չկան</p>
            ) : (
                <div className="space-y-3">
                    {passwords.map(item => (
                        <div key={item.id} className="glass-card p-4 rounded-2xl flex items-center justify-between shadow-neoDark">
                            <div>
                                <h3 className="font-semibold text-sm text-yellow-400 flex items-center gap-2">
                                    <KeyRound size={16} />
                                    {item.site_name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">{item.username}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono tracking-widest bg-black/30 px-2 py-1 rounded-lg text-gray-300">
                                    {visiblePasswords[item.id] ? item.encrypted_password : '••••••••'}
                                </span>
                                <button
                                    onClick={() => toggleVisibility(item.id)}
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    {visiblePasswords[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={(e) => deletePassword(item.id, e)}
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