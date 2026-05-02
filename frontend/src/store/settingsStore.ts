import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FLOW_VISUAL_OPTIONS } from '@/config/constants';

type FlowVisualMode = 'neon_streams' | 'wind_tunnel' | 'streaklines' | 'clean_vectors';
type Units = 'metric' | 'imperial';
type Theme = 'dark' | 'light';

interface SettingsState {
  useNeuralFoil: boolean;
  units: Units;
  lowPowerMode: boolean;
  flowVisualMode: FlowVisualMode;
  audioVolume: number;
  soundPreset: string;
  graphBounds: { min: number; max: number };
  customAirfoils: unknown[];
  theme: Theme;
  language: string;

  setUseNeuralFoil: (v: boolean) => void;
  setUnits: (v: Units) => void;
  setLowPowerMode: (v: boolean) => void;
  setFlowVisualMode: (v: FlowVisualMode) => void;
  setAudioVolume: (v: number) => void;
  setSoundPreset: (v: string) => void;
  setGraphBounds: (v: { min: number; max: number }) => void;
  setCustomAirfoils: (v: unknown[]) => void;
  setTheme: (v: Theme) => void;
  setLanguage: (v: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      useNeuralFoil: true,
      units: 'metric',
      lowPowerMode: false,
      flowVisualMode: 'neon_streams',
      audioVolume: 50,
      soundPreset: 'horn',
      graphBounds: { min: -20, max: 30 },
      customAirfoils: [],
      theme: 'dark',
      language: 'en',

      setUseNeuralFoil: (v) => set({ useNeuralFoil: v }),
      setUnits: (v) => set({ units: v }),
      setLowPowerMode: (v) => set({ lowPowerMode: v }),
      setFlowVisualMode: (v) => set({ flowVisualMode: v }),
      setAudioVolume: (v) => set({ audioVolume: v }),
      setSoundPreset: (v) => set({ soundPreset: v }),
      setGraphBounds: (v) => set({ graphBounds: v }),
      setCustomAirfoils: (v) => set({ customAirfoils: v }),
      setTheme: (v) => set({ theme: v }),
      setLanguage: (v) => set({ language: v }),
    }),
    { name: 'vortexgen-settings' }
  )
);
