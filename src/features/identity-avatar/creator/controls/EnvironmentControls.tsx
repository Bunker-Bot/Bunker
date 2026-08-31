import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { PaintBucketIcon } from '@hugeicons/core-free-icons';

const ENV_PRESETS = [
  {
    id: 0,
    name: 'Bunker Dark Studio',
    desc: 'Deep graphite space with subtle radial halo and ambient orbital rings.',
  },
  {
    id: 1,
    name: 'Cybernetic Atelier',
    desc: 'Rotating concentric HUD orbit rings with luminescent backdrop aura.',
  },
  {
    id: 2,
    name: 'Clean Neutral Slate',
    desc: 'Minimal high-readability studio for documentation and executive reviews.',
  },
];

export const EnvironmentControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={PaintBucketIcon} size={14} className="text-cyan-400" />
            <span>Environment & Stage Ambiance</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Configure the backdrop radial atmosphere and holographic HUD rings.
          </p>
        </div>

        <div className="space-y-2.5">
          {ENV_PRESETS.map((ep) => {
            const isSelected = draftConfig.environmentVariant === ep.id;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => updateConfig(() => ({ environmentVariant: ep.id }))}
                className={`w-full p-3.5 rounded-sm border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{ep.name}</span>
                  {isSelected && <span className="text-[10px] font-bold text-cyan-400">Active</span>}
                </div>
                <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed mt-1">
                  {ep.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentControls;
