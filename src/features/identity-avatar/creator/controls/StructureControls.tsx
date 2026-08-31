import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import type { GuardianFamily, GuardianSilhouette } from '../../types/avatar.types';
import { GUARDIAN_FAMILIES } from '../../lib/guardian-geometry.resolver';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Structure01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

const SILHOUETTES: { id: GuardianSilhouette; name: string; desc: string }[] = [
  { id: 'balanced', name: 'Balanced', desc: 'Canonical Bunker proportion standard' },
  { id: 'wide', name: 'Wide', desc: 'Expanded shoulder span and command presence' },
  { id: 'compact', name: 'Compact', desc: 'Low-profile streamlined frame' },
  { id: 'heavy', name: 'Heavy', desc: 'Reinforced protective mass' },
  { id: 'sleek', name: 'Sleek', desc: 'Minimal aerodynamic contours' },
  { id: 'tall', name: 'Tall', desc: 'Elongated geometric bust profile' },
];

export const StructureControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();
  const currentFamily = draftConfig.family || 'core';
  const currentSilhouette = draftConfig.silhouette || 'balanced';

  const handleSelectFamily = (familyKey: GuardianFamily) => {
    const family = GUARDIAN_FAMILIES[familyKey];
    updateConfig(() => ({
      family: familyKey,
      archetype: family.archetype,
      headVariant: family.recommendedHead,
      visorVariant: family.recommendedVisor,
      shoulderVariant: family.recommendedShoulder,
    }));
  };

  const handleSelectSilhouette = (sil: GuardianSilhouette) => {
    updateConfig(() => ({
      silhouette: sil,
    }));
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Design Family Selection */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={Structure01Icon} size={14} className="text-cyan-400" />
            <span>Guardian Design Family (20 Styles)</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Select an architectural style family to define silhouette philosophy, visor family, and component synergy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar p-0.5">
          {Object.values(GUARDIAN_FAMILIES).map((fam) => {
            const isSelected = currentFamily === fam.id;
            return (
              <button
                key={fam.id}
                type="button"
                onClick={() => handleSelectFamily(fam.id)}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-extrabold text-white text-xs">{fam.name}</span>
                  {isSelected && (
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[9.5px] text-zinc-400 font-sans line-clamp-2 leading-tight">
                  {fam.visualTone}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Silhouette Scale Constraints */}
      <div className="space-y-3 border-t border-zinc-850 pt-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-cyan-400" />
            <span>Silhouette Proportion Profile</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Fine-tune the upper-body mass balance while preserving canonical anchor alignment.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SILHOUETTES.map((sil) => {
            const isSelected = currentSilhouette === sil.id;
            return (
              <button
                key={sil.id}
                type="button"
                onClick={() => handleSelectSilhouette(sil.id)}
                className={`p-2 rounded-sm border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-white font-bold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{sil.name}</div>
                <div className="text-[9px] text-zinc-500 font-sans truncate">{sil.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StructureControls;
