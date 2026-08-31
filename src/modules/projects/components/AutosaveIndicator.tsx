import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface AutosaveIndicatorProps {
  status: SaveStatus;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ status }) => {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono select-none shrink-0">
      {status === 'saving' && (
        <>
          <RadialSpinner size={12} className="text-amber-400" />
          <span className="text-amber-300 font-medium">Saving...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <HugeiconsIcon icon={Tick02Icon} size={12} className="text-emerald-400" />
          <span className="text-zinc-400">Saved to Cloud</span>
        </>
      )}

      {status === 'unsaved' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-300 font-medium">Unsaved Changes</span>
        </>
      )}

      {status === 'error' && (
        <>
          <HugeiconsIcon icon={AlertCircleIcon} size={12} className="text-rose-400" />
          <span className="text-rose-300 font-medium">Save Failed</span>
        </>
      )}
    </div>
  );
};

export default AutosaveIndicator;
