import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FolderCheckIcon,
  UserGroupIcon,
  Clock01Icon,
  Coins01Icon,
  Task01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import type { TeamOverviewDTO, TeamRole, TeamFinanceSummary, TeamProjectSummary } from '../../types/team.types';
import { canViewFinance } from '../../permissions/team.permissions';

interface TeamOverviewViewProps {
  overview: TeamOverviewDTO;
  userRole: TeamRole;
  onNavigateTab: (tab: string) => void;
}

export const TeamOverviewView: React.FC<TeamOverviewViewProps> = ({
  overview,
  userRole,
  onNavigateTab,
}) => {
  const navigate = useNavigate();
  const { counts, finance, timeSummary, recentProjects } = overview;
  const showFinance = canViewFinance(userRole) && finance.length > 0;

  return (
    <div className="space-y-8 font-mono">
      {/* 1. Operational Score Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <HugeiconsIcon icon={FolderCheckIcon} size={16} className="text-cyan-400" />
            <span>Active Projects</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {counts.activeProjects}
            <span className="text-xs font-normal text-zinc-500 ml-1.5">/ {counts.projects} total</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <HugeiconsIcon icon={UserGroupIcon} size={16} className="text-purple-400" />
            <span>Team Members</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{counts.members}</div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <HugeiconsIcon icon={Task01Icon} size={16} className="text-amber-400" />
            <span>Pending Deliverables</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{counts.pendingDeliverables}</div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <HugeiconsIcon icon={Clock01Icon} size={16} className="text-emerald-400" />
            <span>Time Tracked (Week)</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {Math.floor(timeSummary.weekMinutes / 60)}h {timeSummary.weekMinutes % 60}m
          </div>
        </div>

        {showFinance && (
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
              <HugeiconsIcon icon={Coins01Icon} size={16} className="text-emerald-400" />
              <span>Remaining Exposure</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {finance[0]?.currency} {finance[0]?.remaining.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* 2. Financial Position Strip (If Authorized) */}
      {showFinance && (
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <HugeiconsIcon icon={Coins01Icon} size={16} className="text-emerald-400" />
              Team Financial Overview
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Detailed Ledger <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {finance.map((f: TeamFinanceSummary) => (
              <React.Fragment key={f.currency}>
                <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-sm">
                  <div className="text-[11px] text-zinc-500 uppercase">Portfolio Value</div>
                  <div className="text-base font-bold text-zinc-200 mt-0.5">
                    {f.currency} {f.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-sm">
                  <div className="text-[11px] text-zinc-500 uppercase">Settled / Received</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {f.currency} {f.received.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-sm">
                  <div className="text-[11px] text-zinc-500 uppercase">Pending Remaining</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {f.currency} {f.remaining.toLocaleString()}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <HugeiconsIcon icon={FolderCheckIcon} size={16} className="text-cyan-400" />
            Active Team Projects
          </h2>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            View All ({counts.projects}) <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-sm">
            <p className="text-xs text-zinc-500">No projects currently assigned to this team workspace.</p>
            <button
              onClick={() => onNavigateTab('projects')}
              className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded-sm transition-colors"
            >
              Assign or Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((p: TeamProjectSummary) => (
              <div
                key={p.id}
                onClick={() => navigate(`/app/projects/${p.slug}`)}
                className="p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-sm cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: p.color || '#06B6D4' }}
                    />
                    <h3 className="text-xs font-bold text-zinc-200 hover:text-cyan-400 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-zinc-800 text-zinc-400 rounded-sm">
                    {p.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Completion</span>
                    <span>{p.completionPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-sm transition-all"
                      style={{ width: `${p.completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
