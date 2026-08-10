import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Building01Icon,
  Mail01Icon,
  CallIcon,
  GlobalIcon,
  Clock01Icon,
  GithubIcon,
  Folder01Icon,
  ActivityIcon
} from '@hugeicons/core-free-icons';
import { type FormattedClient } from '../../../../lib/services/client.service';
import { useClientProjects, useClientTimeline, useClient360Statistics } from '../../../../lib/supabase/queries/clients';
import { Badge } from '../../../../components/ui/badge';
import { CollapsibleMarkdown } from '../../../projects/components/CollapsibleMarkdown';

interface OverviewTabProps {
  client: FormattedClient;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ client }) => {
  const navigate = useNavigate();
  const { data: projects } = useClientProjects(client.id, true);
  const { data: timeline } = useClientTimeline(client.id, true);
  const { data: stats } = useClient360Statistics(client.id);

  const recentProjects = (projects || []).slice(0, 5);
  const recentTimeline = (timeline || []).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-mono text-xs select-none"
    >
      {/* 1. Client Profile DescriptionList Panel */}
      <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <HugeiconsIcon icon={UserIcon} size={16} className="text-cyan-400" />
            <span>Client Profile Details</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-sans">Account Profile</span>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5 text-xs">
          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} size={12} className="text-zinc-400" /> Full Name
            </dt>
            <dd className="font-bold text-white text-sm">{client.name}</dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={Building01Icon} size={12} className="text-zinc-400" /> Company / Org
            </dt>
            <dd className="font-bold text-cyan-400">{client.company}</dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={Mail01Icon} size={12} className="text-zinc-400" /> Primary Email
            </dt>
            <dd className="font-bold text-white truncate max-w-[200px]">{client.email}</dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={CallIcon} size={12} className="text-zinc-400" /> Direct Phone
            </dt>
            <dd className="font-bold text-zinc-200">{client.phone || '—'}</dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={GlobalIcon} size={12} className="text-zinc-400" /> Country & Region
            </dt>
            <dd className="font-bold text-white flex items-center gap-1.5">
              <span>{client.countryFlag}</span>
              <span>{client.country}</span>
            </dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={Clock01Icon} size={12} className="text-zinc-400" /> Operational Timezone
            </dt>
            <dd className="font-bold text-zinc-200">{client.timezone || 'UTC'}</dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={GlobalIcon} size={12} className="text-zinc-400" /> Corporate Website
            </dt>
            <dd className="font-bold text-cyan-400 truncate max-w-[200px]">
              {client.website ? (
                <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline">
                  {client.website}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>

          <div className="space-y-0.5">
            <dt className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HugeiconsIcon icon={GithubIcon} size={12} className="text-zinc-400" /> GitHub Handle
            </dt>
            <dd className="font-bold text-emerald-400">
              {client.githubUsername ? `@${client.githubUsername}` : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* 2. Account Summary Telemetry Bar */}
      <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <div className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center justify-between">
          <span>Account Lifecycle Summary</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px]">
          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Client Since</span>
            <p className="font-bold text-white">{client.formattedCreatedAt}</p>
          </div>

          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Total Projects</span>
            <p className="font-bold text-cyan-400">{client.projectCount} Projects</p>
          </div>

          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Vault Storage</span>
            <p className="font-bold text-emerald-400">{stats?.vaultStorage || '0 MB'}</p>
          </div>

          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Latest Activity</span>
            <p className="font-bold text-amber-400">{client.lastActivityRelative}</p>
          </div>

          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Last Record Edit</span>
            <p className="font-bold text-zinc-300">{client.formattedUpdatedAt}</p>
          </div>
        </div>
      </div>

      {/* 3. Recent Projects Cards (Latest 5) */}
      <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <HugeiconsIcon icon={Folder01Icon} size={16} className="text-cyan-400" />
            <span>Assigned Projects Portfolio ({recentProjects.length})</span>
          </div>
          {client.projectCount > 0 && (
            <button onClick={() => navigate('/app/projects')} className="text-xs text-cyan-400 hover:underline">
              View All Projects ({client.projectCount})
            </button>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4 text-center">No assigned projects for this client.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentProjects.map((p: any) => {
              const target = p.slug || p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/app/projects/${target}`)}
                  className="p-3.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer space-y-2.5 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors truncate">
                      {p.name}
                    </span>
                    <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] font-bold uppercase">
                      {p.status}
                    </Badge>
                  </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Progress Completion</span>
                    <span className="font-bold text-cyan-400">{p.completionPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-sm bg-zinc-900 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-sm"
                      style={{ width: `${p.completionPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans border-t border-zinc-850 pt-2">
                  <span>Deadline: <strong className="text-zinc-200 font-mono">{p.deadline}</strong></span>
                  <span className="text-zinc-500 font-mono text-[9px]">Priority: {p.priority}</span>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* 4. Project Health Timeline */}
      <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <HugeiconsIcon icon={ActivityIcon} size={14} className="text-amber-400" />
            <span>Project Health Timeline</span>
          </div>
        </div>

        {recentTimeline.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">No timeline updates recorded.</p>
        ) : (
          <div className="space-y-3">
            {recentTimeline.map((t: any) => (
              <div key={t.id} className="p-4 rounded bg-zinc-950 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{t.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-zinc-300 font-sans">
                  <CollapsibleMarkdown content={t.description || `Project update logged on ${t.projectName}`} maxCollapsedHeight={120} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
