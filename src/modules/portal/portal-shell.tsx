import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  LockKeyIcon,
  Download01Icon,
  Clock01Icon,
  Building01Icon,
  GitBranchIcon,
  DocumentCodeIcon,
  MoneyBagIcon,
  PackageIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { AppLogo } from '../../components/ui/AppLogo';
import { Badge } from '../../components/ui/badge';
import { supabase } from '../../lib/supabase/client';

import { PasswordDialog } from '../../components/portal/PasswordDialog';
import { InvalidLinkPage } from '../../components/portal/InvalidLinkPage';
import { LinkExpiredPage } from '../../components/portal/LinkExpiredPage';
import { AccessRevokedPage } from '../../components/portal/AccessRevokedPage';
import { ViewLimitExceededPage } from '../../components/portal/ViewLimitExceededPage';
import { Module403Page } from '../../components/portal/Module403Page';
import { PortalSidebar } from '../../components/portal/PortalSidebar';
import { PortalPaymentReminderModal } from '../../components/portal/PortalPaymentReminderModal';
import { ShareService } from '../../lib/services/share.service';

import { PortalOverviewView } from '../../components/portal/views/PortalOverviewView';
import { PortalTimelineView } from '../../components/portal/views/PortalTimelineView';
import { PortalDocumentationView } from '../../components/portal/views/PortalDocumentationView';
import { PortalGithubView } from '../../components/portal/views/PortalGithubView';
import { PortalFinanceView } from '../../components/portal/views/PortalFinanceView';
import { PortalDeliverablesView } from '../../components/portal/views/PortalDeliverablesView';
import { PortalDownloadsView } from '../../components/portal/views/PortalDownloadsView';
import { MobileBottomNav } from './components/MobileBottomNav';

async function hashSHA256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface PortalModuleDef {
  id: string;
  label: string;
  icon: any;
}

export const PORTAL_ALL_MODULES: PortalModuleDef[] = [
  { id: 'overview', label: 'Overview', icon: Building01Icon },
  { id: 'timeline', label: 'Timeline', icon: Clock01Icon },
  { id: 'documentation', label: 'Documentation', icon: DocumentCodeIcon },
  { id: 'github', label: 'GitHub', icon: GitBranchIcon },
  { id: 'finance', label: 'Finance', icon: MoneyBagIcon },
  { id: 'deliverables', label: 'Deliverables', icon: PackageIcon },
  { id: 'downloads', label: 'Downloads', icon: Download01Icon },
];

export const PortalShell: React.FC = () => {
  const { token, '*': subPath } = useParams<{ token: string; '*': string }>();
  const navigate = useNavigate();

  // React State & Sheet Open State
  const [password, setPassword] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Active module route resolution
  const rawPath = (subPath || '').replace(/^\//, '').split('/')[0];
  const activeModule = rawPath ? rawPath.toLowerCase().trim() : 'overview';

  // Fetch Portal Data using Supabase RPC or fallback
  const { data: portalData, isLoading, error, refetch } = useQuery({
    queryKey: ['portal', token, password],
    queryFn: async () => {
      if (!token) throw new Error('NO_TOKEN');
      const tokenHash = await hashSHA256(token);

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

      if (rpcResult) {
        if (rpcResult.error) {
          if (rpcResult.error === 'INVALID_LINK') throw new Error('INVALID_LINK');
          if (rpcResult.error === 'ACCESS_REVOKED') throw new Error('ACCESS_REVOKED');
          if (rpcResult.error === 'LINK_EXPIRED') throw new Error('LINK_EXPIRED');
          if (rpcResult.error === 'LIMIT_EXCEEDED') throw new Error('LIMIT_EXCEEDED');
          throw new Error(rpcResult.error);
        }

        const link = rpcResult.link;
        if (link?.password_hash) {
          if (!password) throw new Error('PASSWORD_REQUIRED');
          const pwdHash = await hashSHA256(`bunker_salt_${password}`);
          if (password !== link.password_hash && pwdHash !== link.password_hash) {
            throw new Error('PASSWORD_REQUIRED');
          }
        }

        let projectObj = rpcResult.project || {};
        if (projectObj.client_id && (!projectObj.client_name || projectObj.client_name === 'Valued Client')) {
          try {
            const { data: clientRecord } = await supabase
              .from('clients')
              .select('id, name, company, email')
              .eq('id', projectObj.client_id)
              .maybeSingle();
            if (clientRecord) {
              projectObj.client = clientRecord;
              projectObj.client_name = clientRecord.name || clientRecord.company || projectObj.client_name;
            }
          } catch (_e) { }
        }

        const resolvedClientName =
          (rpcResult.link?.client_name && rpcResult.link.client_name.trim()) ||
          (projectObj.client_name && projectObj.client_name.trim() !== 'Valued Client' && projectObj.client_name.trim()) ||
          (projectObj.client?.name && projectObj.client.name.trim()) ||
          (projectObj.client?.company && projectObj.client.company.trim()) ||
          'Valued Client';

        projectObj = {
          ...projectObj,
          client_name: resolvedClientName,
          clientName: resolvedClientName,
          share_link: rpcResult.link,
        };

        return {
          link: rpcResult.link,
          project: projectObj,
          milestones: rpcResult.milestones || [],
          payments: rpcResult.payments || [],
          assets: rpcResult.assets || [],
          github: rpcResult.github || {},
          docs: rpcResult.docs || [],
          timeline: rpcResult.timeline || [],
        };
      }

      // Fallback query
      const { data: links, error: linkErr } = await supabase
        .from('share_links')
        .select('*, project:projects(*)')
        .or(`token.eq.${tokenHash},token.eq.${token}`);

      const link = links && links.length > 0 ? links[0] : null;

      if (linkErr || !link) throw new Error('INVALID_LINK');
      if (!link.is_active) throw new Error('ACCESS_REVOKED');
      if (link.expires_at && new Date(link.expires_at) < new Date()) throw new Error('LINK_EXPIRED');
      if (link.max_views && link.view_count >= link.max_views) throw new Error('LIMIT_EXCEEDED');

      if (link.password_hash) {
        if (!password) throw new Error('PASSWORD_REQUIRED');
        const pwdHash = await hashSHA256(`bunker_salt_${password}`);
        if (password !== link.password_hash && pwdHash !== link.password_hash) {
          throw new Error('PASSWORD_REQUIRED');
        }
      }

      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', link.project_id)
        .order('sort_order', { ascending: true });

      const { data: payments } = await supabase
        .from('project_payments')
        .select('*')
        .eq('project_id', link.project_id)
        .order('created_at', { ascending: false });

      const { data: assets } = await supabase
        .from('delivery_assets')
        .select('*')
        .eq('project_id', link.project_id);

      const { data: githubRepo } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('project_id', link.project_id)
        .maybeSingle();

      let docsData: any[] = [];
      try {
        const { data: mainDocs } = await supabase.from('documents').select('*').eq('project_id', link.project_id);
        if (mainDocs) docsData = mainDocs;
      } catch (_e) { }

      let changelogData: any[] = [];
      try {
        const { data: updates } = await supabase.from('project_updates').select('*').eq('project_id', link.project_id);
        if (updates) changelogData = updates;
      } catch (_e) { }

      let projectObj = link.project || {};
      if (projectObj.client_id && !projectObj.client) {
        try {
          const { data: clientRecord } = await supabase
            .from('clients')
            .select('id, name, company, email')
            .eq('id', projectObj.client_id)
            .maybeSingle();
          if (clientRecord) {
            projectObj.client = clientRecord;
            projectObj.client_name = clientRecord.name || clientRecord.company;
          }
        } catch (_e) { }
      }

      const fallbackClientName =
        (link?.client_name && link.client_name.trim()) ||
        (projectObj.client_name && projectObj.client_name.trim() !== 'Valued Client' && projectObj.client_name.trim()) ||
        (projectObj.client?.name && projectObj.client.name.trim()) ||
        (projectObj.client?.company && projectObj.client.company.trim()) ||
        'Valued Client';

      projectObj = {
        ...projectObj,
        client_name: fallbackClientName,
        clientName: fallbackClientName,
        share_link: link,
      };
      try {
        const { data: techs } = await supabase.from('project_technologies').select('name').eq('project_id', link.project_id);
        if (techs && techs.length > 0) {
          const techNames = techs.map((t: any) => t.name);
          projectObj = {
            ...projectObj,
            tech_stack: Array.isArray(projectObj.tech_stack)
              ? Array.from(new Set([...projectObj.tech_stack, ...techNames]))
              : techNames,
          };
        }
      } catch (_e) { }

      return {
        link,
        project: projectObj,
        milestones: milestones || [],
        payments: payments || [],
        assets: assets || [],
        github: githubRepo || {},
        docs: docsData,
        timeline: changelogData,
      };
    },
    enabled: Boolean(token),
    retry: false,
  });

  const link = portalData?.link;
  const project = portalData?.project;
  const milestones = portalData?.milestones || [];
  const payments = portalData?.payments || [];
  const assets = portalData?.assets || [];
  const github = portalData?.github || {};
  const docs = portalData?.docs || [];
  const timeline = portalData?.timeline || [];

  const totalBudget = Number(project?.budget || project?.amount || project?.cost || 0);
  const verifiedPayments = (payments || []).filter(
    (p: any) => p.is_verified !== false && p.status !== 'Failed' && p.status !== 'Cancelled'
  );
  const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const remainingAmount = totalBudget > 0 ? Math.max(0, totalBudget - totalPaid) : (totalPaid > 0 ? 0 : 0);
  const isFullyPaid = totalBudget > 0 ? remainingAmount <= 0 : (totalPaid > 0);
  const currencySymbol = project?.currency === 'USD' ? '$' : project?.currency === 'EUR' ? '€' : project?.currency === 'GBP' ? '£' : '₹';

  const secureAssets = React.useMemo(() => {
    return (assets || []).map((a: any) => {
      const isManualUnlocked = Boolean(a.is_manual_unlocked || a.isManualUnlocked);
      const isUnlocked = isManualUnlocked || (isFullyPaid && a.unlock_type !== 'manual' && a.unlockType !== 'manual');
      const realUrl = isUnlocked ? (a.asset_url || a.downloadUrl || a.file_url || '') : '';
      return {
        ...a,
        is_unlocked: isUnlocked,
        unlocked: isUnlocked,
        isUnlocked: isUnlocked,
        is_manual_unlocked: isManualUnlocked,
        asset_url: realUrl,
        downloadUrl: realUrl,
        download_url: realUrl,
        file_url: realUrl,
      };
    });
  }, [assets, isFullyPaid]);

  useEffect(() => {
    if (link?.id) {
      const sessionKey = `bunker_logged_view_${link.id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        ShareService.recordShareLinkView(link.id);
      }
    }
  }, [link?.id]);

  useEffect(() => {
    if (project) {
      const storageKey = `bunker_dismissed_payment_reminder_${project.id || token}`;
      const isDismissed = sessionStorage.getItem(storageKey);
      if (remainingAmount > 0 && !isDismissed) {
        setIsPaymentModalOpen(true);
      }
    }
  }, [project, remainingAmount, token]);

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    const storageKey = `bunker_dismissed_payment_reminder_${project?.id || token}`;
    sessionStorage.setItem(storageKey, 'true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FAFAFA] relative font-sans pt-[64px] pb-16 lg:pb-0 select-none">
        {/* Sticky Header Skeleton */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800/90 bg-[#09090b]/95 backdrop-blur-2xl z-40 flex items-center justify-between px-4 sm:px-6 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <AppLogo className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="h-4 w-32 bg-zinc-800/80 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-zinc-900 border border-zinc-800 rounded-sm animate-pulse" />
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Hero Banner Skeleton */}
          <div className="p-6 sm:p-8 rounded-sm bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 animate-pulse relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                <RadialSpinner size={24} className="text-cyan-400" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-48 sm:w-64 bg-zinc-800 rounded" />
                  <div className="h-5 w-20 bg-cyan-950/80 border border-cyan-800/60 rounded" />
                </div>
                <div className="h-4 w-36 bg-zinc-800/60 rounded" />
                <div className="h-2 w-full max-w-md bg-zinc-800 rounded-full" />
              </div>
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-zinc-900/80 border border-zinc-800/60 rounded-sm animate-pulse shrink-0" />
            ))}
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-sm bg-zinc-900/50 border border-zinc-800/80 animate-pulse p-4 space-y-3">
                <div className="h-4 w-28 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-800/60 rounded" />
                <div className="h-3 w-3/4 bg-zinc-800/40 rounded" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    const errMessage = (error as Error).message;
    if (errMessage === 'PASSWORD_REQUIRED') {
      return (
        <PasswordDialog
          onSubmit={(pwd) => setPassword(pwd)}
          error={password ? 'Invalid access password. Please try again.' : null}
          isLoading={isLoading}
        />
      );
    }
    if (errMessage === 'ACCESS_REVOKED') return <AccessRevokedPage />;
    if (errMessage === 'LINK_EXPIRED') return <LinkExpiredPage />;
    if (errMessage === 'LIMIT_EXCEEDED') return <ViewLimitExceededPage />;
    return <InvalidLinkPage />;
  }

  // Parse allowed modules
  const rawAllowed: any[] = Array.isArray(link?.allowed_modules)
    ? link.allowed_modules
    : Array.isArray(link?.permissions)
      ? link.permissions
      : ['overview', 'timeline', 'documentation', 'github', 'finance', 'deliverables', 'downloads'];

  const allowedModules: string[] = rawAllowed.map((m: any) => String(m).toLowerCase().trim());
  const isModuleAllowed =
    allowedModules.length === 0 ||
    allowedModules.includes('all') ||
    allowedModules.includes(activeModule);

  const computedProgress =
    (project?.completion_percent !== undefined && project?.completion_percent > 0)
      ? project.completion_percent
      : milestones.length > 0
        ? Math.round(
          milestones.reduce((acc: number, m: any) => acc + (m.progress !== undefined ? m.progress : 0), 0) /
          milestones.length
        )
        : 0;

  const handleSelectModule = (modId: string) => {
    setIsMobileSheetOpen(false);
    navigate(`/share/${token}/${modId}`);
  };

  const knownModules = ['overview', 'timeline', 'documentation', 'github', 'finance', 'deliverables', 'downloads'];
  const isOverview = activeModule === 'overview' || !knownModules.includes(activeModule);

  const visibleModules = PORTAL_ALL_MODULES.filter((m) =>
    allowedModules.length === 0 || allowedModules.includes(m.id) || allowedModules.includes('all')
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] relative font-sans selection:bg-zinc-800 selection:text-white pt-[64px] pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">

      {/* STICKY RESPONSIVE HEADER (Height: 64px / h-16) */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800/90 bg-[#09090b]/95 backdrop-blur-2xl z-40 flex items-center justify-between px-3 sm:px-6 font-mono select-none shadow-xl">

        {/* Left: Mobile Sheet Trigger + Project Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Sheet Trigger (Left Side Drawer) */}
          <div className="lg:hidden">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger>
                <button
                  type="button"
                  className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Open Mobile Navigation"
                >
                  <HugeiconsIcon icon={Menu01Icon} size={18} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[320px] max-w-[90vw] p-0 bg-[#09090b] border-r border-zinc-800 text-white font-mono"
              >
                <SheetHeader className="p-4 border-b border-zinc-800 text-left space-y-2">
                  <div className="flex items-center gap-2.5">
                    <AppLogo size={26} showText={false} />
                    <div>
                      <SheetTitle className="text-sm font-extrabold text-white tracking-tight leading-none">
                        {project?.name || 'Client Portal'}
                      </SheetTitle>
                      {project?.client_name && (
                        <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                          {project.client_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completion Progress Bar inside Sheet */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-sans">
                      <span>Project Completion</span>
                      <strong className="text-emerald-400 font-mono">{computedProgress}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-sm overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-emerald-400 rounded-sm transition-all duration-300"
                        style={{ width: `${computedProgress}%` }}
                      />
                    </div>
                  </div>
                </SheetHeader>

                {/* Mobile Navigation List */}
                <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                  <span className="text-[10px] text-zinc-500 font-sans font-bold uppercase px-3 block mb-1">
                    Portal Modules
                  </span>
                  {visibleModules.map((mod) => {
                    const isActive = activeModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleSelectModule(mod.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${isActive
                            ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <HugeiconsIcon
                            icon={mod.icon}
                            size={16}
                            className={isActive ? 'text-cyan-400' : 'text-zinc-500'}
                          />
                          <span>{mod.label}</span>
                        </div>
                        {isActive && (
                          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Sheet Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-850 bg-zinc-950 text-[10px] text-zinc-500 space-y-1 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-mono text-zinc-400">
                      <HugeiconsIcon icon={LockKeyIcon} size={11} className="text-cyan-400" />
                      Protected Share Link
                    </span>
                    <Badge variant="outline" className="text-[9px] bg-zinc-900 border-zinc-800 text-zinc-400">
                      Read Only
                    </Badge>
                  </div>
                  <span className="block text-zinc-600 font-mono text-[9px]">Powered by Bunker Enterprise Engine</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <AppLogo size={24} showText={false} className="hidden xs:block" />

          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-[220px]">
              {project?.name || 'Client Portal'}
            </h2>
            <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] uppercase font-bold hidden sm:inline-flex shrink-0">
              {project?.status || 'Active'}
            </Badge>
          </div>
        </div>

        {/* Center: Desktop Module Navigation */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-sm bg-zinc-950/90 border border-zinc-850 shadow-inner">
          {visibleModules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
              >
                <HugeiconsIcon icon={mod.icon} size={13} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Progress & Pay Now Button */}
        <div className="flex items-center gap-2 shrink-0">
          {remainingAmount > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="h-8 px-2.5 rounded-sm bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-600/60 hover:border-amber-500 text-amber-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <HugeiconsIcon icon={LockKeyIcon} size={13} className="text-amber-400" />
              <span className="hidden xs:inline">Pay {currencySymbol}{remainingAmount.toLocaleString()}</span>
              <span className="xs:inline sm:hidden">Pay</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850 text-xs">
            <span className="text-[10px] text-zinc-500 font-sans uppercase hidden xs:inline">Progress</span>
            <strong className="text-emerald-400 font-bold">{computedProgress}%</strong>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex">
        {/* Desktop Fixed Sidebar */}
        <PortalSidebar
          allowedModules={allowedModules}
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
        />

        {/* Responsive Content Area */}
        <main className="flex-1 lg:ml-56 p-3 sm:p-6 lg:p-8 max-w-[1700px] min-h-[calc(100vh-64px)] space-y-4 overflow-x-hidden">
          {!isModuleAllowed ? (
            <Module403Page
              moduleName={activeModule}
              onGoOverview={() => handleSelectModule('overview')}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {isOverview && (
                  <PortalOverviewView
                    project={project}
                    milestones={milestones}
                    deliverables={secureAssets}
                    docs={docs}
                    github={github}
                    timeline={timeline}
                    payments={payments}
                    expiresAt={link?.expires_at}
                    onNavigateModule={handleSelectModule}
                    onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                  />
                )}

                {activeModule === 'timeline' && (
                  <PortalTimelineView timeline={timeline} projectId={project?.id || link?.project_id} />
                )}

                {activeModule === 'documentation' && (
                  <PortalDocumentationView docs={docs} />
                )}

                {activeModule === 'github' && (
                  <PortalGithubView github={github} projectId={project?.id} />
                )}

                {activeModule === 'finance' && (
                  <PortalFinanceView project={project} payments={payments} milestones={milestones} />
                )}

                {activeModule === 'deliverables' && (
                  <PortalDeliverablesView
                    assets={secureAssets}
                    payments={payments}
                    project={project}
                    milestones={milestones}
                    onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                  />
                )}

                {activeModule === 'downloads' && (
                  <PortalDownloadsView
                    assets={secureAssets}
                    docs={docs}
                    project={project}
                    payments={payments}
                    onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* STICKY BOTTOM BAR FOR MOBILE PAYMENTS / ACTIONS */}
      {remainingAmount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-zinc-950/95 border-t border-amber-900/60 backdrop-blur-xl z-30 flex items-center justify-between shadow-2xl">
          <div className="font-mono text-xs">
            <span className="text-[10px] text-zinc-400 block font-sans">Pending Balance</span>
            <strong className="text-amber-400 text-sm font-bold">{currencySymbol}{remainingAmount.toLocaleString()}</strong>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 rounded-sm bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 text-zinc-950 font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <HugeiconsIcon icon={LockKeyIcon} size={14} />
            <span>Pay Now to Unlock</span>
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenMore={() => setIsMobileSheetOpen(true)}
      />

      {/* Payment Reminder & Deliverable Unlock Center */}
      <PortalPaymentReminderModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        project={project}
        payments={payments}
        assets={assets}
        milestones={milestones}
        onRefetch={refetch}
      />
    </div>
  );
};

export default PortalShell;
