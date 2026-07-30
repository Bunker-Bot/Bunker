import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  PlusSignIcon,
  RefreshIcon,
  CheckmarkBadge01Icon,
  UserGroupIcon
} from '@hugeicons/core-free-icons';
import { PageHeader } from '../../../components/project/PageHeader';
import { Badge } from '../../../components/ui/badge';

interface GithubWorkspaceHeaderProps {
  onConnectRepo: () => void;
  onSyncAll: () => void;
  isSyncing?: boolean;
}

export const GithubWorkspaceHeader: React.FC<GithubWorkspaceHeaderProps> = ({
  onConnectRepo,
  onSyncAll,
  isSyncing = false,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4 font-mono select-none">
      <PageHeader
        title="GitHub Repositories Workspace"
        description="Enterprise-grade GitHub repository operations center, live code telemetry, CI/CD pipelines, release management, and security insights."
        icon={GithubIcon}
        badge="Enterprise DevOps"
        breadcrumbs={[
          { label: 'Workspace', href: '/app/dashboard' },
          { label: 'GitHub Operations Center' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-sm bg-zinc-850 border border-zinc-750 text-zinc-200 font-bold text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <HugeiconsIcon icon={RefreshIcon} size={14} className={isSyncing ? 'animate-spin text-cyan-400' : ''} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync All'}</span>
            </button>

            <button
              onClick={onConnectRepo}
              className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span className="hidden sm:inline">Connect Repository</span>
              <span className="sm:hidden">Connect</span>
            </button>
          </div>
        }
      />

      {/* Account & Organization Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-sm text-xs overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-zinc-400">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={GithubIcon} size={16} className="text-white shrink-0" />
            <span className="truncate">Account: <strong className="text-white font-bold">@BunkerEnterprise</strong></span>
          </div>

          <div className="flex items-center gap-2 sm:border-l sm:border-zinc-800 sm:pl-3">
            <HugeiconsIcon icon={UserGroupIcon} size={15} className="text-cyan-400 shrink-0" />
            <span className="truncate">Org: <strong className="text-cyan-400 font-bold">Bunker-DevOps</strong></span>
          </div>

          <div className="flex items-center gap-2 sm:border-l sm:border-zinc-800 sm:pl-3">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={15} className="text-emerald-400 shrink-0" />
            <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] font-bold uppercase">Live Synced</Badge>
          </div>
        </div>

        <span className="text-[11px] text-zinc-500 font-sans whitespace-nowrap shrink-0">
          Last Sync: <strong className="text-zinc-300 font-mono">{new Date().toLocaleTimeString()}</strong>
        </span>
      </div>
    </div>
  );
};
