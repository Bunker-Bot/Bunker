import { useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './auth-provider';
import { authService } from './auth-service';
import { sessionManager } from './session-manager';
import type { AuthContextType, SessionValidationResult } from './auth-types';

export function useAuthSession() {
  const queryClient = useQueryClient();

  const query = useQuery<SessionValidationResult, Error>({
    queryKey: ['session'],
    queryFn: async () => {
      sessionManager.log('Validating session from Supabase...');
      return await authService.getSession();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      sessionManager.logError('Session fetch retry attempt:', error);
      return true;
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    sessionManager.log('Subscribing to Supabase auth state changes');

    const unsubscribe = authService.onAuthStateChange((event, session) => {
      sessionManager.log(`Auth state event triggered: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        queryClient.setQueryData(['session'], {
          isValid: Boolean(session && session.user),
          session,
          user: session?.user ?? null,
        });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else if (event === 'SIGNED_OUT') {
        sessionManager.clearAuthCache(queryClient);
        queryClient.setQueryData(['session'], {
          isValid: false,
          session: null,
          user: null,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return {
    session: query.data?.session ?? null,
    user: query.data?.user ?? null,
    isAuthenticated: Boolean(query.data?.isValid),
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider />');
  }
  return context;
}

export default useAuthSession;
