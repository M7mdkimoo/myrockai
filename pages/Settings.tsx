import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Save, Key, Shield, Globe, Cpu, Zap, Check, Settings as SettingsIcon, Bell, Eye, Layout, Lock } from 'lucide-react';
import { UserRole } from '../types';
import AnimatedBackground from '../components/AnimatedBackground';

const Settings: React.FC = () => {
  const { userProfile, updateUserProfile, toggleUserRole, apiKeys, setApiKey } = useApp();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'preferences'>('profile');
  
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [bio, setBio] = useState(userProfile.bio);

  const providers = [
    { id: 'google', name: 'Google Gemini', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10', placeholder: 'AIzaSy...' },
    { id: 'openai', name: 'OpenAI GPT-4', icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10', placeholder: 'sk-...' },
    { id: 'anthropic', name: 'Anthropic Claude', icon: Cpu, color: 'text-orange-500', bg: 'bg-orange-500/10', placeholder: 'sk-ant-...' },
    { id: 'mistral', name: 'Mistral AI', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10', placeholder: 'key_...' },
    { id: 'cohere', name: 'Cohere', icon: Layout, color: 'text-teal-500', bg: 'bg-teal-500/10', placeholder: 'production_...' },
  ];

  const handleSaveProfile = () => {
    updateUserProfile({ name, email, bio });
    addToast("Profile updated successfully", "success");
  };
  
  const handleApiKeyChange = (id: string, value: string) => {
      setApiKey(id, value);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden p-4 md:p-8">
      <AnimatedBackground />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
           <p className="text-gray-500 dark:text-gray-400">Manage your account, API connections, and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile' 
                  ? 'bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-white/10' 
                  : 'text-gray-500 hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <User size={18} /> Profile & Role
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'api' 
                  ? 'bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-white/10' 
                  : 'text-gray-500 hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <Key size={18} /> API Keys
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'preferences' 
                  ? 'bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-white/10' 
                  : 'text-gray-500 hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <SettingsIcon size={18} /> Preferences
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="glass rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up bg-white/40 dark:bg-[#0a0a0a]/60">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <User className="text-primary" size={24} />
                    Personal Information
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden">
                        <img 
                          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Display Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Bio</label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Account Role</label>
                      <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${userProfile.role === UserRole.EXPERT ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {userProfile.role === UserRole.EXPERT ? <Shield size={20} /> : <User size={20} />}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{userProfile.role === UserRole.EXPERT ? 'Expert (Rock)' : 'Standard User'}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { toggleUserRole(); addToast(`Role switched to ${userProfile.role === UserRole.USER ? 'Expert' : 'Client'}`, 'info'); }}
                          className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Switch to {userProfile.role === UserRole.USER ? 'Expert' : 'User'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleSaveProfile}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                      >
                        <Save size={18} /> Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API TAB */}
            {activeTab === 'api' && (
              <div className="glass rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up bg-white/40 dark:bg-[#0a0a0a]/60">
                <div className="mb-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex gap-3">
                  <div className="shrink-0 p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-300">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-blue-900 dark:text-blue-100">Security Notice</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                      Keys are stored securely in local storage. We never see them.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div key={provider.id} className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-primary/30 transition-all">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-4 min-w-[180px]">
                          <div className={`p-3 rounded-xl ${provider.bg} ${provider.color}`}>
                            <provider.icon size={24} />
                          </div>
                          <span className="font-bold">{provider.name}</span>
                        </div>
                        
                        <div className="flex-1 relative">
                          <input
                            type="password"
                            value={apiKeys[provider.id] || ''}
                            onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                            placeholder={provider.placeholder}
                            className="w-full pl-4 pr-10 py-3 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm shadow-sm transition-all"
                          />
                          {apiKeys[provider.id] ? (
                            <div className="absolute right-3 top-3.5 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Key Present"></div>
                          ) : (
                            <div className="absolute right-3 top-3.5 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Key Missing"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="glass rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up bg-white/40 dark:bg-[#0a0a0a]/60">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <SettingsIcon className="text-primary" size={24} />
                  App Preferences
                </h2>
                <div className="space-y-4 opacity-75">
                  {/* Example Prefs */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white/30 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Bell className="text-gray-400" size={20} />
                      <div className="font-medium">Notifications</div>
                    </div>
                    <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 rounded-full cursor-not-allowed"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;