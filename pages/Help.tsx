import React from 'react';
import { HelpCircle, MessageSquare, Video, Image, Zap, Shield, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { SERVICE_RATES, ServiceCategory } from '../types';

const Help: React.FC = () => {
  const faqs = [
    {
      q: "How do I use the AI Live Voice feature?",
      a: "Click the 'Live Voice' button in the Chat Workspace. Ensure your microphone permissions are granted. You can speak naturally to Gemini in real-time."
    },
    {
      q: "Can I edit images with AI?",
      a: "Yes! In the 'Design' category, upload an image and tell the AI what to change (e.g., 'Remove the background' or 'Add a sunset'). We use Gemini 2.5 Flash Image for this."
    },
    {
      q: "How does Expert Matching work?",
      a: "When you post a request in the Pool, our algorithm notifies 'Rock' experts whose skills match your category. They can view your request and submit proposals."
    },
    {
      q: "Are my API keys secure?",
      a: "Absolutely. API keys are stored in your browser's Local Storage. They are never sent to our backend servers, only directly to the AI providers (Google, etc.)."
    },
    {
      q: "What is 'Thinking Mode'?",
      a: "Thinking Mode enables Gemini 3 Pro's advanced reasoning capabilities. It's slower but ideal for complex programming or math problems."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden p-6 md:p-12">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Help Center</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Guides, FAQs, and pricing information.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
           <div className="glass bg-white/60 dark:bg-[#0a0a0a]/60 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                 <Video size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Video Gen</h3>
              <p className="text-sm text-gray-500">Learn how to use Veo to create and animate videos from text or images.</p>
           </div>
           <div className="glass bg-white/60 dark:bg-[#0a0a0a]/60 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-600 mb-4">
                 <Image size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Image Tools</h3>
              <p className="text-sm text-gray-500">Master Imagen 3 for generation and Gemini Flash for editing assets.</p>
           </div>
           <div className="glass bg-white/60 dark:bg-[#0a0a0a]/60 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                 <Zap size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Live API</h3>
              <p className="text-sm text-gray-500">Troubleshoot connection issues with real-time voice conversations.</p>
           </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Competitive Pricing Structure</h2>
          </div>
          
          <div className="glass bg-white/80 dark:bg-[#0a0a0a]/80 rounded-3xl p-8 border border-green-100 dark:border-green-900/20 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl shadow-lg">
               MARKET LEADING RATES
             </div>
             
             <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
               <div className="flex-1">
                 <h3 className="text-xl font-bold mb-2">Why pay more?</h3>
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                   MyRockAI combines the raw speed of Generative AI with targeted human expertise. This hybrid approach allows us to offer rates <strong>significantly lower</strong> than traditional agencies while maintaining high quality. You only pay for the expert time you actually need.
                 </p>
               </div>
               <div className="flex gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <TrendingUp className="text-primary mb-2" />
                    <span className="font-black text-2xl">10x</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">Faster</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <DollarSign className="text-green-500 mb-2" />
                    <span className="font-black text-2xl">50%</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">Savings</span>
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {Object.entries(SERVICE_RATES).map(([category, rate]) => (
                 <div key={category} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="font-medium text-gray-700 dark:text-gray-300">{category}</div>
                    <div className="font-bold text-primary">${rate}/hr</div>
                 </div>
               ))}
             </div>
             
             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex gap-2 text-sm text-gray-500">
                <CheckCircle size={16} className="text-green-500" />
                <span>Billing is calculated in 30-minute increments. No hidden fees.</span>
             </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
           <HelpCircle className="text-primary" /> Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="glass bg-white/60 dark:bg-[#0a0a0a]/60 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
               <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-start gap-3">
                 <span className="text-primary">Q.</span> {item.q}
               </h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed pl-7">
                 {item.a}
               </p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 text-center">
           <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
           <p className="mb-6 opacity-80">Our support team is available 24/7 for Pro users.</p>
           <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
             Contact Support
           </button>
        </div>
      </div>
    </div>
  );
};

export default Help;