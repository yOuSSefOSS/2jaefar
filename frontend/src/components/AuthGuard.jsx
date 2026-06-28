import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const { user, isAuthLoading, accountType } = useAppContext();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="animate-spin text-sky-400 w-12 h-12" />
      </div>
    );
  }

  if (!user && import.meta.env.MODE !== 'development') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If in development mode and not logged in, we let them through by mocking a user or just passing through.
  // Actually, we can just return children since we rely on `user` object in context elsewhere, we might need a fake user.
  // Wait, if we just pass them through, they might hit issues if `user` is null. Let's provide a mock user if bypass happens?
  // Let's check how user is used in context and layouts.

  if (user && accountType === 'pending' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export const GlobalOnboardingGuard = ({ children }) => {
  const { user, isAuthLoading, accountType } = useAppContext();
  const location = useLocation();

  const allowedRoutes = ['/onboarding', '/profile'];

  if (!isAuthLoading && user && accountType === 'pending' && !allowedRoutes.includes(location.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default AuthGuard;
