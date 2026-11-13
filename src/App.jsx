import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import PasswordsPage from './pages/PasswordsPage';
import MedicalPage from './pages/MedicalPage';
import DocsPage from './pages/DocsPage';         // <-- Ընդհանուր փաստաթղթերի էջը
import CarDocsPage from './pages/CarDocsPage';   // <-- Մեքենայի փաստաթղթերի էջը
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import WidgetsDock from './components/WidgetsDock';
import Search from './pages/Search';
import RemindersPage from './pages/RemindersPage';
function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#0b0f19] text-white transition-colors duration-300 relative overflow-x-hidden">

          {/* Միավորված ձախ կողային վահանակ */}
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
              <Route path="/docs" element={<DocsPage />} />             {/* Ընդհանուր փաստաթղթեր */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/car-docs" element={<CarDocsPage />} />     {/* Մեքենայի փաստաթղթեր */}
              <Route path="/reminders" element={<RemindersPage />} />
            </Routes>
          </main>

        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;