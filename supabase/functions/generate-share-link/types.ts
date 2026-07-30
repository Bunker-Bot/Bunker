export type ErrorCode =
  | 'INVALID_PROJECT'
  | 'UNAUTHORIZED'
  | 'INVALID_PASSWORD'
  | 'TOKEN_GENERATION_FAILED'
  | 'PROJECT_INACTIVE'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'INVALID_PAYLOAD'
  | 'UNKNOWN_ERROR';

export interface GenerateShareLinkRequest {
  projectId: string;
  name?: string;
  expiresAt?: string | null;
  expirationPreset?: 'never' | '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | '90d' | 'custom';
  password?: string | null;
  notes?: string | null;
  clientName?: string | null;
  label?: string | null;
  purpose?: string | null;
  allowedModules?: string[];
  maxViews?: number | null;
}

export interface GenerateShareLinkResponseSuccess {
  success: true;
  id: string;
  url: string;
  tokenPreview: string;
  expiresAt: string | null;
  createdAt: string;
  passwordProtected: boolean;
  allowedModules: string[];
  maxViews: number | null;
}

export interface GenerateShareLinkResponseError {
  success: false;
  code: ErrorCode;
  message: string;
}

export type GenerateShareLinkResponse =
  | GenerateShareLinkResponseSuccess
  | GenerateShareLinkResponseError;
