import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AIChat from './pages/AIChat';
import Pool from './pages/Pool';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Footer from './components/Footer';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-darker text-gray-900 dark:text-gray-100 transition-colors duration-200 font-sans selection:bg-primary/30 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/pool" element={<Pool />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;