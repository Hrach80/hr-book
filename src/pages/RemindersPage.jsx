import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Bell, Calendar, Clock, Trash2, X, Sparkles, Search } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function RemindersPage() {
    const { t } = useLanguage();
    const location = useLocation();
    const [reminders, setReminders] = useState([]);
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [alertOffset, setAlertOffset] = useState('1'); // օրեր առաջ (դեֆոլտ՝ 1 օր)

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [activeAlerts, setActiveAlerts] = useState([]);

    useEffect(() => {
        fetchReminders();
    }, []);

    // Ձայնային ազդանշան (Web Audio API)
    const playAlertSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 նոտա
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5 նոտա

            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.6);
        } catch (e) {
            console.error('Ձայնի նվագարկման սխալ:', e);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .order('event_date', { ascending: true });

            if (error) throw error;

            const list = data || [];
            setReminders(list);
            checkDueReminders(list);
        } catch (error) {
            console.error('Սխալ հիշեցումները բեռնելիս:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkDueReminders = (list) => {
        const now = new Date();
        const triggered = [];

        list.forEach(item => {
            const eventTime = new Date(item.event_date);
            const diffTime = eventTime - now;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const offsetDays = parseFloat(item.alert_offset || 1);

            if (diffDays <= offsetDays && diffDays >= -1) {
                triggered.push(item);
            }
        });

        if (triggered.length > 0) {
            setActiveAlerts(triggered);
            playAlertSound();
        }
    };

    const addReminder = async (e) => {
        e.preventDefault();
        if (!title.trim() || !eventDate) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const { data, error } = await supabase
                .from('reminders')
                .insert([{
                    title: title.trim(),
                    event_date: eventDate,
                    alert_offset: parseInt(alertOffset),
                    user_id: user.id
                }])
                .select();

            if (error) throw error;

            if (data) {
                const updated = [...reminders, data[0]].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
                setReminders(updated);
                setTitle('');
                setEventDate('');
                setShowForm(false);
                showToast(t('reminderSaved') || 'Հիշեցումը հաջողությամբ պահպանվեց!');
            }
        } catch (error) {
            showToast('Սխալ ավելացնելիս: ' + error.message, 'error');
        }
    };

    const deleteReminder = async (id, e) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setReminders(reminders.filter(r => r.id !== id));
            showToast(t('reminderDeleted') || 'Հիշեցումը ջնջվեց', 'info');
        } catch (error) {
            console.error('Սխալ ջնջելիս:', error.message);
        }
    };

    const getStatusStyle = (eventDateStr) => {
        const now = new Date();
        const eventDate = new Date(eventDateStr);
        const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: t('expired') || 'Ժամկետն անցել է', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
        } else if (diffDays === 0) {
            return { text: t('today') || 'Այսօր է!', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse' };
        } else {
            return { text: (t('leftDays') || 'Մնաց {days} օր').replace('{days}', diffDays), color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
        }
    };

    return (
        <div className="font-sans pb-40 w-full max-w-md mx-auto px-4 pt-4 text-white relative box-border overflow-x-hidden flex flex-col items-center">

            {/* Toast ծանուցում */}
            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
                    <div className="px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border bg-emerald-950/90 border-emerald-500/40 text-emerald-200 flex items-center gap-3 text-sm font-semibold">
                        <Sparkles size={18} className="text-blue-400 flex-shrink-0" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Ակտիվ հիշեցումների ծանուցում */}
            {activeAlerts.length > 0 && (
                <div className="w-full mb-5 p-4 rounded-3xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                        <Bell size={16} className="animate-bounce" />
                        <span>{t('attentionDueEvents') || 'Ուշադրություն՝ Մոտեցող իրադարձություններ'}</span>
                    </div>
                    <div className="space-y-1">
                        {activeAlerts.map(a => (
                            <div key={a.id} className="text-xs text-gray-200 flex justify-between items-center">
                                <span className="font-semibold">• {a.title}</span>
                                <span className="text-amber-300 font-mono">{new Date(a.event_date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Վերնագիր */}
            <div className="w-full flex items-center justify-between mb-5 px-1 box-border">
                <Link to="/" className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition shadow-md flex items-center justify-center">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-base font-bold text-white tracking-wider uppercase text-center flex items-center gap-2">
                    <Bell size={20} className="text-amber-400" />
                    <span>{t('remindersTitle') || 'Հիշեցումներ'}</span>
                </h1>

                <button
                    onClick={() => { setShowForm(!showForm); setTitle(''); setEventDate(''); }}
                    className="p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {/* Ավելացման Ֆորմա */}
            {showForm && (
                <form onSubmit={addReminder} className="w-full box-border glass-card p-5 rounded-3xl border border-blue-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-5">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                        <Clock size={16} />
                        <span>{t('newReminder') || 'Նոր կարևոր հիշեցում'}</span>
                    </h3>

                    <div className="w-full space-y-4 box-border">
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('reminderName') || 'Իրադարձության անվանում'}</label>
                            <input
                                type="text"
                                placeholder={t('reminderNamePlaceholder') || 'օր. Մամայի ծնունդ, Ապահովագրություն...'}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('reminderDate') || 'Ամսաթիվ և ժամ'}</label>
                            <input
                                type="datetime-local"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('alertTiming') || 'Ձայնային զգուշացում (քանի օր առաջ)'}</label>
                            <select
                                value={alertOffset}
                                onChange={(e) => setAlertOffset(e.target.value)}
                                className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            >
                                <option value="0">{t('offsetZero') || 'Հենց իրադարձության օրը'}</option>
                                <option value="1">{t('offsetOne') || '1 օր առաջ'}</option>
                                <option value="3">{t('offsetThree') || '3 օր առաջ'}</option>
                                <option value="7">{t('offsetWeek') || '1 շաբաթ առաջ'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-end gap-3.5 mt-5 px-1 box-border">
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setTitle(''); setEventDate(''); }}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600/50 border border-blue-500/60 hover:bg-blue-600/70 shadow-[0_0_12px_rgba(59,130,246,0.4)] transition cursor-pointer"
                        >
                            {t('save') || 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            {/* Հիշեցումների Ցանկ */}
            <div className="w-full space-y-3.5 box-border px-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center animate-[pulse_2s_infinite]">
                            <Bell size={26} className="text-amber-400 animate-pulse" />
                        </div>
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-medium bg-white/5 rounded-2xl border border-white/5">
                        {t('noReminders') || 'Հիշեցումներ դեռևս չկան'}
                    </div>
                ) : (
                    reminders.map(item => {
                        const status = getStatusStyle(item.event_date);
                        return (
                            <div key={item.id} className="w-full box-border glass-card px-4 py-3.5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 group transition hover:border-amber-500/50">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm text-gray-100 font-semibold truncate">{item.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] text-gray-400 font-mono">
                                                {new Date(item.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteReminder(item.id, e)}
                                    className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/15 transition cursor-pointer flex items-center justify-center flex-shrink-0"
                                    title={t('delete') || 'Ջնջել'}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Ներքևի նավիգացիոն մենյու (Ֆուտեր) */}
            <footer className="fixed bottom-4 left-0 right-0 mx-auto max-w-md px-4 z-50">
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
                        <Link to="/search" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/search'
                            ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Search size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'transition-all'} />
                            <span className={`text-[10px] mt-1 ${location.pathname === '/search' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('search') || 'Search'}</span>
                        </Link>

                        {/* 3. Reminders (Հիշեցումներ) */}
                        <Link to="/reminders" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/reminders'
                            ? 'text-amber-400 bg-amber-600/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Bell size={22} className={location.pathname === '/reminders' ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all'} />
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