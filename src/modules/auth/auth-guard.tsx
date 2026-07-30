import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/auth-provider';
import { LoadingScreen } from './loading-screen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
