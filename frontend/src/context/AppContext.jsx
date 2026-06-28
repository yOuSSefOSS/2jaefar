import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

/** Persisted IDs for `flowVisualMode` — keep in sync with Settings + SimulationView. */
export const FLOW_VISUAL_OPTIONS = [
  { id: 'neon_streams', label: 'Neon streams', description: 'Bright additive particles (default).' },
  { id: 'wind_tunnel', label: 'Wind tunnel', description: 'Softer, depth-aware smoke-like traces.' },
  { id: 'streaklines', label: 'Streaklines', description: 'Short, sparse trails (teleports culled; calmer than dense line fields).' },
  { id: 'clean_vectors', label: 'Clean vectors', description: 'Sparse minimal highlights — good for stills.' },
  { id: 'smoke', label: 'Smoke (CFD)', description: 'Analytical vortices with red smoke CFD colormapping.' },
];

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Auth & Subscription State
  const [user, setUser] = useState(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [subscriptionTier, setSubscriptionTier] = useState('free'); // 'free', 'pro', 'pro_max'
  const [importsCount, setImportsCount] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accountType, setAccountType] = useState('pending');
  const [userRole, setUserRole] = useState(null);
  const [academyId, setAcademyId] = useState(null);

  // Application Settings State
  const [useNeuralFoil, setUseNeuralFoil] = useState(
    localStorage.getItem('useNeuralFoil') !== 'false'
  );
  
  const [units, setUnits] = useState(
    localStorage.getItem('appUnits') || 'metric' // 'metric' or 'imperial'
  );
  
  const [lowPowerMode, setLowPowerMode] = useState(
    localStorage.getItem('lowPowerMode') === 'true'
  );

  /** 3D flow visualization: particles look / streaklines (see Settings). */
  const [flowVisualMode, setFlowVisualMode] = useState(() => {
    const v = localStorage.getItem('flowVisualMode');
    const ok = FLOW_VISUAL_OPTIONS.some((o) => o.id === v);
    return ok ? v : 'neon_streams';
  });
  
  const [audioVolume, setAudioVolume] = useState(
    parseFloat(localStorage.getItem('audioVolume') || '50')
  );

  const [soundPreset, setSoundPreset] = useState(
    localStorage.getItem('soundPreset') || 'horn'
  );
  
  const [graphBounds, setGraphBounds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('graphBounds')) || { min: -20, max: 30 };
    } catch {
      return { min: -20, max: 30 };
    }
  });

  // Hangar / Data State
  const [customAirfoils, setCustomAirfoils] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customAirfoils')) || [];
    } catch {
      return [];
    }
  });
  
  // Ephemeral Data (Not stored in localStorage)
  const [lastSimulationData, setLastSimulationData] = useState([]);
  const [activeShapeIdGlobal, setActiveShapeIdGlobal] = useState('naca4412');
  const [compareShapeIdGlobal, setCompareShapeIdGlobal] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  /** True after AUTOTUNE FOR MAX LIFT completes — metrics panel gold accent until user edits. */
  const [goldenLiftActive, setGoldenLiftActive] = useState(false);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('useNeuralFoil', useNeuralFoil); }, [useNeuralFoil]);
  useEffect(() => { localStorage.setItem('appUnits', units); }, [units]);
  useEffect(() => { localStorage.setItem('lowPowerMode', lowPowerMode); }, [lowPowerMode]);
  useEffect(() => { localStorage.setItem('flowVisualMode', flowVisualMode); }, [flowVisualMode]);
  useEffect(() => { localStorage.setItem('audioVolume', audioVolume); }, [audioVolume]);
  useEffect(() => { localStorage.setItem('soundPreset', soundPreset); }, [soundPreset]);
  useEffect(() => { localStorage.setItem('graphBounds', JSON.stringify(graphBounds)); }, [graphBounds]);
  useEffect(() => { localStorage.setItem('customAirfoils', JSON.stringify(customAirfoils)); }, [customAirfoils]);

  // Auth Effect
  useEffect(() => {
    // Removed dev bypass to allow real auth locally

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setIsAuthLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setSubscriptionTier('free');
        setImportsCount(0);
        setIsAuthLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('active_workspace_id, account_type, academy_id, role')
        .eq('id', userId)
        .single();
        
      console.log('fetchUserData profileData:', profileData);
      console.log('fetchUserData profileError:', profileError);
        
      if (!profileError && profileData) {
        setActiveWorkspaceId(profileData.active_workspace_id);
        setAccountType(profileData.account_type || 'pending');
        setAcademyId(profileData.academy_id);
        setUserRole(profileData.role);
        
        if (profileData.account_type === 'workspace') {
          // Fetch workspace plan
          const { data: memberData } = await supabase
            .from('workspace_members')
            .select('workspaces(plan)')
            .eq('user_id', userId)
            .eq('workspace_id', profileData.active_workspace_id)
            .single();
            
          setSubscriptionTier(memberData?.workspaces?.plan || 'free');
          
          // Fetch custom airfoils count for imports limit
          const { count } = await supabase
            .from('custom_airfoils')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', profileData.active_workspace_id);
            
          setImportsCount(count || 0);
        } else if (profileData.account_type === 'academy' || profileData.account_type === 'superadmin') {
          setSubscriptionTier('pro_max');
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Persistent Simulation Environment State
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [compareShapeId, setCompareShapeId] = useState(null);
  const [activePreset, setActivePreset] = useState('standard');
  const [density, setDensity] = useState(1.225);
  const [windSpeed, setWindSpeed] = useState(50);
  const [pitchAngle, setPitchAngle] = useState(0);
  const [flowActive, setFlowActive] = useState(false);

  const value = {
    user, setUser,
    activeWorkspaceId, setActiveWorkspaceId,
    accountType, setAccountType,
    userRole, setUserRole,
    academyId, setAcademyId,
    displayName: user?.user_metadata?.display_name || user?.email || 'Guest',
    subscriptionTier, setSubscriptionTier,
    importsCount, setImportsCount,
    isAuthLoading,
    fetchUserData,

    useNeuralFoil, setUseNeuralFoil,
    units, setUnits,
    lowPowerMode, setLowPowerMode,
    flowVisualMode, setFlowVisualMode,
    audioVolume, setAudioVolume,
    soundPreset, setSoundPreset,
    graphBounds, setGraphBounds,
    customAirfoils, setCustomAirfoils,
    lastSimulationData, setLastSimulationData,
    activeShapeIdGlobal, setActiveShapeIdGlobal,
    compareShapeIdGlobal, setCompareShapeIdGlobal,
    isCompareMode, setIsCompareMode,
    goldenLiftActive, setGoldenLiftActive,
    
    // Homed Simulation UI State
    activeShapeId, setActiveShapeId,
    compareShapeId, setCompareShapeId,
    activePreset, setActivePreset,
    density, setDensity,
    windSpeed, setWindSpeed,
    pitchAngle, setPitchAngle,
    flowActive, setFlowActive
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
