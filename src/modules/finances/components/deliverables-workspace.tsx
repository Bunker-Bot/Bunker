import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PackageIcon,
  LockIcon,
  LockKeyIcon,
  Link01Icon,
  Copy01Icon,
  Tick02Icon,
  Delete02Icon,
  Folder01Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface DeliverablesWorkspaceProps {
  assets: any[];
  projectId?: string;
  onCreateAsset?: (input: any) => Promise<void>;
  onToggleManualUnlock?: (assetId: string, isManualUnlocked: boolean) => Promise<void>;
  onDeleteAsset?: (assetId: string) => Promise<void>;
  readOnly?: boolean;
}

export const DeliverablesWorkspace: React.FC<DeliverablesWorkspaceProps> = ({
  assets,
  onToggleManualUnlock,
  onDeleteAsset,
  readOnly = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getUnlockLabel = (type: string) => {
    switch (type) {
      case 'immediate': return 'Immediate Access';
      case '25_percent': return 'Unlocked after 25% Payment';
      case '50_percent': return 'Unlocked after 50% Payment';
      case '75_percent': return 'Unlocked after 75% Payment';
      case '100_percent': return 'Unlocked after 100% Payment';
      case 'manual': return 'Manual Release Only';
      default: return 'Automated Release';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-xs">
          <HugeiconsIcon icon={PackageIcon} size={15} className="text-blue-400" />
          <span>Deliverables & Released Assets ({assets.length})</span>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="p-6 rounded bg-zinc-950 border border-zinc-850 text-center text-zinc-500 text-xs space-y-2">
          <p>No deliverables or assets attached to this project yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset, idx) => {
            const isUnlocked = asset.isUnlocked || asset.isManualUnlocked || readOnly;
            const unlockThresholdLabel = getUnlockLabel(asset.unlockType);

            return (
              <motion.div
                key={asset.id || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="relative p-4 rounded bg-zinc-950 border border-zinc-850 space-y-3 shadow-sm hover:border-zinc-700 transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
                      <HugeiconsIcon icon={Folder01Icon} size={16} className="text-zinc-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{asset.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-sans truncate">{asset.assetType?.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className={`rounded-sm text-[10px] uppercase font-bold shrink-0 flex items-center gap-1 ${
                    isUnlocked
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950/80 text-rose-300 border-rose-800'
                  }`}>
                    <HugeiconsIcon icon={isUnlocked ? LockKeyIcon : LockIcon} size={11} />
                    <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                  </Badge>
                </div>

                {asset.description && (
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                    {asset.description}
                  </p>
                )}

                {/* Locked Glass Overlay */}
                {!isUnlocked && (
                  <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800/90 text-center space-y-1 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs">
                      <HugeiconsIcon icon={LockIcon} size={14} />
                      <span>{unlockThresholdLabel}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      Deliverable link will automatically activate once payment threshold is verified.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-850">
                  {isUnlocked && asset.assetUrl && (
                    <a
                      href={asset.assetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-200 hover:bg-emerald-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <HugeiconsIcon icon={Link01Icon} size={13} />
                      <span>Open Deliverable</span>
                    </a>
                  )}

                  {asset.assetUrl && (
                    <button
                      onClick={() => handleCopyLink(asset.assetUrl, asset.id)}
                      className="h-8 px-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <HugeiconsIcon icon={copiedId === asset.id ? Tick02Icon : Copy01Icon} size={13} className={copiedId === asset.id ? 'text-emerald-400' : ''} />
                      <span>{copiedId === asset.id ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  )}

                  {!readOnly && onToggleManualUnlock && (
                    <button
                      onClick={() => onToggleManualUnlock(asset.id, !asset.isManualUnlocked)}
                      className={`h-8 px-2.5 rounded border text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        asset.isManualUnlocked
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <HugeiconsIcon icon={asset.isManualUnlocked ? LockIcon : LockKeyIcon} size={13} />
                      <span>{asset.isManualUnlocked ? 'Lock Asset' : 'Manual Unlock'}</span>
                    </button>
                  )}

                  {!readOnly && onDeleteAsset && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this deliverable asset permanently?')) {
                          onDeleteAsset(asset.id);
                        }
                      }}
                      className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 text-rose-400 hover:bg-rose-950/40 cursor-pointer inline-flex items-center justify-center transition-colors ml-auto"
                      title="Delete Asset"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
