import React from 'react';
import { Globe, Mountain } from 'lucide-react';

export interface EnvPreset {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  density: number;
  windSpeed: number;
  particleCount: number;
  color: string;
}

export const ENV_PRESETS: Record<string, EnvPreset> = {
  standard: {
    label: 'Standard Air',
    sublabel: 'Sea Level',
    icon: React.createElement(Globe, { size: 13 }),
    density: 1.225,
    windSpeed: 50,
    particleCount: 1000,
    color: '#00f0ff',
  },
  highAlt: {
    label: 'High Altitude',
    sublabel: '~10 km',
    icon: React.createElement(Mountain, { size: 13 }),
    density: 0.414,
    windSpeed: 80,
    particleCount: 500,
    color: '#a78bfa',
  },
};
