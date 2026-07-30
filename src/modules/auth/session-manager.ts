import type { QueryClient } from '@tanstack/react-query';
import type { Location } from 'react-router-dom';

const IS_DEV = import.meta.env.DEV;

export const sessionManager = {
  clearAuthCache(queryClient?: QueryClient): void {
    if (!queryClient) return;

    queryClient.invalidateQueries({ queryKey: ['auth'] });
    queryClient.invalidateQueries({ queryKey: ['session'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['permissions'] });

    queryClient.removeQueries({ queryKey: ['auth'] });
    queryClient.removeQueries({ queryKey: ['session'] });
    queryClient.removeQueries({ queryKey: ['profile'] });

    this.log('Auth cache cleared and invalidated');
  },

  getRedirectState(location: Location) {
    const fullPath = `${location.pathname}${location.search}${location.hash}`;
    
    if (fullPath === '/login' || fullPath === '/register' || fullPath === '/') {
      return { from: '/app/dashboard' };
    }

    return { from: fullPath };
  },

  log(message: string, ...details: any[]): void {
    if (IS_DEV) {
      console.log(`[AuthGuard] ${message}`, ...details);
    }
  },

  logError(message: string, error?: any): void {
    if (IS_DEV) {
      console.error(`[AuthGuard] ${message}`, error ?? '');
    }
  },
};

export default sessionManager;
