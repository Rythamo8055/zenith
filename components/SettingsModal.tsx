
import React, { useState, useEffect } from 'react';
import { DurationOption } from '../types';
import { CloseIcon, SoundOnIcon, SoundOffIcon, PlayIcon, PauseIcon } from './icons'; 
import { Theme } from '../App'; 

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationOptions: DurationOption[];
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  breathingGuidanceEnabled: boolean;
  onBreathingGuidanceToggle: () => void;
  ambientSoundEnabled: boolean;
  onAmbientSoundToggle: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  durationOptions,
  selectedDuration,
  onDurationChange,
  soundEnabled,
  onSoundToggle,
  breathingGuidanceEnabled,
  onBreathingGuidanceToggle,
  ambientSoundEnabled,
  onAmbientSoundToggle,
  currentTheme,
  onThemeChange,
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 50); 
      return () => clearTimeout(timer);
    } else {
      setShowContent(false); 
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const themeToggleOptions: { label: string; value: Theme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <div 
      className={`fixed inset-0 bg-[var(--backdrop-color)] backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className={`
          glass-bg w-full max-w-md p-5 sm:p-6 md:p-8 rounded-3xl shadow-2xl text-[var(--text-primary)] relative
          transform transition-all duration-300 ease-in-out
          max-h-[90vh] overflow-y-auto 
          ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <CloseIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <h2 id="settings-title" className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center">Settings</h2>

        <div className="space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Duration</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDurationChange(option.value)}
                  aria-pressed={selectedDuration === option.value}
                  className={`p-2.5 sm:p-3 text-sm sm:text-base rounded-xl text-center transition-all duration-200 ease-in-out
                              ${selectedDuration === option.value 
                                ? 'bg-[var(--accent-selected-bg)] text-[var(--text-primary)] font-semibold ring-2 ring-[var(--accent-selected-ring)]' 
                                : 'bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] text-[var(--text-secondary)]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Theme</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {themeToggleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onThemeChange(option.value)}
                  aria-pressed={currentTheme === option.value}
                  className={`p-2.5 sm:p-3 text-sm sm:text-base rounded-xl text-center transition-all duration-200 ease-in-out
                              ${currentTheme === option.value 
                                ? 'bg-[var(--accent-selected-bg)] text-[var(--text-primary)] font-semibold ring-2 ring-[var(--accent-selected-ring)]' 
                                : 'bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] text-[var(--text-secondary)]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Sound Controls</h3>
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={onSoundToggle}
                aria-pressed={soundEnabled}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] transition-colors text-sm sm:text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <span>{soundEnabled ? 'All Sounds Enabled' : 'All Sounds Disabled'}</span>
                {soundEnabled ? <SoundOnIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--icon-green)]" /> : <SoundOffIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--icon-red)]" />}
              </button>
             
              <button
                onClick={onBreathingGuidanceToggle}
                aria-pressed={breathingGuidanceEnabled}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] transition-colors text-sm sm:text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <span>{breathingGuidanceEnabled ? 'Breathing Voice Cues On' : 'Breathing Voice Cues Off'}</span>
                {breathingGuidanceEnabled ? <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--icon-green)]" /> : <PauseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--icon-red)]" />}
              </button>

              <button
                onClick={onAmbientSoundToggle}
                aria-pressed={ambientSoundEnabled}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] transition-colors text-sm sm:text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <span>{ambientSoundEnabled ? 'Background Noise On' : 'Background Noise Off'}</span>
                {ambientSoundEnabled ? <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--icon-green)]" /> : <PauseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--icon-red)]" />}
              </button>
            </div>
             <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-2 sm:mt-3">
              All sounds are generated by your browser.
              <br/>Ensure device is not on silent and volume is up for all sound features.
              Breathing cues and background noise only work if "All Sounds" is also enabled.
             </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-8 sm:mt-10 w-full bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
