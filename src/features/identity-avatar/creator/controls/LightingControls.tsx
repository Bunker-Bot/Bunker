import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon } from '@hugeicons/core-free-icons';

const LIGHTING_PRESETS = [
  {
    variant: 0,
    name: 'Bunker Studio Master',
    desc: 'High-contrast key light with cool spatial fill and cyan rim highlight.',
  },
  {
    variant: 1,
    name: 'Soft Product Light',
    desc: 'Diffused top-down softbox with minimal shadow occlusion.',
  },
  {
    variant: 2,
    name: 'Midnight Cybernetic',
    desc: 'Dramatic high-intensity neon rim illumination with dark specular body.',
  },
  {
    variant: 3,
    name: 'Architectural Gallery',
    desc: 'Crisp neutral daylight with realistic material sheen.',
  },
];

export const LightingControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <HugeiconsIcon icon={Sun01Icon} size={14} className="text-cyan-400" />
          <span>Stage Lighting Studio</span>
        </label>
        <p className="text-[10.5px] text-zinc-400 font-sans">
          Curated studio lighting configurations calibrated for PBR materials.
        </p>
      </div>

      <div className="space-y-2.5">
        {LIGHTING_PRESETS.map((lp) => {
          const isSelected = draftConfig.environmentVariant === lp.variant;
          return (
            <button
              key={lp.variant}
              type="button"
              onClick={() => updateConfig(() => ({ environmentVariant: lp.variant }))}
              className={`w-full p-3.5 rounded-sm border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-lg'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-white">{lp.name}</span>
                {isSelected && <span className="text-[10px] font-bold text-cyan-400">Active</span>}
              </div>
              <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed mt-1">
                {lp.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LightingControls;
