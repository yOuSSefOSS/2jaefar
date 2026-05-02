import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';

export const useAppInit = () => {
  const initAuth = useAuthStore((s) => s.initAuth);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth();
    const timer = setTimeout(() => setIsInitializing(false), 2500);
    return () => { unsubscribe(); clearTimeout(timer); };
  }, [initAuth]);

  const onLoadingComplete = () => setShowLoadingScreen(false);

  return { showLoadingScreen: showLoadingScreen && isInitializing, onLoadingComplete };
};
