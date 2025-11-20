import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Clock, AlertCircle, MessageSquare, DollarSign, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Message, FileAttachment, ServiceCategory, SERVICE_RATES } from '../types';

interface RockPopupProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const RockPopup: React.FC<RockPopupProps> = ({ isOpen, onClose, category }) => {
  const { activeChatMessages } = useApp();
  const [rockMessages, setRockMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionTime, setSessionTime] = useState(0); // Seconds
  const [isSessionActive, setIsSessionActive] = useState(false); // Start false, activate after matching
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [isMatching, setIsMatching] = useState(true); // New state for matching phase
  const [isReviewing, setIsReviewing] = useState(false); // New state for review phase

  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine Rate based on Category
  // Default to TEXT rate if category not found
  const hourlyRate = SERVICE_RATES[category as ServiceCategory] || SERVICE_RATES[ServiceCategory.TEXT];

  useEffect(() => {
    let interval: any;
    if (isOpen && isSessionActive && !showRating) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isSessionActive, showRating]);

  useEffect(() => {
    if (isOpen && isMatching) {
      // Show matching screen for 3 seconds, then start review phase
      const timer = setTimeout(() => {
        setIsMatching(false);
        setIsReviewing(true);
        // After 1 minute of reviewing, start session
        setTimeout(() => {
          setIsReviewing(false);
          setIsSessionActive(true);
        }, 60000); // 60 seconds
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMatching]);

  useEffect(() => {
    if (isOpen && !isMatching && !isReviewing && rockMessages.length === 0) {
      // Initial greeting from Rock after reviewing
      setRockMessages([
        {
          id: 'init-rock',
          role: 'rock',
          text: `Hey there! I'm your dedicated Rock expert in ${category}. I've reviewed your AI conversation and I'm ready to bring my specialized skills to help you achieve your goals. What would you like me to work on?`,
          timestamp: Date.now()
        }
      ]);
    }
  }, [isOpen, isMatching, isReviewing, category, rockMessages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rockMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    setRockMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate Rock Typing and Response
    setTimeout(() => {
      const rockResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'rock',
        text: "I see what you mean. Let me work on that file for you. It will take about 10 minutes. Please keep this session open.",
        timestamp: Date.now()
      };
      setRockMessages(prev => [...prev, rockResponse]);
    }, 2000);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setShowRating(true);
  };

  const submitRating = (stars: number) => {
    setRating(stars);
    // Logic to save rating would go here
    setTimeout(() => {
      onClose();
      // Reset local state for next time
      setShowRating(false);
      setSessionTime(0);
      setIsSessionActive(false);
      setIsMatching(true);
      setIsReviewing(false);
      setRockMessages([]);
    }, 1500);
  };

  // --- BILLING LOGIC ---
  // 1. Calculate total minutes
  const actualMinutes = Math.ceil(sessionTime / 60);
  
  // 2. Round UP to nearest 30-minute block
  // e.g., 1 min -> 1 block (0.5h)
  // e.g., 20 mins -> 1 block (0.5h)
  // e.g., 45 mins -> 2 blocks (1.0h)
  const billableBlocks = Math.max(1, Math.ceil(actualMinutes / 30));
  
  // 3. Convert blocks to hours (each block is 0.5h)
  const billableHours = billableBlocks * 0.5;
  
  // 4. Calculate total cost
  const totalCost = billableHours * hourlyRate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[80vh] overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
              R
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Rock
                <span className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-[10px] border border-gray-200 dark:border-gray-700">
                  ${hourlyRate}/hr
                </span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Session • {category}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-xs font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock size={12} className="text-primary" />
                <span>{Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}</span>
                <span className="text-gray-400 mx-1">|</span>
                <span className="font-bold">{billableHours.toFixed(1)}h Billed</span>
              </div>
              <div className="font-bold text-primary text-sm">
                ${totalCost.toFixed(2)}
              </div>
            </div>
            <button onClick={endSession} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-red-500/20 shadow-lg">
              End Session
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">

          {isMatching ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10 p-8 animate-fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <div className="w-8 h-8 bg-white rounded-full animate-ping"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Matching with a Rock
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Looking for the best rock to assist you...<br/>
                  Searching and suggesting the perfect match.
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          ) : isReviewing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10 p-8 animate-fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <div className="w-8 h-8 bg-white rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Rock is Reviewing Your Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Analyzing your AI conversation history...<br/>
                  Preparing personalized insights and recommendations.
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          ) : showRating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10 p-8 animate-fade-in-up">
              <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <DollarSign size={20} /> Invoice Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Type</span>
                    <span className="font-bold">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hourly Rate</span>
                    <span>${hourlyRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Actual Duration</span>
                    <span>{Math.floor(sessionTime / 60)}m {sessionTime % 60}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      Billable Units <span title="rounded up to nearest 30m"><Info size={12} className="text-gray-400" /></span>
                    </span>
                    <span>{billableHours} hrs ({billableBlocks} x 30m)</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-lg font-black text-primary">
                    <span>Total</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <p className="mb-4 font-medium text-gray-600 dark:text-gray-300">How was your Rock?</p>
              <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => submitRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300 dark:text-gray-700'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-green-500 font-bold animate-pulse">Payment Processed Successfully!</p>}
            </div>
          ) : (
            <>
              {/* Chat Log */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                {/* AI History Preview (ReadOnly) */}
                {activeChatMessages.length > 0 && (
                  <div className="mb-6 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-gray-800/50 opacity-75 text-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2 uppercase text-xs font-bold tracking-wider">
                      <MessageSquare size={12} />
                      AI Context
                    </div>
                    {activeChatMessages.slice(-3).map(msg => (
                      <div key={msg.id} className="mb-1 truncate">
                        <span className="font-bold text-xs">{msg.role}:</span> {msg.text}
                      </div>
                    ))}
                    <div className="text-xs text-center mt-2 text-gray-400 italic">...Expert can see full history...</div>
                  </div>
                )}

                {/* Live Chat */}
                {rockMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] opacity-70 block mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2 items-center">
                   <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-white"
                      placeholder="Message Rock..."
                   />
                   <button onClick={handleSend} className="p-3 bg-primary text-white rounded-xl hover:scale-105 transition-transform">
                      <Send size={20} />
                   </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RockPopup;