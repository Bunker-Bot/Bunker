import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { BadgePercentIcon } from '@hugeicons/core-free-icons';

const EMBLEM_OPTIONS = [
  {
    variant: 0,
    name: 'Bunker Shield Glyph',
    desc: 'Geometric cryptographic shield insignia mounted on the forehead apex.',
  },
  {
    variant: 1,
    name: 'Diamond Sentinel Crest',
    desc: 'Luminescent diamond core beacon with cybernetic edge glow.',
  },
  {
    variant: 2,
    name: 'Circular Core Node',
    desc: 'Focused optical telemetry node for agile reconnaissance frames.',
  },
];

export const EmblemControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <HugeiconsIcon icon={BadgePercentIcon} size={14} className="text-cyan-400" />
          <span>Forehead Crest Emblem</span>
        </label>
        <p className="text-[10.5px] text-zinc-400 font-sans">
          Select the cryptographic seal emblazoned on the Guardian helmet.
        </p>
      </div>

      <div className="space-y-2.5">
        {EMBLEM_OPTIONS.map((e) => {
          const isSelected = draftConfig.emblemVariant === e.variant;
          return (
            <button
              key={e.variant}
              type="button"
              onClick={() => updateConfig(() => ({ emblemVariant: e.variant }))}
              className={`w-full p-3.5 rounded-sm border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-lg'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-white">{e.name}</span>
                {isSelected && <span className="text-[10px] font-bold text-cyan-400">Active</span>}
              </div>
              <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed mt-1">
                {e.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmblemControls;
