
import React, { useState, useEffect } from 'react';
import { DurationOption } from '../types';
import { CloseIcon, SoundOnIcon, SoundOffIcon, PlayIcon, PauseIcon } from './icons'; 

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

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className={`
          glass-bg w-full max-w-md p-5 sm:p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 text-white relative
          transform transition-all duration-300 ease-in-out
          max-h-[90vh] overflow-y-auto 
          ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-white/70 hover:text-white transition-colors"
        >
          <CloseIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <h2 id="settings-title" className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-center">Settings</h2>

        <div className="space-y-5 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Duration</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDurationChange(option.value)}
                  aria-pressed={selectedDuration === option.value}
                  className={`p-2.5 sm:p-3 text-sm sm:text-base rounded-xl text-center transition-all duration-200 ease-in-out
                              ${selectedDuration === option.value ? 'bg-blue-500/70 text-white font-semibold ring-2 ring-blue-400' : 'bg-white/20 hover:bg-white/30'}`}
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
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                <span>{soundEnabled ? 'All Sounds Enabled' : 'All Sounds Disabled'}</span>
                {soundEnabled ? <SoundOnIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : <SoundOffIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />}
              </button>
             
              <button
                onClick={onBreathingGuidanceToggle}
                aria-pressed={breathingGuidanceEnabled}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                <span>{breathingGuidanceEnabled ? 'Breathing Voice Cues On' : 'Breathing Voice Cues Off'}</span>
                {breathingGuidanceEnabled ? <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : <PauseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />}
              </button>

              <button
                onClick={onAmbientSoundToggle}
                aria-pressed={ambientSoundEnabled}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                <span>{ambientSoundEnabled ? 'Background Noise On' : 'Background Noise Off'}</span>
                {ambientSoundEnabled ? <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : <PauseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />}
              </button>
            </div>
             <p className="text-xs sm:text-sm text-white/60 mt-2 sm:mt-3">
              All sounds are generated by your browser.
              <br/>Ensure device is not on silent and volume is up for all sound features.
              Breathing cues and background noise only work if "All Sounds" is also enabled.
             </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 sm:mt-8 w-full bg-blue-600/80 hover:bg-blue-500/80 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
    