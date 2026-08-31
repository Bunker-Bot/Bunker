import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { FormattedShareLink } from '../../../lib/services/share.service';
import { Badge } from '../../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Link01Icon,
  Copy01Icon,
  Tick01Icon,
  LockKeyIcon,
  EyeIcon,
  Calendar01Icon,
  RotateLeftIcon,
  AlertCircleIcon,
  Delete02Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

interface ShareLinkCardProps {
  link: FormattedShareLink;
  onCopy: (url: string) => void;
  onRegenerate: (id: string) => void;
  onToggleStatus: (id: string, currentIsActive: boolean) => void;
  onDelete: (id: string) => void;
  onSelect: (link: FormattedShareLink) => void;
}

export const ShareLinkCard: React.FC<ShareLinkCardProps> = ({
  link,
  onCopy,
  onRegenerate,
  onToggleStatus,
  onDelete,
  onSelect,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(link.shareUrl || link.portalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (link.status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-emerald-950/80 border-emerald-800 text-emerald-300 font-mono text-[10px] font-bold">
            Active
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-amber-950/80 border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
            Expired
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold">
            Disabled
          </Badge>
        );
      case 'view_limit_reached':
        return (
          <Badge variant="outline" className="bg-rose-950/80 border-rose-800 text-rose-300 font-mono text-[10px] font-bold">
            View Limit
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => onSelect(link)}
      className="p-4 rounded bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 shadow-md group relative"
    >
      {/* Header Row: Title & Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-cyan-400 shrink-0">
            <HugeiconsIcon icon={Link01Icon} size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
              {link.name}
            </h4>
            <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
              <span>{link.projectName}</span>
              <span>•</span>
              <span>Token: {link.maskedToken}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* Share URL Row */}
      <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/80 border border-zinc-800/60 font-mono text-[11px]">
        <span className="text-zinc-300 truncate flex-1 font-mono">{link.portalUrl}</span>
        <button
          type="button"
          onClick={handleCopyClick}
          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10.5px] font-bold cursor-pointer shrink-0 flex items-center gap-1 transition-colors"
          title="Copy Share Link URL"
        >
          <HugeiconsIcon icon={isCopied ? Tick01Icon : Copy01Icon} size={12} className={isCopied ? 'text-emerald-400' : ''} />
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-900 text-[10.5px] text-zinc-400">
        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={EyeIcon} size={12} className="text-sky-400" />
          <span>Views: {link.viewCount} / {link.maxViews || '∞'}</span>
        </div>

        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={LockKeyIcon} size={12} className={link.hasPassword ? 'text-emerald-400' : 'text-zinc-600'} />
          <span>Password: {link.hasPassword ? 'Protected' : 'None'}</span>
        </div>

        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-amber-400" />
          <span>Expires: {link.formattedExpiresAt}</span>
        </div>

        <div className="flex items-center gap-1 justify-end">
          <HugeiconsIcon icon={InformationCircleIcon} size={12} className="text-zinc-500" />
          <span>Created: {link.createdAt}</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-900 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate(link.id);
          }}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
          title="Regenerate Token (Invalidates Previous Link)"
        >
          <HugeiconsIcon icon={RotateLeftIcon} size={12} />
          <span>Regenerate</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(link.id, link.status === 'active');
          }}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
          title={link.status === 'active' ? 'Disable Share Link' : 'Enable Share Link'}
        >
          <HugeiconsIcon icon={AlertCircleIcon} size={12} className="text-amber-400" />
          <span>{link.status === 'active' ? 'Disable' : 'Enable'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(link.id);
          }}
          className="p-1 rounded bg-zinc-900 border border-rose-950 text-rose-400 hover:bg-rose-950 cursor-pointer"
          title="Revoke / Delete Link"
        >
          <HugeiconsIcon icon={Delete02Icon} size={13} />
        </button>
      </div>
    </motion.div>
  );
};
