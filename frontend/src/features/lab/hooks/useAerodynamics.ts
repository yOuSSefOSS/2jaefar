import { useCallback } from 'react';
import { useSimulationStore, useSettingsStore } from '@/store';

// ─── NACA 4-digit coordinate generator ───────────────────────────────────────
export const computeNACA = (m: number, p: number, t: number, N = 60): [number, number][] => {
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = (1 - Math.cos(Math.PI * i / N)) / 2;
    const xn = Math.max(0, x);
    const yt = 5 * t * (0.2969 * Math.sqrt(xn + 1e-9) - 0.126 * xn - 0.3516 * xn ** 2 + 0.2843 * xn ** 3 - 0.1015 * xn ** 4);
    let yc: number, dyc: number;
    if (m === 0 || p === 0) {
      yc = 0; dyc = 0;
    } else if (xn < p) {
      yc = (m / p ** 2) * (2 * p * xn - xn ** 2);
      dyc = (2 * m / p ** 2) * (p - xn);
    } else {
      yc = (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xn - xn ** 2);
      dyc = (2 * m / (1 - p) ** 2) * (p - xn);
    }
    const theta = Math.atan(dyc);
    upper.push([xn - yt * Math.sin(theta) - 0.5, yc + yt * Math.cos(theta)]);
    lower.push([xn + yt * Math.sin(theta) - 0.5, yc - yt * Math.cos(theta)]);
  }
  return [...upper, ...lower.slice(1).reverse()];
};

// ─── Per-airfoil parameters from published wind-tunnel data ──────────────────
export const AIRFOIL_PARAMS: Record<string, { alpha0: number; clAlpha: number; stallPos: number; stallNeg: number; clMax: number; cdMin: number; k: number }> = {
  naca4412: { alpha0: -4, clAlpha: 0.11, stallPos: 14, stallNeg: -12, clMax: 1.5, cdMin: 0.006, k: 0.004 },
  naca0012: { alpha0:  0, clAlpha: 0.11, stallPos: 16, stallNeg: -16, clMax: 1.6, cdMin: 0.006, k: 0.004 },
  imported: { alpha0:  0, clAlpha: 0.11, stallPos: 15, stallNeg: -15, clMax: 1.5, cdMin: 0.008, k: 0.005 },
};

export const calculateAerodynamics = (shapeId: string, isAirfoil: boolean, alpha: number): { cl: number; cd: number } => {
  alpha = parseFloat(String(alpha)) || 0;

  if (isAirfoil || shapeId === 'naca4412' || shapeId === 'naca0012') {
    const params = AIRFOIL_PARAMS[shapeId] || AIRFOIL_PARAMS.imported;
    const { alpha0, clAlpha, stallPos, stallNeg, cdMin, k } = params;

    let cl = clAlpha * (alpha - alpha0);
    let cd = cdMin + k * cl * cl;

    if (alpha > stallPos) {
      const excess = alpha - stallPos;
      const clAtStall = clAlpha * (stallPos - alpha0);
      cl = Math.max(0.1, clAtStall - excess * 0.22);
      cd = cdMin + k * clAtStall * clAtStall + 0.025 * Math.pow(excess, 1.6);
    } else if (alpha < stallNeg) {
      const excess = Math.abs(alpha - stallNeg);
      const clAtStall = clAlpha * (stallNeg - alpha0);
      cl = Math.min(-0.1, clAtStall + excess * 0.22);
      cd = cdMin + k * clAtStall * clAtStall + 0.025 * Math.pow(excess, 1.6);
    }

    if (alpha0 === 0 && Math.abs(alpha) < 0.01) cl = 0;
    if (Math.abs(alpha) > 35) cd = Math.max(cd, 1.25 * Math.pow(Math.sin((alpha * Math.PI) / 180), 2));

    return { cl: Number(cl.toFixed(4)), cd: Number(cd.toFixed(4)) };
  }

  return { cl: 0, cd: 0 };
};

// ─── Parse .dat airfoil file ──────────────────────────────────────────────────
export const parseAirfoilDat = (text: string): [number, number][] | null => {
  const points: [number, number][] = [];
  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith('#') || isNaN(parseFloat(line.split(/\s+/)[0]))) continue;
    const parts = line.split(/[\s,]+/);
    if (parts.length >= 2) {
      const x = parseFloat(parts[0]), y = parseFloat(parts[1]);
      if (!isNaN(x) && !isNaN(y)) points.push([x, y]);
    }
  }
  if (points.length < 3) return null;
  const minX = Math.min(...points.map((p) => p[0]));
  const maxX = Math.max(...points.map((p) => p[0]));
  const chord = maxX - minX || 1;
  return points.map(([x, y]) => [(x - minX) / chord - 0.5, y / chord]);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAerodynamics = () => {
  const pitchAngle = useSimulationStore((s) => s.pitchAngle);
  const activeShapeId = useSimulationStore((s) => s.activeShapeId);
  const graphBounds = useSettingsStore((s) => s.graphBounds);

  const getMetrics = useCallback(
    (shapeId: string, alpha: number) => calculateAerodynamics(shapeId, true, alpha),
    []
  );

  const getChartData = useCallback(() => {
    const data = [];
    for (let a = graphBounds.min; a <= graphBounds.max; a++) {
      const { cl, cd } = calculateAerodynamics(activeShapeId, true, a);
      data.push({ alpha: a, cl, cd, ld: cd !== 0 ? Number((cl / cd).toFixed(2)) : 0 });
    }
    return data;
  }, [activeShapeId, graphBounds]);

  const currentMetrics = getMetrics(activeShapeId, pitchAngle);

  return { currentMetrics, getMetrics, getChartData };
};
