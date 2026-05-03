import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ExplorerLayout from './layouts/ExplorerLayout';
import { checkBackendStatus } from './services/apiService';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import LandingPage from './pages/LandingPage';
import Explorer from './pages/Explorer';
import FuselageSection from './pages/explore/FuselageSection';
import WingsSection from './pages/explore/WingsSection';
import AirfoilSection from './pages/explore/AirfoilSection';
import TailSection from './pages/explore/TailSection';
import LabHub from './pages/lab/LabHub';
import WingsLab from './pages/lab/WingsLab';
import TailLab from './pages/lab/TailLab';
import FuselageLab from './pages/lab/FuselageLab';
import AuthGuard from './components/AuthGuard';
import { AppProvider } from './context/AppContext';
import LoadingScreen from './components/LoadingScreen';

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
      {showLoadingScreen && (
        <LoadingScreen 
          isInitializing={isInitializing} 
          onLoadingComplete={() => setShowLoadingScreen(false)} 
        />
      )}
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Explorer Routes (Public — educational content) ── */}
          <Route path="/explore" element={<ExplorerLayout />}>
            <Route index element={<Explorer />} />
            <Route path="fuselage" element={<FuselageSection />} />
            <Route path="wings" element={<WingsSection />} />
            <Route path="tail" element={<TailSection />} />
            <Route path="airfoil" element={<AirfoilSection />} />
          </Route>

          {/* ── Lab Routes (Public Hub + labs, Airfoil lab auth-protected) ── */}
          <Route path="/lab" element={<LabHub />} />
          <Route path="/lab/wings" element={<WingsLab />} />
          <Route path="/lab/tail" element={<TailLab />} />
          <Route path="/lab/fuselage" element={<FuselageLab />} />
          <Route
            path="/lab/airfoil"
            element={
              <AuthGuard>
                <DashboardLayout isBackendConnected={isConnected}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                  </Routes>
                </DashboardLayout>
              </AuthGuard>
            }
          />

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
                  </Routes>
                </DashboardLayout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
