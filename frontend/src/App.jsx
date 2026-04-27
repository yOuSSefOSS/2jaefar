import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { checkBackendStatus } from './services/apiService';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
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
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <DashboardLayout isBackendConnected={isConnected}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Home />} />
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
