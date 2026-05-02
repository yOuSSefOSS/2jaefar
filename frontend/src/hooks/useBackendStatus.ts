import { useState, useEffect } from 'react';
import { checkBackendStatus } from '@/lib/apiClient';

export const useBackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        await checkBackendStatus();
        if (isMounted) setIsConnected(true);
      } catch {
        if (isMounted) setIsConnected(false);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return isConnected;
};
