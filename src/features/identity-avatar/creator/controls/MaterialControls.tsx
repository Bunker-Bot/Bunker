import React, { useState } from 'react';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import type { AvatarMaterial } from '../../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { CpuIcon, SparklesIcon, ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';

interface MaterialFamily {
  id: AvatarMaterial;
  name: string;
  desc: string;
  tag: string;
  roughnessPreset: number;
  metalnessPreset: number;
  swatchColor: string;
}

const MATERIAL_FAMILIES: MaterialFamily[] = [
  {
    id: 'graphite',
    name: 'Graphite Slate',
    desc: 'Dense carbon composite with soft satin reflections and deep gunmetal luster.',
    tag: 'Matte Satin',
    roughnessPreset: 0.45,
    metalnessPreset: 0.25,
    swatchColor: '#282C37',
  },
  {
    id: 'titanium',
    name: 'Titanium Alloy',
    desc: 'Precision aerospace alloy with crisp metallic specular highlights.',
    tag: 'Precision Metal',
    roughnessPreset: 0.3,
    metalnessPreset: 0.35,
    swatchColor: '#475569',
  },
  {
    id: 'black-ceramic',
    name: 'Obsidian Ceramic',
    desc: 'Deep black sintered ceramic with specular edge chamfers.',
    tag: 'Luxury Dark',
    roughnessPreset: 0.2,
    metalnessPreset: 0.2,
    swatchColor: '#12141A',
  },
  {
    id: 'white-ceramic',
    name: 'Ceramic White',
    desc: 'High-purity sintered ceramic with high diffuse reflectivity and clean finish.',
    tag: 'Polished',
    roughnessPreset: 0.25,
    metalnessPreset: 0.15,
    swatchColor: '#E2E8F0',
  },
  {
    id: 'brushed-titanium',
    name: 'Brushed Titanium',
    desc: 'Directional micro-texture with anisotropic reflection planes.',
    tag: 'Industrial',
    roughnessPreset: 0.35,
    metalnessPreset: 0.38,
    swatchColor: '#64748B',
  },
  {
    id: 'anodized-aluminum',
    name: 'Anodized Aluminum',
    desc: 'Micro-beaded electro-chemical finish with saturated color response.',
    tag: 'Technical',
    roughnessPreset: 0.38,
    metalnessPreset: 0.32,
    swatchColor: '#0EA5E9',
  },
  {
    id: 'carbon-composite',
    name: 'Carbon Composite',
    desc: 'Ultra-light structural weave with deep stealth absorption.',
    tag: 'Stealth',
    roughnessPreset: 0.5,
    metalnessPreset: 0.22,
    swatchColor: '#1E293B',
  },
  {
    id: 'pearlescent-ceramic',
    name: 'Pearlescent Pearl',
    desc: 'Luminous multi-angle color reflection with subtle iridescence.',
    tag: 'Premium',
    roughnessPreset: 0.22,
    metalnessPreset: 0.24,
    swatchColor: '#CBD5E1',
  },
  {
    id: 'dark-chrome',
    name: 'Dark Chrome',
    desc: 'Specular liquid metallic finish with sharp environmental reflections.',
    tag: 'High Polish',
    roughnessPreset: 0.15,
    metalnessPreset: 0.45,
    swatchColor: '#334155',
  },
  {
    id: 'satin',
    name: 'Satin Polymer',
    desc: 'Soft-touch architectural polymer with smooth omnidirectional light falloff.',
    tag: 'Soft Finish',
    roughnessPreset: 0.55,
    metalnessPreset: 0.1,
    swatchColor: '#475569',
  },
];

export const MaterialControls: React.FC = () => {
  const { draftConfig, updateConfig } = useGuardianEditorStore();
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);

  const handleSelectMaterial = (mat: MaterialFamily) => {
    updateConfig(() => ({
      material: mat.id,
      roughness: mat.roughnessPreset,
      metalness: mat.metalnessPreset,
    }));
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Material Families */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={CpuIcon} size={14} className="text-cyan-400" />
            <span>PBR Material Archetype (10 Finishes)</span>
          </label>
          <p className="text-[10.5px] text-zinc-400 font-sans">
            Curated physically-based material finishes for the cranial shell and chassis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-0.5">
          {MATERIAL_FAMILIES.map((mat) => {
            const isSelected = draftConfig.material === mat.id;
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => handleSelectMaterial(mat)}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* Material Visual Swatch Sphere */}
                <div
                  className="w-7 h-7 rounded-full border border-zinc-700 shadow-md shrink-0 relative overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${mat.swatchColor} 50%, #090A0E 100%)`,
                  }}
                />

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white truncate">{mat.name}</span>
                    <span className="text-[8.5px] font-bold text-zinc-400">{mat.tag}</span>
                  </div>
                  <div className="text-[9.5px] text-zinc-500 font-mono">
                    R: {mat.roughnessPreset.toFixed(2)} • M: {mat.metalnessPreset.toFixed(2)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Micro PBR Fine-Tuning */}
      <div className="p-3.5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-3">
        <button
          type="button"
          onClick={() => setIsFineTuneOpen(!isFineTuneOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} size={13} className="text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              PBR Calibration Sliders
            </span>
          </div>
          <HugeiconsIcon
            icon={isFineTuneOpen ? ArrowUp01Icon : ArrowDown01Icon}
            size={13}
            className="text-zinc-500"
          />
        </button>

        {isFineTuneOpen && (
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            {/* Roughness Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-zinc-400">Surface Roughness</span>
                <span className="text-white font-mono font-bold">
                  {(draftConfig.roughness ?? 0.35).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.85"
                step="0.01"
                value={draftConfig.roughness ?? 0.35}
                onChange={(e) => updateConfig(() => ({ roughness: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Metalness Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-zinc-400">Specular Metalness</span>
                <span className="text-white font-mono font-bold">
                  {(draftConfig.metalness ?? 0.25).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.45"
                step="0.01"
                value={draftConfig.metalness ?? 0.25}
                onChange={(e) => updateConfig(() => ({ metalness: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialControls;
