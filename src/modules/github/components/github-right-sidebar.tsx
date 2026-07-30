import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkBadge01Icon,
  ActivityIcon,
  CloudIcon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { LiveActivityFeed } from '../../activity/live-activity-feed';

interface GithubRightSidebarProps {
  repo: any;
  telemetry?: any;
}

export const GithubRightSidebar: React.FC<GithubRightSidebarProps> = ({ repo, telemetry }) => {
  const commitsCount = telemetry?.commits?.length || 0;
  const prsCount = telemetry?.pullRequests?.length || 0;
  const issuesCount = telemetry?.issues?.length || 0;
  const contributorsCount = telemetry?.contributors?.length || 0;
  const workflowsCount = telemetry?.workflows?.length || 0;
  const isCached = telemetry?.cached === true;
  const syncDuration = telemetry?.durationMs ? `${telemetry.durationMs}ms` : '—';

  return (
    <div className="space-y-3 sm:space-y-4 font-mono text-xs select-none">
      {/* Repository Telemetry Summary */}
      <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-emerald-400" />
          <span>Repository Telemetry</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Commits Loaded:</span>
            <span className="font-bold text-white font-mono">{commitsCount}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Pull Requests:</span>
            <span className="font-bold text-white font-mono">{prsCount}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Issues:</span>
            <span className="font-bold text-white font-mono">{issuesCount}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Contributors:</span>
            <span className="font-bold text-white font-mono">{contributorsCount}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Workflow Runs:</span>
            <span className="font-bold text-white font-mono">{workflowsCount}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Data Source:</span>
            <Badge variant="outline" className={`rounded-sm text-[9px] font-bold uppercase ${
              isCached
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}>
              {isCached ? 'Cached' : 'Live Sync'}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Sync Duration:</span>
            <span className="font-bold text-cyan-400 font-mono">{syncDuration}</span>
          </div>
        </div>
      </div>

      {/* Deployment & Release */}
      <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
          <HugeiconsIcon icon={CloudIcon} size={14} className="text-cyan-400" />
          <span>Repository Details</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Latest Release:</span>
            <span className="font-bold text-emerald-400 font-mono">{repo?.latest_version || repo?.latest_release || '—'}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Default Branch:</span>
            <span className="font-bold text-purple-400 font-mono">{repo?.branch || '—'}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Visibility:</span>
            <span className="font-bold text-white font-mono">{repo?.visibility || '—'}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Last Synced:</span>
            <span className="font-bold text-cyan-400 font-mono">{repo?.last_synced_at ? new Date(repo.last_synced_at).toLocaleTimeString() : '—'}</span>
          </div>
        </div>
      </div>

      {/* Realtime Activity Feed */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs px-1">
          <HugeiconsIcon icon={ActivityIcon} size={14} className="text-amber-400" />
          <span>Activity Stream</span>
        </div>
        <LiveActivityFeed limit={5} />
      </div>
    </div>
  );
};
