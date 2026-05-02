import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import LabLayout      from '@/features/lab/layout/LabLayout';
import AcademyLayout  from '@/features/academy/layout/AcademyLayout';

// Auth
import { AuthGuard }  from '@/features/auth/components/AuthGuard';
import LoginPage      from '@/features/auth/pages/LoginPage';
import SignupPage     from '@/features/auth/pages/SignupPage';

// Pages
import LandingPage    from '@/features/landing/pages/LandingPage';
import ExplorerPage   from '@/features/academy/pages/ExplorerPage';
import FuselagePage   from '@/features/academy/pages/FuselagePage';
import WingsPage      from '@/features/academy/pages/WingsPage';
import AirfoilPage    from '@/features/academy/pages/AirfoilPage';
import DashboardPage  from '@/features/lab/pages/DashboardPage';
import ProfilePage    from '@/features/profile/pages/ProfilePage';
import SettingsPage   from '@/features/settings/pages/SettingsPage';
import PricingPage    from '@/features/pricing/pages/PricingPage';

// Loading + backend
import LoadingScreen  from '@/components/layout/LoadingScreen';
import { checkBackendStatus } from '@/lib/apiClient';

// NOTE: AppProvider is still needed until zustand migration is complete
import { AppProvider } from './context/AppContext';

export default function App() {
  const [isConnected,       setIsConnected]       = useState(false);
  const [isInitializing,    setIsInitializing]    = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  // Backend polling — identical to original App.jsx
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        await checkBackendStatus();
        if (isMounted) setIsConnected(true);
      } catch {
        if (isMounted) setIsConnected(false);
      } finally {
        setTimeout(() => { if (isMounted) setIsInitializing(false); }, 2500);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <AppProvider>
      {showLoadingScreen && (
        <LoadingScreen
          isInitializing={isInitializing}
          onLoadingComplete={() => setShowLoadingScreen(false)}
        />
      )}
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Academy — public, uses Outlet (same as original ExplorerLayout) */}
          <Route path="/explore" element={<AcademyLayout />}>
            <Route index           element={<ExplorerPage />} />
            <Route path="fuselage" element={<FuselagePage />} />
            <Route path="wings"    element={<WingsPage />} />
            <Route path="airfoil"  element={<AirfoilPage />} />
          </Route>

          {/* Lab — protected, children pattern (identical to original) */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <LabLayout isBackendConnected={isConnected}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile"   element={<ProfilePage />} />
                    <Route path="/settings"  element={<SettingsPage />} />
                    <Route path="/pricing"   element={<PricingPage />} />
                  </Routes>
                </LabLayout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
