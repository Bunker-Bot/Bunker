import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudIcon } from '@hugeicons/core-free-icons';
import { useDeploymentSummary } from '../../../lib/supabase/queries/dashboard';

export const DeploymentStatusWidget: React.FC = () => {
  const { data: envs, isLoading } = useDeploymentSummary();

  if (isLoading) {
    return <div className="h-52 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />;
  }

  const environments = envs || [];
  const operationalCount = environments.filter((e) => e.status === 'Operational' || e.status === 'successful' || e.status === 'Active').length;

  return (
    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={CloudIcon} size={16} className="text-emerald-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Deployment Environment Status</h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">
          {environments.length > 0 ? `${operationalCount}/${environments.length} Online` : '0 Environments'}
        </span>
      </div>

      {environments.length === 0 ? (
        <div className="p-4 text-center rounded bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs font-sans">
          No deployment environments logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {environments.map((env: any, index) => (
            <div key={env.id || index} className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-white truncate">{env.environment}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] font-bold text-emerald-400">{env.status}</p>
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans pt-0.5 border-t border-zinc-900">
                <span>{env.version}</span>
                <span>{env.responseTime || 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
