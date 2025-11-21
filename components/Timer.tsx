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

  return (
    <div className="flex items-center space-x-2 text-slate-400 text-sm font-mono">
      <div className="relative w-8 h-8 flex items-center justify-center">
         <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-slate-700"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={88}
              strokeDashoffset={88 - (88 * percentage) / 100}
              className="text-cyan-500 transition-all duration-1000 ease-linear"
            />
         </svg>
      </div>
      <span>Next update: {minutes}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};
