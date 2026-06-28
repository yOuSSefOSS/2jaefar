import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ExplorerLayout from './layouts/ExplorerLayout';
import LabLayout from './layouts/LabLayout';
import { checkBackendStatus } from './services/apiService';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Admin from './pages/Admin';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import SuperadminDashboard from './pages/admin/SuperadminDashboard';
import AcademyAdmin from './pages/admin/AcademyAdmin';
import Pricing from './pages/Pricing';
import LandingPage from './pages/LandingPage';
import Pitch from './pages/Pitch';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Explorer from './pages/Explorer';
import FuselageSection from './pages/explore/FuselageSection';
import WingsSection from './pages/explore/WingsSection';
import AirfoilSection from './pages/explore/AirfoilSection';
import TailSection from './pages/explore/TailSection';
import EnginesSection from './pages/explore/EnginesSection';
import LabHub from './pages/lab/LabHub';
import WingsLab from './pages/lab/WingsLab';
import TailLab from './pages/lab/TailLab';
import FuselageLab from './pages/lab/FuselageLab';
import EnginesLab from './pages/lab/EnginesLab';

// New Principles of Flight Lab
import FlightLabLayout from './features/flight-lab/pages/FlightLabLayout';
import AerodynamicsTab from './features/flight-lab/pages/AerodynamicsTab';
import LiftEquationTab from './features/flight-lab/pages/LiftEquationTab';
import HighLiftDevicesTab from './features/flight-lab/pages/HighLiftDevicesTab';
import StabilityTab from './features/flight-lab/pages/StabilityTab';
import ControlsTab from './features/flight-lab/pages/ControlsTab';
import { AcademyProvider } from './context/AcademyContext';
import { TenantProvider } from './context/TenantContext';
import AuthGuard, { GlobalOnboardingGuard } from './components/AuthGuard';
import { AppProvider } from './context/AppContext';
import LoadingScreen from './components/LoadingScreen';

// Error Screens
import NotFound from './pages/error/NotFound';
import ServerError from './pages/error/ServerError';
import Vulnerability from './pages/error/Vulnerability';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        await checkBackendStatus();
        if (isMounted) setIsConnected(true);
      } catch (error) {
        if (isMounted) setIsConnected(false);
      } finally {
        // Guarantee the loading screen shows for at least 2.5s to see the cool animation
        setTimeout(() => {
          if (isMounted) setIsInitializing(false);
        }, 2500);
      }
    };

    fetchStatus();
    
    // Polling every 30s for connection robust check
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AppProvider>
      <TenantProvider>
      {showLoadingScreen && (
        <LoadingScreen 
          isInitializing={isInitializing} 
          onLoadingComplete={() => setShowLoadingScreen(false)} 
        />
      )}
      <BrowserRouter>
        <GlobalOnboardingGuard>
          <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Error Routes ── */}
          <Route 
            path="/error/500" 
            element={
              <DashboardLayout isBackendConnected={isConnected}>
                <ServerError />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/error/403" 
            element={
              <DashboardLayout isBackendConnected={isConnected}>
                <Vulnerability />
              </DashboardLayout>
            } 
          />

          {/* ── Explorer Routes (Public — educational content) ── */}
          <Route path="/explore" element={<ExplorerLayout />}>
            <Route index element={<Explorer />} />
            <Route path="fuselage" element={<FuselageSection />} />
            <Route path="wings" element={<WingsSection />} />
            <Route path="tail" element={<TailSection />} />
            <Route path="airfoil" element={<AirfoilSection />} />
            <Route path="engines" element={<EnginesSection />} />
          </Route>

          {/* ── Lab Routes (Public Hub + labs, Airfoil lab auth-protected) ── */}
          <Route path="/lab" element={<LabLayout />}>
            <Route index element={<LabHub />} />
            <Route path="wings" element={<WingsLab />} />
            <Route path="tail" element={<TailLab />} />
            <Route path="fuselage" element={<FuselageLab />} />
            <Route path="engines" element={<EnginesLab />} />
          </Route>

          {/* ── Principles of Flight Lab (Interactive Module) ── */}
          <Route path="/principles-of-flight" element={<AcademyProvider><FlightLabLayout /></AcademyProvider>}>
            <Route index element={<Navigate to="aerodynamics" replace />} />
            <Route path="aerodynamics" element={<AerodynamicsTab />} />
            <Route path="lift-equation" element={<LiftEquationTab />} />
            <Route path="high-lift-devices" element={<HighLiftDevicesTab />} />
            <Route path="stability" element={<StabilityTab />} />
            <Route path="controls" element={<ControlsTab />} />
          </Route>
          
          <Route
            path="/lab/airfoil"
            element={
              <AuthGuard>
                <DashboardLayout isBackendConnected={isConnected}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DashboardLayout>
              </AuthGuard>
            }
          />

          <Route path="/instructor" element={
            <AuthGuard>
              <InstructorDashboard />
            </AuthGuard>
          } />

          <Route path="/onboarding" element={
            <AuthGuard>
              <Onboarding />
            </AuthGuard>
          } />

          <Route path="/superadmin" element={
            <AuthGuard>
              <SuperadminDashboard />
            </AuthGuard>
          } />

          <Route path="/academy-admin/:id?" element={
            <AuthGuard>
              <AcademyAdmin />
            </AuthGuard>
          } />

          {/* Legacy /dashboard redirect */}
          <Route path="/dashboard" element={<Navigate to="/lab/airfoil" replace />} />

          {/* ── Protected Settings / Profile / Pricing ── */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <DashboardLayout isBackendConnected={isConnected}>
                  <Routes>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/instructor" element={<InstructorDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DashboardLayout>
              </AuthGuard>
            }
          />
          
          {/* Global 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </GlobalOnboardingGuard>
      </BrowserRouter>
      </TenantProvider>
    </AppProvider>
  );
}

export default App;
