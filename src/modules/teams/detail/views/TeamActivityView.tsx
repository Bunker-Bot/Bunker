import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Activity01Icon,
  Shield02Icon,
  UserGroupIcon,
  FolderCheckIcon,
  Coins01Icon,
} from '@hugeicons/core-free-icons';
import { useTeamActivity } from '../../../../lib/supabase/queries/teams';
import type { Team } from '../../types/team.types';

interface TeamActivityViewProps {
  team: Team;
}

export const TeamActivityView: React.FC<TeamActivityViewProps> = ({ team }) => {
  const { data: activities = [], isLoading } = useTeamActivity(team.id);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <HugeiconsIcon icon={Activity01Icon} size={16} className="text-cyan-400" />
            Team Activity Stream & Audit Log
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time audit log of team actions, membership changes, and project events
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading activity feed...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <HugeiconsIcon icon={Activity01Icon} size={32} className="text-zinc-600 mx-auto" />
            <p>No recent activity recorded for this team workspace.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  {item.targetType === 'member' ? (
                    <HugeiconsIcon icon={UserGroupIcon} size={16} />
                  ) : item.targetType === 'finance' ? (
                    <HugeiconsIcon icon={Coins01Icon} size={16} />
                  ) : item.targetType === 'guardian' ? (
                    <HugeiconsIcon icon={Shield02Icon} size={16} />
                  ) : (
                    <HugeiconsIcon icon={FolderCheckIcon} size={16} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-200">
                    <span className="text-cyan-400">{item.actorName}</span> {item.description}
                  </div>
                  {item.targetTitle && (
                    <div className="text-[11px] text-zinc-400 mt-0.5">{item.targetTitle}</div>
                  )}
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
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
