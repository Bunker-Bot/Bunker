import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { AvatarPoster } from '../../components/AvatarPoster';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, LockKeyIcon } from '@hugeicons/core-free-icons';

const LOCKABLE_ATTRIBUTES = [
  { id: 'material', label: 'Lock Material Finish', desc: 'Preserve Graphite/Titanium PBR parameters' },
  { id: 'colors', label: 'Lock Color Palette', desc: 'Preserve primary, accent, and visor colors' },
  { id: 'structure', label: 'Lock Structure & Mantle', desc: 'Preserve archetype and shoulder geometry' },
  { id: 'visor', label: 'Lock Optic Visor', desc: 'Preserve facial sensor aperture style' },
];

export const VariantControls: React.FC = () => {
  const {
    lockedAttributes,
    toggleLock,
    generateVariants,
    candidateVariants,
    applyVariant,
  } = useGuardianEditorStore();

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Attribute Locks */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={LockKeyIcon} size={14} className="text-cyan-400" />
            <span>Lock Attributes Before Generation</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Locked parameters will be strictly preserved when generating new candidate variations.
          </p>
        </div>

        <div className="space-y-2">
          {LOCKABLE_ATTRIBUTES.map((attr) => {
            const isLocked = lockedAttributes.has(attr.id);
            return (
              <button
                key={attr.id}
                type="button"
                onClick={() => toggleLock(attr.id)}
                className={`w-full p-2.5 rounded-sm border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLocked
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block text-white">{attr.label}</span>
                  <span className="text-[10px] text-zinc-500 font-sans block">{attr.desc}</span>
                </div>
                <div
                  className={`p-1 rounded ${
                    isLocked ? 'text-cyan-400 bg-cyan-950 border border-cyan-800' : 'text-zinc-600'
                  }`}
                >
                  <HugeiconsIcon icon={LockKeyIcon} size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Generation Actions */}
      <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
        <button
          type="button"
          onClick={() => generateVariants()}
          className="w-full py-2.5 rounded-sm bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={SparklesIcon} size={15} />
          <span>Generate 4 Candidate Variants</span>
        </button>

        <p className="text-[10.5px] text-zinc-500 font-sans text-center">
          Generates curated deterministic alternatives respecting all active locks.
        </p>
      </div>

      {/* 3. Generated Candidates */}
      {candidateVariants.length > 0 && (
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Generated Candidates (Click to apply)
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {candidateVariants.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyVariant(v)}
                className="p-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-cyan-500/80 hover:bg-zinc-850 text-left transition-all cursor-pointer space-y-2 group shadow-sm"
              >
                <div className="w-full aspect-square rounded bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center overflow-hidden">
                  <AvatarPoster config={v} size="100%" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-zinc-300 group-hover:text-cyan-300">
                    Candidate #{i + 1}
                  </span>
                  <span className="text-zinc-500 capitalize">{v.archetype}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantControls;
