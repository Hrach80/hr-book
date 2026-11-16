import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { supabase } from './services/supabaseClient';
import { subscribeUserToPush } from './utils/pushService';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import PasswordsPage from './pages/PasswordsPage';
import MedicalPage from './pages/MedicalPage';
import DocsPage from './pages/DocsPage';
import CarDocsPage from './pages/CarDocsPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import Search from './pages/Search';
import RemindersPage from './pages/RemindersPage';
import Footer from './components/Footer';
import SplashLoader from './components/SplashLoader';

function App() {
  const [isLaunching, setIsLaunching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLaunching(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.0);
    } catch (e) {
      console.error('Audio play error:', e);
    }
  };

  useEffect(() => {
    if (Notification.permission === 'granted') {
      setTimeout(() => {
        subscribeUserToPush().catch(err => console.error('Push sub error:', err));
      }, 1000);
    }

    const checkRemindersAndNotify = async () => {
      try {
        const { data, error } = await supabase.from('reminders').select('*');
        if (error) throw error;

        if (data && data.length > 0) {
          const now = new Date();
          const lastAlertDate = sessionStorage.getItem('last_reminder_alert');
          const todayStr = now.toDateString();

          const urgentEvent = data.find(item => {
            const eventDate = new Date(item.event_date);
            const diffTime = eventDate - now;
            const diffHours = diffTime / (1000 * 60 * 60);

            return diffHours >= 0 && diffHours <= 24;
          });

          if (urgentEvent && lastAlertDate !== todayStr) {
            playAlertSound();

            if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('⚠️ Մոտեցող իրադարձություն', {
                  body: `${urgentEvent.title || 'Հիշեցում'}-ին մնացել է մոտ 1 օր:`,
                  icon: '/favicon.svg',
                  badge: '/favicon.svg',
                  vibrate: [300, 100, 300]
                });
              }).catch(err => console.log('SW ready error:', err));
            }

            sessionStorage.setItem('last_reminder_alert', todayStr);
          }
        }
      } catch (e) {
        console.error('Error checking reminders for notification:', e);
      }
    };

    const initialTimer = setTimeout(() => {
      checkRemindersAndNotify();
    }, 1500);

    const interval = setInterval(() => {
      checkRemindersAndNotify();
    }, 60 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <LanguageProvider>
      <Router>
        {/* Եթե բեռնման փուլն է, ցույց ենք տալիս լոադերը որպես շերտ, առանց Router-ը կոտրելու */}
        {isLaunching && <SplashLoader />}

        <div className="min-h-screen bg-[#0b0f19] text-white transition-colors duration-300 relative overflow-x-hidden pb-40">
          <Navbar />

          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/passwords" element={<PasswordsPage />} />
              <Route path="/medical" element={<MedicalPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/car-docs" element={<CarDocsPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;