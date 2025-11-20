
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Paperclip, Image as ImageIcon, Cpu, AlertTriangle, Trash2, Settings, Sparkles, Download, Play, Radio, Mic, Brain, Speaker, Globe, MapPin, Copy, Menu, X, Check, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { ServiceCategory, Message, FileAttachment } from '../types';
import { generateAIResponse, generateSpeech } from '../services/geminiService';
import RockPopup from '../components/RockPopup';
import LiveVoiceModal from '../components/LiveVoiceModal';
import AnimatedBackground from '../components/AnimatedBackground';

// Internal Component for Code Blocks with Copy State
interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-700 shadow-lg group/code text-left font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
         <span className="text-[10px] font-bold text-gray-400 lowercase">{language || 'code'}</span>
         <button 
           className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`} 
           onClick={handleCopy}
         >
            {copied ? <Check size={12} /> : <Copy size={12} />} 
            {copied ? 'Copied!' : 'Copy'}
         </button>
      </div>
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm text-[#d4d4d4] leading-relaxed custom-scrollbar">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex justify-start animate-fade-in-up">
    <div className="max-w-[80%] flex gap-3 flex-row">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md">
         <Cpu size={16} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-sm flex items-center">
         <div className="flex space-x-1.5">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
         </div>
      </div>
    </div>
  </div>
);

const AIChat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ServiceCategory;
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(categoryParam || ServiceCategory.TEXT);
  
  const { getApiKey, activeChatMessages, addMessage, resetChat, setActiveChatMessages } = useApp();
  const { addToast } = useToast();
  const apiKey = getApiKey('google');

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamText, setCurrentStreamText] = useState('');
  
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  
  // Modals & Controls
  const [showRockPopup, setShowRockPopup] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages, currentStreamText, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newAttachments.push({
            name: file.name,
            type: file.type,
            data: event.target.result as string
          });
          if (newAttachments.length === files.length) {
            setAttachments(prev => [...prev, ...newAttachments]);
            addToast(`${files.length} file(s) attached`, 'info');
          }
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      resetChat();
      addToast("Chat history cleared", 'info');
    }
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now(),
      attachments: [...attachments]
    };

    addMessage(userMsg);
    setInputValue('');
    setAttachments([]);
    setIsLoading(true);
    setIsStreaming(true);
    setCurrentStreamText('');

    try {
      // Determine if we should stream based on intent
      const isMediaGen = selectedCategory === ServiceCategory.DESIGN || selectedCategory === ServiceCategory.VIDEO;
      
      const aiResponse = await generateAIResponse(
        apiKey, 
        activeChatMessages, 
        userMsg.text, 
        selectedCategory, 
        userMsg.attachments,
        { thinkingMode, aspectRatio },
        // Streaming callback
        !isMediaGen ? (text) => {
           setCurrentStreamText(text);
        } : undefined
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse.text,
        timestamp: Date.now(),
        generatedMedia: aiResponse.media,
        groundingMetadata: aiResponse.groundingMetadata
      };
      
      addMessage(aiMsg);
    } catch (err: any) {
      addToast(err.message || "AI Request Failed", 'error');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setCurrentStreamText('');
    }
  };

  const playTTS = async (msg: Message) => {
    if (playingMessageId === msg.id) return;
    try {
      setPlayingMessageId(msg.id);
      const result = await generateSpeech(apiKey, msg.text);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const res = await fetch(result.audioUrl);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      source.onended = () => setPlayingMessageId(null);
    } catch (e) {
      addToast("Failed to generate speech", 'error');
      setPlayingMessageId(null);
    }
  };

  const renderMessageContent = (text: string) => {
    const parts = [];
    const regex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>);
      }
      const language = match[1] || '';
      const code = match[2] || '';
      parts.push(<CodeBlock key={match.index} language={language} code={code} />);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Dynamic Chat Background Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-blob pointer-events-none -z-10 mix-blend-screen dark:mix-blend-plus-lighter"></div>

      <LiveVoiceModal isOpen={showLiveModal} onClose={() => setShowLiveModal(false)} />

      {/* Mobile Menu Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`relative sm:fixed w-72 h-full flex flex-col border-r border-gray-200/50 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-xl z-40 transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : 'sm:-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg">
              <Cpu className="text-primary" size={20} /> 
              Models
           </div>
           <button onClick={() => setMobileSidebarOpen(false)} className="sm:hidden p-1 text-gray-500"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {Object.values(ServiceCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setMobileSidebarOpen(false); }}
              className={`group w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                selectedCategory === cat 
                  ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white font-bold border-l-4 border-primary shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              {cat}
              {selectedCategory === cat && <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary"></div>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200/50 dark:border-white/5 space-y-2">
           <button onClick={() => setShowLiveModal(true)} className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
              <Mic size={16} /> Live Voice
           </button>
           <button onClick={handleClearChat} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors">
             <Trash2 size={14} /> Clear History
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-full relative z-10">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="hidden sm:block p-2 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10">
               <Menu size={18} />
            </button>

            <span className="hidden md:block text-sm font-bold bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
              {selectedCategory}
            </span>
            
            {/* Thinking Mode Toggle */}
            {(selectedCategory === ServiceCategory.PROGRAMMING || selectedCategory === ServiceCategory.ANALYSIS) && (
               <button 
                 onClick={() => setThinkingMode(!thinkingMode)}
                 className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${thinkingMode ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-transparent border-gray-300 text-gray-500 dark:border-gray-700'}`}
               >
                  <Brain size={12} /> Deep Think {thinkingMode ? 'ON' : 'OFF'}
               </button>
            )}

            {/* Aspect Ratio */}
            {selectedCategory === ServiceCategory.DESIGN && (
               <select 
                 value={aspectRatio}
                 onChange={(e) => setAspectRatio(e.target.value)}
                 className="text-xs font-bold bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-full px-2 py-1 text-gray-500 outline-none cursor-pointer"
               >
                 <option value="1:1">1:1 Square</option>
                 <option value="16:9">16:9 Landscape</option>
                 <option value="9:16">9:16 Portrait</option>
               </select>
            )}
          </div>
          
          <button 
            onClick={() => setShowRockPopup(true)}
            className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-black px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Hire Expert
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
          {activeChatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <Sparkles size={48} className="text-primary opacity-80" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                 {selectedCategory} Workspace
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">
                {selectedCategory === ServiceCategory.DESIGN ? "Generate logos, edit photos, or brainstorm UI." : 
                 selectedCategory === ServiceCategory.VIDEO ? "Create animations from text or images." : 
                 "How can AI accelerate your workflow today?"}
              </p>
              {!apiKey && (
                 <Link to="/settings" className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/30 transition-transform hover:scale-105">
                   Configure API Key
                 </Link>
              )}
            </div>
          )}
          
          {activeChatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[90%] md:max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${
                   msg.role === 'user' 
                   ? 'bg-white dark:bg-gray-700' 
                   : 'bg-gradient-to-tr from-primary to-indigo-500 text-white'
                }`}>
                   {msg.role === 'user' ? <Settings size={14} /> : <Cpu size={16} />}
                </div>

                <div className="space-y-2 w-full min-w-0">
                    <div className={`p-5 rounded-2xl relative group/msg overflow-hidden text-sm md:text-base leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-primary via-indigo-600 to-purple-700 text-white shadow-lg shadow-primary/25 rounded-tr-none border border-white/10' 
                        : 'bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
                    }`}>
                      
                      {/* Message Text */}
                      <div className="whitespace-pre-wrap">
                          {renderMessageContent(msg.text)}
                      </div>
                      
                      {/* Grounding Citations */}
                      {msg.groundingMetadata?.groundingChunks && (
                         <div className="mt-4 flex flex-wrap gap-2">
                            {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                              <a key={i} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors">
                                 {chunk.maps ? <MapPin size={10}/> : <Globe size={10}/>}
                                 <span className="truncate max-w-[150px]">{chunk.web?.title || chunk.maps?.title || 'Source'}</span>
                              </a>
                            ))}
                         </div>
                      )}

                      {/* Generated Media */}
                      {msg.generatedMedia && (
                        <div className="mt-4">
                          {msg.generatedMedia.type === 'image' ? (
                            <div className="relative group rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-black">
                              <img src={msg.generatedMedia.url} alt="AI Generated" className="w-full max-w-md object-cover" />
                              <a href={msg.generatedMedia.url} download className="absolute bottom-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                                <Download size={16} />
                              </a>
                            </div>
                          ) : msg.generatedMedia.type === 'video' ? (
                            <div className="relative rounded-xl overflow-hidden shadow-lg bg-black max-w-md">
                              <video controls className="w-full">
                                <source src={msg.generatedMedia.url} type={msg.generatedMedia.mimeType} />
                              </video>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* TTS Trigger */}
                      {msg.role === 'model' && (
                        <button 
                          onClick={() => playTTS(msg)}
                          className={`absolute -bottom-1 left-2 p-2 rounded-full transition-all ${playingMessageId === msg.id ? 'text-primary animate-pulse' : 'text-gray-400 hover:text-primary opacity-0 group-hover/msg:opacity-100'}`}
                          title="Read Aloud"
                        >
                          <Speaker size={14} />
                        </button>
                      )}
                    </div>
                    
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-end">
                          {msg.attachments.map((att, i) => (
                          <div key={i} className="relative group cursor-pointer hover:scale-105 transition-transform">
                              {att.type.startsWith('image/') ? (
                              <img src={att.data} alt={att.name} className="w-20 h-20 object-cover rounded-lg border border-white dark:border-gray-700 shadow-sm" />
                              ) : (
                              <div className="w-20 h-20 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg text-[10px] text-gray-500 p-1 text-center break-all border border-gray-200 dark:border-gray-700 shadow-sm">
                                  <div className="flex flex-col items-center gap-1">
                                    <FileText size={16} />
                                    <span className="line-clamp-2">{att.name}</span>
                                  </div>
                              </div>
                              )}
                          </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Live Streaming Bubble */}
          {isStreaming && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="max-w-[80%] flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md">
                   <Cpu size={16} />
                </div>
                <div className="p-5 rounded-2xl rounded-tl-none bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 text-gray-900 dark:text-gray-100 shadow-sm text-sm md:text-base">
                   <div className="whitespace-pre-wrap leading-relaxed">
                      {renderMessageContent(currentStreamText)}
                      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle"></span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isLoading && !isStreaming && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-white/5 z-20">
          
          {/* Attachment Preview Area */}
          {attachments.length > 0 && (
            <div className="mb-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
              {attachments.map((att, i) => (
                <div key={i} className="relative flex-shrink-0 group animate-fade-in-up">
                  <div className="w-20 h-20 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                     {att.type.startsWith('image/') ? (
                       <img src={att.data} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt={att.name} />
                     ) : (
                       <div className="flex flex-col items-center gap-1 p-2 text-center">
                          <FileText size={20} className="text-primary" />
                          <span className="text-[9px] text-gray-500 leading-tight line-clamp-2">{att.name}</span>
                       </div>
                     )}
                  </div>
                  <button 
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-all hover:scale-110 z-10"
                    title="Remove file"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-white/5 rounded-[1.5rem] p-2 flex gap-2 items-center shadow-inner border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-black/40 transition-all">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-3 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all"
               title="Attach file"
             >
               <Paperclip size={20} />
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
             
             <input
               type="text"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
               placeholder={apiKey ? `Message ${selectedCategory}...` : "Enter API key to chat"}
               disabled={!apiKey || isLoading}
               className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none px-2 text-sm md:text-base"
             />

             <button 
               onClick={sendMessage}
               disabled={(!inputValue && attachments.length === 0) || isLoading || !apiKey}
               className={`p-3 rounded-xl transition-all duration-300 ${
                 (inputValue || attachments.length > 0) && !isLoading && apiKey
                   ? 'bg-primary text-white hover:scale-110 shadow-lg shadow-primary/30 rotate-0' 
                   : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
               }`}
             >
               <Send size={20} className={inputValue ? 'ml-0.5' : ''} />
             </button>
          </div>
        </div>
      </div>

      <RockPopup isOpen={showRockPopup} onClose={() => setShowRockPopup(false)} category={selectedCategory} />
    </div>
  );
};

export default AIChat;
