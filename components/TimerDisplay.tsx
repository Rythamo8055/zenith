
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  breathingGuidanceEnabled?: boolean;
  currentPhaseText?: string;
}

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, breathingGuidanceEnabled, currentPhaseText }) => {
  return (
    <div className="text-center my-4 sm:my-6 md:my-8 relative h-28 sm:h-32 md:h-36 flex flex-col justify-center items-center">
      <p 
        aria-live="polite" 
        aria-atomic="true"
        className="text-6xl sm:text-7xl lg:text-8xl font-thin tracking-tighter text-[var(--text-primary)] tabular-nums"
      >
        {formatTime(timeLeft)}
      </p>
      {breathingGuidanceEnabled && currentPhaseText && (
        <p 
          aria-live="polite"
          className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] mt-2 absolute -bottom-0 sm:-bottom-1 md:-bottom-2 left-0 right-0 animate-fadeIn"
          style={{ animationDuration: '0.5s' }}
        >
          {currentPhaseText}
        </p>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation-name: fadeIn; }
      `}</style>
    </div>
  );
};

export default TimerDisplay;
