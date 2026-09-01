import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coins01Icon,
  FolderCheckIcon,
  LockKeyIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { useTeamFinance } from '../../../../lib/supabase/queries/teams';
import { canViewFinance } from '../../permissions/team.permissions';
import type { Team, TeamRole } from '../../types/team.types';

interface TeamFinanceViewProps {
  team: Team;
  userRole: TeamRole;
}

export const TeamFinanceView: React.FC<TeamFinanceViewProps> = ({ team, userRole }) => {
  const navigate = useNavigate();
  const hasFinanceAccess = canViewFinance(userRole);
  const { data: financeData, isLoading } = useTeamFinance(hasFinanceAccess ? team.id : null);

  if (!hasFinanceAccess) {
    return (
      <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 font-mono space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 mx-auto">
          <HugeiconsIcon icon={LockKeyIcon} size={24} />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">Restricted Financial Module</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Your role ({userRole}) does not have permission to view team financial totals and contract ledgers.
        </p>
      </div>
    );
  }

  const currencies = financeData?.currencies || [];
  const projects = financeData?.projects || [];

  return (
    <div className="space-y-8 font-mono">
      {/* Portfolio Totals by Currency */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <HugeiconsIcon icon={Coins01Icon} size={16} className="text-emerald-400" />
          Aggregated Portfolio Balances
        </div>

        {isLoading ? (
          <div className="h-28 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse" />
        ) : currencies.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl text-xs text-zinc-500">
            No financial contract value recorded for assigned projects.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {currencies.map((f) => (
              <React.Fragment key={f.currency}>
                <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Total Contract Value</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {f.currency} {f.totalValue.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Verified Received</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {f.currency} {f.received.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Remaining Exposure</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {f.currency} {f.remaining.toLocaleString()}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Project Breakdown Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <HugeiconsIcon icon={FolderCheckIcon} size={16} className="text-cyan-400" />
            Project Breakdown ({projects.length})
          </h3>
          <button
            onClick={() => navigate('/app/finances')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Global Finances <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="divide-y divide-zinc-800/80">
            {projects.map((p: any) => (
              <div
                key={p.id}
                onClick={() => navigate(`/app/projects/${p.slug}`)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-zinc-800/30 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 hover:text-cyan-400 transition-colors">
                    {p.name}
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase mt-0.5 inline-block">
                    Status: {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-6 text-right text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Budget</div>
                    <div className="font-semibold text-zinc-300 mt-0.5">
                      {p.currency} {Number(p.budget || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Received</div>
                    <div className="font-semibold text-emerald-400 mt-0.5">
                      {p.currency} {Number(p.received || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Remaining</div>
                    <div className="font-semibold text-amber-400 mt-0.5">
                      {p.currency} {Number(p.remaining || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
