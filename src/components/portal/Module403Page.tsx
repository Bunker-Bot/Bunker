import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

interface Module403PageProps {
  moduleName?: string;
  onGoOverview?: () => void;
}

export const Module403Page: React.FC<Module403PageProps> = ({ moduleName, onGoOverview }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none font-mono relative z-10">
      <div className="relative z-10 max-w-md w-full p-8 rounded-sm bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-xl space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-sm bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mx-auto shadow-md">
          <HugeiconsIcon icon={LockKeyIcon} size={28} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
            403 — Access Restricted
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Module Not Shared
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            The <strong className="text-zinc-200 font-mono">{moduleName || 'requested section'}</strong> module was not enabled for this share link by the project owner.
          </p>
        </div>

        {onGoOverview && (
          <button
            onClick={onGoOverview}
            className="w-full h-10 px-4 rounded-sm bg-white text-black font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer shadow-md"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
            <span>Return to Shared Overview</span>
          </button>
        )}

        <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-sans">
          Protected Share • Read-Only Verified Access • Powered by Bunker
        </div>
      </div>
    </div>
  );
};

export default Module403Page;
