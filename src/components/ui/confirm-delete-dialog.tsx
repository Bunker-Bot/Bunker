import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-sm rounded-lg bg-[#0c0c0e]/95 border border-rose-500/30 p-5 font-mono text-xs space-y-4 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-tight">{title}</h3>
              <p className="text-[10px] text-rose-400/90 font-mono">Irreversible Action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs text-zinc-300 font-sans leading-relaxed">
          {description}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium hover:text-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            <HugeiconsIcon icon={Delete02Icon} size={13} />
            <span>{isLoading ? 'Deleting...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
