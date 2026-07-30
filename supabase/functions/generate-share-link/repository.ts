import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { config } from './config.ts';

export function getAdminSupabaseClient() {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
}

export async function verifyProjectExists(projectId: string): Promise<{ exists: boolean; name?: string }> {
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from('projects')
    .select('id, name, is_archived')
    .eq('id', projectId)
    .single();

  if (error || !data || data.is_archived) {
    return { exists: false };
  }

  return { exists: true, name: data.name };
}

export async function executeShareLinkCreation(params: {
  projectId: string;
  name: string;
  tokenHash: string;
  passwordHash?: string | null;
  expiresAt: string | null;
  maxViews: number | null;
  modulePermissions: Record<string, boolean>;
  notes?: string | null;
  clientName?: string | null;
  label?: string | null;
  purpose?: string | null;
  tokenPreview: string;
  createdBy: string;
}): Promise<{ id: string; createdAt: string }> {
  const admin = getAdminSupabaseClient();

  // Single Active Share Link Policy Enforcement
  if (!config.allowMultipleShareLinks) {
    await admin
      .from('share_links')
      .update({ is_active: false })
      .eq('project_id', params.projectId)
      .eq('is_active', true);
  }

  // Insert Share Link Record
  const { data, error } = await admin
    .from('share_links')
    .insert({
      project_id: params.projectId,
      name: params.name,
      token: params.tokenHash, // DB stores SHA-256(token)
      password_hash: params.passwordHash || null,
      expires_at: params.expiresAt,
      is_active: true,
      max_views: params.maxViews,
      permissions: params.modulePermissions,
      notes: params.notes || null,
      client_name: params.clientName || null,
      label: params.label || null,
      purpose: params.purpose || null,
      token_preview: params.tokenPreview,
      created_by: params.createdBy,
      created_at: new Date().toISOString(),
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('[repository] DB insert error:', error);
    throw error || new Error('Database insert failed');
  }

  return { id: data.id, createdAt: data.created_at };
}

export async function writeActivityLog(params: {
  linkId: string;
  projectId: string;
  projectName: string;
  userId: string;
  expiresAt: string | null;
  passwordEnabled: boolean;
  maxViews: number | null;
  allowedModules: string[];
  tokenPreview: string;
}): Promise<void> {
  try {
    const admin = getAdminSupabaseClient();
    await admin.from('activity_logs').insert({
      action: 'share_link.created',
      entity_type: 'share_link',
      entity_id: params.linkId,
      user_id: params.userId,
      metadata: {
        project_id: params.projectId,
        project_name: params.projectName,
        expires_at: params.expiresAt,
        password_enabled: params.passwordEnabled,
        max_views: params.maxViews,
        allowed_modules: params.allowedModules,
        creator: params.userId,
        token_preview: params.tokenPreview,
      },
      created_at: new Date().toISOString(),
    });
  } catch (_err) {
    // Non-blocking log failure
  }
}
