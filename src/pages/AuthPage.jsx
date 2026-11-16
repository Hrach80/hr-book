import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, LogOut, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
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
        setMessage({ type: '', text: '' });

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Հաջողությամբ մուտք գործեցիք համակարգ' });
                setTimeout(() => navigate('/'), 800);
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Գրանցումը հաջողվեց։ Խնդրում ենք մուտք գործել' });
                setIsLogin(true);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Սխալ՝ ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    // Ելք համակարգից
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setMessage({ type: 'success', text: 'Դուք հաջողությամբ դուրս եկաք' });
    };

    if (user) {
        return (
            <div className="p-4 max-w-md mx-auto min-h-screen flex flex-col justify-center items-center font-sans text-white text-center animate-softFadeScale">
                <div className="glass-card p-8 rounded-3xl w-full shadow-2xl border border-white/15 bg-[#0b0f19]/90 backdrop-blur-2xl space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                        <User size={30} />
                    </div>
                    <div>
                        <h2 className="text-lg font-normal tracking-wide">Ակտիվ հաշիվ</h2>
                        <p className="text-xs text-gray-400 mt-1 break-all font-light">{user.email}</p>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs animate-fadeIn ${message.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div className="pt-2 space-y-3">
                        <Link to="/" className="block w-full py-3 rounded-2xl bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/40 transition text-sm font-normal text-white shadow-md">
                            Գլխավոր էջ
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full py-3 rounded-2xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 transition text-sm font-normal text-red-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <LogOut size={16} />
                            <span>Դուրս գալ համակարգից</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto min-h-screen flex flex-col justify-center font-sans text-white relative animate-softFadeScale">
            {/* Վերադարձի կոճակ */}
            <div className="absolute top-6 left-6">
                <Link to="/" className="p-2.5 glass-card rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition shadow-md">
                    <ArrowLeft size={18} className="text-cyan-400" />
                </Link>
            </div>

            <div className="glass-card p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/15 bg-[#0b0f19]/90 backdrop-blur-2xl">
                <h1 className="text-xl font-normal mb-1.5 text-center tracking-wide">
                    {isLogin ? 'Մուտք հաշիվ' : 'Նոր գրանցում'}
                </h1>
                <p className="text-xs text-gray-400 text-center mb-6 font-light">
                    {isLogin ? 'Մուտք գործեք ձեր տվյալները կառավարելու համար' : 'Ստեղծեք ձեր անձնական անվտանգ հաշիվը'}
                </p>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-2xl flex items-center gap-2.5 text-xs animate-fadeIn ${message.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Էլեկտրոնային հասցե"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0d1322] pl-11 pr-4 py-3 rounded-2xl text-base outline-none text-white placeholder-gray-400 border border-white/15 focus:border-cyan-500 transition shadow-inner font-light"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Գաղտնաբառ"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0d1322] pl-11 pr-12 py-3 rounded-2xl text-base outline-none text-white placeholder-gray-400 border border-white/15 focus:border-cyan-500 transition shadow-inner font-light"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white transition cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600/60 to-cyan-600/50 hover:from-blue-600/80 hover:to-cyan-600/70 border border-blue-400/40 transition text-sm font-normal tracking-wider uppercase shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Կատարվում է...' : (isLogin ? 'Մուտք գործել' : 'Գրանցվել')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage({ type: '', text: '' });
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition font-light cursor-pointer"
                    >
                        {isLogin ? 'Չունե՞ք հաշիվ։ Ստեղծեք նորը' : 'Արդեն ունե՞ք հաշիվ։ Մուտք գործեք'}
                    </button>
                </div>
            </div>
        </div>
    );
}