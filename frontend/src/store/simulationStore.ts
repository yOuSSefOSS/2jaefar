import { create } from 'zustand';

interface SimulationState {
  activeShapeId: string;
  compareShapeId: string | null;
  isCompareMode: boolean;
  activePreset: string;
  density: number;
  windSpeed: number;
  pitchAngle: number;
  flowActive: boolean;
  lastSimulationData: unknown[];
  goldenLiftActive: boolean;

  setActiveShapeId: (v: string) => void;
  setCompareShapeId: (v: string | null) => void;
  setIsCompareMode: (v: boolean) => void;
  setActivePreset: (v: string) => void;
  setDensity: (v: number) => void;
  setWindSpeed: (v: number) => void;
  setPitchAngle: (v: number) => void;
  setFlowActive: (v: boolean) => void;
  setLastSimulationData: (v: unknown[]) => void;
  setGoldenLiftActive: (v: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  activeShapeId: 'naca4412',
  compareShapeId: null,
  isCompareMode: false,
  activePreset: 'standard',
  density: 1.225,
  windSpeed: 50,
  pitchAngle: 0,
  flowActive: false,
  lastSimulationData: [],
  goldenLiftActive: false,

  setActiveShapeId: (v) => set({ activeShapeId: v }),
  setCompareShapeId: (v) => set({ compareShapeId: v }),
  setIsCompareMode: (v) => set({ isCompareMode: v }),
  setActivePreset: (v) => set({ activePreset: v }),
  setDensity: (v) => set({ density: v }),
  setWindSpeed: (v) => set({ windSpeed: v }),
  setPitchAngle: (v) => set({ pitchAngle: v }),
  setFlowActive: (v) => set({ flowActive: v }),
  setLastSimulationData: (v) => set({ lastSimulationData: v }),
  setGoldenLiftActive: (v) => set({ goldenLiftActive: v }),
}));
