import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { HEAD_REGISTRY } from '../../lib/guardian-geometry.resolver';
import { HugeiconsIcon } from '@hugeicons/react';
import { Shield01Icon } from '@hugeicons/core-free-icons';

export const HeadControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <HugeiconsIcon icon={Shield01Icon} size={14} className="text-cyan-400" />
          <span>Head Shell Geometry (10 Systems)</span>
        </label>
        <p className="text-[10.5px] text-zinc-400 font-sans">
          Select the primary cranial helmet geometry and side telemetry pod configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto custom-scrollbar p-0.5">
        {Object.entries(HEAD_REGISTRY).map(([key, head]) => {
          const variantNum = Number(key);
          const isSelected = draftConfig.headVariant === variantNum;
          return (
            <button
              key={variantNum}
              type="button"
              onClick={() => updateConfig(() => ({ headVariant: variantNum }))}
              className={`p-3 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white truncate">{head.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-400 uppercase">
                    {head.familyTag}
                  </span>
                </div>
                <div className="text-[9.5px] text-zinc-500 font-mono">
                  W: {head.bounds.width.toFixed(2)} • H: {head.bounds.height.toFixed(2)} • D: {head.bounds.depth.toFixed(2)}
                </div>
              </div>

              <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500 font-mono">ID: #{variantNum + 1}</span>
                {isSelected && <span className="font-bold text-cyan-400">Selected</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HeadControls;
