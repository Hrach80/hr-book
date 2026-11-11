import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, LogOut } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Ստուգում ենք՝ արդյոք օգտատերը արդեն մուտք է գործել
    useEffect(() => {
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };

    // Մուտք կամ Գրանցում
    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Մուտք
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                alert('Հաջողությամբ մուտք գործեցիք!');
                navigate('/');
            } else {
                // Գրանցում
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Գրանցումը հաջողվեց! Ստուգեք ձեր էլ. փոստը (եթե հաստատում է պահանջվում) կամ մուտք գործեք։');
                setIsLogin(true);
            }
        } catch (error) {
            alert('Սխալ: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Ելք համակարգից (Logout)
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    if (user) {
        return (
            <div className="p-4 max-w-md mx-auto min-h-screen flex flex-col justify-center items-center font-sans text-white text-center">
                <div className="glass-card p-6 rounded-3xl w-full shadow-neoDark space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                        <User size={32} />
                    </div>
                    <h2 className="text-lg font-bold">Դուք արդեն մուտք եք գործել</h2>
                    <p className="text-xs text-gray-400 break-all">{user.email}</p>

                    <div className="pt-4 space-y-2">
                        <Link to="/" className="block w-full py-3 rounded-2xl bg-blue-600/40 hover:bg-blue-600/60 transition text-sm font-medium">
                            Գլխավոր էջ
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="block w-full py-3 rounded-2xl bg-red-600/30 hover:bg-red-600/50 transition text-sm font-medium text-red-300 flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} />
                            <span>Դուրս գալ (Logout)</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto min-h-screen flex flex-col justify-center font-sans text-white">
            {/* Վերադարձի կոճակ */}
            <div className="absolute top-6 left-6">
                <Link to="/" className="p-2.5 glass-card rounded-full flex items-center justify-center hover:bg-white/10 transition">
                    <ArrowLeft size={20} />
                </Link>
            </div>

            <div className="glass-card p-8 rounded-3xl shadow-neoDark border border-white/10">
                <h1 className="text-2xl font-bold mb-2 text-center">
                    {isLogin ? 'Մուտք Հաշիվ' : 'Գրանցում'}
                </h1>
                <p className="text-xs text-gray-400 text-center mb-6">
                    {isLogin ? 'Մուտք գործեք՝ ձեր տվյալները սנքրոնիզացնելու համար' : 'Ստեղծեք նոր հաշիվ անվտանգ կերպով'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Էլ. փոստ (Email)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full glass-card pl-11 pr-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 transition"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input
                            type="password"
                            placeholder="Գաղտնաբառ (Password)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-card pl-11 pr-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-blue-600/50 hover:bg-blue-600/70 transition text-sm font-semibold shadow-neoDark disabled:opacity-50"
                    >
                        {loading ? 'Կատարվում է...' : (isLogin ? 'Մուտք գործել' : 'Գրանցվել')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs text-blue-400 hover:underline transition"
                    >
                        {isLogin ? 'Չունե՞ք հաշիվ։ Գրանցվեք' : 'Արդեն ունե՞ք հաշիվ։ Մուտք գործեք'}
                    </button>
                </div>
            </div>
        </div>
    );
}