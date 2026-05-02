import React from 'react';
import { Wind, Layers } from 'lucide-react';
import { computeNACA } from '../hooks/useAerodynamics';

const NACA4412_POINTS = computeNACA(0.04, 0.4, 0.12);
const NACA0012_POINTS = computeNACA(0, 0, 0.12);

export interface Shape {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  airfoilData: [number, number][];
}

export const SHAPES: Shape[] = [
  { id: 'naca4412', name: 'NACA 4412', type: 'Airfoil · Cambered',  icon: React.createElement(Wind,   { size: 18 }), airfoilData: NACA4412_POINTS },
  { id: 'naca0012', name: 'NACA 0012', type: 'Airfoil · Symmetric', icon: React.createElement(Layers, { size: 18 }), airfoilData: NACA0012_POINTS },
];
