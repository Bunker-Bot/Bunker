import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudIcon, Link01Icon } from '@hugeicons/core-free-icons';
import { useClientDeployments } from '../../../../lib/supabase/queries/clients';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';
import { Badge } from '../../../../components/ui/badge';

interface DeploymentsTabProps {
  clientId: string;
}

export const DeploymentsTab: React.FC<DeploymentsTabProps> = ({ clientId }) => {
  const { data: deployments, isLoading } = useClientDeployments(clientId, true);
  const items = deployments || [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ProjectEmptyState title="No Deployments Yet" description="Deploy your first environment to begin tracking releases and builds." icon={CloudIcon} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((dep: any) => (
            <div key={dep.id} className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm hover:border-zinc-700 transition-all min-w-0">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 gap-2 min-w-0">
                <span className="font-bold text-white text-sm truncate">{dep.projectName} — {dep.environment}</span>
                <Badge variant="outline" className={`rounded-sm text-[10px] font-bold uppercase shrink-0 ${dep.status === 'active' || dep.status === 'successful' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-zinc-900 text-zinc-400 border-zinc-700'}`}>
                  {dep.status}
                </Badge>
              </div>

              <div className="space-y-2 text-[11px] min-w-0">
                {dep.frontendUrl && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-400 min-w-0">
                    <span className="shrink-0 text-zinc-500 font-bold">Frontend:</span>
                    <a
                      href={dep.frontendUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 min-w-0 max-w-full sm:max-w-[260px]"
                    >
                      <span className="truncate">{dep.frontendUrl}</span>
                      <HugeiconsIcon icon={Link01Icon} size={12} className="shrink-0" />
                    </a>
                  </div>
                )}

                {dep.backendUrl && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-400 min-w-0">
                    <span className="shrink-0 text-zinc-500 font-bold">Backend API:</span>
                    <a
                      href={dep.backendUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 min-w-0 max-w-full sm:max-w-[260px]"
                    >
                      <span className="truncate">{dep.backendUrl}</span>
                      <HugeiconsIcon icon={Link01Icon} size={12} className="shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-sans border-t border-zinc-850 pt-2">
                <span>Version: <strong className="text-zinc-200 font-mono">{dep.version}</strong></span>
                <span>Deployed: <strong className="text-zinc-300 font-mono">{dep.updatedAt}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
