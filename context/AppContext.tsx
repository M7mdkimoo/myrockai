import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole, PoolRequest, Message, ServiceCategory, ExpertBid, ApiKeys, UserProfile } from '../types';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  apiKeys: ApiKeys;
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  toggleUserRole: () => void;
  poolRequests: PoolRequest[];
  addPoolRequest: (req: PoolRequest) => void;
  addBidToRequest: (requestId: string, bid: ExpertBid) => void;
  activeChatMessages: Message[];
  setActiveChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (msg: Message) => void;
  resetChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Alex Designer',
  email: 'alex@example.com',
  bio: 'Creative professional looking for AI-enhanced workflows.',
  role: UserRole.USER,
  ratings: []
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true);
  
  // Store keys as an object: { google: "...", openai: "..." }
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({});
  
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [poolRequests, setPoolRequests] = useState<PoolRequest[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);

  // Initialize theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load API keys and Profile from local storage
  useEffect(() => {
    const storedKeys = localStorage.getItem('myrockai_api_keys');
    if (storedKeys) {
      try {
        setApiKeysState(JSON.parse(storedKeys));
      } catch (e) {
        console.error("Failed to parse API keys", e);
      }
    } else {
      // Fallback to legacy key if exists
      const legacyKey = localStorage.getItem('gemini_api_key');
      if (legacyKey) {
        setApiKeysState({ google: legacyKey });
      }
    }

    const storedProfile = localStorage.getItem('myrockai_profile');
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const setApiKey = (provider: string, key: string) => {
    setApiKeysState(prev => {
      const newKeys = { ...prev, [provider]: key };
      localStorage.setItem('myrockai_api_keys', JSON.stringify(newKeys));
      
      // Legacy support for simpler components
      if (provider === 'google') {
        localStorage.setItem('gemini_api_key', key);
      }
      
      return newKeys;
    });
  };

  const getApiKey = (provider: string) => apiKeys[provider] || '';

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const newProfile = { ...prev, ...updates };
      localStorage.setItem('myrockai_profile', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  const toggleUserRole = () => {
    updateUserProfile({ role: userProfile.role === UserRole.USER ? UserRole.EXPERT : UserRole.USER });
  };

  const addPoolRequest = (req: PoolRequest) => {
    setPoolRequests(prev => [req, ...prev]);
  };

  const addBidToRequest = (requestId: string, bid: ExpertBid) => {
    setPoolRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, bids: [...req.bids, bid] };
      }
      return req;
    }));
  };

  const addMessage = (msg: Message) => {
    setActiveChatMessages(prev => [...prev, msg]);
  };

  const resetChat = () => {
    setActiveChatMessages([]);
  };

  return (
    <AppContext.Provider value={{
      darkMode,
      toggleDarkMode,
      apiKeys,
      setApiKey,
      getApiKey,
      userProfile,
      updateUserProfile,
      toggleUserRole,
      poolRequests,
      addPoolRequest,
      addBidToRequest,
      activeChatMessages,
      setActiveChatMessages,
      addMessage,
      resetChat
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
