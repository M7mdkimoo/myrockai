import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sun, Moon, User, ShieldCheck, Home, MessageSquare, Briefcase, Settings, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
  const { darkMode, toggleDarkMode, userProfile, toggleUserRole, getApiKey } = useApp();
  const location = useLocation();
  const apiKey = getApiKey('google');

  const navLinkClass = (path: string) => 
    `relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden group ${
      location.pathname === path 
        ? 'text-white bg-primary shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]' 
        : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Logo className="w-10 h-10 relative z-10" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
                MyRock<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1 bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-full border border-gray-200/50 dark:border-white/5">
              <Link to="/" className={navLinkClass('/')}>
                <Home size={16} className="relative z-10" />
                <span className="relative z-10">Home</span>
              </Link>
              <Link to="/chat" className={navLinkClass('/chat')}>
                <MessageSquare size={16} className="relative z-10" />
                <span className="relative z-10">Workspace</span>
              </Link>
              <Link to="/pool" className={navLinkClass('/pool')}>
                <Briefcase size={16} className="relative z-10" />
                <span className="relative z-10">Pool</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleUserRole}
              className={`hidden sm:flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-all duration-300 font-semibold ${
                 userProfile.role === 'EXPERT' 
                 ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                 : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {userProfile.role === 'USER' ? <User size={14} /> : <ShieldCheck size={14} />}
              <span>{userProfile.role === 'USER' ? 'Client' : 'Expert'}</span>
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-white/10">
              <Link to="/help" className="p-2 text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
                <HelpCircle size={20} />
              </Link>
              <Link to="/settings" className="p-2 text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
                <Settings size={20} />
              </Link>
              <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {!apiKey && (
              <Link to="/settings" className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> No API Key
              </Link>
            )}
            
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors font-medium" />
                <SignUpButton className="px-4 py-2 rounded-full bg-secondary text-white hover:bg-secondary/90 transition-colors font-medium" />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;