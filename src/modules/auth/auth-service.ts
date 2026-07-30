import { supabase } from '../../lib/supabase/client';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import type { SessionValidationResult, AuthStateChangeHandler } from './auth-types';

export const authService = {
  async getSession(): Promise<SessionValidationResult> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return {
          isValid: false,
          session: null,
          user: null,
          error,
        };
      }

      const session = data.session;
      const user = session?.user ?? null;

      return {
        isValid: Boolean(session && user),
        session,
        user,
      };
    } catch (err: any) {
      return {
        isValid: false,
        session: null,
        user: null,
        error: err instanceof Error ? err : new Error('Failed to retrieve session'),
      };
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return null;
      return data.user;
    } catch {
      return null;
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthService] Error during sign out:', error.message);
      }
    } catch (err: any) {
      console.error('[AuthService] Sign out exception:', err);
    }
  },

  async refreshSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('[AuthService] Session refresh failed:', error.message);
        return null;
      }
      return data.session;
    } catch {
      return null;
    }
  },

  onAuthStateChange(handler: AuthStateChangeHandler) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        handler(event, session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  },
};

export default authService;
