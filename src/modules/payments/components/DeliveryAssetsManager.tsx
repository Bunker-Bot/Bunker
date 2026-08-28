import React, { useState } from 'react';
import type { DeliveryAsset, AssetType, UnlockType, CreateDeliveryAssetInput } from '../types/payment';
import { parseGoogleDriveUrl } from '../../../utils/google-drive';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  LockKeyIcon,
  Delete02Icon,
  Link01Icon,
  Folder01Icon,
  Video01Icon,
  DocumentCodeIcon,
  Key01Icon,
  SecurityCheckIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';
import { ConfirmDeleteDialog } from '../../../components/ui/confirm-delete-dialog';

interface DeliveryAssetsManagerProps {
  assets: DeliveryAsset[];
  projectId: string;
  onCreateAsset: (input: CreateDeliveryAssetInput) => Promise<void>;
  onToggleManualUnlock: (assetId: string, isManualUnlocked: boolean) => Promise<void>;
  onDeleteAsset: (assetId: string) => Promise<void>;
  readOnly?: boolean;
}

const ASSET_TYPES: { id: AssetType; label: string; icon: any }[] = [
  { id: 'google_drive', label: 'Google Drive Link', icon: Folder01Icon },
  { id: 'source_code', label: 'Source Code (Repo/ZIP)', icon: DocumentCodeIcon },
  { id: 'setup_video', label: 'Setup Video', icon: Video01Icon },
  { id: 'deployment_guide', label: 'Deployment Guide', icon: DocumentCodeIcon },
  { id: 'credentials', label: 'Admin Credentials', icon: Key01Icon },
  { id: 'api_docs', label: 'API Documentation', icon: DocumentCodeIcon },
  { id: 'license_key', label: 'License Key', icon: SecurityCheckIcon },
  { id: 'apk_ipa', label: 'Mobile App (APK/IPA)', icon: Folder01Icon },
  { id: 'custom', label: 'Custom Deliverable', icon: Link01Icon },
];

const UNLOCK_RULES: { id: UnlockType; label: string }[] = [
  { id: '100_percent', label: 'Unlock After 100% Payment (Default)' },
  { id: '75_percent', label: 'Unlock After 75% Payment' },
  { id: '50_percent', label: 'Unlock After 50% Payment' },
  { id: '25_percent', label: 'Unlock After 25% Payment' },
  { id: 'immediate', label: 'Unlock Immediately' },
  { id: 'manual', label: 'Manual Unlock Only' },
];

export const DeliveryAssetsManager: React.FC<DeliveryAssetsManagerProps> = ({
  assets,
  projectId,
  onCreateAsset,
  onToggleManualUnlock,
  onDeleteAsset,
  readOnly = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<DeliveryAsset | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('google_drive');
  const [assetUrl, setAssetUrl] = useState('');
  const [unlockType, setUnlockType] = useState<UnlockType>('100_percent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assetUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAsset({
        projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        assetType,
        assetUrl: assetUrl.trim(),
        unlockType,
        isManualUnlocked: false,
      });

      setTitle('');
      setDescription('');
      setAssetUrl('');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAssetIcon = (type: AssetType) => {
    const found = ASSET_TYPES.find((t) => t.id === type);
    return found ? found.icon : Link01Icon;
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <HugeiconsIcon icon={SecurityCheckIcon} size={14} className="text-zinc-500" />
          <span>Project Deliverables & Assets ({assets.length})</span>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3 rounded-md bg-white text-black font-semibold text-xs font-mono inline-flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer shadow-md"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} />
            <span>Add Deliverable</span>
          </button>
        )}
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="p-8 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 text-center font-mono space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <HugeiconsIcon icon={Folder01Icon} size={20} />
          </div>
          <h4 className="text-sm font-semibold text-zinc-300 font-sans">No deliverables created</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {readOnly
              ? 'No project deliverables have been configured yet.'
              : 'Add Google Drive folders, setup videos, source code, or credentials with automated unlock rules.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {assets.map((asset) => {
            const IconComponent = getAssetIcon(asset.assetType);
            const driveInfo = parseGoogleDriveUrl(asset.assetUrl);

            return (
              <div
                key={asset.id}
                className="p-4 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-3 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                        <HugeiconsIcon icon={IconComponent} size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white font-sans truncate">{asset.title}</h4>
                        <div className="text-[10px] text-zinc-500 capitalize">{asset.assetType.replace(/_/g, ' ')}</div>
                      </div>
                    </div>

                    {/* Unlock Status Badge */}
                    <div className="shrink-0">
                      {asset.isUnlocked ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                          Unlocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                          <HugeiconsIcon icon={LockKeyIcon} size={11} />
                          Locked ({asset.unlockType.replace('_', ' ')})
                        </span>
                      )}
                    </div>
                  </div>

                  {asset.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                      {asset.description}
                    </p>
                  )}
                </div>

                {/* Verified Resource Preview Banner */}
                {asset.isUnlocked && asset.assetUrl && (
                  <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <HugeiconsIcon icon={driveInfo.isValid ? Folder01Icon : Link01Icon} size={12} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">
                          {driveInfo.isValid ? 'Google Drive Cloud Asset' : 'Verified Resource Link'}
                        </span>
                        <span className="text-zinc-300 font-mono text-[10px] truncate block max-w-[180px] sm:max-w-xs">
                          {asset.assetUrl}
                        </span>
                      </div>
                    </div>
                    <a
                      href={asset.assetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-[10px] font-mono inline-flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <HugeiconsIcon icon={Link01Icon} size={11} />
                      <span>Open Link</span>
                    </a>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
                  <a
                    href={asset.assetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`h-7 px-2.5 rounded border text-[11px] font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      asset.isUnlocked
                        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white'
                        : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600 pointer-events-none'
                    }`}
                  >
                    <HugeiconsIcon icon={Link01Icon} size={11} />
                    <span>{driveInfo.isValid ? 'Open Google Drive' : 'Access Link'}</span>
                  </a>

                  {!readOnly && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleManualUnlock(asset.id, !asset.isManualUnlocked)}
                        className={`h-7 px-2 rounded border text-[10px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer ${
                          asset.isManualUnlocked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Toggle Manual Unlock"
                      >
                        <HugeiconsIcon icon={asset.isManualUnlocked ? CheckmarkCircle02Icon : LockKeyIcon} size={11} />
                        <span>{asset.isManualUnlocked ? 'Manual Unlocked' : 'Auto Rule'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetToDelete(asset)}
                        className="h-7 w-7 rounded bg-zinc-900 border border-zinc-800 hover:border-rose-900/60 text-zinc-500 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Asset"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Deliverable Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(assetToDelete)}
        onClose={() => setAssetToDelete(null)}
        onConfirm={() => {
          if (assetToDelete) {
            onDeleteAsset(assetToDelete.id);
            setAssetToDelete(null);
          }
        }}
        title="Delete Deliverable Asset"
        description={`Are you sure you want to delete deliverable asset "${assetToDelete?.title || ''}"? This action cannot be undone.`}
        confirmText="Delete Deliverable"
      />

      {/* Add Deliverable Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
          <div className="w-full max-w-lg rounded-lg bg-[#0c0c0e]/95 border border-zinc-800/80 p-5 font-mono text-xs space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HugeiconsIcon icon={Add01Icon} size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans tracking-tight">Add Deliverable / Asset</h3>
                  <p className="text-[10px] text-zinc-500">Configure release resources and automated unlock rules</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Title (*)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Production Setup Video & Google Drive Folder"
                  className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">Asset Type</label>
                  <Select value={assetType} onValueChange={(val: any) => setAssetType(val as AssetType)}>
                    <SelectTrigger className="h-10 text-xs px-3 bg-zinc-900/80 border-zinc-800 rounded-lg font-mono text-zinc-200 focus:border-zinc-600 w-full">
                      <SelectValue placeholder="Asset Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">Unlock Rule</label>
                  <Select value={unlockType} onValueChange={(val: any) => setUnlockType(val as UnlockType)}>
                    <SelectTrigger className="h-10 text-xs px-3 bg-zinc-900/80 border-zinc-800 rounded-lg font-mono text-zinc-200 focus:border-zinc-600 w-full">
                      <SelectValue placeholder="Unlock Rule" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNLOCK_RULES.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Resource URL / Google Drive Link (*)</label>
                <input
                  type="url"
                  required
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Description / Access Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Contains source code ZIP, env variables, setup video, and database backup."
                  className="w-full p-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !assetUrl}
                  className="h-10 px-5 rounded-lg bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Add Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
