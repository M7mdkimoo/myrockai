import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
        <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Abstract Rock/Hexagon Shape */}
    <path 
      d="M100 20 L175 65 L175 135 L100 180 L25 135 L25 65 Z" 
      fill="none" 
      stroke="url(#logoGrad)" 
      strokeWidth="12" 
      strokeLinejoin="round"
      filter="url(#glow)"
      className="opacity-90"
    />
    
    {/* Internal Neural Circuitry */}
    <path 
      d="M100 20 L100 80 M175 135 L120 100 M25 135 L80 100" 
      stroke="url(#logoGrad)" 
      strokeWidth="6" 
      strokeLinecap="round"
      className="opacity-60"
    />
    
    {/* Core Node */}
    <circle cx="100" cy="100" r="18" fill="url(#logoGrad)" filter="url(#glow)" />
    <circle cx="100" cy="100" r="8" fill="white" className="dark:fill-white fill-indigo-50" />

    {/* Satellite Nodes */}
    <circle cx="100" cy="40" r="5" fill="#ec4899" />
    <circle cx="155" cy="125" r="5" fill="#6366f1" />
    <circle cx="45" cy="125" r="5" fill="#6366f1" />
  </svg>
);
