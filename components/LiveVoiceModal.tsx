import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Radio, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useApp } from '../context/AppContext';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const { getApiKey } = useApp();
  const apiKey = getApiKey('google');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0); // For visualizer
  
  // Refs for Audio Handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Queue for playback
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Canvas for visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper: PCM to Base64
  const encodePCM = (bytes: Float32Array) => {
    const l = bytes.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = bytes[i] * 32768;
    }
    const u8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = u8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(u8[i]);
    }
    return btoa(binary);
  };

  // Helper: Base64 to AudioBuffer
  const decodeAudio = (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return Promise.resolve(buffer);
  };

  useEffect(() => {
    if (!isOpen) {
      handleDisconnect();
      return;
    }
    startSession();

    // Draw visualizer loop
    let animId: number;
    const draw = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 300, 100);
          ctx.fillStyle = '#6366f1';
          const height = Math.min(volume * 200, 100);
          const width = 10;
          // Simple bar visualizer simulation
          for(let i=0; i<10; i++) {
             const h = Math.random() * height;
             ctx.fillRect(i * 20 + 50, 50 - h/2, width, h);
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      handleDisconnect();
    };
  }, [isOpen]);

  const startSession = async () => {
    if (!apiKey) return;
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Init Audio Contexts
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC({ sampleRate: 24000 }); // Output rate
      audioContextRef.current = ctx;
      
      // Input Context (Microphone) - 16kHz for Gemini
      const inputCtx = new AC({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are a helpful, conversational AI assistant named Rock.",
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            // Setup Microphone Stream
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (isMuted) return; // Logic to stop sending if muted
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for visualizer
              let sum = 0;
              for(let x=0; x<inputData.length; x++) sum += Math.abs(inputData[x]);
              setVolume(sum / inputData.length * 5); // Gain up for visuals

              const b64 = encodePCM(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: b64
                  }
                });
              });
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
               const buffer = await decodeAudio(audioData, ctx);
               const src = ctx.createBufferSource();
               src.buffer = buffer;
               src.connect(ctx.destination);
               
               const currentTime = ctx.currentTime;
               const start = Math.max(currentTime, nextStartTimeRef.current);
               src.start(start);
               nextStartTimeRef.current = start + buffer.duration;
               
               sourcesRef.current.add(src);
               src.onended = () => sourcesRef.current.delete(src);
             }
             
             if (msg.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setIsConnected(false);
          }
        }
      });
      
    } catch (err) {
      console.error("Failed to start live session", err);
    }
  };

  const handleDisconnect = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsConnected(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-lg">
       <div className="relative w-full max-w-lg p-10 flex flex-col items-center">
          <button onClick={onClose} className="absolute top-0 right-0 p-4 text-gray-500 hover:text-white">
             <X size={32} />
          </button>

          <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isConnected ? 'bg-primary/20 shadow-[0_0_60px_rgba(99,102,241,0.5)]' : 'bg-gray-800'}`}>
             <div className={`w-40 h-40 rounded-full flex items-center justify-center ${isConnected ? 'animate-pulse-slow bg-primary' : 'bg-gray-700'}`}>
                 <Radio size={64} className="text-white" />
             </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Gemini Live</h2>
          <p className="text-gray-400 mb-8 text-center">
             {isConnected ? "Listening... Speak naturally." : "Connecting to satellites..."}
          </p>

          <canvas ref={canvasRef} width="300" height="100" className="mb-8 opacity-80"></canvas>

          <div className="flex gap-6">
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className={`p-6 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
             >
                {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
             </button>
             <button onClick={onClose} className="p-6 rounded-full bg-gray-800 text-red-400 hover:bg-gray-700 hover:text-red-300 border border-red-500/20">
                <X size={32} />
             </button>
          </div>
       </div>
    </div>
  );
};

export default LiveVoiceModal;