import crypto from 'crypto';
import { supabaseServer } from './supabase-server';

export interface SharePreviewMetadata {
  state: 'available' | 'protected' | 'expired' | 'revoked' | 'exhausted' | 'invalid';
  shareLinkId?: string;
  previewVersion?: number;
  project?: {
    id?: string;
    name: string;
    description?: string | null;
    status?: string | null;
    completionPercent?: number | null;
    color?: string | null;
    thumbnailUrl?: string | null;
  };
  client?: {
    id?: string | null;
    displayName?: string | null;
    logoUrl?: string | null;
  };
  technologies?: string[];
  avatar?: {
    seed: string;
    version: number;
    config?: any;
  };
}

export function hashTokenSha256(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export async function fetchSharePreviewMetadata(
  tokenHashOrRaw: string
): Promise<SharePreviewMetadata> {
  if (!tokenHashOrRaw) {
    return { state: 'invalid' };
  }

  // If input length is 64 hex characters, it might already be a hash, but we also check raw token
  const tokenHash =
    tokenHashOrRaw.length === 64 && /^[0-9a-fA-F]+$/.test(tokenHashOrRaw)
      ? tokenHashOrRaw.toLowerCase()
      : hashTokenSha256(tokenHashOrRaw);

  try {
    const { data, error } = await supabaseServer.rpc('get_share_preview_metadata', {
      p_token_hash: tokenHash,
      p_raw_token: tokenHashOrRaw,
    });

    if (error) {
      console.error('[SharePreview] RPC error:', error.message);
      return { state: 'invalid' };
    }

    if (!data || typeof data !== 'object') {
      return { state: 'invalid' };
    }

    return data as SharePreviewMetadata;
  } catch (err: any) {
    console.error('[SharePreview] Unexpected error:', err);
    return { state: 'invalid' };
  }
}
