import React from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  CallIcon,
  MoreVerticalIcon,
  ArrowDown01Icon,
  ArrowUp01Icon
} from '@hugeicons/core-free-icons';
import { type FormattedClient } from '../../../lib/services/client.service';
import { Badge } from '../../../components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../../../components/ui/hover-card';

interface ClientTableRowProps {
  client: FormattedClient;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenMenu: (e: React.MouseEvent) => void;
}

export const ClientTableRow: React.FC<ClientTableRowProps> = ({
  client,
  isExpanded,
  onToggleExpand,
  onOpenMenu,
}) => {
  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return (
          <Badge variant="outline" className="rounded-sm bg-emerald-950/90 text-emerald-300 border-emerald-700/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Healthy
          </Badge>
        );
      case 'at_risk':
        return (
          <Badge variant="outline" className="rounded-sm bg-amber-950/90 text-amber-300 border-amber-700/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            At Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-sm bg-zinc-900 text-zinc-400 border-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Inactive
          </Badge>
        );
    }
  };

  return (
    <tr
      onClick={onToggleExpand}
      className={`hover:bg-zinc-800/40 transition-colors cursor-pointer select-none font-mono text-xs ${
        isExpanded ? 'bg-zinc-850/60' : ''
      }`}
    >
      {/* 1. Client Column (Avatar + Name + Company + ID + HoverCard) */}
      <td className="px-4 py-3 font-bold text-white">
        <HoverCard>
          <HoverCardTrigger className="inline-block">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
                {client.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5 min-w-0">
                <Link
                  to={`/app/clients/${client.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline truncate block text-sm font-bold text-white"
                >
                  {client.name}
                </Link>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-sans">
                  <span className="truncate max-w-[110px] font-semibold text-zinc-300">{client.company}</span>
                  <span className="text-zinc-600 font-mono text-[9px]">#{client.id.substring(0, 6)}</span>
                </div>
              </div>
            </div>
          </HoverCardTrigger>

          <HoverCardContent className="w-64 p-3 rounded-sm bg-zinc-950 border border-zinc-800/80 shadow-2xl font-mono text-xs space-y-2 text-zinc-200">
            <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-2">
              <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs">
                {client.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">{client.name}</p>
                <p className="text-[10px] text-zinc-400 font-sans">{client.company}</p>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <HugeiconsIcon icon={Mail01Icon} size={12} className="text-cyan-400" />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <HugeiconsIcon icon={CallIcon} size={12} className="text-emerald-400" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </td>

      {/* 2. Contact (Email + Phone) */}
      <td className="px-4 py-3 text-zinc-300 font-sans">
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-zinc-200">
            <HugeiconsIcon icon={Mail01Icon} size={13} className="text-zinc-500 shrink-0" />
            <span className="truncate max-w-[150px]">{client.email}</span>
          </div>
          {client.phone ? (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <HugeiconsIcon icon={CallIcon} size={12} className="text-zinc-500 shrink-0" />
              <span>{client.phone}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-600 font-mono">— No Phone —</span>
          )}
        </div>
      </td>

      {/* 3. Location (Country + Flag + Timezone) */}
      <td className="px-4 py-3 text-zinc-300">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="text-sm">{client.countryFlag}</span>
            <span>{client.country}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-sans block">{client.timezone || 'UTC'}</span>
        </div>
      </td>

      {/* 4. Active Projects (Count + HoverCard breakdown) */}
      <td className="px-4 py-3">
        <HoverCard>
          <HoverCardTrigger className="inline-block">
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded-sm bg-zinc-800 text-cyan-300 border border-zinc-700/80 font-bold text-xs inline-block">
                {client.activeProjectsCount} Active
              </span>
              <span className="text-[10px] text-zinc-500 block">{client.projectCount} Total Projects</span>
            </div>
          </HoverCardTrigger>

          <HoverCardContent className="w-56 p-3 rounded-sm bg-zinc-950 border border-zinc-800/80 shadow-2xl font-mono text-xs space-y-2 text-zinc-200">
            <div className="font-bold border-b border-zinc-800/70 pb-1.5 text-white flex items-center justify-between">
              <span>Project Breakdown</span>
              <span className="text-cyan-400">{client.projectCount} Total</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400">Active:</span>
                <span className="font-bold">{client.activeProjectsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400">Completed:</span>
                <span className="font-bold">{client.completedProjectsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400">On Hold:</span>
                <span className="font-bold">{client.onHoldProjectsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-400">Cancelled:</span>
                <span className="font-bold">{client.cancelledProjectsCount}</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </td>

      {/* 5. Current Project (Name + Status + Progress) */}
      <td className="px-4 py-3">
        {client.currentProject ? (
          <div className="space-y-1 max-w-[160px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white truncate">{client.currentProject.name}</span>
              <span className="text-[10px] font-bold text-cyan-400">{client.currentProject.completionPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-sm"
                style={{ width: `${client.currentProject.completionPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-500 italic">— Unassigned —</span>
        )}
      </td>

      {/* 6. Last Activity */}
      <td className="px-4 py-3 text-zinc-300" title={`Updated: ${client.formattedUpdatedAt}`}>
        <span className="font-bold text-white block text-xs">{client.lastActivityRelative}</span>
        <span className="text-[10px] text-zinc-500 block">{client.formattedUpdatedAt}</span>
      </td>

      {/* 7. Registration Date */}
      <td className="px-4 py-3 text-zinc-400 text-[11px]">{client.formattedCreatedAt}</td>

      {/* 8. Client Health Badge */}
      <td className="px-4 py-3">{getHealthBadge(client.healthStatus)}</td>

      {/* 9. Actions Dropdown */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Row' : 'Expand Row'}
          >
            <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={15} />
          </button>

          <button
            onClick={onOpenMenu}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
