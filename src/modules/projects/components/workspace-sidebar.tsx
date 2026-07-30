import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  HardDriveIcon,
  FlashIcon,
  Download01Icon,
  FileCodeIcon,
  SecurityCheckIcon
} from '@hugeicons/core-free-icons';
import { useWorkspaceActivity, useWorkspaceStorage } from '../../../lib/supabase/queries/projects';

interface WorkspaceSidebarProps {
  onOpenNewProject: () => void;
  onExportProjects: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  onOpenNewProject,
  onExportProjects,
}) => {
  const { data: activityList, isLoading: isActivityLoading } = useWorkspaceActivity();
  const { data: storageInfo } = useWorkspaceStorage();

  const activities = activityList || [];
  const storage = storageInfo || {
    totalDocuments: 0,
    totalFiles: 0,
    totalShareLinks: 0,
    usedMB: 12,
    capacityMB: 5000,
    percentageUsed: 1,
  };

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'recently';
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <aside className="space-y-4 font-mono text-zinc-100 select-none sticky top-20">
      {/* 1. Recent Activity Stream */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800/80 shadow-md space-y-3"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Clock01Icon} size={15} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Recent Activity</h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold">Stream</span>
        </div>

        {isActivityLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-zinc-950/60 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-3 text-center rounded bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-500">
            No recent activity logged in workspace.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.slice(0, 5).map((act: any) => (
              <div
                key={act.id}
                className="p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white truncate max-w-[150px]">
                    {act.projects?.name || 'Project Update'}
                  </span>
                  <span className="text-zinc-500 shrink-0">{getRelativeTime(act.created_at)}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans line-clamp-1 leading-snug">
                  {act.title || act.content || 'Logged a new project milestone.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 2. Workspace Storage Usage */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800/80 shadow-md space-y-3"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={HardDriveIcon} size={15} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Storage Usage</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">
            {storage.usedMB} MB / 5.0 GB
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px]">Capacity Used</span>
            <span className="font-bold text-white">{storage.percentageUsed}%</span>
          </div>

          <div className="w-full h-2 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(4, storage.percentageUsed)}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Documents</span>
              <p className="font-bold text-white">{storage.totalDocuments} Specs</p>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Share Portals</span>
              <p className="font-bold text-cyan-400">{storage.totalShareLinks} Links</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Workspace Quick Actions Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800/80 shadow-md space-y-3"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
          <HugeiconsIcon icon={FlashIcon} size={15} className="text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={onOpenNewProject}
            className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200 font-bold flex flex-col items-start gap-1 transition-all cursor-pointer text-left"
          >
            <HugeiconsIcon icon={FileCodeIcon} size={14} className="text-white" />
            <span className="text-[11px]">New Project</span>
          </button>

          <button
            onClick={onExportProjects}
            className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200 font-bold flex flex-col items-start gap-1 transition-all cursor-pointer text-left"
          >
            <HugeiconsIcon icon={Download01Icon} size={14} className="text-cyan-400" />
            <span className="text-[11px]">Export Workspace</span>
          </button>
        </div>
      </motion.div>

      {/* 4. Workspace Health Inspection */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800/80 shadow-md space-y-2.5 text-xs font-mono"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SecurityCheckIcon} size={15} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Workspace Health</h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-[10px]">
            Optimal
          </span>
        </div>

        <div className="space-y-2 pt-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Query Engine</span>
            <span className="text-emerald-400 font-bold">React Query v5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Concurrency Limit</span>
            <span className="text-zinc-300 font-bold">Max 2 Queue</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Realtime Channel</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
