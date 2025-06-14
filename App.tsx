
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, DurationOption, BreathingPhase, BreathingCycleConfig } from './types';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import SettingsModal from './components/SettingsModal';
import { SettingsIcon } from './components/icons';

const DURATION_OPTIONS: DurationOption[] = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '20 min', value: 1200 },
];

const DEFAULT_DURATION = 300; // 5 minutes

const START_CHIME_ID = 'CHIME_START';
const END_CHIME_ID = 'CHIME_END';

const BREATHE_IN_TEXT = 'Breathe In';
const BREATHE_HOLD_TEXT = 'Hold';
const BREATHE_OUT_TEXT = 'Breathe Out';

const BREATHING_CYCLE: BreathingCycleConfig = {
  [BreathingPhase.IN]: { duration: 4, next: BreathingPhase.HOLD, sound: BREATHE_IN_TEXT, text: 'Breathe In' },
  [BreathingPhase.HOLD]: { duration: 4, next: BreathingPhase.OUT, sound: BREATHE_HOLD_TEXT, text: 'Hold' },
  [BreathingPhase.OUT]: { duration: 6, next: BreathingPhase.IN, sound: BREATHE_OUT_TEXT, text: 'Breathe Out' },
  [BreathingPhase.IDLE]: { duration: 0, next: BreathingPhase.IDLE, sound: '', text: ''}
};

const AMBIENT_NOISE_VOLUME = 0.015;

export type Theme = 'light' | 'dark'; // Simplified Theme type

const App: React.FC = () => {
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATION);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [breathingGuidanceEnabled, setBreathingGuidanceEnabled] = useState<boolean>(true);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState<boolean>(false);

  const [currentBreathingPhase, setCurrentBreathingPhase] = useState<BreathingPhase>(BreathingPhase.IDLE);
  const [timeInPhase, setTimeInPhase] = useState<number>(0);

  const [theme, setTheme] = useState<Theme>(() => {
    let storedThemeValue = localStorage.getItem('theme');
    if (storedThemeValue === 'system') { // Handle legacy 'system' value
      storedThemeValue = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Ensure it's one of the valid new Theme types, default to 'light'
    if (storedThemeValue === 'dark') {
      return 'dark';
    }
    return 'light'; // Default to light if not 'dark' or if null/invalid
  });

  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const ambientSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window !== 'undefined') {
      if (!audioContextRef.current && (window.AudioContext || (window as any).webkitAudioContext)) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(err => console.warn("[Audio] Error resuming context on get:", err));
      }
    }
    return audioContextRef.current;
  }, []);
  
  const playSynthesizedChime = useCallback((type: 'start' | 'end') => {
    const context = getAudioContext();
    if (!context || !soundEnabled) return;
    
    if (context.state === 'suspended') context.resume().catch(err => console.warn("[Audio] Error resuming context for chime:", err));

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    if (type === 'start') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.8);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.8);
    } else {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      gainNode.gain.setValueAtTime(0.4, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.2);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 1.2);
    }
  }, [getAudioContext, soundEnabled]);

  const playSound = useCallback((soundSource: string) => {
    if (!soundEnabled || !soundSource) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    if (soundSource === START_CHIME_ID) {
      playSynthesizedChime('start');
    } else if (soundSource === END_CHIME_ID) {
      playSynthesizedChime('end');
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(soundSource);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onerror = (event) => console.warn('[Audio] Speech synthesis error:', event.error);
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('[Audio] Web Speech API not supported.');
      }
    }
  }, [soundEnabled, playSynthesizedChime]);

  const stopAmbientNoise = useCallback(() => {
    if (ambientSourceNodeRef.current) {
      try {
        ambientSourceNodeRef.current.stop();
      } catch (e) { /* Already stopped or node not playing */ }
      ambientSourceNodeRef.current.disconnect();
      ambientSourceNodeRef.current = null;
    }
    if (ambientGainNodeRef.current) {
      ambientGainNodeRef.current.disconnect();
      ambientGainNodeRef.current = null;
    }
  }, []);

  const playAmbientNoise = useCallback(() => {
    if (!soundEnabled || !ambientSoundEnabled) {
      stopAmbientNoise();
      return;
    }

    const context = getAudioContext();
    if (!context || ambientSourceNodeRef.current) return; 

    if (context.state === 'suspended') {
      context.resume().catch(err => console.warn("[Audio] Error resuming context for ambient noise:", err));
    }

    const bufferSize = 2 * context.sampleRate;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; 
    }

    const sourceNode = context.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = true;
    
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(AMBIENT_NOISE_VOLUME, context.currentTime);

    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    sourceNode.start();

    ambientSourceNodeRef.current = sourceNode;
    ambientGainNodeRef.current = gainNode;
  }, [getAudioContext, soundEnabled, ambientSoundEnabled, stopAmbientNoise]);

  useEffect(() => {
    getAudioContext();
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      stopAmbientNoise();
    };
  }, [getAudioContext, stopAmbientNoise]);

  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      if (soundEnabled && ambientSoundEnabled && !ambientSourceNodeRef.current) {
        playAmbientNoise();
      }
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerState(TimerState.FINISHED);
            playSound(END_CHIME_ID);
            setCurrentBreathingPhase(BreathingPhase.IDLE);
            setTimeInPhase(0);
            stopAmbientNoise();
            return 0;
          }
          return prevTime - 1;
        });

        if (breathingGuidanceEnabled) {
          setTimeInPhase(prevTimeInPhase => {
            let nextPhase = currentBreathingPhase;
            let newTimeInPhase = prevTimeInPhase + 1;

            if (currentBreathingPhase === BreathingPhase.IDLE) { 
                nextPhase = BreathingPhase.IN;
                if(soundEnabled && BREATHING_CYCLE[nextPhase]?.sound) playSound(BREATHING_CYCLE[nextPhase].sound);
                newTimeInPhase = 0;
            } else {
                const phaseConfig = BREATHING_CYCLE[currentBreathingPhase];
                if (phaseConfig && newTimeInPhase >= phaseConfig.duration) {
                    nextPhase = phaseConfig.next;
                    if(soundEnabled && BREATHING_CYCLE[nextPhase]?.sound) playSound(BREATHING_CYCLE[nextPhase].sound);
                    newTimeInPhase = 0;
                }
            }
            setCurrentBreathingPhase(nextPhase);
            return newTimeInPhase;
          });
        }
      }, 1000);
    } else { 
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (timerState === TimerState.IDLE || timerState === TimerState.FINISHED) {
         stopAmbientNoise(); 
         setCurrentBreathingPhase(BreathingPhase.IDLE);
         setTimeInPhase(0);
         if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
           window.speechSynthesis.cancel(); 
         }
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, playSound, breathingGuidanceEnabled, currentBreathingPhase, soundEnabled, ambientSoundEnabled, playAmbientNoise, stopAmbientNoise]);

  useEffect(() => {
    if (timerState === TimerState.IDLE || timerState === TimerState.FINISHED) {
      setTimeLeft(duration);
    }
  }, [duration, timerState]);

  const handleStartPause = useCallback(() => {
    const context = getAudioContext();
    if (context && context.state === 'suspended') {
        context.resume().catch(err => console.warn("[Audio] Error resuming context on start/pause:", err));
    }

    if (timerState === TimerState.RUNNING) {
      setTimerState(TimerState.PAUSED);
      stopAmbientNoise(); 
    } else { 
      if (timerState === TimerState.IDLE || timerState === TimerState.FINISHED) {
        setTimeLeft(duration); 
        playSound(START_CHIME_ID);
        if (soundEnabled && ambientSoundEnabled) playAmbientNoise();

        if (breathingGuidanceEnabled) {
          setCurrentBreathingPhase(BreathingPhase.IN);
          setTimeInPhase(0);
          if (soundEnabled && BREATHING_CYCLE[BreathingPhase.IN]?.sound) playSound(BREATHING_CYCLE[BreathingPhase.IN].sound);
        } else {
          setCurrentBreathingPhase(BreathingPhase.IDLE);
        }
      } else if (timerState === TimerState.PAUSED) { 
         if (soundEnabled && ambientSoundEnabled) {
            playAmbientNoise();
         }
         if (breathingGuidanceEnabled && currentBreathingPhase === BreathingPhase.IDLE) {
            setCurrentBreathingPhase(BreathingPhase.IN);
            setTimeInPhase(0);
            if (soundEnabled && BREATHING_CYCLE[BreathingPhase.IN]?.sound) playSound(BREATHING_CYCLE[BreathingPhase.IN].sound);
         }
      }
      setTimerState(TimerState.RUNNING);
    }
  }, [timerState, duration, playSound, breathingGuidanceEnabled, soundEnabled, ambientSoundEnabled, currentBreathingPhase, getAudioContext, playAmbientNoise, stopAmbientNoise]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState(TimerState.IDLE);
    setTimeLeft(duration);
    setCurrentBreathingPhase(BreathingPhase.IDLE);
    setTimeInPhase(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); 
    }
    stopAmbientNoise();
  }, [duration, stopAmbientNoise]);

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (timerState === TimerState.IDLE || timerState === TimerState.FINISHED) {
      setTimeLeft(newDuration);
    }
  };

  const handleSoundToggle = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    if (!newSoundEnabled) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        stopAmbientNoise(); 
    } else {
        if (ambientSoundEnabled && (timerState === TimerState.RUNNING || timerState === TimerState.PAUSED)) {
            if(timerState === TimerState.RUNNING || (timerState === TimerState.PAUSED && ambientSourceNodeRef.current === null)){
                 playAmbientNoise();
            }
        }
    }
  };

  const handleBreathingGuidanceToggle = () => {
    setBreathingGuidanceEnabled(prev => {
      const turningOn = !prev;
      if (turningOn) { 
        if ((timerState === TimerState.RUNNING || timerState === TimerState.PAUSED) && currentBreathingPhase === BreathingPhase.IDLE) {
          setCurrentBreathingPhase(BreathingPhase.IN);
          setTimeInPhase(0);
          if (timerState === TimerState.RUNNING && soundEnabled && BREATHING_CYCLE[BreathingPhase.IN]?.sound) playSound(BREATHING_CYCLE[BreathingPhase.IN].sound);
        }
      } else { 
        setCurrentBreathingPhase(BreathingPhase.IDLE);
        setTimeInPhase(0);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel(); 
        }
      }
      return turningOn;
    });
  };

  const handleAmbientSoundToggle = () => {
    setAmbientSoundEnabled(prevAmbientEnabled => {
        const newAmbientEnabled = !prevAmbientEnabled;
        if (newAmbientEnabled && soundEnabled && (timerState === TimerState.RUNNING || timerState === TimerState.PAUSED)) {
            playAmbientNoise();
        } else {
            stopAmbientNoise();
        }
        return newAmbientEnabled;
    });
  };
  
  const currentPhaseText = breathingGuidanceEnabled && currentBreathingPhase !== BreathingPhase.IDLE && (timerState === TimerState.RUNNING || timerState === TimerState.PAUSED)
    ? BREATHING_CYCLE[currentBreathingPhase]?.text || ''
    : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full text-[var(--text-primary)]">
      <main className="flex flex-col items-center justify-center p-5 sm:p-6 md:p-10 glass-bg rounded-3xl shadow-2xl max-w-md sm:max-w-lg w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-1 sm:mb-2 text-[var(--text-primary)]">Zenith</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 sm:mb-8 md:mb-10">Focus. Breathe. Relax.</p>
        
        <TimerDisplay 
          timeLeft={timeLeft} 
          breathingGuidanceEnabled={breathingGuidanceEnabled && (timerState === TimerState.RUNNING || timerState === TimerState.PAUSED)}
          currentPhaseText={currentPhaseText}
        />
        <TimerControls
          timerState={timerState}
          onStartPause={handleStartPause}
          onReset={handleReset}
          timeLeft={timeLeft}
          initialDuration={duration}
        />

        <button
          onClick={() => {
              const context = getAudioContext(); 
              if (context && context.state === 'suspended') {
                context.resume().catch(err => console.warn("[Audio] Error resuming context on settings open:", err));
              }
              setShowSettings(true);
          }}
          aria-label="Open settings"
          className="mt-8 sm:mt-10 px-6 py-3 rounded-full glass-bg hover:bg-[var(--button-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--button-focus-ring)] transition-all duration-200 ease-in-out flex items-center space-x-2 text-sm sm:text-base"
        >
          <SettingsIcon className="w-5 h-5 text-[var(--text-primary)]" />
          <span className="text-[var(--text-primary)]">Settings</span>
        </button>
      </main>
      
      <footer className="mt-8 sm:mt-10 md:mt-12 text-center max-w-lg w-full px-4">
        <p className="text-xs text-[var(--text-tertiary)]">
          Please ensure sound is enabled on your device.
        </p>
        <p className="text-xs text-[var(--text-tertiary)] opacity-80 mt-1">
          Tip: Add to Home Screen for a native app feel.
        </p>
      </footer>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        durationOptions={DURATION_OPTIONS}
        selectedDuration={duration}
        onDurationChange={handleDurationChange}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        breathingGuidanceEnabled={breathingGuidanceEnabled}
        onBreathingGuidanceToggle={handleBreathingGuidanceToggle}
        ambientSoundEnabled={ambientSoundEnabled}
        onAmbientSoundToggle={handleAmbientSoundToggle}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
};

export default App;
