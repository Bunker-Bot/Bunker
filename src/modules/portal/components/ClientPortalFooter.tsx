import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon, Clock01Icon, CheckmarkBadge01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface ClientPortalFooterProps {
  expiresAt?: string | null;
}

export const ClientPortalFooter: React.FC<ClientPortalFooterProps> = ({ expiresAt }) => {
  const formattedExpires = expiresAt ? new Date(expiresAt).toLocaleDateString() : 'Never';

  return (
    <footer className="mt-8 pt-6 border-t border-zinc-850 text-zinc-500 font-mono text-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={LockKeyIcon} size={14} className="text-cyan-400" />
            <span className="font-extrabold text-white">Protected Enterprise Share Workspace</span>
            <Badge variant="outline" className="rounded-sm text-[9px] bg-zinc-900 border-zinc-800 text-zinc-400">
              Read-Only Access
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            Encrypted client portal session token. All activities and views are logged for audit compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-sans">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-zinc-900/80 border border-zinc-850">
            <HugeiconsIcon icon={Clock01Icon} size={13} className="text-amber-400" />
            <span>Link Expires: <strong className="text-white font-mono">{formattedExpires}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-zinc-900/80 border border-zinc-850">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={13} className="text-emerald-400" />
            <span className="text-zinc-300 font-mono font-bold">256-Bit SHA Protocol</span>
          </div>
        </div>
      </div>

      <div className="text-center sm:text-left text-[10px] text-zinc-600 font-sans border-t border-zinc-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Bunker Enterprise Engine. All rights reserved.</span>
        <span className="font-mono text-zinc-500">Powered by Bunker Client Portal System</span>
      </div>
    </footer>
  );
};

export default ClientPortalFooter;
