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
    safeDescription?: string | null;
    avatarCode?: string | null;
    avatarConfig?: Record<string, unknown> | null;
  };
  client?: {
    id?: string | null;
    displayName?: string | null;
    logoUrl?: string | null;
  };
  technologies?: string[];
  avatar?: {
    id?: string;
    code?: string;
    name?: string;
    seed?: string;
    version: number;
    config?: Record<string, unknown> | null;
  };
}

export function hashTokenSha256(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export async function fetchSharePreviewMetadata(tokenHash: string): Promise<SharePreviewMetadata> {
  if (!/^[0-9a-f]{64}$/.test(tokenHash)) {
    return { state: 'invalid' };
  }

  try {
    const { data, error } = await supabaseServer.rpc('get_share_preview_metadata', {
      p_token_hash: tokenHash.toLowerCase(),
    });

    if (error) {
      console.error('[SharePreview] RPC error category:', error.code || 'rpc_failure');
      return { state: 'invalid' };
    }

    if (!data || typeof data !== 'object') {
      return { state: 'invalid' };
    }

    return data as SharePreviewMetadata;
  } catch {
    console.error('[SharePreview] Unexpected error category: metadata_lookup_failure');
    return { state: 'invalid' };
  }
}
