import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { generateAvatarConfig } from '../../../features/identity-avatar/lib/avatar-generator';
import type { BunkerAvatarConfig } from '../../../features/identity-avatar/types/avatar.types';
import type {
  PortalEntryStage,
  PortalEntryState,
  SafePortalProject,
  SafePortalClient,
} from './portal-entry.types';
import { STAGE_DEFINITIONS } from './portal-entry.types';

async function hashSHA256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_AVATAR_CONFIG = generateAvatarConfig({
  entityId: 'bunker-default-guardian',
  entityKind: 'generic',
  name: 'Bunker Guardian',
});

export function usePortalEntry(token: string | undefined) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<PortalEntryStage>('initializing');
  const [password, setPassword] = useState<string>('');
  const [project, setProject] = useState<SafePortalProject | null>(null);
  const [client, setClient] = useState<SafePortalClient | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<BunkerAvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [avatarCode, setAvatarCode] = useState<string>('4839201746');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<'confirmed' | 'pending' | 'restricted' | 'checking'>('checking');
  const [paymentMetrics, setPaymentMetrics] = useState<{
    totalPaid: number;
    totalBudget: number;
    percent: number;
    isFullyPaid: boolean;
    currencySymbol: string;
  } | null>(null);
  const [portalRawData, setPortalRawData] = useState<any>(null);

  // Numeric smooth interpolation
  const [displayProgress, setDisplayProgress] = useState<number>(8);
  const targetProgressRef = useRef<number>(8);
  const isExecutingRef = useRef<boolean>(false);

  // Update target progress when stage changes
  useEffect(() => {
    const def = STAGE_DEFINITIONS[stage];
    targetProgressRef.current = def ? def.weight : 8;
  }, [stage]);

  // Smooth numeric lerp loop
  useEffect(() => {
    let animFrame: number;
    const updateProgress = () => {
      setDisplayProgress((prev) => {
        const target = targetProgressRef.current;
        if (Math.abs(target - prev) < 0.2) return target;
        // Smooth exponential approach
        const step = (target - prev) * 0.14;
        return prev + step;
      });
      animFrame = requestAnimationFrame(updateProgress);
    };

    animFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const executePipeline = useCallback(async (providedPassword = '') => {
    if (!token || isExecutingRef.current) return;
    isExecutingRef.current = true;

    try {
      // Stage 1: Initializing
      setStage('initializing');
      await new Promise((r) => setTimeout(r, 120));

      // Stage 2: Validating Link (Compute SHA-256)
      setStage('validating-link');
      const tokenHash = await hashSHA256(token);
      await new Promise((r) => setTimeout(r, 150));

      // Stage 3: Resolving Access (Supabase RPC)
      setStage('resolving-access');
      let rpcResult: any = null;
      try {
        const { data, error: rpcErr } = await supabase.rpc('get_portal_data', {
          p_token_hash: tokenHash,
          p_raw_token: token,
        });
        if (!rpcErr && data) {
          rpcResult = data;
        }
      } catch (_e) { }

      // Handle RPC Errors
      if (rpcResult?.error) {
        if (rpcResult.error === 'INVALID_LINK') { setStage('invalid'); return; }
        if (rpcResult.error === 'ACCESS_REVOKED') { setStage('revoked'); return; }
        if (rpcResult.error === 'LINK_EXPIRED') { setStage('expired'); return; }
        if (rpcResult.error === 'LIMIT_EXCEEDED') { setStage('access-restricted'); return; }
      }

      // Password Requirement Check
      const link = rpcResult?.link;
      if (link?.password_hash) {
        const activePwd = providedPassword || password;
        if (!activePwd) {
          setStage('password-required');
          isExecutingRef.current = false;
          return;
        }
        const pwdHash = await hashSHA256(`bunker_salt_${activePwd}`);
        if (activePwd !== link.password_hash && pwdHash !== link.password_hash) {
          setErrorMessage('Invalid access password. Please try again.');
          setStage('password-required');
          isExecutingRef.current = false;
          return;
        }
      }

      // Fallback Direct Query if RPC not available
      if (!rpcResult) {
        const { data: links, error: linkErr } = await supabase
          .from('share_links')
          .select('*, project:projects(*)')
          .or(`token.eq.${tokenHash},token.eq.${token}`);

        const fallbackLink = links && links.length > 0 ? links[0] : null;
        if (linkErr || !fallbackLink) { setStage('invalid'); return; }
        if (!fallbackLink.is_active) { setStage('revoked'); return; }
        if (fallbackLink.expires_at && new Date(fallbackLink.expires_at) < new Date()) { setStage('expired'); return; }
        if (fallbackLink.max_views && fallbackLink.view_count >= fallbackLink.max_views) { setStage('access-restricted'); return; }

        if (fallbackLink.password_hash) {
          const activePwd = providedPassword || password;
          if (!activePwd) {
            setStage('password-required');
            isExecutingRef.current = false;
            return;
          }
          const pwdHash = await hashSHA256(`bunker_salt_${activePwd}`);
          if (activePwd !== fallbackLink.password_hash && pwdHash !== fallbackLink.password_hash) {
            setErrorMessage('Invalid access password. Please try again.');
            setStage('password-required');
            isExecutingRef.current = false;
            return;
          }
        }

        rpcResult = {
          link: fallbackLink,
          project: fallbackLink.project || {},
          milestones: [],
          payments: [],
          assets: [],
          github: {},
          docs: [],
          timeline: [],
        };
      }

      // Stage 4: Loading Identity
      setStage('loading-identity');
      const projectData = rpcResult.project || {};
      const resolvedClientName =
        (rpcResult.link?.client_name && rpcResult.link.client_name.trim()) ||
        (projectData.client_name && projectData.client_name.trim() !== 'Valued Client' && projectData.client_name.trim()) ||
        (projectData.client?.name && projectData.client.name.trim()) ||
        (projectData.client?.company && projectData.client.company.trim()) ||
        'Valued Client';

      const safeClient: SafePortalClient = {
        id: projectData.client_id || null,
        displayName: resolvedClientName,
        logoUrl: projectData.client?.logo_url || null,
      };
      setClient(safeClient);

      // Stage 5: Loading Project & Guardian Identity
      setStage('loading-project');
      const derivedAvatarConfig =
        projectData.avatar_config ||
        projectData.avatarConfig ||
        projectData.avatar?.config ||
        generateAvatarConfig({
          entityId: projectData.id || token,
          entityKind: 'project',
          name: projectData.name || 'Project Vault',
          preferredColor: projectData.color,
          parentEntityId: projectData.client_id || '',
        });

      const derivedCode =
        projectData.avatar_code ||
        projectData.avatarCode ||
        projectData.avatar?.code ||
        '4839201746';

      setAvatarConfig(derivedAvatarConfig);
      setAvatarCode(derivedCode);

      const safeProj: SafePortalProject = {
        id: projectData.id || '',
        name: projectData.name || 'Project Review',
        description: projectData.description || null,
        status: projectData.status || 'Active',
        color: projectData.color || '#06B6D4',
        completionPercent: projectData.completion_percent ?? projectData.completionPercent ?? null,
        currency: projectData.currency || 'USD',
        budget: projectData.budget || projectData.amount || null,
        clientName: resolvedClientName,
        avatarCode: derivedCode,
        avatarConfig: derivedAvatarConfig,
      };
      setProject(safeProj);
      await new Promise((r) => setTimeout(r, 160));

      // Stage 6: Checking Portal Security & Entitlement State
      setStage('checking-portal-state');
      const payments = rpcResult.payments || [];
      const totalBudget = Number(safeProj.budget || 0);
      const verifiedPayments = payments.filter((p: any) => p.is_verified !== false && p.status !== 'Failed' && p.status !== 'Cancelled');
      const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const isPendingPayment = totalBudget > 0 && totalPaid < totalBudget;
      setAccessStatus(isPendingPayment ? 'pending' : 'confirmed');

      const paymentPercent = totalBudget > 0
        ? Math.min(100, Math.round((totalPaid / totalBudget) * 100))
        : (totalPaid > 0 ? 100 : (safeProj.completionPercent ?? 100));

      const symbol = safeProj.currency === 'EUR' ? '€' : safeProj.currency === 'GBP' ? '£' : safeProj.currency === 'INR' ? '₹' : '$';

      setPaymentMetrics({
        totalPaid,
        totalBudget,
        percent: paymentPercent,
        isFullyPaid: !isPendingPayment,
        currencySymbol: symbol,
      });
      await new Promise((r) => setTimeout(r, 140));

      // Stage 7: Preparing Interface Assets & TanStack Cache Pre-seeding
      setStage('preparing-assets');
      setPortalRawData(rpcResult);

      // Pre-seed query cache so subsequent PortalShell load has 0ms latency
      queryClient.setQueryData(['portal', token, providedPassword || password], {
        link: rpcResult.link,
        project: {
          ...projectData,
          client_name: resolvedClientName,
          clientName: resolvedClientName,
          share_link: rpcResult.link,
        },
        milestones: rpcResult.milestones || [],
        payments: rpcResult.payments || [],
        assets: rpcResult.assets || [],
        github: rpcResult.github || {},
        docs: rpcResult.docs || [],
        timeline: rpcResult.timeline || [],
      });

      await new Promise((r) => setTimeout(r, 180));

      // Stage 8: Ready State (100%)
      setStage('ready');
    } catch (err: any) {
      console.error('[PortalEntry] Error during pipeline:', err);
      setErrorMessage(err?.message || 'We could not prepare this portal.');
      setStage('error');
    } finally {
      isExecutingRef.current = false;
    }
  }, [token, password, queryClient]);

  useEffect(() => {
    executePipeline();
  }, [executePipeline]);

  const submitPassword = useCallback((newPassword: string) => {
    setPassword(newPassword);
    setErrorMessage(null);
    executePipeline(newPassword);
  }, [executePipeline]);

  const retry = useCallback(() => {
    setErrorMessage(null);
    isExecutingRef.current = false;
    executePipeline();
  }, [executePipeline]);

  const def = STAGE_DEFINITIONS[stage] || STAGE_DEFINITIONS.initializing;

  const state: PortalEntryState = useMemo(() => ({
    stage,
    progress: Math.round(displayProgress),
    stageLabel: def.label,
    project,
    client,
    avatarConfig,
    avatarCode,
    guardianMood: def.mood,
    isReady: stage === 'ready' && displayProgress >= 99.5,
    isPasswordRequired: stage === 'password-required',
    errorMessage,
    accessStatus,
    paymentProgress: paymentMetrics,
  }), [stage, displayProgress, def, project, client, avatarConfig, avatarCode, errorMessage, accessStatus, paymentMetrics]);

  return {
    state,
    portalRawData,
    submitPassword,
    retry,
  };
}
