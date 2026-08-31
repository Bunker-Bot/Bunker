import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  CallIcon,
  Clock01Icon,
  Edit01Icon,
  Copy01Icon,
  PlusSignIcon,
  Folder01Icon,
  MoreVerticalIcon,
  Delete02Icon,
  Link01Icon
} from '@hugeicons/core-free-icons';
import { type FormattedClient } from '../../../lib/services/client.service';
import { Badge } from '../../../components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../../../components/ui/dropdown-menu';
import { IdentityAvatar3D } from '../../../features/identity-avatar';

interface ClientHeroSectionProps {
  client: FormattedClient;
  onEdit: () => void;
  onDelete: () => void;
  onCreateProject: () => void;
}

export const ClientHeroSection: React.FC<ClientHeroSectionProps> = ({
  client,
  onEdit,
  onDelete,
  onCreateProject,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(client.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHealthBadge = (health: string, score: number) => {
    if (health === 'healthy') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-sm bg-emerald-950/90 text-emerald-300 border-emerald-700/80 text-xs font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Healthy
          </Badge>
          <span className="text-xs font-bold text-emerald-400 font-mono">{score}% Excellent</span>
        </div>
      );
    }
    if (health === 'at_risk') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-sm bg-amber-950/90 text-amber-300 border-amber-700/80 text-xs font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Attention Needed
          </Badge>
          <span className="text-xs font-bold text-amber-400 font-mono">{score}% Warning</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-sm bg-zinc-900 text-zinc-400 border-zinc-700 text-xs font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-500" />
          Inactive
        </Badge>
        <span className="text-xs font-bold text-zinc-400 font-mono">{score}% Stale</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-4 sm:p-6 rounded-sm bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border border-zinc-800/90 shadow-xl font-mono text-xs select-none space-y-4"
    >
      {/* Background Soft Gradient Glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 min-w-0">
        {/* Left Side: 3D Guardian Identity + Client Metadata */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-xl flex items-center justify-center overflow-hidden">
            <IdentityAvatar3D
              input={{
                entityId: client.id,
                entityKind: 'client',
                name: client.name,
                logoUrl: (client as any).logo_url || (client as any).logoUrl || null,
              }}
              badgeText={client.name.substring(0, 2).toUpperCase()}
              size="100%"
            />
            {/* Ambient Health Dot */}
            <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-zinc-950 flex items-center justify-center z-20">
              <span className={`w-2 h-2 rounded-full ${client.healthStatus === 'healthy' ? 'bg-emerald-400' : client.healthStatus === 'at_risk' ? 'bg-amber-400' : 'bg-zinc-500'}`} />
            </div>
          </div>

          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white font-mono truncate">
                {client.name}
              </h1>
              <Badge variant="secondary" className="rounded-sm bg-zinc-800 text-zinc-200 border-zinc-700 text-xs font-semibold px-2 py-0.5 shrink-0">
                {client.company}
              </Badge>
              <div className="flex items-center gap-1 shrink-0 text-zinc-300 text-xs">
                <span>{client.countryFlag}</span>
                <span className="text-zinc-400 font-sans">{client.country}</span>
              </div>
            </div>

            {/* Health Badge & Responsive Quick Contact Line */}
            <div className="flex flex-wrap items-center gap-3 text-zinc-400 pt-0.5">
              {getHealthBadge(client.healthStatus, client.healthScore)}

              {client.email && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-sans sm:border-l sm:border-zinc-800 sm:pl-3">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <HugeiconsIcon icon={Mail01Icon} size={13} className="text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-[240px]">{client.email}</span>
                  </span>
                  {client.phone && (
                    <span className="hidden md:flex items-center gap-1.5 text-zinc-300">
                      <HugeiconsIcon icon={CallIcon} size={13} className="text-emerald-400 shrink-0" />
                      <span>{client.phone}</span>
                    </span>
                  )}
                  {client.timezone && (
                    <span className="hidden lg:flex items-center gap-1.5 text-zinc-400">
                      <HugeiconsIcon icon={Clock01Icon} size={13} className="text-purple-400 shrink-0" />
                      <span>{client.timezone}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Uniform Height & Non-Wrapping Action Buttons Bar */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t border-zinc-800/80 lg:border-t-0 pb-1 lg:pb-0">
          <button
            onClick={onEdit}
            className="h-9 px-3.5 rounded-sm bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 font-bold text-xs hover:bg-zinc-700 hover:text-white cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <HugeiconsIcon icon={Edit01Icon} size={14} />
            <span>Edit Client</span>
          </button>

          <button
            onClick={() => navigate('/app/projects')}
            className="h-9 px-3.5 rounded-sm bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 font-bold text-xs hover:bg-zinc-700 hover:text-white cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <HugeiconsIcon icon={Folder01Icon} size={14} className="text-cyan-400" />
            <span>Open Projects</span>
          </button>

          <button
            onClick={onCreateProject}
            className="h-9 px-3.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} />
            <span>Create Project</span>
          </button>

          <button
            onClick={handleCopyEmail}
            className="h-9 w-9 rounded-sm bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 hover:text-white cursor-pointer transition-colors inline-flex items-center justify-center shrink-0"
            title="Copy Client Email"
          >
            <HugeiconsIcon icon={Copy01Icon} size={15} className={copied ? 'text-emerald-400' : ''} />
          </button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 rounded-sm bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 hover:text-white cursor-pointer transition-colors inline-flex items-center justify-center shrink-0 outline-none">
              <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44 bg-zinc-950 border-zinc-800 text-zinc-200 font-mono text-xs">
              {client.website && (
                <DropdownMenuItem onClick={() => window.open(client.website, '_blank')} className="cursor-pointer gap-2">
                  <HugeiconsIcon icon={Link01Icon} size={14} />
                  <span>Open Website</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer gap-2">
                <HugeiconsIcon icon={Edit01Icon} size={14} />
                <span>Edit Record</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-850" />
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer gap-2 text-rose-400 hover:text-rose-300 focus:bg-rose-950/30">
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                <span>Delete Client</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-sans min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Client Since: <strong className="text-zinc-200 font-mono">{client.formattedCreatedAt}</strong></span>
          <span>Last Updated: <strong className="text-zinc-200 font-mono">{client.formattedUpdatedAt}</strong></span>
          <span>Last Activity: <strong className="text-cyan-400 font-mono">{client.lastActivityRelative}</strong></span>
        </div>
        <span className="font-mono text-zinc-400 truncate max-w-full sm:max-w-xs">ID: #{client.id}</span>
      </div>
    </motion.div>
  );
};
