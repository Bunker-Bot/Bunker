import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { SHOULDER_REGISTRY, PLINTH_REGISTRY } from '../../lib/guardian-geometry.resolver';
import { HugeiconsIcon } from '@hugeicons/react';
import { Layers01Icon } from '@hugeicons/core-free-icons';

export const ArmorControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Shoulder Mantle & Collar */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={Layers01Icon} size={14} className="text-cyan-400" />
            <span>Shoulder Mantle & Collar (6 Armor Packages)</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Symmetrical pauldrons and collar reinforcement. Anchored to upper chest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar p-0.5">
          {Object.entries(SHOULDER_REGISTRY).map(([key, s]) => {
            const variantNum = Number(key);
            const isSelected = draftConfig.shoulderVariant === variantNum;
            return (
              <button
                key={variantNum}
                type="button"
                onClick={() => updateConfig(() => ({ shoulderVariant: variantNum }))}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white truncate">{s.name}</span>
                  {isSelected && <span className="text-[9.5px] font-bold text-cyan-400">Active</span>}
                </div>
                <div className="text-[9.5px] text-zinc-500 font-mono">
                  Width Ratio: {s.widthRatio.toFixed(2)}x • Collar: {s.collarHeight.toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Magnetic Plinth / Pedestal */}
      <div className="space-y-3 pt-4 border-t border-zinc-850">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Plinth Pedestal Base (5 Grounded Form Factors)
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Grounded architectural plinth establishing the canonical baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-0.5">
          {Object.entries(PLINTH_REGISTRY).map(([key, p]) => {
            const variantNum = Number(key);
            const isSelected = draftConfig.plinthVariant === variantNum;
            return (
              <button
                key={variantNum}
                type="button"
                onClick={() => updateConfig(() => ({ plinthVariant: variantNum }))}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white truncate">{p.name}</span>
                  {isSelected && <span className="text-[9.5px] font-bold text-cyan-400">Selected</span>}
                </div>
                <div className="text-[9.5px] text-zinc-500 font-mono">
                  Radius: {p.radius.toFixed(2)} • Height: {p.height.toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArmorControls;
