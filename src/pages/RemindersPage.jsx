import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Bell, Calendar, Clock, Trash2, X, Sparkles, Search, ShieldAlert, Gift } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function RemindersPage() {
    const { t } = useLanguage();
    const location = useLocation();
    const [reminders, setReminders] = useState([]);

    const [activeTab, setActiveTab] = useState(null); // 'reminder' | 'birthday' | null

    // Սովորական հիշեցման դաշտեր
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [alertOffset, setAlertOffset] = useState('1');

    // Ծննդյան օրվա դաշտեր
    const [bdayName, setBdayName] = useState('');
    const [bdayDate, setBdayDate] = useState(''); // YYYY-MM-DD

    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [activeAlerts, setActiveAlerts] = useState([]);

    const hasInteracted = useRef(false);

    useEffect(() => {
        const handleUserGesture = () => {
            hasInteracted.current = true;
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
            window.removeEventListener('touchstart', handleUserGesture);
        };

        window.addEventListener('click', handleUserGesture);
        window.addEventListener('keydown', handleUserGesture);
        window.addEventListener('touchstart', handleUserGesture);

        fetchReminders();

        return () => {
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
            window.removeEventListener('touchstart', handleUserGesture);
        };
    }, []);

    const playAlertSound = () => {
        if (!hasInteracted.current) return;

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const audioCtx = new AudioCtx();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);

            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.6);
        } catch (e) {
            // Լռությամբ կլանում ենք սխալը
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

    const getEffectiveEventDate = (item) => {
        const now = new Date();
        const originalDate = new Date(item.event_date);

        if (!item.is_birthday) {
            return originalDate;
        }

        let effectiveDate = new Date(now.getFullYear(), originalDate.getMonth(), originalDate.getDate(), originalDate.getHours(), originalDate.getMinutes());

        if (effectiveDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            effectiveDate.setFullYear(now.getFullYear() + 1);
        }

        return effectiveDate;
    };

    // Ճշգրիտ տարիքի հաշվարկ՝ հիմնված իրադարձության ակտիվ (արդյունավետ) տարվա վրա
    const calculateAge = (item) => {
        const birthDate = new Date(item.event_date);
        if (isNaN(birthDate.getTime())) return null;

        const effectiveDate = getEffectiveEventDate(item);
        const targetYear = effectiveDate.getFullYear();
        const birthYear = birthDate.getFullYear();

        let age = targetYear - birthYear;
        return age >= 0 ? age : null;
    };

    const checkDueReminders = (list) => {
        const now = new Date();
        const triggered = [];

        list.forEach(item => {
            const eventTime = getEffectiveEventDate(item);
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
                    is_birthday: false,
                    user_id: user.id
                }])
                .select();

            if (error) throw error;

            if (data) {
                const updated = [...reminders, data[0]].sort((a, b) => getEffectiveEventDate(a) - getEffectiveEventDate(b));
                setReminders(updated);
                setTitle('');
                setEventDate('');
                setActiveTab(null);
                showToast(t('reminderSaved') || 'Հիշեցումը հաջողությամբ պահպանվեց!');
            }
        } catch (error) {
            showToast('Սխալ ավելացնելիս: ' + error.message, 'error');
        }
    };

    const addBirthday = async (e) => {
        e.preventDefault();
        if (!bdayName.trim() || !bdayDate) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired') || 'Խնդրում ենք նախ մուտք գործել համակարգ', 'error');
                return;
            }

            const fullDateTime = `${bdayDate}T09:00`;

            const { data, error } = await supabase
                .from('reminders')
                .insert([{
                    title: bdayName.trim(),
                    event_date: fullDateTime,
                    alert_offset: 1,
                    is_birthday: true,
                    user_id: user.id
                }])
                .select();

            if (error) throw error;

            if (data) {
                const updated = [...reminders, data[0]].sort((a, b) => getEffectiveEventDate(a) - getEffectiveEventDate(b));
                setReminders(updated);
                setBdayName('');
                setBdayDate('');
                setActiveTab(null);
                showToast(t('birthdaySaved') || '🎂 Ծննդյան օրը հաջողությամբ ավելացվեց!');
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

    const getStatusStyle = (item) => {
        const now = new Date();
        const eventDate = getEffectiveEventDate(item);

        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

        const diffTime = eventDateOnly - nowDateOnly;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: t('expired') || 'Ժամկետն անցել է', color: 'text-red-400 bg-red-500/15 border-red-500/40' };
        } else if (diffDays === 0) {
            return { text: t('today') || 'Այսօր է!', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40 animate-pulse' };
        } else {
            return { text: (t('leftDays') || 'Մնաց {days} օր').replace('{days}', diffDays), color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' };
        }
    };

    const upcomingCount = reminders.filter(item => {
        const now = new Date();
        const eventDate = getEffectiveEventDate(item);
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDateOnly >= nowDateOnly;
    }).length;

    return (
        <div className="font-sans pb-44 w-full max-w-[calc(100vw-6px)] mx-auto px-[3px] pt-6 text-white relative box-border overflow-x-hidden flex flex-col items-center">

            <style>{`
                @keyframes rotateYAxis {
                    0% { transform: perspective(300px) rotateY(0deg); }
                    100% { transform: perspective(300px) rotateY(360deg); }
                }
                .globe-spin {
                    animation: rotateYAxis 4s linear infinite;
                    transform-style: preserve-3d;
                }
            `}</style>

            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
                    <div className="px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border bg-emerald-950/90 border-emerald-500/40 text-emerald-200 flex items-center gap-3 text-base font-semibold">
                        <Sparkles size={20} className="text-blue-400 flex-shrink-0" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {activeAlerts.length > 0 && (
                <div className="w-full mb-6 p-5 rounded-3xl bg-[#030712]/90 border border-cyan-500/50 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.25),inset_0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[pulse_2s_infinite]"></div>

                    <div className="flex items-center gap-3 text-cyan-400 font-bold text-sm uppercase tracking-widest mb-3">
                        <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                            <ShieldAlert size={28} className="text-cyan-300 globe-spin" />
                        </div>
                        <span className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{t('attentionDueEvents') || 'ՀԱՄԱԿԱՐԳԻ ԶԳՈՒՇԱՑՈՒՄ • Մոտեցող իրադարձություններ'}</span>
                    </div>
                    <div className="space-y-2">
                        {activeAlerts.map(a => (
                            <div key={a.id} className="text-sm text-gray-200 flex justify-between items-center bg-cyan-950/30 border border-cyan-500/20 px-3.5 py-2.5 rounded-xl">
                                <span className="font-semibold text-cyan-100 flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                                    {a.title} {a.is_birthday && '🎂'}
                                </span>
                                <span className="text-cyan-300 font-mono text-xs px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                                    {getEffectiveEventDate(a).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Վերնագիր և Երկու առանձին ավելացման կոճակներ */}
            <div className="w-full flex items-center justify-between mb-6 px-1 box-border gap-2">
                <Link to="/" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition shadow-md flex items-center justify-center flex-shrink-0">
                    <ArrowLeft size={22} />
                </Link>

                <h1 className="text-sm sm:text-lg font-bold text-white tracking-wider uppercase text-center flex items-center gap-2">
                    <Bell size={20} className="text-amber-400" />
                    <span>{t('remindersTitle') || 'Հիշեցումներ'}</span>
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setActiveTab(activeTab === 'reminder' ? null : 'reminder'); }}
                        className={`p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer ${activeTab === 'reminder' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-blue-600/20 border-blue-500/40 text-blue-300'}`}
                        title={t('addReminderTooltip') || 'Ավելացնել հիշեցում'}
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={() => { setActiveTab(activeTab === 'birthday' ? null : 'birthday'); }}
                        className={`p-3 rounded-2xl border transition shadow-lg flex items-center justify-center cursor-pointer ${activeTab === 'birthday' ? 'bg-pink-600 border-pink-400 text-white' : 'bg-pink-600/20 border-pink-500/40 text-pink-300'}`}
                        title={t('addBirthdayTooltip') || 'Ավելացնել ծննդյան օր'}
                    >
                        <Gift size={20} />
                    </button>
                </div>
            </div>

            {/* 1. Սովորական Հիշեցման Ավելացման Ֆորմա */}
            {activeTab === 'reminder' && (
                <form onSubmit={addReminder} className="w-full box-border glass-card p-6 rounded-3xl border border-blue-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-6">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                        <Clock size={18} />
                        <span>{t('newReminder') || 'Նոր կարևոր հիշեցում'}</span>
                    </h3>

                    <div className="w-full space-y-4.5 box-border">
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('reminderName') || 'Իրադարձության անվանում'}</label>
                            <input
                                type="text"
                                placeholder={t('reminderNamePlaceholder') || 'օր. Ապահովագրություն, Հանդիպում...'}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                                required
                            />
                        </div>

                        <div className="w-full box-border">
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('reminderDate') || 'Ամսաթիվ և ժամ'}</label>
                            <input
                                type="datetime-local"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full box-border max-w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] appearance-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('alertTiming') || 'Ձայնային զգուշացում (քանի օր առաջ)'}</label>
                            <select
                                value={alertOffset}
                                onChange={(e) => setAlertOffset(e.target.value)}
                                className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-blue-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                            >
                                <option value="0">{t('offsetZero') || 'Հենց իրադարձության օրը'}</option>
                                <option value="1">{t('offsetOne') || '1 օր առաջ'}</option>
                                <option value="3">{t('offsetThree') || '3 օր առաջ'}</option>
                                <option value="7">{t('offsetWeek') || '1 շաբաթ առաջ'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-end gap-4 mt-6 px-1 box-border">
                        <button
                            type="button"
                            onClick={() => setActiveTab(null)}
                            className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            className="px-7 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600/50 border border-blue-500/60 hover:bg-blue-600/70 shadow-[0_0_12px_rgba(59,130,246,0.4)] transition cursor-pointer"
                        >
                            {t('save') || 'Պահպանել'}
                        </button>
                    </div>
                </form>
            )}

            {/* 2. Ծննդյան Օրվա Ավելացման Ֆորմա */}
            {activeTab === 'birthday' && (
                <form onSubmit={addBirthday} className="w-full box-border glass-card p-6 rounded-3xl border border-pink-500/40 bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-6">
                    <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                        <Gift size={18} />
                        <span>{t('addBirthdayTitle') || 'Ավելացնել ամենամյա ծննդյան օր'}</span>
                    </h3>

                    <div className="w-full space-y-4.5 box-border">
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('fullNameLabel') || 'Անուն Ազգանուն'}</label>
                            <input
                                type="text"
                                placeholder={t('fullNamePlaceholder') || 'օր. Արմեն Վարդանյան'}
                                value={bdayName}
                                onChange={(e) => setBdayName(e.target.value)}
                                className="w-full box-border bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                                required
                            />
                        </div>

                        <div className="w-full box-border">
                            <label className="text-xs text-gray-400 mb-1.5 block">{t('birthDateLabel') || 'Ծննդյան ամսաթիվ (օր, ամիս, տարի)'}</label>
                            <input
                                type="date"
                                value={bdayDate}
                                onChange={(e) => setBdayDate(e.target.value)}
                                className="w-full box-border max-w-full bg-[#070a14]/90 border border-white/15 rounded-2xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-pink-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] appearance-none"
                                required
                            />
                            <p className="text-[11px] text-gray-400 mt-1">{t('birthdayHint') || 'Համակարգն ամեն տարի ավտոմատ կհիշեցնի այս օրը և կհաշվի տարիքը։'}</p>
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-end gap-4 mt-6 px-1 box-border">
                        <button
                            type="button"
                            onClick={() => setActiveTab(null)}
                            className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                        >
                            {t('cancel') || 'Չեղարկել'}
                        </button>
                        <button
                            type="submit"
                            className="px-7 py-3 rounded-xl text-sm font-semibold text-white bg-pink-600/50 border border-pink-500/60 hover:bg-pink-600/70 shadow-[0_0_12px_rgba(236,72,153,0.4)] transition cursor-pointer"
                        >
                            {t('addBirthdayBtn') || 'Ավելացնել ծնունդ'}
                        </button>
                    </div>
                </form>
            )}

            {/* Հիշեցումների Ցանկ */}
            <div className="w-full space-y-4 box-border px-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center animate-[pulse_2s_infinite]">
                            <Bell size={30} className="text-amber-400 animate-pulse" />
                        </div>
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="text-center py-14 text-gray-400 text-base font-medium bg-white/5 rounded-2xl border border-white/5">
                        {t('noReminders') || 'Հիշեցումներ դեռևս չկան'}
                    </div>
                ) : (
                    reminders.map(item => {
                        const status = getStatusStyle(item);
                        const effectiveDate = getEffectiveEventDate(item);
                        const age = item.is_birthday ? calculateAge(item) : null;

                        return (
                            <div key={item.id} className="w-full box-border glass-card px-5 py-4.5 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f19]/90 to-[#070a12]/95 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 group transition hover:border-amber-500/50">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className={`w-11 h-11 rounded-2xl ${item.is_birthday ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'} border flex items-center justify-center flex-shrink-0`}>
                                        {item.is_birthday ? <Gift size={20} /> : <Calendar size={20} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-base text-gray-100 font-semibold truncate flex items-center gap-2">
                                            {item.title}
                                            {item.is_birthday && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-normal">
                                                    {age !== null ? (t('turningAge') || 'դառնում է {age} տարեկան').replace('{age}', age) : (t('birthdayLabel') || 'Ծննդյան օր')}
                                                </span>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="text-xs text-gray-400 font-mono">
                                                {effectiveDate.toLocaleDateString([], { dateStyle: 'medium' })}
                                            </span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteReminder(item.id, e)}
                                    className="text-gray-400 hover:text-red-400 p-2.5 rounded-xl hover:bg-red-500/15 transition cursor-pointer flex items-center justify-center flex-shrink-0"
                                    title={t('delete') || 'Ջնջել'}
                                >
                                    <Trash2 size={20} />
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

                        <Link to="/search" className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-300 hover:scale-105 ${location.pathname === '/search'
                            ? 'text-blue-400 bg-blue-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Search size={22} className={location.pathname === '/search' ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'transition-all'} />
                            <span className={`text-[10px] mt-1 ${location.pathname === '/search' ? 'font-semibold tracking-wide' : 'font-medium'}`}>{t('search') || 'Search'}</span>
                        </Link>

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