import React, { createContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthSession } from './auth-hooks';
import { authService } from './auth-service';
import { sessionManager } from './session-manager';
import type { AuthContextType } from './auth-types';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { session, user, isAuthenticated, isLoading, error, refetch } = useAuthSession();

  const handleSignOut = async () => {
    sessionManager.log('User initiated sign out');
    await authService.signOut();
    sessionManager.clearAuthCache(queryClient);
  };

  const handleRefreshSession = async () => {
    sessionManager.log('Manual session refresh requested');
    const newSession = await authService.refreshSession();
    await refetch();
    return newSession;
  };

  const handleGetSession = async () => {
    const result = await authService.getSession();
    return result.session;
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      isLoading,
      session,
      user,
      error,
      signOut: handleSignOut,
      refreshSession: handleRefreshSession,
      getSession: handleGetSession,
    }),
    [isAuthenticated, isLoading, session, user, error]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
