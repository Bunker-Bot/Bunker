import type { ReactNode } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  error: Error | null;
}

export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  getSession: () => Promise<Session | null>;
}

export interface SessionValidationResult {
  isValid: boolean;
  session: Session | null;
  user: User | null;
  error?: Error | null;
}

export type AuthStateChangeHandler = (
  event: AuthChangeEvent,
  session: Session | null
) => void;
