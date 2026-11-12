import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import PasswordsPage from './pages/PasswordsPage';
import MedicalPage from './pages/MedicalPage';
import DocsPage from './pages/DocsPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import WidgetsDock from './components/WidgetsDock'; // <-- Նոր միավորված վահանակը (Dock)
import Search from './pages/Search';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#0b0f19] text-white transition-colors duration-300 relative overflow-x-hidden">

          {/* Միավորված ձախ կողային վահանակ՝ Ժամացույցի և Փոխարժեքի իկոնաներով */}
          <WidgetsDock />

          {/* Միասնական Նավբար բոլոր էջերի համար */}
          <Navbar />

          {/* Էջերի բովանդակությունը */}
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
            </Routes>
          </main>

        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;