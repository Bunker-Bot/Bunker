import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { requestQueue } from '../../utils/request-queue';
import SettingsRepository from '../../repositories/settings.repository';
import type {
  ProfileData,
  ShareLinkDefaults,
  PortalBranding,
  StorageStats,
} from '../../../modules/settings/types/settings';

const DEFAULT_SHARE_LINK_DEFAULTS: ShareLinkDefaults = {
  defaultExpiration: 'never',
  defaultModules: ['overview', 'timeline', 'milestones', 'screenshots', 'documentation', 'changelog', 'deployments', 'downloads'],
  requirePasswordByDefault: false,
  defaultMaxViews: null,
  linkPolicy: 'one_active_per_project',
  jwtLifetime: '30m',
  enableViewCounter: true,
  enableUniqueVisitors: true,
  enableBrowserDetection: true,
  enableDeviceDetection: true,
  enableCountryDetection: true,
};

const DEFAULT_PORTAL_BRANDING: PortalBranding = {
  portalName: 'Client Command Portal',
  welcomeMessage: 'Welcome to your project command workspace. Track milestones, release notes, and deliverable releases in real time.',
  footerText: 'Powered by Bunker Agency Engine',
  portalLogoUrl: '',
};

// 1. Profile Query & Mutation
export function useProfile() {
  return useQuery<ProfileData, Error>({
    queryKey: ['settings', 'profile'],
    queryFn: async () => {
      return requestQueue.enqueue(async () => {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (!user) {
          return {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'admin@bunker.internal',
            fullName: 'Eswar Chinthakayala',
            avatarUrl: '',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            status: 'active',
          };
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url, created_at')
          .eq('id', user.id)
          .maybeSingle();

        return {
          id: user.id,
          email: user.email || 'admin@bunker.internal',
          fullName: profile?.full_name || user.user_metadata?.full_name || 'Eswar Chinthakayala',
          avatarUrl: profile?.avatar_url || '',
          role: (profile?.role && profile.role.trim()) ? profile.role : 'admin',
          createdAt: profile?.created_at || user.created_at || new Date().toISOString(),
          lastLoginAt: user.last_sign_in_at || new Date().toISOString(),
          status: 'active',
        };
      }, 'low');
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { fullName?: string; avatarUrl?: string }>({
    mutationFn: async ({ fullName, avatarUrl }) => {
      return requestQueue.enqueue(async () => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) return;

        const updates: Record<string, unknown> = {};
        if (fullName !== undefined) updates.full_name = fullName;
        if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (error) throw error;
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
    },
  });
}

// 2. Share Link Defaults
export function useShareLinkDefaults() {
  return useQuery<ShareLinkDefaults, Error>({
    queryKey: ['settings', 'share_link_defaults'],
    queryFn: async () => {
      const data = await SettingsRepository.getSetting<ShareLinkDefaults>('share_link_defaults');
      return data ? { ...DEFAULT_SHARE_LINK_DEFAULTS, ...data } : DEFAULT_SHARE_LINK_DEFAULTS;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateShareLinkDefaults() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Partial<ShareLinkDefaults>, { previous?: ShareLinkDefaults }>({
    mutationFn: async (patch) => {
      const current = await SettingsRepository.getSetting<ShareLinkDefaults>('share_link_defaults');
      const updated = { ...DEFAULT_SHARE_LINK_DEFAULTS, ...current, ...patch };
      await SettingsRepository.updateSetting('share_link_defaults', updated);
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['settings', 'share_link_defaults'] });
      const previous = queryClient.getQueryData<ShareLinkDefaults>(['settings', 'share_link_defaults']);
      queryClient.setQueryData<ShareLinkDefaults>(['settings', 'share_link_defaults'], (old) => ({
        ...DEFAULT_SHARE_LINK_DEFAULTS,
        ...old,
        ...patch,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['settings', 'share_link_defaults'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'share_link_defaults'] });
    },
  });
}

// 3. Portal Branding
export function usePortalBranding() {
  return useQuery<PortalBranding, Error>({
    queryKey: ['settings', 'portal_branding'],
    queryFn: async () => {
      const data = await SettingsRepository.getSetting<PortalBranding>('portal_branding');
      return data ? { ...DEFAULT_PORTAL_BRANDING, ...data } : DEFAULT_PORTAL_BRANDING;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePortalBranding() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Partial<PortalBranding>, { previous?: PortalBranding }>({
    mutationFn: async (patch) => {
      const current = await SettingsRepository.getSetting<PortalBranding>('portal_branding');
      const updated = { ...DEFAULT_PORTAL_BRANDING, ...current, ...patch };
      await SettingsRepository.updateSetting('portal_branding', updated);
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['settings', 'portal_branding'] });
      const previous = queryClient.getQueryData<PortalBranding>(['settings', 'portal_branding']);
      queryClient.setQueryData<PortalBranding>(['settings', 'portal_branding'], (old) => ({
        ...DEFAULT_PORTAL_BRANDING,
        ...old,
        ...patch,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['settings', 'portal_branding'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'portal_branding'] });
    },
  });
}

// 4. Storage & System Stats Query
export function useStorageStatistics() {
  return useQuery<StorageStats, Error>({
    queryKey: ['settings', 'storage_stats'],
    queryFn: async () => {
      return requestQueue.enqueue(async () => {
        const { data, error } = await supabase.rpc('get_storage_statistics');
        if (error || !data) {
          return {
            totalProjects: 0,
            totalClients: 0,
            totalShareLinks: 0,
            totalTasks: 0,
            totalNotes: 0,
            totalChangelogs: 0,
            totalDeployments: 0,
            totalPayments: 0,
            totalDeliverables: 0,
          };
        }
        return {
          totalProjects: Number(data.total_projects || 0),
          totalClients: Number(data.total_clients || 0),
          totalShareLinks: Number(data.total_share_links || 0),
          totalTasks: Number(data.total_tasks || 0),
          totalNotes: Number(data.total_notes || 0),
          totalChangelogs: Number(data.total_changelogs || 0),
          totalDeployments: Number(data.total_deployments || 0),
          totalPayments: Number(data.total_payments || 0),
          totalDeliverables: Number(data.total_deliverables || 0),
        };
      }, 'low');
    },
    staleTime: 1000 * 60,
  });
}

// 5. Danger Zone Actions
export function useDeleteExpiredShareLinks() {
  const queryClient = useQueryClient();

  return useMutation<number, Error, void>({
    mutationFn: async () => {
      return requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('share_links')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .select('id');

        if (error) throw error;
        return data?.length || 0;
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share_links'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'storage_stats'] });
    },
  });
}
