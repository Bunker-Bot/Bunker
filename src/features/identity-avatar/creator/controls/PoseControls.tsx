import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import type { AvatarPose } from '../../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlignBoxTopCenterIcon } from '@hugeicons/core-free-icons';

const POSES: { id: AvatarPose; name: string; desc: string }[] = [
  {
    id: 'three-quarter-left',
    name: 'Three-Quarter Left',
    desc: 'Art-directed 22° dynamic studio portrait facing left.',
  },
  {
    id: 'three-quarter-right',
    name: 'Three-Quarter Right',
    desc: 'Art-directed 22° dynamic studio portrait facing right.',
  },
  {
    id: 'front',
    name: 'Direct Frontal',
    desc: 'Orthogonal front-facing architectural perspective.',
  },
];

export const PoseControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Base Pose Stance */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={AlignBoxTopCenterIcon} size={14} className="text-cyan-400" />
            <span>Art-Directed Base Orientation</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Choose the static portrait framing stance used across 2D cards and default scenes.
          </p>
        </div>

        <div className="space-y-2.5">
          {POSES.map((p) => {
            const isSelected = draftConfig.pose === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateConfig(() => ({ pose: p.id }))}
                className={`w-full p-3.5 rounded-sm border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{p.name}</span>
                  {isSelected && <span className="text-[10px] font-bold text-cyan-400">Active</span>}
                </div>
                <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed mt-1">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoseControls;
