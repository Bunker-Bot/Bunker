import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  CallIcon,
  GlobalIcon,
  GithubIcon,
  Building01Icon,
  Tag01Icon,
  ActivityIcon
} from '@hugeicons/core-free-icons';
import { type FormattedClient } from '../../../lib/services/client.service';
import { useClientActivity } from '../../../lib/supabase/queries/clients';
import { Badge } from '../../../components/ui/badge';

interface ClientStickySidebarProps {
  client: FormattedClient;
}

export const ClientStickySidebar: React.FC<ClientStickySidebarProps> = ({ client }) => {
  const { data: activities } = useClientActivity(client.id, true);
  const recentActivities = (activities || []).slice(0, 5);

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. Quick Information Card */}
      <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
          <HugeiconsIcon icon={Building01Icon} size={14} className="text-cyan-400" />
          <span>Quick Information</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Client ID:</span>
            <span className="font-mono text-zinc-200">#{client.id.substring(0, 8)}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Country / Region:</span>
            <span className="font-bold text-white">{client.countryFlag} {client.country}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Timezone:</span>
            <span className="font-bold text-zinc-200">{client.timezone || 'UTC'}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Created:</span>
            <span className="text-zinc-300">{client.formattedCreatedAt}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Last Updated:</span>
            <span className="text-zinc-300">{client.formattedUpdatedAt}</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
          <HugeiconsIcon icon={Mail01Icon} size={14} className="text-emerald-400" />
          <span>Quick Actions</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {client.email && client.email !== '—' && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center justify-between p-2 rounded-sm bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Mail01Icon} size={14} className="text-cyan-400" />
                <span>Send Email</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-sans truncate max-w-[110px]">{client.email}</span>
            </a>
          )}

          {client.phone && client.phone !== '—' && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center justify-between p-2 rounded-sm bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CallIcon} size={14} className="text-emerald-400" />
                <span>Call Client</span>
              </div>
              <span className="text-[10px] text-zinc-500">{client.phone}</span>
            </a>
          )}

          {client.website && (
            <a
              href={client.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-sm bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={GlobalIcon} size={14} className="text-purple-400" />
                <span>Open Website</span>
              </div>
              <span className="text-[10px] text-zinc-500 truncate max-w-[110px]">{client.website}</span>
            </a>
          )}

          {client.githubUsername && (
            <a
              href={`https://github.com/${client.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-sm bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={GithubIcon} size={14} className="text-white" />
                <span>GitHub Profile</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">@{client.githubUsername}</span>
            </a>
          )}
        </div>
      </div>

      {/* 3. Account Labels / Tags */}
      <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs border-b border-zinc-800 pb-2">
          <HugeiconsIcon icon={Tag01Icon} size={14} className="text-amber-400" />
          <span>Client Tags</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="rounded-sm bg-zinc-950 text-cyan-300 border-cyan-800/80 text-[10px]">
            {client.company}
          </Badge>
          <Badge variant="outline" className="rounded-sm bg-zinc-950 text-emerald-300 border-emerald-800/80 text-[10px]">
            {client.country}
          </Badge>
          <Badge variant="outline" className={`rounded-sm bg-zinc-950 text-[10px] ${client.healthStatus === 'healthy' ? 'text-emerald-400 border-emerald-800' : 'text-amber-400 border-amber-800'}`}>
            {client.healthStatus === 'healthy' ? 'Healthy' : client.healthStatus === 'at_risk' ? 'Attention Needed' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* 4. Recent Client Activity Feed */}
      <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <HugeiconsIcon icon={ActivityIcon} size={14} className="text-emerald-400" />
            <span>Recent Activity</span>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <p className="text-[10px] text-zinc-500 italic py-1">No recent activity logged for client.</p>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((act: any) => (
              <div key={act.id} className="text-[10px] space-y-0.5 border-b border-zinc-850 pb-1.5 last:border-0">
                <p className="font-bold text-white truncate">{act.title}</p>
                <p className="text-zinc-400 font-sans truncate">{act.description}</p>
                <span className="text-[9px] text-cyan-400 block font-mono">{new Date(act.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
