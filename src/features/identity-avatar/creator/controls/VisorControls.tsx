import React from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { VISOR_REGISTRY } from '../../lib/guardian-geometry.resolver';
import { ColorPicker } from '../../../../components/ui/color-picker';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, SparklesIcon } from '@hugeicons/core-free-icons';

const PRESET_TINTS = [
  { name: 'Cyan Glow', hex: '#06B6D4' },
  { name: 'Amber Core', hex: '#F59E0B' },
  { name: 'Emerald Sentinel', hex: '#10B981' },
  { name: 'Ruby Laser', hex: '#E11D48' },
  { name: 'Electric Violet', hex: '#8B5CF6' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export const VisorControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Visor Aperture Shape */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={ViewIcon} size={14} className="text-cyan-400" />
            <span>Optic Visor Systems (8 Architectures)</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Choose the facial sensor geometry and optic scan filament layout. Auto-fits cranial width.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-0.5">
          {Object.entries(VISOR_REGISTRY).map(([key, visor]) => {
            const variantNum = Number(key);
            const isSelected = draftConfig.visorVariant === variantNum;
            return (
              <button
                key={variantNum}
                type="button"
                onClick={() => updateConfig(() => ({ visorVariant: variantNum }))}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white truncate">{visor.name}</span>
                  {isSelected && <span className="text-[9.5px] font-bold text-cyan-400">Active</span>}
                </div>
                <div className="text-[9.5px] text-zinc-500 font-mono">
                  Width: {(visor.widthRatio * 100).toFixed(0)}% • Height: {visor.height.toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Visor Luminescence Tint & Full Color Studio Dialog */}
      <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} size={13} className="text-cyan-400" />
            <span>Visor Luminescence Tint</span>
          </label>
          <span className="text-[10px] text-zinc-400 uppercase font-bold">{draftConfig.visorTint}</span>
        </div>

        {/* Quick Swatches */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {PRESET_TINTS.map((t) => (
            <button
              key={t.hex}
              type="button"
              onClick={() => updateConfig(() => ({ visorTint: t.hex, glowColor: t.hex }))}
              className={`w-7 h-7 rounded-sm border transition-transform cursor-pointer relative ${
                draftConfig.visorTint.toLowerCase() === t.hex.toLowerCase()
                  ? 'border-white scale-110 shadow-md ring-2 ring-cyan-400/50'
                  : 'border-zinc-700 hover:scale-105'
              }`}
              style={{ backgroundColor: t.hex }}
              title={t.name}
            />
          ))}
        </div>

        {/* Studio Dialog Integration */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
          <span className="text-[10.5px] text-zinc-400 font-sans">
            Fine-tune custom spectral HEX/RGB:
          </span>
          <ColorPicker
            value={draftConfig.visorTint}
            onChange={(c) => updateConfig(() => ({ visorTint: c, glowColor: c }))}
            label="Visor Studio Color"
          />
        </div>
      </div>
    </div>
  );
};

export default VisorControls;
