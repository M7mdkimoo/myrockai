import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Dark Mode Mesh Gradient */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-[#050505] transition-colors duration-500"></div>
      
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-purple-500/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
      <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-pink-500/20 dark:bg-pink-600/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-30 dark:opacity-20 mix-blend-overlay"></div>
      
      {/* Grid Pattern (Subtle) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
    </div>
  );
};

export default AnimatedBackground;