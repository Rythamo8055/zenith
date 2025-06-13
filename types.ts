
export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export interface DurationOption {
  label: string;
  value: number; // in seconds
}

export enum BreathingPhase {
  IDLE = 'IDLE',
  IN = 'IN',
  HOLD = 'HOLD',
  OUT = 'OUT',
}

export interface BreathingCyclePhaseConfig {
  duration: number;
  next: BreathingPhase;
  sound: string;
  text: string;
}

export interface BreathingCycleConfig {
  [key: string]: BreathingCyclePhaseConfig;
}
