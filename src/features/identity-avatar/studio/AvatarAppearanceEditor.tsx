import React from 'react';
import type {
  BunkerAvatarConfig,
  AvatarArchetype,
  AvatarPose,
} from '../types/avatar.types';
import { BUNKER_PALETTES, customizePaletteWithColor } from '../lib/avatar-palette';
import { ColorPicker } from '../../../components/ui/color-picker';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  PaintBucketIcon,
} from '@hugeicons/core-free-icons';

interface AvatarAppearanceEditorProps {
  config: BunkerAvatarConfig;
  onChange: (updatedConfig: BunkerAvatarConfig) => void;
}

const ARCHETYPES: Array<{ id: AvatarArchetype; label: string; desc: string }> = [
  { id: 'guardian', label: 'Guardian', desc: 'Sleek protective sentinel with studio lighting' },
  { id: 'architect', label: 'Architect', desc: 'Angular geometric chassis and sharp planar lines' },
  { id: 'sentinel', label: 'Sentinel', desc: 'Heavy armored visor with industrial telemetry' },
  { id: 'operator', label: 'Operator', desc: 'Agile cybernetic frame with dual optic sensors' },
];

const HEAD_VARIANTS = [
  { id: 0, label: 'Vault Shell', desc: 'Chamfered helmet with brow ridge' },
  { id: 1, label: 'Crown Crest', desc: 'Angular crown ridge with top bevel' },
  { id: 2, label: 'Capsule Pod', desc: 'Aerodynamic cylindrical pod chassis' },
  { id: 3, label: 'Poly Sentinel', desc: 'Low-poly chiseled polygonal helm' },
];

const VISOR_VARIANTS = [
  { id: 0, label: 'Smoked Bar', desc: 'Continuous horizontal optic slit' },
  { id: 1, label: 'Dual Optic', desc: 'Twin sensor telemetry apertures' },
  { id: 2, label: 'Narrow Monolith', desc: 'High-contrast vertical sensor' },
  { id: 3, label: 'Hex Horizon', desc: 'Hexagonal precision focal array' },
];

const SHOULDER_VARIANTS = [
  { id: 0, label: 'Architectural Mantle', desc: 'Broad angular trapezoid shoulder cowl' },
  { id: 1, label: 'Ergonomic Collar', desc: 'Smooth curved composite neckline' },
  { id: 2, label: 'Tiered Chassis', desc: 'Multi-layer articulated shoulder pauldron' },
];

const POSES: Array<{ id: AvatarPose; label: string }> = [
  { id: 'three-quarter-left', label: '18° Left Portrait' },
  { id: 'three-quarter-right', label: '18° Right Portrait' },
  { id: 'front', label: 'Frontal Alignment' },
];

export const AvatarAppearanceEditor: React.FC<AvatarAppearanceEditorProps> = ({
  config,
  onChange,
}) => {
  const handleArchetypeChange = (archetype: AvatarArchetype) => {
    onChange({ ...config, archetype });
  };

  const handleHeadChange = (headVariant: number) => {
    onChange({ ...config, headVariant });
  };

  const handleVisorChange = (visorVariant: number) => {
    onChange({ ...config, visorVariant });
  };

  const handleShoulderChange = (shoulderVariant: number) => {
    onChange({ ...config, shoulderVariant });
  };

  const handlePaletteSelect = (paletteId: string) => {
    const selected = BUNKER_PALETTES.find((p) => p.id === paletteId);
    if (!selected) return;
    const custom = customizePaletteWithColor(selected, config.accentColor);
    onChange({
      ...config,
      material: selected.material,
      primaryColor: custom.primary,
      secondaryColor: custom.secondary,
      accentColor: custom.accent,
      visorTint: custom.visor,
      glowColor: custom.glow,
      metalness: custom.metalness,
      roughness: custom.roughness,
    });
  };

  const handleAccentColorChange = (hex: string) => {
    onChange({
      ...config,
      accentColor: hex,
      visorTint: hex,
      glowColor: hex,
    });
  };

  const handlePoseChange = (pose: AvatarPose) => {
    onChange({ ...config, pose });
  };

  return (
    <div className="space-y-6 font-mono text-xs text-zinc-200">
      {/* 1. Archetype Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={SparklesIcon} size={14} className="text-cyan-400" />
          <span>Guardian Archetype</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ARCHETYPES.map((arch) => {
            const isSelected = config.archetype === arch.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleArchetypeChange(arch.id)}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer space-y-1 ${isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs capitalize">{arch.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-tight line-clamp-2">
                  {arch.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Palette & Material Finish */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={PaintBucketIcon} size={14} className="text-amber-400" />
          <span>PBR Material Finish & Tone</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {BUNKER_PALETTES.map((pal) => {
            const isSelected = config.primaryColor === pal.primary;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => handlePaletteSelect(pal.id)}
                className={`p-2 rounded-sm border text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${isSelected
                    ? 'bg-zinc-850 border-white text-white ring-1 ring-white/30 shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                title={`${pal.name} (${pal.material})`}
              >
                <div className="w-full h-4 rounded flex overflow-hidden border border-zinc-700/60 shadow-inner">
                  <div className="w-1/2 h-full" style={{ backgroundColor: pal.primary }} />
                  <div className="w-1/2 h-full" style={{ backgroundColor: pal.accent }} />
                </div>
                <span className="text-[9.5px] font-bold truncate w-full text-center">
                  {pal.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Professional Custom Accent Color Picker */}
        <div className="pt-1">
          <ColorPicker
            value={config.accentColor}
            onChange={handleAccentColorChange}
            label="Accent Illumination & Glow"
          />
        </div>
      </div>

      {/* 3. Head Chassis Variant */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Head Geometry
        </label>
        <div className="grid grid-cols-2 gap-2">
          {HEAD_VARIANTS.map((h) => {
            const isSelected = config.headVariant === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => handleHeadChange(h.id)}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer space-y-0.5 ${isSelected
                    ? 'bg-zinc-800 border-zinc-600 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>{h.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </div>
                <p className="text-[9.5px] text-zinc-500 font-sans">{h.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Optic Visor Variant */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Optic Visor Array
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VISOR_VARIANTS.map((v) => {
            const isSelected = config.visorVariant === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleVisorChange(v.id)}
                className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer space-y-0.5 ${isSelected
                    ? 'bg-zinc-800 border-zinc-600 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>{v.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </div>
                <p className="text-[9.5px] text-zinc-500 font-sans">{v.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Shoulder Cowl Mantle */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Shoulder Mantle
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SHOULDER_VARIANTS.map((s) => {
            const isSelected = config.shoulderVariant === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleShoulderChange(s.id)}
                className={`p-2 rounded-sm border text-left transition-all cursor-pointer space-y-0.5 ${isSelected
                    ? 'bg-zinc-800 border-zinc-600 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
              >
                <span className="text-[11px] block truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Art-Directed Pose */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Portrait Camera Angle
        </label>
        <div className="grid grid-cols-3 gap-2">
          {POSES.map((p) => {
            const isSelected = config.pose === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePoseChange(p.id)}
                className={`p-2 rounded-sm border text-center transition-all cursor-pointer text-xs ${isSelected
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-300 font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
