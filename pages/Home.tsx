
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Users, ArrowRight, Terminal, Clapperboard, Palette, Feather, TrendingUp, Zap, Sparkles, Layers, Globe, Cuboid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceCategory } from '../types';
import AnimatedBackground from '../components/AnimatedBackground';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { getApiKey } = useApp();
  const hasApiKey = !!getApiKey('google');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoadingCards, setIsLoadingCards] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position normalized from center (-10 to 10 range)
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Simulate loading delay for shimmer effect demo
    const timer = setTimeout(() => setIsLoadingCards(false), 1500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const handleServiceClick = (category: string) => {
    if (!hasApiKey) {
      navigate('/settings');
      return;
    }
    navigate(`/chat?category=${category}`);
  };

  const services = [
    { 
      id: ServiceCategory.DESIGN, 
      icon: Palette, 
      title: 'Creative Design',
      desc: 'Create stunning visuals, logos, and user interfaces.',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      hover: 'group-hover:shadow-pink-500/20'
    },
    { 
      id: ServiceCategory.VIDEO, 
      icon: Clapperboard, 
      title: 'Video Production',
      desc: 'Produce professional videos and AI animations.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      hover: 'group-hover:shadow-purple-500/20'
    },
    { 
      id: ServiceCategory.PROGRAMMING, 
      icon: Terminal, 
      title: 'Engineering',
      desc: 'Build robust software, scripts, and applications.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      hover: 'group-hover:shadow-blue-500/20'
    },
    { 
      id: ServiceCategory.WEB_DATA, 
      icon: Globe, 
      title: 'Web & Data',
      desc: 'Develop modern websites and data dashboards.',
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      hover: 'group-hover:shadow-teal-500/20'
    },
    { 
      id: ServiceCategory.MODELING_3D, 
      icon: Cuboid, 
      title: '3D Modeling',
      desc: 'Design realistic 3D models and spatial assets.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      hover: 'group-hover:shadow-orange-500/20'
    },
    { 
      id: ServiceCategory.TEXT, 
      icon: Feather, 
      title: 'Content & Copy',
      desc: 'Generate engaging copy, articles, and SEO content.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      hover: 'group-hover:shadow-emerald-500/20'
    },
    { 
      id: ServiceCategory.ANALYSIS, 
      icon: TrendingUp, 
      title: 'Data Science',
      desc: 'Unlock insights with advanced data analysis.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      hover: 'group-hover:shadow-amber-500/20'
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section with Parallax */}
      <div className="relative z-10 pt-20 pb-16 text-center px-4">
        
        {/* Wrapper for animation, Inner for Parallax */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-bold tracking-widest text-gray-600 dark:text-gray-300 mb-8 shadow-lg hover:scale-105 transition-transform cursor-default"
            style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }}
            >
            <Sparkles size={12} className="text-amber-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI-POWERED WORKSPACE</span>
            </div>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-tight transition-transform duration-100 ease-out" 
            style={{ 
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
            }}
            >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 filter drop-shadow-lg">
                MyRockAI
            </span>
            </h1>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p 
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10 transition-transform duration-100 ease-out font-medium" 
            style={{ 
                transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
            }}
            >
            Fusion of <span className="text-gray-900 dark:text-white font-bold">Generative AI</span> and <span className="text-gray-900 dark:text-white font-bold">Human Experts</span>. 
            <br className="hidden md:block" />Solve complex problems with unparalleled speed.
            </p>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row justify-center gap-5" style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}>
            <button 
                onClick={() => navigate(hasApiKey ? '/chat' : '/settings')}
                className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-opacity group-hover:opacity-90"></div>
                <span className="relative flex items-center justify-center gap-2">
                <Zap size={20} className="fill-current" /> Start Creating
                </span>
            </button>
            <button 
                onClick={() => navigate('/pool')}
                className="px-8 py-4 glass text-gray-900 dark:text-white rounded-2xl font-bold text-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
                <Users size={20} /> Talent Pool
            </button>
            </div>
        </div>
      </div>

      {/* Main Split Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-24 grid lg:grid-cols-2 gap-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        
        {/* Left: AI Services Card */}
        <div className="group relative glass rounded-[2.5rem] p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(99,102,241,0.15)] transition-all duration-500">
          
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Studio</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Specialized models for every task</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              isLoadingCards ? (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 relative overflow-hidden border border-transparent">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <button
                  key={s.id}
                  onClick={() => handleServiceClick(s.id)}
                  className={`group/card relative flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl ${s.hover} text-left overflow-hidden`}
                >
                   {/* Inner Glow on Hover */}
                   <div className={`absolute inset-0 opacity-0 group-hover/card:opacity-10 bg-gradient-to-r ${s.bg.replace('bg-', 'from-').replace('/10', '')} to-transparent transition-opacity duration-500`}></div>

                  <div className={`relative p-3 rounded-xl ${s.bg} ${s.color} border ${s.border}`}>
                    <s.icon size={20} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover/card:text-primary dark:group-hover/card:text-white transition-colors">{s.title}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">{s.desc}</p>
                  </div>
                </button>
              )
            ))}
          </div>
          
          {!hasApiKey && (
             <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold backdrop-blur-md">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
               Setup API Key to unlock AI features.
             </div>
          )}
        </div>

        {/* Right: Pool Requests Card */}
        <div className="group relative rounded-[2.5rem] p-[1px] transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-[0_0_50px_rgba(236,72,153,0.2)]">
           <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-secondary via-purple-500 to-primary opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700"></div>
           
           <div className="relative h-full glass rounded-[2.5rem] p-8 overflow-hidden">
            
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-pink-600 flex items-center justify-center text-white shadow-lg shadow-secondary/30">
                <Users size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Expert Pool</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Human expertise on demand</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                { num: 1, title: 'Post Request', desc: 'Describe requirements & files', icon: Layers },
                { num: 2, title: 'AI Estimation', desc: 'Instant scope & price range', icon: Zap },
                { num: 3, title: 'Hire Expert', desc: 'Connect with vetted pros', icon: Users },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-5 items-center group/step p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center font-bold text-gray-400 group-hover/step:text-secondary group-hover/step:scale-110 transition-all shadow-sm">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover/step:text-secondary transition-colors">{step.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}

              <Link 
                to="/pool" 
                className="group block w-full py-4 mt-6 text-center bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Browse Pool <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
