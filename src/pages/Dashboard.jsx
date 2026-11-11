import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Pencil, KeyRound, Plus, Folder, User, Settings, Search } from 'lucide-react';

export default function Dashboard() {
    return (
        // Հիմնական ֆոնը (մուգ կապույտ գրադիենտ)
        <div className="min-h-screen bg-[#0b0f19] text-white p-5 font-sans">
            {/* Վերնագիր */}
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight">My Assistant</h1>
                <Link to="/settings" className="p-2.5 rounded-full glass-card hover:bg-white/10 transition">
                    <Settings size={20} className="text-gray-300" />
                </Link>
            </header>

            {/* 1. Ժամացույցների քարտ (Time Cards) */}
            <div className="glass-card p-6 rounded-3xl mb-6 shadow-neoDark">
                <div className="grid grid-cols-3 gap-4 text-center">
                    {/* Ժամ 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mb-2 shadow-inner">
                            <Clock size={30} className="text-gray-400" />
                        </div>
                        <p className="text-xl font-semibold">18:17</p>
                        <p className="text-xs text-gray-400">Yerevan</p>
                    </div>
                    {/* Ժամ 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mb-2 shadow-inner">
                            <Clock size={30} className="text-gray-400" />
                        </div>
                        <p className="text-xl font-semibold">15:17</p>
                        <p className="text-xs text-gray-400">Paris</p>
                    </div>
                    {/* Ժամ 3 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mb-2 shadow-inner">
                            <Clock size={30} className="text-gray-400" />
                        </div>
                        <p className="text-xl font-semibold">09:17</p>
                        <p className="text-xs text-gray-400">New York</p>
                    </div>
                </div>
            </div>

            {/* 2. Փոխարժեքների քարտ (Currency Card) */}
            <div className="glass-card p-6 rounded-3xl mb-6 shadow-neoDark">
                <div className="flex justify-between items-start mb-5">
                    <DollarSign className="text-blue-400 bg-blue-500/10 p-2 rounded-xl" size={36} />
                    <span className="text-xs text-blue-300 font-medium bg-blue-900/30 px-3 py-1 rounded-full">Live Rates</span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Currency</span>
                        <span className='font-medium text-white'>USD/AMD</span>
                        <span className="font-semibold text-white">402.15</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Exchange Rates</span>
                        <span className='font-medium text-white'>EUR/AMD</span>
                        <span className="font-semibold text-white">428.90</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Live exchange rates</span>
                        <span className='font-medium text-white'>RUB/AMD</span>
                        <span className="font-semibold text-white">4.15</span>
                    </div>
                </div>
            </div>

            {/* 3. Հիմնական բաժինների ցանցը (Grid Section - Ըստ նկարի) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Notes (Ակտիվացված/Նեոմորֆիկ) */}
                <Link to="/notes" className="glass-card p-5 rounded-3xl flex flex-col items-center justify-center text-center h-32 shadow-neoDark border-2 border-blue-900/50 bg-blue-900/10 transition hover:scale-105">
                    <Pencil className="text-blue-400 mb-2" size={32} />
                    <span className="font-semibold text-sm text-white">Notes</span>
                </Link>

                {/* Passwords */}
                <Link to="/passwords" className="glass-card p-5 rounded-3xl flex flex-col items-center justify-center text-center h-32 shadow-neoDark transition hover:bg-white/5 hover:scale-105">
                    <KeyRound className="text-gray-400 mb-2" size={32} />
                    <span className="font-semibold text-sm text-gray-300">Passwords</span>
                </Link>

                {/* Medical */}
                <Link to="/medical" className="glass-card p-5 rounded-3xl flex flex-col items-center justify-center text-center h-32 shadow-neoDark transition hover:bg-white/5 hover:scale-105">
                    <Plus className="text-gray-400 mb-2" size={32} />
                    <span className="font-semibold text-sm text-gray-300">Medical</span>
                </Link>

                {/* Documents */}
                <Link to="/docs" className="glass-card p-5 rounded-3xl flex flex-col items-center justify-center text-center h-32 shadow-neoDark transition hover:bg-white/5 hover:scale-105">
                    <Folder className="text-gray-400 mb-2" size={32} />
                    <span className="font-semibold text-sm text-gray-300">Documents</span>
                </Link>
            </div>

            {/* 4. Ներքևի նավիգացիոն մենյու (Bottom Menu) */}
            <footer className="fixed bottom-0 left-0 right-0 glass-card-light border-t border-gray-800 mx-auto max-w-md rounded-t-3xl p-4 shadow-2xl z-50">
                <nav className="grid grid-cols-4 gap-4 text-center">
                    <Link to="/" className="flex flex-col items-center text-blue-400">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 10.1183C3 9.23167 3 8.78835 3.17964 8.38673C3.35928 7.98512 3.69548 7.66755 4.36789 7.03242L9.36789 2.29909C10.5129 1.20417 11.0854 0.656709 11.7473 0.451981C12.4092 0.247253 13.1134 0.430393 14.5219 0.796673L19.5219 2.12999C20.2547 2.32417 20.6212 2.42125 20.8106 2.69887C21 2.97648 21 3.34915 21 4.09449V17.0183C21 19.2291 21 20.3345 20.6651 21.1794C20.3303 22.0243 19.433 22.6202 17.6385 22.812L13.6385 23.2453C12.5192 23.3653 11.9596 23.4253 11.4818 23.2378C11.004 23.0503 10.6827 22.6344 10.0401 21.8025L5.04007 15.3025C4.28177 14.3321 3.90263 13.8469 3.45132 13.2856C3 12.7243 3 12.0036 3 10.5623V10.1183Z" fill="currentColor" />
                                <path d="M16.5 12.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-xs mt-1 font-medium">Home</span>
                    </Link>
                    <Link to="/search" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                        <Search size={24} />
                        <span className="text-xs mt-1">Search</span>
                    </Link>
                    <Link to="/add" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                        <Plus size={24} />
                        <span className="text-xs mt-1">Add</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                        <User size={24} />
                        <span className="text-xs mt-1">Profile</span>
                    </Link>
                </nav>
            </footer>
        </div>
    );
}