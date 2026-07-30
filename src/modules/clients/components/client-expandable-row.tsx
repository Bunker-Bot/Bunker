import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Clock01Icon,
  Link01Icon,
  CloudIcon,
  NoteIcon,
  Building01Icon
} from '@hugeicons/core-free-icons';
import { useClientExpandedDetails } from '../../../lib/supabase/queries/clients';
import { Badge } from '../../../components/ui/badge';
import { type FormattedClient } from '../../../lib/services/client.service';

interface ClientExpandableRowProps {
  client: FormattedClient;
  isExpanded: boolean;
}

export const ClientExpandableRow: React.FC<ClientExpandableRowProps> = ({
  client,
  isExpanded,
}) => {
  const { data: details, isLoading } = useClientExpandedDetails(client.id, isExpanded);

  if (!isExpanded) return null;

  if (isLoading) {
    return (
      <tr className="bg-zinc-950/90 border-b border-zinc-800 font-mono text-xs">
        <td colSpan={9} className="p-4">
          <div className="h-24 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        </td>
      </tr>
    );
  }

  const d = details || {
    recentProjects: [],
    recentTimeline: [],
    shareLinks: [],
    deploymentsCount: 0,
  };

  return (
    <tr className="bg-zinc-950/90 border-b border-zinc-800 font-mono text-xs select-none">
      <td colSpan={9} className="p-4 sm:p-5">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Expanded Main Grid (4 Panels) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Panel 1: Account Overview & Metadata */}
            <div className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
                <HugeiconsIcon icon={Building01Icon} size={14} className="text-purple-400" />
                <span>Account Profile & Metadata</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Company:</span>
                  <span className="font-bold text-white truncate max-w-[120px]">{client.company}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Email:</span>
                  <span className="font-bold text-cyan-400 truncate max-w-[140px]">{client.email}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Phone:</span>
                  <span className="font-bold text-zinc-300">{client.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Country / Region:</span>
                  <span className="font-bold text-white">{client.countryFlag} {client.country}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Timezone:</span>
                  <span className="font-bold text-zinc-300">{client.timezone || 'UTC'}</span>
                </div>
                {client.githubUsername && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>GitHub:</span>
                    <span className="font-bold text-emerald-400">@{client.githubUsername}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Panel 2: Assigned Projects Portfolio */}
            <div className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <HugeiconsIcon icon={Folder01Icon} size={14} className="text-cyan-400" />
                  <span>Recent Projects ({d.recentProjects.length})</span>
                </div>
              </div>

              {d.recentProjects.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic py-2">No active projects assigned to client.</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                  {d.recentProjects.map((p: any) => (
                    <div key={p.id} className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white truncate max-w-[130px]">{p.name}</span>
                        <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[9px] px-1 py-0 font-bold uppercase">
                          {p.status || 'active'}
                        </Badge>
                      </div>
                      <div className="w-full h-1 rounded-sm bg-zinc-900 overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-sm" style={{ width: `${p.completion_percent || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel 3: Recent Activity Log */}
            <div className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
                <HugeiconsIcon icon={Clock01Icon} size={14} className="text-amber-400" />
                <span>Recent Client Timeline</span>
              </div>

              {d.recentTimeline.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic py-2">No timeline updates recorded.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                  {d.recentTimeline.map((u: any) => (
                    <div key={u.id} className="text-[10px] space-y-0.5 border-b border-zinc-850 pb-1">
                      <p className="font-bold text-zinc-200 truncate">{u.title}</p>
                      <span className="text-[9px] text-zinc-500 font-sans">{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel 4: Notes & Telemetry Metrics */}
            <div className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <HugeiconsIcon icon={NoteIcon} size={14} className="text-emerald-400" />
                  <span>Private Admin Notes</span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800/80 max-h-24 overflow-y-auto font-sans leading-relaxed">
                {client.notes ? client.notes : <span className="italic text-zinc-600">No admin notes logged for client.</span>}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={Link01Icon} size={10} className="text-cyan-400" />
                    Share Portals
                  </span>
                  <p className="font-bold text-cyan-400">{d.shareLinks.length} Active</p>
                </div>
                <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={CloudIcon} size={10} className="text-emerald-400" />
                    Deployments
                  </span>
                  <p className="font-bold text-emerald-400">{d.deploymentsCount} Builds</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </td>
    </tr>
  );
};
