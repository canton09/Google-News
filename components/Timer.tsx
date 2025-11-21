import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // in milliseconds
  onComplete: () => void;
  resetTrigger: number; // Increment to reset
}

export const Timer: React.FC<TimerProps> = ({ duration, onComplete, resetTrigger }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTrigger, duration, onComplete]);

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const percentage = (timeLeft / duration) * 100;
  
  // SVG Math for a radius of 14
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center space-x-3 text-slate-400 text-sm font-mono bg-[#0a1a0a] border border-[#1a3a1a] px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <div className="relative w-9 h-9 flex items-center justify-center">
         <svg className="w-full h-full" viewBox="0 0 40 40">
            {/* Outer Tick Marks Ring */}
            <circle
              cx="20"
              cy="20"
              r="19"
              stroke="currentColor"
              strokeWidth="1"
              fill="transparent"
              strokeDasharray="1 4"
              className="text-[#00ff41] opacity-20"
            />
            
            {/* Inner Background Track */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-[#1a3a1a]"
            />

            {/* Active Progress Ring (Rotated to start from top) */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              stroke="#00ff41"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-linear transform -rotate-90 origin-center shadow-[0_0_10px_#00ff41]"
            />
            
            {/* Center Pulse Core */}
            <circle cx="20" cy="20" r="3" fill="#00ff41" className="animate-pulse">
               <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
            
            {/* Rotating Radar Sweep Line */}
            <path d="M20 20 L20 5" stroke="cyan" strokeWidth="1" opacity="0.5" className="origin-center animate-spin" style={{animationDuration: '3s'}} />
         </svg>
      </div>
      
      <div className="flex flex-col leading-none">
         <span className="text-[9px] text-[#00ff41]/50 tracking-wider uppercase mb-0.5">Next Scan</span>
         <span className="text-cyan-400 font-bold font-orbitron text-base tracking-widest">
           {minutes}:{seconds.toString().padStart(2, '0')}
         </span>
      </div>
    </div>
  );
};