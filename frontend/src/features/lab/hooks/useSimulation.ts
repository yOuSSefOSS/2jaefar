import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSimulationStore, useSettingsStore, useAuthStore } from '@/store';
import { calculateAerodynamics } from './useAerodynamics';
import { SHAPES } from '../data/shapes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ChartPoint {
  aoa: number;
  cl: number | null;
  cd: number | null;
}

export const useSimulation = (customAirfoils: any[] = []) => {
  const activeShapeId   = useSimulationStore((s) => s.activeShapeId);
  const compareShapeId  = useSimulationStore((s) => s.compareShapeId);
  const isCompareMode   = useSimulationStore((s) => s.isCompareMode);
  const density         = useSimulationStore((s) => s.density);
  const windSpeed       = useSimulationStore((s) => s.windSpeed);
  const pitchAngle      = useSimulationStore((s) => s.pitchAngle);
  const setLastSimulationData = useSimulationStore((s) => s.setLastSimulationData);

  const useNeuralFoil   = useSettingsStore((s) => s.useNeuralFoil);
  const graphBounds     = useSettingsStore((s) => s.graphBounds);
  const subscriptionTier = useAuthStore((s) => s.subscriptionTier);

  const allShapes = [...SHAPES, ...customAirfoils];
  const activeShape  = allShapes.find((s) => s.id === activeShapeId);
  const compareShape = allShapes.find((s) => s.id === compareShapeId);

  const [isSimulating,      setIsSimulating]      = useState(false);
  const [isWarmingUp,       setIsWarmingUp]       = useState(false);
  const [chartData,         setChartData]          = useState<ChartPoint[]>([]);
  const [compareChartData,  setCompareChartData]   = useState<ChartPoint[]>([]);

  // ─── Compute chart data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeShape) return;
    let isMounted = true;
    setIsSimulating(true);

    const isCustomAirfoil = !['naca4412', 'naca0012'].includes(activeShapeId);
    const isSymmetric = activeShape.type?.toLowerCase().includes('symmetric') || activeShape.name?.includes('00');
    const compareActive = isCompareMode && compareShape;
    const isCompareCustom = compareActive ? !['naca4412', 'naca0012'].includes(compareShapeId) : false;
    const isCompareSymmetric = compareActive
      ? (compareShape!.type?.toLowerCase().includes('symmetric') || compareShape!.name?.includes('00'))
      : false;

    if (!useNeuralFoil) {
      setTimeout(() => {
        if (!isMounted) return;

        const buildData = (shapeId: string, isCustom: boolean, isSym: boolean): ChartPoint[] => {
          const rawData: ChartPoint[] = [];
          for (let a = graphBounds.min; a <= graphBounds.max; a++) {
            const { cl, cd } = calculateAerodynamics(shapeId, isCustom, a);
            rawData.push({ aoa: a, cl, cd });
          }

          let maxCl = -Infinity, minCl = Infinity;
          let stallPos: number | null = null, stallNeg: number | null = null;
          for (const d of rawData) {
            if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; stallPos = d.aoa; }
            if (d.cl !== null && d.cl < minCl) { minCl = d.cl; stallNeg = d.aoa; }
          }

          return rawData.map((d) => {
            const clFinal = (isSym && Math.abs(d.aoa) < 0.01) ? 0 : Number((d.cl || 0).toFixed(3));
            const cdFinal = Number((d.cd || 0).toFixed(3));
            const limitPos = stallPos !== null ? stallPos + 5 : 999;
            const limitNeg = stallNeg !== null ? stallNeg - 5 : -999;
            if (d.aoa > limitPos || d.aoa < limitNeg) return { aoa: d.aoa, cl: null, cd: null };
            return { aoa: d.aoa, cl: clFinal, cd: cdFinal };
          });
        };

        const newData = buildData(activeShapeId, isCustomAirfoil, isSymmetric);
        setChartData(newData);
        setLastSimulationData(newData);

        if (compareActive) {
          setCompareChartData(buildData(compareShapeId!, isCompareCustom, isCompareSymmetric));
        } else {
          setCompareChartData([]);
        }
        setIsSimulating(false);
      }, 300);

      return () => { isMounted = false; };
    }

    // NeuralFoil API path
    const reynolds = (windSpeed * density) / 1.81e-5;
    const alphaRange = Array.from(
      { length: graphBounds.max - graphBounds.min + 1 },
      (_, i) => i + graphBounds.min
    );

    const fetchShape = async (shape: any, isSym: boolean, retries = 0): Promise<ChartPoint[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      const activeWorkspaceId = useAuthStore.getState().activeWorkspaceId;
      
      try {
        const response = await fetch(`${API_URL}/api/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            ...(activeWorkspaceId ? { 'X-Workspace-Id': activeWorkspaceId } : {})
          },
          body: JSON.stringify({
            airfoil: shape.name, // match AnalyzeSchema
            alpha: alphaRange,
            reynolds: reynolds,
            mach: 0,
            coordinates: shape.airfoilData,
            modelSize: 'xlarge',
          }),
        });

        if (response.status === 503) {
          const data = await response.json();
          if (data.retry && retries < 2) {
            setIsWarmingUp(true);
            await new Promise(r => setTimeout(r, 8000));
            return fetchShape(shape, isSym, retries + 1);
          }
          throw new Error('Simulation engine unavailable');
        }

        const data = await response.json();
        
        // Handle failure where JSON still returns an error 
        if (data.error) {
          throw new Error(data.error);
        }

        if (!Array.isArray(data) && !data.cl && !Array.isArray(data.cl_values)) {
            // Neuralfoil might return a different structure via the backend
            // For now, assume data is an array or contains arrays of cl/cd.
            // Adjust based on actual payload. Assuming array based on previous code.
            throw new Error('Invalid response');
        }
        
        let resultData = Array.isArray(data) ? data : data.data || [];
        
        let maxCl = -Infinity, minCl = Infinity;
        let stallPos: number | null = null, stallNeg: number | null = null;
        resultData.forEach((d: any) => {
          if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; stallPos = d.aoa; }
          if (d.cl !== null && d.cl < minCl) { minCl = d.cl; stallNeg = d.aoa; }
        });
        return resultData.map((d: any) => {
          let { cl, cd } = d;
          if (isSym && Math.abs(d.aoa) < 0.01) cl = 0;
          const limitPos = stallPos !== null ? stallPos + 5 : 999;
          const limitNeg = stallNeg !== null && minCl < -0.1 ? stallNeg - 5 : -999;
          if (d.aoa > limitPos || d.aoa < limitNeg) return { aoa: d.aoa, cl: null, cd: null };
          return { aoa: d.aoa, cl, cd };
        });
      } catch (err) {
         throw err;
      }
    };

    const promises = [fetchShape(activeShape, isSymmetric)];
    if (compareActive) promises.push(fetchShape(compareShape!, isCompareSymmetric));

    Promise.all(promises)
      .then((results) => {
        if (!isMounted) return;
        setChartData(results[0]);
        setLastSimulationData(results[0]);
        setCompareChartData(results.length > 1 ? results[1] : []);
        setIsSimulating(false);
        setIsWarmingUp(false);
      })
      .catch((err) => {
        if (isMounted) { setIsSimulating(false); setIsWarmingUp(false); console.error('Fetch Error:', err); }
      });

    return () => { isMounted = false; };
  }, [activeShapeId, compareShapeId, isCompareMode, windSpeed, density, useNeuralFoil, graphBounds, activeShape?.id]);

  // ─── Derived stall info ───────────────────────────────────────────────────────
  const { positiveStallAngle, negativeStallAngle } = useMemo(() => {
    if (!chartData.length) return { positiveStallAngle: null, negativeStallAngle: null };
    let maxCl = -Infinity, minCl = Infinity, posAoA = null, negAoA = null;
    for (const d of chartData) {
      if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; posAoA = d.aoa; }
      if (d.cl !== null && d.cl < minCl) { minCl = d.cl; negAoA = d.aoa; }
    }
    return { positiveStallAngle: posAoA, negativeStallAngle: minCl < -0.1 ? negAoA : null };
  }, [chartData]);

  const stallAngle = positiveStallAngle;

  const isStalling = useMemo(() => {
    if (positiveStallAngle === null) return false;
    if (pitchAngle > positiveStallAngle) return true;
    if (negativeStallAngle !== null && pitchAngle < negativeStallAngle) return true;
    return false;
  }, [pitchAngle, positiveStallAngle, negativeStallAngle]);

  const stallPoint = useMemo(() => {
    if (positiveStallAngle === null || !chartData.length) return { cd: null, cl: null };
    const pt = chartData.find((d) => d.aoa === positiveStallAngle);
    return pt ? { cd: pt.cd, cl: pt.cl } : { cd: null, cl: null };
  }, [positiveStallAngle, chartData]);

  const currentAeroItem = useMemo(() => {
    if (!chartData.length) return { cl: 0, cd: 0 };
    const closest = chartData.reduce((prev, curr) =>
      Math.abs(curr.aoa - pitchAngle) < Math.abs(prev.aoa - pitchAngle) ? curr : prev
    );
    const isSymmetric = activeShape?.type?.toLowerCase().includes('symmetric') || activeShape?.name?.includes('00');
    if (isSymmetric && Math.abs(pitchAngle) < 0.01) return { ...closest, cl: 0 };
    return closest;
  }, [activeShape, chartData, pitchAngle]);

  // ─── Compare derived ──────────────────────────────────────────────────────────
  const { comparePositiveStallAngle, compareNegativeStallAngle } = useMemo(() => {
    if (!compareChartData.length) return { comparePositiveStallAngle: null, compareNegativeStallAngle: null };
    let maxCl = -Infinity, minCl = Infinity, posAoA = null, negAoA = null;
    for (const d of compareChartData) {
      if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; posAoA = d.aoa; }
      if (d.cl !== null && d.cl < minCl) { minCl = d.cl; negAoA = d.aoa; }
    }
    return { comparePositiveStallAngle: posAoA, compareNegativeStallAngle: minCl < -0.1 ? negAoA : null };
  }, [compareChartData]);

  const compareStallPoint = useMemo(() => {
    if (comparePositiveStallAngle === null || !compareChartData.length) return { cd: null, cl: null };
    const pt = compareChartData.find((d) => d.aoa === comparePositiveStallAngle);
    return pt ? { cd: pt.cd, cl: pt.cl } : { cd: null, cl: null };
  }, [comparePositiveStallAngle, compareChartData]);

  const compareCurrentAeroItem = useMemo(() => {
    if (!compareChartData.length) return { cl: 0, cd: 0 };
    const closest = compareChartData.reduce((prev, curr) =>
      Math.abs(curr.aoa - pitchAngle) < Math.abs(prev.aoa - pitchAngle) ? curr : prev
    );
    const isSymmetric = compareShape?.type?.toLowerCase().includes('symmetric') || compareShape?.name?.includes('00');
    if (isSymmetric && Math.abs(pitchAngle) < 0.01) return { ...closest, cl: 0 };
    return closest;
  }, [compareShape, compareChartData, pitchAngle]);

  return {
    allShapes,
    activeShape,
    compareShape,
    isSimulating,
    isWarmingUp,
    chartData,
    compareChartData,
    positiveStallAngle,
    negativeStallAngle,
    stallAngle,
    isStalling,
    stallPoint,
    currentAeroItem,
    comparePositiveStallAngle,
    compareNegativeStallAngle,
    compareStallPoint,
    compareCurrentAeroItem,
  };
};
