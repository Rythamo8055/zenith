
import React from 'react';
import { TimerState } from '../types';
import { PlayIcon, PauseIcon, ResetIcon } from './icons';

interface TimerControlsProps {
  timerState: TimerState;
  onStartPause: () => void;
  onReset: () => void;
  timeLeft: number;
  initialDuration: number;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; ariaLabel: string, className?: string, disabled?: boolean }> = 
  ({ onClick, children, ariaLabel, className, disabled = false }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    disabled={disabled}
    className={`p-3 sm:p-4 rounded-full glass-bg hover:bg-[var(--button-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--button-focus-ring)] transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:!bg-[var(--glass-bg-color)]' : ''} ${className || ''}`}
  >
    {children}
  </button>
);


const TimerControls: React.FC<TimerControlsProps> = ({ timerState, onStartPause, onReset, timeLeft, initialDuration }) => {
  return (
    <div className="flex justify-center items-center space-x-4 sm:space-x-6 my-4 sm:my-6 md:my-8">
      <ControlButton 
        onClick={onReset} 
        ariaLabel="Reset Timer"
        disabled={timerState === TimerState.IDLE && timeLeft === initialDuration}
        className={`${(timerState === TimerState.IDLE && timeLeft === initialDuration) ? 'opacity-60' : ''}`}
      >
        <ResetIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[var(--text-primary)]" />
      </ControlButton>
      <ControlButton 
        onClick={onStartPause} 
        ariaLabel={timerState === TimerState.RUNNING ? "Pause Timer" : "Start Timer"}
        className="w-16 h-16 sm:w-20 sm:h-20 !rounded-full !p-0 flex items-center justify-center bg-[var(--button-main-bg)] hover:!bg-[var(--button-main-hover-bg)] shadow-lg"
      >
        {timerState === TimerState.RUNNING ? (
          <PauseIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-primary)]" />
        ) : (
          <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-primary)]" />
        )}
      </ControlButton>
      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 p-3 sm:p-4 opacity-0"></div> {/* Visual balance spacer */}
    </div>
  );
};

export default TimerControls;
